import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Account, Post, Insight, AccountInsight, Recommendation } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      Post,
      Insight,
      AccountInsight,
      Recommendation,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
