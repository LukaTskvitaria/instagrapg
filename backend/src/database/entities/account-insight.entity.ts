import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Account } from './account.entity';

@Entity('account_insights')
@Unique(['accountId', 'date'])
export class AccountInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  reach: number;

  @Column({ default: 0 })
  impressions: number;

  @Column({ name: 'profile_visits', default: 0 })
  profileVisits: number;

  @Column({ name: 'website_clicks', default: 0 })
  websiteClicks: number;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'media_count', default: 0 })
  mediaCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Account, account => account.insights)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
