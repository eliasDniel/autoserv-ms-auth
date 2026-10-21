import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async health() {
    const roles = await this.prisma.rol.count();
    return { status: 'ok', servicio: 'ms-auth', roles };
  }
}
