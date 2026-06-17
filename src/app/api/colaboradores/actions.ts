"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function crearColaborador(data: any) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Verificar permisos (solo admin puede crear usuarios)
  const usuario = await prisma.colaborador.findUnique({
    where: { id: session.uid },
    include: { perfil: true },
  });

  if (!usuario || usuario.perfil.nombre !== "Administrador") {
    return { success: false, error: "No autorizado para crear colaboradores" };
  }

  // Hash contraseña
  const passwordHash = await bcrypt.hash(data.password || "Iencinas2026", 10);

  try {
    const nuevo = await prisma.colaborador.create({
      data: {
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno || null,
        correo: data.correo.toLowerCase(),
        passwordHash,
        // Datos personales
        telefonoPersonal: data.telefonoPersonal || null,
        rutPersonal: data.rutPersonal || null,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        region: data.region || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        numeroEmergencia: data.numeroEmergencia || null,
        // Datos empresa
        area: data.area || null,
        cargo: data.cargo || null,
        telefonoCorporativo: data.telefonoCorporativo || null,
        centrodeCosto: data.centrodeCosto || null,
        disponibilidad: data.disponibilidad || "activo",
        fechaEgresoEsperado: data.fechaEgresoEsperado ? new Date(data.fechaEgresoEsperado) : null,
        perfilId: data.perfilId,
      },
      include: { perfil: true },
    });

    // Proyectos asignados
    const proyectosIds: string[] = data.proyectosIds ?? [];
    if (proyectosIds.length > 0) {
      await prisma.colaboradorProyecto.createMany({
        data: proyectosIds.map((pid: string) => ({ colaboradorId: nuevo.id, proyectoId: pid })),
      });
    }

    // Auditoría
    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid,
        accion: "crear",
        entidad: "Colaborador",
        detalle: `Creado usuario: ${nuevo.nombre} ${nuevo.apellidoPaterno}`,
      },
    });

    return { success: true, data: nuevo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function actualizarColaborador(id: string, data: any) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Verificar permisos: admin o usuario editando su propio perfil
  const esAdmin = (await prisma.colaborador.findUnique({
    where: { id: session.uid },
    include: { perfil: { include: { colaboradores: true } } },
  }))?.perfil.nombre === "Administrador";

  if (id !== session.uid && !esAdmin) throw new Error("No autorizado");

  try {
    const actualizado = await prisma.colaborador.update({
      where: { id },
      data: {
        // Datos que el usuario puede editar de sí mismo
        telefonoPersonal: data.telefonoPersonal !== undefined ? data.telefonoPersonal : undefined,
        direccion: data.direccion !== undefined ? data.direccion : undefined,
        ciudad: data.ciudad !== undefined ? data.ciudad : undefined,
        region: data.region !== undefined ? data.region : undefined,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
        numeroEmergencia: data.numeroEmergencia !== undefined ? data.numeroEmergencia : undefined,
        // Datos que solo admin puede editar
        ...(esAdmin && {
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno || null,
          nombre: data.nombre,
          area: data.area || null,
          cargo: data.cargo || null,
          telefonoCorporativo: data.telefonoCorporativo || null,
          centrodeCosto: data.centrodeCosto || null,
          disponibilidad: data.disponibilidad || "activo",
          fechaEgresoEsperado: data.fechaEgresoEsperado ? new Date(data.fechaEgresoEsperado) : null,
          perfilId: data.perfilId,
        }),
      },
      include: { perfil: true },
    });

    // Sincronizar proyectos (solo admin)
    if (esAdmin && Array.isArray(data.proyectosIds)) {
      await prisma.colaboradorProyecto.deleteMany({ where: { colaboradorId: id } });
      if (data.proyectosIds.length > 0) {
        await prisma.colaboradorProyecto.createMany({
          data: data.proyectosIds.map((pid: string) => ({ colaboradorId: id, proyectoId: pid })),
        });
      }
    }

    // Auditoría
    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid,
        accion: "editar",
        entidad: "Colaborador",
        detalle: `Actualizado usuario: ${actualizado.nombre}`,
      },
    });

    return { success: true, data: actualizado };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
