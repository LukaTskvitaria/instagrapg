import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';
import { Account, Post, Insight, AccountInsight, MediaType } from '../database/entities';

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  website?: string;
  biography?: string;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
}

export interface InstagramInsights {
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  profile_visits?: number;
  website_clicks?: number;
  video_views?: number;
  video_avg_time_watched?: number;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly graphApiUrl: string;

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Insight)
    private insightRepository: Repository<Insight>,
    @InjectRepository(AccountInsight)
    private accountInsightRepository: Repository<AccountInsight>,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectQueue('insights') private insightsQueue: Queue,
  ) {
    this.graphApiUrl = this.configService.get<string>('INSTAGRAM_GRAPH_API_BASE_URL', 'https://graph.facebook.com');
  }

  async connectInstagramAccount(userId: string, accessToken: string): Promise<Account> {
    try {
      // Get Instagram Business Account
      const accountsResponse = await firstValueFrom(
        this.httpService.get(`${this.graphApiUrl}/me/accounts`, {
          params: {
            access_token: accessToken,
            fields: 'instagram_business_account',
          },
        }),
      );

      const accounts = accountsResponse.data.data;
      const instagramAccount = accounts.find(account => account.instagram_business_account);

      if (!instagramAccount) {
        throw new Error('Instagram Business Account არ მოიძებნა');
      }

      const igAccountId = instagramAccount.instagram_business_account.id;

      // Get Instagram account details
      const accountDetailsResponse = await firstValueFrom(
        this.httpService.get(`${this.graphApiUrl}/${igAccountId}`, {
          params: {
            access_token: accessToken,
            fields: 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,website,biography',
          },
        }),
      );

      const igAccountData: InstagramAccount = accountDetailsResponse.data;

      // Save or update account in database
      let account = await this.accountRepository.findOne({
        where: { igId: igAccountData.id },
      });

      if (account) {
        // Update existing account
        Object.assign(account, {
          username: igAccountData.username,
          name: igAccountData.name,
          profilePictureUrl: igAccountData.profile_picture_url,
          followersCount: igAccountData.followers_count,
          followingCount: igAccountData.follows_count,
          mediaCount: igAccountData.media_count,
          website: igAccountData.website,
          biography: igAccountData.biography,
          accessToken,
          isActive: true,
        });
      } else {
        // Create new account
        account = this.accountRepository.create({
          userId,
          igId: igAccountData.id,
          username: igAccountData.username,
          name: igAccountData.name,
          profilePictureUrl: igAccountData.profile_picture_url,
          followersCount: igAccountData.followers_count,
          followingCount: igAccountData.follows_count,
          mediaCount: igAccountData.media_count,
          website: igAccountData.website,
          biography: igAccountData.biography,
          accessToken,
          isActive: true,
        });
      }

      await this.accountRepository.save(account);

      // Queue initial data fetch
      await this.insightsQueue.add('fetch-account-insights', { accountId: account.id });
      await this.insightsQueue.add('fetch-media-insights', { accountId: account.id });

      this.logger.log(`Instagram account connected: ${igAccountData.username}`);
      return account;
    } catch (error) {
      this.logger.error('Instagram account connection failed', error.stack);
      throw error;
    }
  }

  async fetchAccountInsights(accountId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.graphApiUrl}/${account.igId}/insights`, {
          params: {
            access_token: account.accessToken,
            metric: 'reach,impressions,profile_visits,website_clicks',
            period: 'day',
            since: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // Last 30 days
          },
        }),
      );

      const insights = response.data.data;
      const today = new Date().toISOString().split('T')[0];

      // Process and save insights
      const insightData = {
        accountId,
        date: new Date(today),
        reach: insights.find(i => i.name === 'reach')?.values?.[0]?.value || 0,
        impressions: insights.find(i => i.name === 'impressions')?.values?.[0]?.value || 0,
        profileVisits: insights.find(i => i.name === 'profile_visits')?.values?.[0]?.value || 0,
        websiteClicks: insights.find(i => i.name === 'website_clicks')?.values?.[0]?.value || 0,
        followersCount: account.followersCount,
        followingCount: account.followingCount,
        mediaCount: account.mediaCount,
      };

      await this.accountInsightRepository.save(insightData);
      this.logger.log(`Account insights updated for ${account.username}`);
    } catch (error) {
      this.logger.error(`Failed to fetch account insights for ${account.username}`, error.stack);
    }
  }

  async fetchMediaInsights(accountId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      // Get recent media
      const mediaResponse = await firstValueFrom(
        this.httpService.get(`${this.graphApiUrl}/${account.igId}/media`, {
          params: {
            access_token: account.accessToken,
            fields: 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp',
            limit: 25,
          },
        }),
      );

      const mediaItems: InstagramMedia[] = mediaResponse.data.data;

      for (const media of mediaItems) {
        // Save or update post
        let post = await this.postRepository.findOne({
          where: { igMediaId: media.id },
        });

        if (!post) {
          post = this.postRepository.create({
            accountId,
            igMediaId: media.id,
            mediaType: media.media_type as MediaType,
            mediaUrl: media.media_url,
            thumbnailUrl: media.thumbnail_url,
            caption: media.caption,
            permalink: media.permalink,
            timestamp: media.timestamp ? new Date(media.timestamp) : null,
          });
          await this.postRepository.save(post);
        }

        // Fetch insights for this media
        try {
          const insightsResponse = await firstValueFrom(
            this.httpService.get(`${this.graphApiUrl}/${media.id}/insights`, {
              params: {
                access_token: account.accessToken,
                metric: media.media_type === 'VIDEO' 
                  ? 'reach,impressions,likes,comments,shares,saves,video_views'
                  : 'reach,impressions,likes,comments,shares,saves',
              },
            }),
          );

          const insights = insightsResponse.data.data;
          const reach = insights.find(i => i.name === 'reach')?.values?.[0]?.value || 0;
          const impressions = insights.find(i => i.name === 'impressions')?.values?.[0]?.value || 0;
          const likes = insights.find(i => i.name === 'likes')?.values?.[0]?.value || 0;
          const comments = insights.find(i => i.name === 'comments')?.values?.[0]?.value || 0;
          const shares = insights.find(i => i.name === 'shares')?.values?.[0]?.value || 0;
          const saves = insights.find(i => i.name === 'saves')?.values?.[0]?.value || 0;
          const videoViews = insights.find(i => i.name === 'video_views')?.values?.[0]?.value || 0;

          const engagementRate = reach > 0 ? ((likes + comments + shares + saves) / reach) * 100 : 0;

          const insightData = {
            postId: post.id,
            reach,
            impressions,
            likes,
            comments,
            shares,
            saves,
            videoViews,
            engagementRate,
            recordedAt: new Date(),
          };

          await this.insightRepository.save(insightData);
        } catch (insightError) {
          this.logger.warn(`Failed to fetch insights for media ${media.id}`, insightError.message);
        }
      }

      this.logger.log(`Media insights updated for ${account.username}`);
    } catch (error) {
      this.logger.error(`Failed to fetch media insights for ${account.username}`, error.stack);
    }
  }

  async getAccountAnalytics(accountId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['posts', 'posts.insights'],
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const recentPosts = account.posts
      .filter(post => post.insights && post.insights.length > 0)
      .slice(0, 10);

    const totalReach = recentPosts.reduce((sum, post) => 
      sum + (post.insights[0]?.reach || 0), 0);
    const totalImpressions = recentPosts.reduce((sum, post) => 
      sum + (post.insights[0]?.impressions || 0), 0);
    const totalEngagement = recentPosts.reduce((sum, post) => 
      sum + (post.insights[0]?.likes || 0) + (post.insights[0]?.comments || 0) + 
      (post.insights[0]?.shares || 0) + (post.insights[0]?.saves || 0), 0);

    const avgEngagementRate = recentPosts.length > 0 
      ? recentPosts.reduce((sum, post) => sum + (post.insights[0]?.engagementRate || 0), 0) / recentPosts.length
      : 0;

    return {
      account: {
        username: account.username,
        followersCount: account.followersCount,
        mediaCount: account.mediaCount,
      },
      analytics: {
        totalReach,
        totalImpressions,
        totalEngagement,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        postsAnalyzed: recentPosts.length,
      },
      topPosts: recentPosts
        .sort((a, b) => (b.insights[0]?.engagementRate || 0) - (a.insights[0]?.engagementRate || 0))
        .slice(0, 3)
        .map(post => ({
          id: post.id,
          caption: post.caption?.substring(0, 100) + '...',
          mediaType: post.mediaType,
          engagementRate: post.insights[0]?.engagementRate,
          reach: post.insights[0]?.reach,
          likes: post.insights[0]?.likes,
          comments: post.insights[0]?.comments,
        })),
    };
  }
}
