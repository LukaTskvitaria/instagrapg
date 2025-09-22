import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

export enum RecommendationType {
  CONTENT_IDEA = 'content_idea',
  CAPTION = 'caption',
  HASHTAGS = 'hashtags',
  TIMING = 'timing'
}

export enum RecommendationStatus {
  ACTIVE = 'active',
  DISMISSED = 'dismissed',
  COMPLETED = 'completed'
}

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 1 })
  priority: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'valid_until', nullable: true })
  validUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Account, account => account.recommendations)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
