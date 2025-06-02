import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ApiAuthParams } from '@demo-t3/models';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async createUser({ email, password }: ApiAuthParams) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async updateUser(id: number, data: { email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async signIn({ email, password }: ApiAuthParams) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }
}
