import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, Post, Recommendation, RecommendationType, RecommendationStatus } from '../database/entities';
import { ContentGeneratorService, ContentIdea } from './content-generator.service';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    private contentGenerator: ContentGeneratorService,
  ) {}

  async generateRecommendations(accountId: string): Promise<Recommendation[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['posts', 'posts.insights'],
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const recommendations: Recommendation[] = [];

    // Generate content ideas
    const contentRecommendations = await this.generateContentRecommendations(account);
    recommendations.push(...contentRecommendations);

    // Generate timing recommendations
    const timingRecommendations = await this.generateTimingRecommendations(account);
    recommendations.push(...timingRecommendations);

    // Generate hashtag recommendations
    const hashtagRecommendations = await this.generateHashtagRecommendations(account);
    recommendations.push(...hashtagRecommendations);

    // Save recommendations
    const savedRecommendations = await this.recommendationRepository.save(recommendations);
    
    this.logger.log(`Generated ${savedRecommendations.length} recommendations for account ${account.username}`);
    return savedRecommendations;
  }

  private async generateContentRecommendations(account: Account): Promise<Recommendation[]> {
    const recentPosts = account.posts
      .filter(post => post.insights && post.insights.length > 0)
      .slice(0, 10)
      .map(post => ({
        mediaType: post.mediaType,
        engagementRate: post.insights[0]?.engagementRate || 0,
        reach: post.insights[0]?.reach || 0,
        likes: post.insights[0]?.likes || 0,
        caption: post.caption,
      }));

    const contentIdeas = await this.contentGenerator.generateContentIdeas(
      account.niche || 'ზოგადი',
      recentPosts,
      [account.language],
      'friendly',
      5,
    );

    return contentIdeas.map((idea, index) => 
      this.recommendationRepository.create({
        accountId: account.id,
        type: RecommendationType.CONTENT_IDEA,
        title: idea.title,
        content: JSON.stringify({
          idea,
          performance_prediction: this.predictPerformance(idea, recentPosts),
        }),
        priority: index < 2 ? 1 : 2, // First 2 are high priority
        status: RecommendationStatus.ACTIVE,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      })
    );
  }

  private async generateTimingRecommendations(account: Account): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyze posting times from recent posts
    const postingTimes = account.posts
      .filter(post => post.timestamp && post.insights && post.insights.length > 0)
      .map(post => ({
        hour: post.timestamp.getHours(),
        dayOfWeek: post.timestamp.getDay(),
        engagementRate: post.insights[0]?.engagementRate || 0,
        reach: post.insights[0]?.reach || 0,
      }));

    if (postingTimes.length > 5) {
      const bestTimes = this.analyzeBestPostingTimes(postingTimes);
      
      recommendations.push(
        this.recommendationRepository.create({
          accountId: account.id,
          type: RecommendationType.TIMING,
          title: 'საუკეთესო დრო გამოქვეყნებისთვის',
          content: JSON.stringify({
            bestTimes,
            analysis: 'თქვენი აუდიტორიის ანალიზის საფუძველზე',
            timezone: account.timezone,
          }),
          priority: 1,
          status: RecommendationStatus.ACTIVE,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Valid for 14 days
        })
      );
    }

    return recommendations;
  }

  private async generateHashtagRecommendations(account: Account): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyze hashtag performance from recent posts
    const hashtagPerformance = this.analyzeHashtagPerformance(account.posts);

    if (Object.keys(hashtagPerformance).length > 0) {
      const topHashtags = Object.entries(hashtagPerformance)
        .sort(([,a], [,b]) => b.avgEngagement - a.avgEngagement)
        .slice(0, 15)
        .map(([hashtag, data]) => ({ hashtag, ...data }));

      recommendations.push(
        this.recommendationRepository.create({
          accountId: account.id,
          type: RecommendationType.HASHTAGS,
          title: 'საუკეთესო ჰეშთეგები',
          content: JSON.stringify({
            topPerforming: topHashtags.slice(0, 10),
            underperforming: Object.entries(hashtagPerformance)
              .sort(([,a], [,b]) => a.avgEngagement - b.avgEngagement)
              .slice(0, 5)
              .map(([hashtag, data]) => ({ hashtag, ...data })),
            suggestions: await this.contentGenerator.generateHashtags(
              account.niche || 'ზოგადი',
              'ზოგადი კონტენტი',
              account.language,
            ),
          }),
          priority: 2,
          status: RecommendationStatus.ACTIVE,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        })
      );
    }

    return recommendations;
  }

  private predictPerformance(idea: ContentIdea, recentPosts: any[]): any {
    if (recentPosts.length === 0) {
      return { predicted_er: 2.5, confidence: 'low' };
    }

    // Simple performance prediction based on content type and recent performance
    const avgER = recentPosts.reduce((sum, post) => sum + post.engagementRate, 0) / recentPosts.length;
    
    let multiplier = 1;
    if (idea.contentType === 'REEL') multiplier = 1.3; // Reels typically perform better
    if (idea.contentType === 'CAROUSEL') multiplier = 1.1;

    return {
      predicted_er: Math.round(avgER * multiplier * 100) / 100,
      confidence: recentPosts.length > 5 ? 'high' : 'medium',
      based_on_posts: recentPosts.length,
    };
  }

  private analyzeBestPostingTimes(postingTimes: any[]): any {
    const hourlyPerformance = {};
    const dailyPerformance = {};

    postingTimes.forEach(({ hour, dayOfWeek, engagementRate, reach }) => {
      // Hourly analysis
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { totalER: 0, totalReach: 0, count: 0 };
      }
      hourlyPerformance[hour].totalER += engagementRate;
      hourlyPerformance[hour].totalReach += reach;
      hourlyPerformance[hour].count += 1;

      // Daily analysis
      if (!dailyPerformance[dayOfWeek]) {
        dailyPerformance[dayOfWeek] = { totalER: 0, totalReach: 0, count: 0 };
      }
      dailyPerformance[dayOfWeek].totalER += engagementRate;
      dailyPerformance[dayOfWeek].totalReach += reach;
      dailyPerformance[dayOfWeek].count += 1;
    });

    const bestHours = Object.entries(hourlyPerformance)
      .map(([hour, data]: [string, any]) => ({
        hour: parseInt(hour),
        avgER: data.totalER / data.count,
        avgReach: data.totalReach / data.count,
        posts: data.count,
      }))
      .sort((a, b) => b.avgER - a.avgER)
      .slice(0, 3);

    const bestDays = Object.entries(dailyPerformance)
      .map(([day, data]: [string, any]) => ({
        day: parseInt(day),
        dayName: ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'][parseInt(day)],
        avgER: data.totalER / data.count,
        avgReach: data.totalReach / data.count,
        posts: data.count,
      }))
      .sort((a, b) => b.avgER - a.avgER)
      .slice(0, 3);

    return { bestHours, bestDays };
  }

  private analyzeHashtagPerformance(posts: Post[]): Record<string, any> {
    const hashtagPerformance = {};

    posts
      .filter(post => post.hashtags && post.hashtags.length > 0 && post.insights && post.insights.length > 0)
      .forEach(post => {
        const er = post.insights[0]?.engagementRate || 0;
        const reach = post.insights[0]?.reach || 0;

        post.hashtags.forEach(hashtag => {
          if (!hashtagPerformance[hashtag]) {
            hashtagPerformance[hashtag] = {
              totalER: 0,
              totalReach: 0,
              count: 0,
            };
          }
          hashtagPerformance[hashtag].totalER += er;
          hashtagPerformance[hashtag].totalReach += reach;
          hashtagPerformance[hashtag].count += 1;
        });
      });

    // Calculate averages
    Object.keys(hashtagPerformance).forEach(hashtag => {
      const data = hashtagPerformance[hashtag];
      hashtagPerformance[hashtag] = {
        avgEngagement: data.totalER / data.count,
        avgReach: data.totalReach / data.count,
        usageCount: data.count,
      };
    });

    return hashtagPerformance;
  }

  async getRecommendations(accountId: string, status?: RecommendationStatus): Promise<Recommendation[]> {
    const whereCondition: any = { accountId };
    if (status) {
      whereCondition.status = status;
    }

    return this.recommendationRepository.find({
      where: whereCondition,
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  async updateRecommendationStatus(recommendationId: string, status: RecommendationStatus): Promise<void> {
    await this.recommendationRepository.update(recommendationId, { status });
  }
}
