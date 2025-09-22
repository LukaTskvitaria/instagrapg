import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('insights')
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ default: 0 })
  reach: number;

  @Column({ default: 0 })
  impressions: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ default: 0 })
  shares: number;

  @Column({ default: 0 })
  saves: number;

  @Column({ name: 'profile_visits', default: 0 })
  profileVisits: number;

  @Column({ name: 'website_clicks', default: 0 })
  websiteClicks: number;

  @Column({ name: 'video_views', default: 0 })
  videoViews: number;

  @Column({ name: 'video_avg_time_watched', type: 'decimal', precision: 5, scale: 2, default: 0 })
  videoAvgTimeWatched: number;

  @Column({ name: 'engagement_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  engagementRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ctr: number;

  @Column({ name: 'recorded_at' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Post, post => post.insights)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
