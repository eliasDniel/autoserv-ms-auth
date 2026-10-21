import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { envs } from '../src/config/envs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: envs.dataBaseUrl,
  }),
});

const roles = [
  {
    nombre: 'Administrador',
    descripcion: 'Acceso total al taller, usuarios e inventario',
  },
  {
    nombre: 'Asesor de Servicio',
    descripcion: 'Recepción, clientes, vehículos y diagnóstico',
  },
  {
    nombre: 'Técnico Mecánico',
    descripcion: 'Órdenes asignadas, estado del servicio y repuestos usados',
  },
];

async function main() {
  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });
  }

  const correo = process.env.SEED_ADMIN_CORREO ?? 'admin@autoserv.local';
  const yaExiste = await prisma.usuario.findUnique({ where: { correo } });
  if (yaExiste) {
    return;
  }

  const administrador = await prisma.rol.findUnique({
    where: { nombre: 'Administrador' },
  });
  if (!administrador) {
    throw new Error('El rol Administrador no existe');
  }

  await prisma.usuario.create({
    data: {
      nombre: process.env.SEED_ADMIN_NOMBRE ?? 'Admin',
      apellido: process.env.SEED_ADMIN_APELLIDO ?? 'Taller',
      correo,
      passwordHash: await bcrypt.hash(
        process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345',
        10,
      ),
      rolId: administrador.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
