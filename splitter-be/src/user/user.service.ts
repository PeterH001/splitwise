import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindUserDTO, PatchUserDTO } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getMe(user: User) {
    const resultUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
        email: user.email,
      },
      select: {
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return resultUser;
  }

  async findUsersByUsernamePartial(
    dto: FindUserDTO,
  ): Promise<{ id: number; username: string }[]> {
    console.log(dto);

    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: dto.partialUsername,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
    return users;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
  }

  async patchMe(id: number, dto: PatchUserDTO) {
    try {
      const currentUser: User = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (currentUser.email !== dto.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: {
            email: dto.email,
          },
        });
        if (existingUser) {
          throw new HttpException('Email is already in use.', HttpStatus.BAD_REQUEST);
        }
      }

      if (currentUser.username !== dto.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: {
            username: dto.username,
          },
        });
        if (existingUser) {
          throw new HttpException('Username is already in use.', HttpStatus.BAD_REQUEST);
        }
      }
      return this.prisma.user.update({
        where: {
          id,
        },
        data: dto,
        select:{
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
