import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/entities';

export interface FacebookProfile {
  id: string;
  email: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateFacebookUser(profile: FacebookProfile): Promise<User> {
    const { id, email, name, picture } = profile;
    
    let user = await this.userRepository.findOne({
      where: { facebookId: id },
    });

    if (!user) {
      // Check if user exists with this email
      user = await this.userRepository.findOne({
        where: { email },
      });

      if (user) {
        // Link Facebook account to existing user
        user.facebookId = id;
        if (picture?.data?.url) {
          user.avatarUrl = picture.data.url;
        }
        await this.userRepository.save(user);
      } else {
        // Create new user
        user = this.userRepository.create({
          email,
          name,
          facebookId: id,
          avatarUrl: picture?.data?.url,
        });
        await this.userRepository.save(user);
      }
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['accounts'],
    });

    if (!user) {
      throw new UnauthorizedException('მომხმარებელი არ მოიძებნა');
    }

    return user;
  }
}
