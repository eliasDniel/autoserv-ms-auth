import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/payload.interface';

type UsuarioConRol = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rol: { nombre: string };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async health() {
    const roles = await this.prisma.rol.count();
    return { status: 'ok', servicio: 'ms-auth', roles };
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: 'El correo ya está registrado',
      });
    }

    const rol = await this.prisma.rol.findUnique({
      where: { nombre: dto.rol },
    });
    if (!rol) {
      throw new RpcException({
        statusCode: 400,
        message: 'El rol no existe',
      });
    }

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        passwordHash: await bcrypt.hash(dto.password, 10),
        rolId: rol.id,
      },
      include: { rol: true },
    });

    return this.toPublicUser(usuario);
  }

  async login(dto: LoginUserDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
      include: { rol: true },
    });

    const passwordOk = usuario
      ? await bcrypt.compare(dto.password, usuario.passwordHash)
      : false;

    if (!usuario || !passwordOk) {
      throw new RpcException({
        statusCode: 401,
        message: 'Credenciales inválidas',
      });
    }

    if (!usuario.activo) {
      throw new RpcException({
        statusCode: 403,
        message: 'La cuenta está desactivada',
      });
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      usuario: this.toPublicUser(usuario),
    };
  }

  private toPublicUser(usuario: UsuarioConRol) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol.nombre,
      activo: usuario.activo,
    };
  }
}
