import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PERMISOS_ADMIN,
  PERMISOS_BODEGUERO,
  PERMISOS_COLABORADOR,
} from "@/lib/permisos";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Verificar token de seguridad
  const token = request.headers.get("x-seed-token");
  if (token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Limpiando datos previos…");
    await prisma.solicitudItem.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.asignacion.deleteMany();
    await prisma.movimiento.deleteMany();
    await prisma.itemSerializado.deleteMany();
    await prisma.insumo.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.proveedor.deleteMany();
    await prisma.logAuditoria.deleteMany();
    await prisma.colaborador.deleteMany();
    await prisma.perfil.deleteMany();

    console.log("Creando perfiles base…");
    const admin = await prisma.perfil.create({
      data: { nombre: "Administrador", descripcion: "Acceso total", esBase: true, permisos: JSON.stringify(PERMISOS_ADMIN) },
    });
    const bodeguero = await prisma.perfil.create({
      data: { nombre: "Bodeguero", descripcion: "Operación de bodega", esBase: true, permisos: JSON.stringify(PERMISOS_BODEGUERO) },
    });
    const colaboradorPerfil = await prisma.perfil.create({
      data: { nombre: "Colaborador", descripcion: "Solo Mi Espacio", esBase: true, permisos: JSON.stringify(PERMISOS_COLABORADOR) },
    });

    console.log("Creando usuarios…");
    const hash = await bcrypt.hash("Iencinas2026", 10);
    const admin_user = await prisma.colaborador.create({
      data: {
        nombre: "Vicente", apellidoPaterno: "Rabanables", apellidoMaterno: "Valenzuela", correo: "vrabanales@rcapcorp.cl",
        passwordHash: hash,
        telefonoPersonal: "+56 9 8765 4321",
        rutPersonal: "12.345.678-9",
        direccion: "Av. Providencia 1234, Depto 501",
        ciudad: "Santiago",
        region: "Región Metropolitana",
        fechaNacimiento: new Date("1985-03-15"),
        numeroEmergencia: "+56 9 2222 1111",
        fotoPerfil: null,
        area: "Administración", cargo: "Ingeniero Informático",
        telefonoCorporativo: "+56 2 2345 6789 ext. 101",
        centrodeCosto: "ADMIN",
        disponibilidad: "activo",
        perfilId: admin.id,
      },
    });
    const jose_magento = await prisma.colaborador.create({
      data: {
        nombre: "José", apellidoPaterno: "Magento", apellidoMaterno: "García", correo: "jmagento@iencinas.cl",
        passwordHash: hash,
        telefonoPersonal: "+56 9 9999 8888",
        rutPersonal: "18.999.999-K",
        direccion: "Av. Apoquindo 3000, Depto 1201",
        ciudad: "Las Condes",
        region: "Región Metropolitana",
        fechaNacimiento: new Date("1987-06-20"),
        numeroEmergencia: "+56 9 1234 5678",
        fotoPerfil: null,
        area: "Administración", cargo: "Administrador de Sistemas",
        telefonoCorporativo: "+56 2 2345 6789 ext. 105",
        centrodeCosto: "ADMIN",
        disponibilidad: "activo",
        perfilId: admin.id,
      },
    });
    const colab = await prisma.colaborador.create({
      data: {
        nombre: "Diego", apellidoPaterno: "Fuentes", apellidoMaterno: "Ramírez", correo: "colaborador@iencinas.cl",
        passwordHash: hash,
        telefonoPersonal: "+56 9 7654 3210",
        rutPersonal: "34.567.890-1",
        direccion: "La Dehesa 9999, Apto 3",
        ciudad: "Santiago",
        region: "Región Metropolitana",
        fechaNacimiento: new Date("1992-11-08"),
        numeroEmergencia: "+56 9 1111 2222",
        area: "Comercial", cargo: "Ejecutivo de ventas",
        telefonoCorporativo: "+56 2 2345 6789 ext. 201",
        centrodeCosto: "COMERCIAL",
        jefDirectoId: admin_user.id,
        disponibilidad: "activo",
        perfilId: colaboradorPerfil.id,
      },
    });

    console.log("✅ Seed completado");
    return NextResponse.json({ success: true, message: "Seed ejecutado exitosamente" });
  } catch (error: any) {
    console.error("Error en seed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
