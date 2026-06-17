import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PERMISOS_ADMIN,
  PERMISOS_BODEGUERO,
  PERMISOS_COLABORADOR,
} from "../src/lib/permisos";

const prisma = new PrismaClient();

async function main() {
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
      // Datos personales
      telefonoPersonal: "+56 9 8765 4321",
      rutPersonal: "12.345.678-9",
      direccion: "Av. Providencia 1234, Depto 501",
      ciudad: "Santiago",
      region: "Región Metropolitana",
      fechaNacimiento: new Date("1985-03-15"),
      numeroEmergencia: "+56 9 2222 1111",
      fotoPerfil: null,
      // Datos empresa
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
      // Datos personales
      telefonoPersonal: "+56 9 9999 8888",
      rutPersonal: "18.999.999-K",
      direccion: "Av. Apoquindo 3000, Depto 1201",
      ciudad: "Las Condes",
      region: "Región Metropolitana",
      fechaNacimiento: new Date("1987-06-20"),
      numeroEmergencia: "+56 9 1234 5678",
      fotoPerfil: null,
      // Datos empresa
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

  // Crear usuarios adicionales de ejemplo
  const user4 = await prisma.colaborador.create({
    data: {
      nombre: "Marcela", apellidoPaterno: "Carrasco", apellidoMaterno: "Valdés", correo: "marcela.carrasco@iencinas.cl",
      passwordHash: hash,
      telefonoPersonal: "+56 9 5432 1098",
      rutPersonal: "45.678.901-2",
      direccion: "Isidora Goyenechea 2000, Piso 12",
      ciudad: "Las Condes",
      region: "Región Metropolitana",
      fechaNacimiento: new Date("1988-05-30"),
      numeroEmergencia: "+56 9 4444 5555",
      area: "Finanzas", cargo: "Contador",
      telefonoCorporativo: "+56 2 2345 6789 ext. 301",
      centrodeCosto: "FIN",
      disponibilidad: "activo",
      perfilId: colaboradorPerfil.id,
    },
  });

  const user5 = await prisma.colaborador.create({
    data: {
      nombre: "Roberto", apellidoPaterno: "Méndez", apellidoMaterno: "Silva", correo: "roberto.mendez@iencinas.cl",
      passwordHash: hash,
      telefonoPersonal: "+56 9 4321 0987",
      rutPersonal: "56.789.012-3",
      direccion: "Apoquindo 4500, Casa G",
      ciudad: "Las Condes",
      region: "Región Metropolitana",
      fechaNacimiento: new Date("1995-02-14"),
      numeroEmergencia: "+56 9 5555 6666",
      area: "Tecnología", cargo: "Desarrollador",
      telefonoCorporativo: "+56 2 2345 6789 ext. 401",
      centrodeCosto: "TEC",
      disponibilidad: "activo",
      perfilId: colaboradorPerfil.id,
    },
  });

  console.log("Creando proveedores…");
  const prov1 = await prisma.proveedor.create({
    data: { nombre: "PC Factory", rut: "96.670.840-9", contacto: "Ventas empresas", email: "empresas@pcfactory.cl", telefono: "+56 2 2000 0000" },
  });
  const prov2 = await prisma.proveedor.create({
    data: { nombre: "Dimerc", rut: "80.483.000-2", contacto: "Mesa central", email: "ventas@dimerc.cl", telefono: "+56 2 2820 0000" },
  });

  console.log("Creando categorías…");
  const cTec = await prisma.categoria.create({ data: { nombre: "Tecnología", icono: "laptop", tipo: "tecnologia" } });
  const cOfi = await prisma.categoria.create({ data: { nombre: "Papelería", icono: "pen", tipo: "papeleria" } });
  const cCoc = await prisma.categoria.create({ data: { nombre: "Cocina", icono: "coffee", tipo: "cocina" } });
  const cAseo = await prisma.categoria.create({ data: { nombre: "Aseo", icono: "spray", tipo: "aseo" } });
  const cMob = await prisma.categoria.create({ data: { nombre: "Mobiliario", icono: "armchair", tipo: "mobiliario" } });

  console.log("Creando insumos…");
  const notebook = await prisma.insumo.create({
    data: {
      nombre: "Notebook Dell Latitude 5440", descripcion: "Notebook corporativo 14\"", categoriaId: cTec.id,
      sku: "TEC-NB-001", marca: "Dell", modelo: "Latitude 5440", unidad: "unidad",
      stockActual: 6, stockMinimo: 2, esSerializable: true, ubicacion: "Estante A-1", proveedorId: prov1.id,
    },
  });
  await prisma.itemSerializado.createMany({
    data: [
      { insumoId: notebook.id, numeroSerie: "DL5440-0001", estado: "disponible" },
      { insumoId: notebook.id, numeroSerie: "DL5440-0002", estado: "disponible" },
      { insumoId: notebook.id, numeroSerie: "DL5440-0003", estado: "asignado" },
    ],
  });

  const monitor = await prisma.insumo.create({
    data: { nombre: "Monitor LG 24\"", categoriaId: cTec.id, sku: "TEC-MON-002", marca: "LG", modelo: "24MK430", unidad: "unidad", stockActual: 4, stockMinimo: 2, ubicacion: "Estante A-2", proveedorId: prov1.id },
  });
  const cable = await prisma.insumo.create({
    data: { nombre: "Cable HDMI 1.5m", categoriaId: cTec.id, sku: "TEC-CAB-003", unidad: "unidad", stockActual: 15, stockMinimo: 5, ubicacion: "Caja B-3", proveedorId: prov1.id },
  });
  const mouse = await prisma.insumo.create({
    data: { nombre: "Mouse inalámbrico Logitech", categoriaId: cTec.id, sku: "TEC-MOU-004", marca: "Logitech", modelo: "M170", unidad: "unidad", stockActual: 1, stockMinimo: 4, ubicacion: "Caja B-1", proveedorId: prov1.id },
  });
  const resma = await prisma.insumo.create({
    data: { nombre: "Resma papel carta", categoriaId: cOfi.id, sku: "OFI-PAP-005", unidad: "resma", stockActual: 20, stockMinimo: 8, ubicacion: "Estante C-1", proveedorId: prov2.id },
  });
  const cafe = await prisma.insumo.create({
    data: { nombre: "Café molido 1kg", categoriaId: cCoc.id, sku: "COC-CAF-006", unidad: "bolsa", stockActual: 3, stockMinimo: 5, ubicacion: "Cocina", proveedorId: prov2.id },
  });
  await prisma.insumo.create({
    data: { nombre: "Cloro 5L", categoriaId: cAseo.id, sku: "ASE-CLO-007", unidad: "bidón", stockActual: 6, stockMinimo: 2, ubicacion: "Bodega aseo", proveedorId: prov2.id },
  });
  await prisma.insumo.create({
    data: { nombre: "Silla ergonómica", categoriaId: cMob.id, sku: "MOB-SIL-008", unidad: "unidad", stockActual: 2, stockMinimo: 1, ubicacion: "Estante D-1" },
  });

  console.log("Creando movimientos, asignaciones y solicitudes…");
  await prisma.movimiento.createMany({
    data: [
      { insumoId: notebook.id, tipo: "entrada", cantidad: 6, usuario: "Bárbara Soto", referencia: "OC-1024", motivo: "Compra inicial" },
      { insumoId: cafe.id, tipo: "salida", cantidad: 2, usuario: "Bárbara Soto", motivo: "Consumo cocina" },
      { insumoId: mouse.id, tipo: "salida", cantidad: 3, usuario: "Bárbara Soto", motivo: "Asignaciones" },
    ],
  });

  await prisma.asignacion.create({
    data: {
      colaboradorId: colab.id, insumoId: notebook.id, cantidad: 1, numeroSerie: "DL5440-0003",
      estado: "vigente", entregadoPor: "Bárbara Soto", observaciones: "Entrega onboarding",
    },
  });
  await prisma.asignacion.create({
    data: { colaboradorId: colab.id, insumoId: monitor.id, cantidad: 1, estado: "vigente", entregadoPor: "Bárbara Soto" },
  });

  await prisma.solicitud.create({
    data: {
      colaboradorId: colab.id, estado: "pendiente",
      items: { create: [{ insumoId: cable.id, cantidad: 1, justificacion: "Conectar monitor externo" }, { insumoId: resma.id, cantidad: 2, justificacion: "Impresiones de contratos" }] },
    },
  });
  await prisma.solicitud.create({
    data: {
      colaboradorId: colab.id, estado: "aprobada", comentarioAdmin: "Aprobado", resueltaPor: "Vicente Rabanales", fechaResolucion: new Date(),
      items: { create: [{ insumoId: mouse.id, cantidad: 1, justificacion: "Reemplazo mouse dañado" }] },
    },
  });

  console.log("✅ Seed completado.");
  console.log("   Vicente Rabanables (Admin): vrabanales@rcapcorp.cl / Iencinas2026");
  console.log("   José Magento (Admin):       jmagento@iencinas.cl / Iencinas2026");
  console.log("   Diego Fuentes (Colaborador): colaborador@iencinas.cl / Iencinas2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
