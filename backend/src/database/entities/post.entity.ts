import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Insight } from './insight.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CAROUSEL_ALBUM = 'CAROUSEL_ALBUM'
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'ig_media_id', unique: true })
  igMediaId: string;

  @Column({ name: 'media_type' })
  mediaType: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true, type: 'text' })
  caption: string;

  @Column({ nullable: true })
  permalink: string;

  @Column({ nullable: true })
  timestamp: Date;

  @Column({ nullable: true })
  topic: string;

  @Column({ type: 'text', array: true, default: '{}' })
  hashtags: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  mentions: string[];

  @Column({ name: 'is_story', default: false })
  isStory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Account, account => account.posts)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => Insight, insight => insight.post)
  insights: Insight[];
}
