import { ForbiddenException, HttpException, HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDTO, SigninDTO } from './dto';
import * as argon from 'argon2';
import { Role, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from './guard';

@Injectable()
@UseGuards(RolesGuard)
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(dto: SignupDTO) {
    const hash = await argon.hash(dto.password);
    try {
      const user: User = await this.prismaService.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          pwhash: hash,
          role: dto.role,
        },
      });
      const token = await this.signToken(user.id, user.email, user.role);
      return {
        token,
        role: user.role,
      };
    } catch (error) {
      console.log(error); 
      
      const field = error.meta.target[0];
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          if(field === "username"){
            throw new HttpException('Username is already taken', HttpStatus.BAD_REQUEST);
          }else if(field === "email"){
            throw new HttpException('Email is already taken', HttpStatus.BAD_REQUEST);
          }
        }
      }
      throw error;
    }
  }

  async login(dto: SigninDTO) {
    //find user by id
    console.log('login called');

    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if doesnt find throw error
    if (!user) throw new ForbiddenException('Credentials incorrect');
    //compare pw
    const pwMatches = await argon.verify(user.pwhash, dto.password);
    //if pw incorrect throw error
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const token = await this.signToken(user.id, user.email, user.role);
    console.log(token);
    
      return {
        token,
        role: user.role,
      };
    // return this.signToken(user.id, user.email, user.role);
  }

  async signToken(
    userId: number,
    email: string,
    role: Role,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const secret = this.configService.get('JWT_SECRET');
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return access_token;
  }
}
