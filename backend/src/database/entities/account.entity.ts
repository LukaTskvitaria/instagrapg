import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { AccountInsight } from './account-insight.entity';
import { Recommendation } from './recommendation.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'ig_id', unique: true })
  igId: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'media_count', default: 0 })
  mediaCount: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  biography: string;

  @Column({ nullable: true, length: 100 })
  niche: string;

  @Column({ default: 'ka', length: 10 })
  language: string;

  @Column({ default: 'Asia/Tbilisi', length: 50 })
  timezone: string;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Post, post => post.account)
  posts: Post[];

  @OneToMany(() => AccountInsight, insight => insight.account)
  insights: AccountInsight[];

  @OneToMany(() => Recommendation, recommendation => recommendation.account)
  recommendations: Recommendation[];
}
