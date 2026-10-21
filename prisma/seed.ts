import { PrismaPg } from '@prisma/adapter-pg';
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
