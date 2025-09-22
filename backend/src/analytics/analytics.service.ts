import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account, Post, Insight, AccountInsight } from '../database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Insight)
    private insightRepository: Repository<Insight>,
    @InjectRepository(AccountInsight)
    private accountInsightRepository: Repository<AccountInsight>,
  ) {}

  async getAccountOverview(accountId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get recent account insights (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInsights = await this.accountInsightRepository.find({
      where: {
        accountId,
        date: Between(thirtyDaysAgo, new Date()),
      },
      order: { date: 'DESC' },
      take: 30,
    });

    // Get recent posts with insights
    const recentPosts = await this.postRepository.find({
      where: { accountId },
      relations: ['insights'],
      order: { timestamp: 'DESC' },
      take: 10,
    });

    // Calculate metrics
    const totalReach = recentInsights.reduce((sum, insight) => sum + insight.reach, 0);
    const totalImpressions = recentInsights.reduce((sum, insight) => sum + insight.impressions, 0);
    const avgEngagementRate = this.calculateAverageEngagementRate(recentPosts);

    // Growth calculations
    const currentFollowers = account.followersCount;
    const followersGrowth = this.calculateFollowersGrowth(recentInsights);

    return {
      account: {
        id: account.id,
        username: account.username,
        name: account.name,
        profilePictureUrl: account.profilePictureUrl,
        followersCount: currentFollowers,
        followingCount: account.followingCount,
        mediaCount: account.mediaCount,
      },
      metrics: {
        totalReach,
        totalImpressions,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        followersGrowth,
        postsAnalyzed: recentPosts.length,
      },
      chartData: {
        followersGrowth: this.prepareFollowersGrowthChart(recentInsights),
        engagementTrend: this.prepareEngagementTrendChart(recentPosts),
        reachImpressions: this.prepareReachImpressionsChart(recentInsights),
      },
    };
  }

  async getContentAnalytics(accountId: string) {
    const recentPosts = await this.postRepository.find({
      where: { accountId },
      relations: ['insights'],
      order: { timestamp: 'DESC' },
      take: 50,
    });

    const postsWithInsights = recentPosts.filter(post => post.insights && post.insights.length > 0);

    // Top performing posts
    const topPosts = postsWithInsights
      .sort((a, b) => (b.insights[0]?.engagementRate || 0) - (a.insights[0]?.engagementRate || 0))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        caption: post.caption?.substring(0, 100) + '...',
        mediaType: post.mediaType,
        timestamp: post.timestamp,
        metrics: {
          engagementRate: post.insights[0]?.engagementRate,
          reach: post.insights[0]?.reach,
          impressions: post.insights[0]?.impressions,
          likes: post.insights[0]?.likes,
          comments: post.insights[0]?.comments,
          shares: post.insights[0]?.shares,
          saves: post.insights[0]?.saves,
        },
      }));

    // Content type performance
    const contentTypePerformance = this.analyzeContentTypePerformance(postsWithInsights);

    // Hashtag analysis
    const hashtagAnalysis = this.analyzeHashtagPerformance(postsWithInsights);

    return {
      overview: {
        totalPosts: postsWithInsights.length,
        avgEngagementRate: this.calculateAverageEngagementRate(postsWithInsights),
        avgReach: this.calculateAverageReach(postsWithInsights),
        bestPerformingType: this.getBestPerformingContentType(contentTypePerformance),
      },
      topPosts,
      contentTypePerformance,
      hashtagAnalysis,
    };
  }

  async getEngagementAnalytics(accountId: string) {
    const posts = await this.postRepository.find({
      where: { accountId },
      relations: ['insights'],
      order: { timestamp: 'DESC' },
      take: 100,
    });

    const postsWithInsights = posts.filter(post => post.insights && post.insights.length > 0);

    // Time-based analysis
    const hourlyEngagement = this.analyzeHourlyEngagement(postsWithInsights);
    const dailyEngagement = this.analyzeDailyEngagement(postsWithInsights);

    // Engagement distribution
    const engagementDistribution = this.analyzeEngagementDistribution(postsWithInsights);

    return {
      hourlyEngagement,
      dailyEngagement,
      engagementDistribution,
      bestTimes: this.getBestPostingTimes(hourlyEngagement, dailyEngagement),
    };
  }

  private calculateAverageEngagementRate(posts: Post[]): number {
    if (posts.length === 0) return 0;
    
    const totalER = posts
      .filter(post => post.insights && post.insights.length > 0)
      .reduce((sum, post) => sum + (post.insights[0]?.engagementRate || 0), 0);
    
    return totalER / posts.length;
  }

  private calculateAverageReach(posts: Post[]): number {
    if (posts.length === 0) return 0;
    
    const totalReach = posts
      .filter(post => post.insights && post.insights.length > 0)
      .reduce((sum, post) => sum + (post.insights[0]?.reach || 0), 0);
    
    return Math.round(totalReach / posts.length);
  }

  private calculateFollowersGrowth(insights: AccountInsight[]): number {
    if (insights.length < 2) return 0;
    
    const latest = insights[0];
    const earliest = insights[insights.length - 1];
    
    return latest.followersCount - earliest.followersCount;
  }

  private prepareFollowersGrowthChart(insights: AccountInsight[]) {
    return insights
      .reverse()
      .map(insight => ({
        date: insight.date.toISOString().split('T')[0],
        followers: insight.followersCount,
      }));
  }

  private prepareEngagementTrendChart(posts: Post[]) {
    return posts
      .filter(post => post.insights && post.insights.length > 0 && post.timestamp)
      .reverse()
      .map(post => ({
        date: post.timestamp.toISOString().split('T')[0],
        engagementRate: post.insights[0]?.engagementRate || 0,
      }));
  }

  private prepareReachImpressionsChart(insights: AccountInsight[]) {
    return insights
      .reverse()
      .map(insight => ({
        date: insight.date.toISOString().split('T')[0],
        reach: insight.reach,
        impressions: insight.impressions,
      }));
  }

  private analyzeContentTypePerformance(posts: Post[]) {
    const performance = {};
    
    posts.forEach(post => {
      if (!performance[post.mediaType]) {
        performance[post.mediaType] = {
          count: 0,
          totalER: 0,
          totalReach: 0,
          totalImpressions: 0,
        };
      }
      
      performance[post.mediaType].count += 1;
      performance[post.mediaType].totalER += post.insights[0]?.engagementRate || 0;
      performance[post.mediaType].totalReach += post.insights[0]?.reach || 0;
      performance[post.mediaType].totalImpressions += post.insights[0]?.impressions || 0;
    });

    return Object.entries(performance).map(([type, data]: [string, any]) => ({
      type,
      count: data.count,
      avgEngagementRate: Math.round((data.totalER / data.count) * 100) / 100,
      avgReach: Math.round(data.totalReach / data.count),
      avgImpressions: Math.round(data.totalImpressions / data.count),
    }));
  }

  private analyzeHashtagPerformance(posts: Post[]) {
    const hashtagPerformance = {};
    
    posts.forEach(post => {
      if (post.hashtags && post.hashtags.length > 0) {
        const er = post.insights[0]?.engagementRate || 0;
        
        post.hashtags.forEach(hashtag => {
          if (!hashtagPerformance[hashtag]) {
            hashtagPerformance[hashtag] = {
              count: 0,
              totalER: 0,
            };
          }
          hashtagPerformance[hashtag].count += 1;
          hashtagPerformance[hashtag].totalER += er;
        });
      }
    });

    return Object.entries(hashtagPerformance)
      .map(([hashtag, data]: [string, any]) => ({
        hashtag,
        count: data.count,
        avgEngagementRate: Math.round((data.totalER / data.count) * 100) / 100,
      }))
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 20);
  }

  private getBestPerformingContentType(performance: any[]): string {
    if (performance.length === 0) return 'N/A';
    
    return performance.reduce((best, current) => 
      current.avgEngagementRate > best.avgEngagementRate ? current : best
    ).type;
  }

  private analyzeHourlyEngagement(posts: Post[]) {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalER: 0,
      count: 0,
    }));

    posts.forEach(post => {
      if (post.timestamp && post.insights && post.insights.length > 0) {
        const hour = post.timestamp.getHours();
        hourlyData[hour].totalER += post.insights[0]?.engagementRate || 0;
        hourlyData[hour].count += 1;
      }
    });

    return hourlyData.map(data => ({
      hour: data.hour,
      avgEngagementRate: data.count > 0 ? Math.round((data.totalER / data.count) * 100) / 100 : 0,
      posts: data.count,
    }));
  }

  private analyzeDailyEngagement(posts: Post[]) {
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      dayName: ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'][i],
      totalER: 0,
      count: 0,
    }));

    posts.forEach(post => {
      if (post.timestamp && post.insights && post.insights.length > 0) {
        const day = post.timestamp.getDay();
        dailyData[day].totalER += post.insights[0]?.engagementRate || 0;
        dailyData[day].count += 1;
      }
    });

    return dailyData.map(data => ({
      day: data.day,
      dayName: data.dayName,
      avgEngagementRate: data.count > 0 ? Math.round((data.totalER / data.count) * 100) / 100 : 0,
      posts: data.count,
    }));
  }

  private analyzeEngagementDistribution(posts: Post[]) {
    const ranges = [
      { min: 0, max: 1, label: '0-1%' },
      { min: 1, max: 3, label: '1-3%' },
      { min: 3, max: 5, label: '3-5%' },
      { min: 5, max: 10, label: '5-10%' },
      { min: 10, max: Infinity, label: '10%+' },
    ];

    const distribution = ranges.map(range => ({
      range: range.label,
      count: 0,
    }));

    posts.forEach(post => {
      if (post.insights && post.insights.length > 0) {
        const er = post.insights[0]?.engagementRate || 0;
        const rangeIndex = ranges.findIndex(range => er >= range.min && er < range.max);
        if (rangeIndex >= 0) {
          distribution[rangeIndex].count += 1;
        }
      }
    });

    return distribution;
  }

  private getBestPostingTimes(hourlyData: any[], dailyData: any[]) {
    const bestHours = hourlyData
      .filter(data => data.posts > 0)
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 3);

    const bestDays = dailyData
      .filter(data => data.posts > 0)
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 3);

    return { bestHours, bestDays };
  }
}
