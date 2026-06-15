import { eq, and, isNull, desc, gte, lte, sql } from 'drizzle-orm';
import db from '../config/database.js';
import { tiempoExtra, colaboradores, users } from '../db/schema.js';

/**
 * Calcula las horas totales entre dos horas (formato HH:MM)
 * Maneja correctamente turnos que cruzan medianoche
 */
function calcularHorasTotales(horaInicio, horaFin) {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  let minutosInicio = hInicio * 60 + mInicio;
  let minutosFin = hFin * 60 + mFin;

  // Si la hora fin es menor que la hora inicio, asumimos que cruza medianoche
  if (minutosFin < minutosInicio) {
    minutosFin += 24 * 60; // Agregar 24 horas en minutos
  }

  const horasTotales = ((minutosFin - minutosInicio) / 60).toFixed(2);
  return horasTotales;
}

/**
 * GET /api/tiempo-extra
 * Lista registros de tiempo extra
 */
export async function listTiempoExtra(req, res) {
  try {
    // Verificar permisos solo si hay usuario autenticado
    // Si no hay req.user, es acceso público (dashboard RRHH)
    if (req.user) {
      if (!req.user.permisos?.tiempoExtra && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver tiempo extra',
        });
      }
    }

    // Construir condiciones de filtrado
    const conditions = [isNull(tiempoExtra.deleted_at)];

    // Filtros opcionales
    const { fecha, departamento, colaboradorId, mes } = req.query;

    if (fecha) {
      // Filtrar por fecha específica
      conditions.push(eq(tiempoExtra.fecha, fecha));
    } else if (mes) {
      // Filtrar por mes (formato: YYYY-MM)
      const [year, month] = mes.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      conditions.push(gte(tiempoExtra.fecha, startDate));
      conditions.push(lte(tiempoExtra.fecha, endDate));
    }

    if (departamento) {
      conditions.push(eq(tiempoExtra.departamento, departamento));
    }

    if (colaboradorId) {
      conditions.push(eq(tiempoExtra.colaborador_id, parseInt(colaboradorId)));
    }

    // Consulta con JOIN a colaboradores
    const registros = await db
      .select({
        id: tiempoExtra.id,
        colaboradorId: tiempoExtra.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`,
        colaboradorFoto: colaboradores.foto,
        departamento: tiempoExtra.departamento,
        puesto: colaboradores.puesto,
        fecha: tiempoExtra.fecha,
        horaInicio: tiempoExtra.hora_inicio,
        horaFin: tiempoExtra.hora_fin,
        horasTotales: tiempoExtra.horas_totales,
        area: tiempoExtra.area,
        motivo: tiempoExtra.motivo,
        autorizadoPor: tiempoExtra.autorizado_por,
        registradoPor: tiempoExtra.registrado_por,
        editadoPor: tiempoExtra.editado_por,
        fechaRegistro: tiempoExtra.created_at,
        fechaEdicion: tiempoExtra.updated_at,
      })
      .from(tiempoExtra)
      .innerJoin(colaboradores, eq(tiempoExtra.colaborador_id, colaboradores.id))
      .where(and(...conditions))
      .orderBy(desc(tiempoExtra.fecha), desc(tiempoExtra.hora_inicio));

    res.json({
      success: true,
      registros,
      total: registros.length,
    });
  } catch (error) {
    console.error('Error listando tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener registros de tiempo extra',
    });
  }
}

/**
 * POST /api/tiempo-extra
 * Crea un nuevo registro de tiempo extra
 */
export async function createTiempoExtra(req, res) {
  try {
    // Verificar permisos: requiere permiso 'tiempoExtra'
    if (!req.user.permisos?.tiempoExtra) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para registrar tiempo extra',
      });
    }

    const {
      colaboradorId,
      departamento,
      fecha,
      horaInicio,
      horaFin,
      area = null,
      motivo,
      autorizadoPor,
    } = req.body;

    // Validaciones
    if (!colaboradorId || !departamento || !fecha || !horaInicio || !horaFin || !motivo || !autorizadoPor) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Todos los campos requeridos deben ser proporcionados',
      });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'La fecha debe estar en formato YYYY-MM-DD',
      });
    }

    // Validar formato de hora
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(horaInicio) || !timeRegex.test(horaFin)) {
      return res.status(400).json({
        error: 'Hora inválida',
        message: 'Las horas deben estar en formato HH:MM',
      });
    }

    // Verificar que el colaborador exista
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({
        error: 'Colaborador no encontrado',
        message: 'El colaborador especificado no existe',
      });
    }

    // Calcular horas totales
    const horasTotales = calcularHorasTotales(horaInicio, horaFin);

    // Crear registro de tiempo extra
    const [nuevoRegistro] = await db
      .insert(tiempoExtra)
      .values({
        colaborador_id: colaboradorId,
        departamento,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        horas_totales: horasTotales,
        area,
        motivo,
        autorizado_por: autorizadoPor,
        registrado_por: req.user.id,
      })
      .returning();

    // Obtener el registro completo con datos del colaborador
    const [registroCompleto] = await db
      .select({
        id: tiempoExtra.id,
        colaboradorId: tiempoExtra.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`,
        colaboradorFoto: colaboradores.foto,
        departamento: tiempoExtra.departamento,
        puesto: colaboradores.puesto,
        fecha: tiempoExtra.fecha,
        horaInicio: tiempoExtra.hora_inicio,
        horaFin: tiempoExtra.hora_fin,
        horasTotales: tiempoExtra.horas_totales,
        area: tiempoExtra.area,
        motivo: tiempoExtra.motivo,
        autorizadoPor: tiempoExtra.autorizado_por,
        registradoPor: tiempoExtra.registrado_por,
        fechaRegistro: tiempoExtra.created_at,
      })
      .from(tiempoExtra)
      .innerJoin(colaboradores, eq(tiempoExtra.colaborador_id, colaboradores.id))
      .where(eq(tiempoExtra.id, nuevoRegistro.id))
      .limit(1);

    res.status(201).json({
      success: true,
      message: 'Registro de tiempo extra creado exitosamente',
      registro: registroCompleto,
    });
  } catch (error) {
    console.error('Error creando tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear registro de tiempo extra',
    });
  }
}

/**
 * GET /api/tiempo-extra/:id
 * Obtiene un registro específico de tiempo extra
 */
export async function getTiempoExtra(req, res) {
  try {
    const registroId = parseInt(req.params.id);

    // Verificar permisos solo si hay usuario autenticado
    if (req.user) {
      if (!req.user.permisos?.tiempoExtra && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver tiempo extra',
        });
      }
    }

    const [registro] = await db
      .select({
        id: tiempoExtra.id,
        colaboradorId: tiempoExtra.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`,
        colaboradorFoto: colaboradores.foto,
        departamento: tiempoExtra.departamento,
        puesto: colaboradores.puesto,
        fecha: tiempoExtra.fecha,
        horaInicio: tiempoExtra.hora_inicio,
        horaFin: tiempoExtra.hora_fin,
        horasTotales: tiempoExtra.horas_totales,
        area: tiempoExtra.area,
        motivo: tiempoExtra.motivo,
        autorizadoPor: tiempoExtra.autorizado_por,
        registradoPor: tiempoExtra.registrado_por,
        editadoPor: tiempoExtra.editado_por,
        fechaRegistro: tiempoExtra.created_at,
        fechaEdicion: tiempoExtra.updated_at,
      })
      .from(tiempoExtra)
      .innerJoin(colaboradores, eq(tiempoExtra.colaborador_id, colaboradores.id))
      .where(and(eq(tiempoExtra.id, registroId), isNull(tiempoExtra.deleted_at)))
      .limit(1);

    if (!registro) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de tiempo extra no encontrado',
      });
    }

    res.json({
      success: true,
      registro,
    });
  } catch (error) {
    console.error('Error obteniendo tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener registro de tiempo extra',
    });
  }
}

/**
 * PUT /api/tiempo-extra/:id
 * Actualiza un registro de tiempo extra
 */
export async function updateTiempoExtra(req, res) {
  try {
    const registroId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.tiempoExtra) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para actualizar tiempo extra',
      });
    }

    const {
      colaboradorId,
      departamento,
      fecha,
      horaInicio,
      horaFin,
      area,
      motivo,
      autorizadoPor,
    } = req.body;

    // Verificar que el registro existe
    const [registroExistente] = await db
      .select()
      .from(tiempoExtra)
      .where(and(eq(tiempoExtra.id, registroId), isNull(tiempoExtra.deleted_at)))
      .limit(1);

    if (!registroExistente) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de tiempo extra no encontrado',
      });
    }

    // Construir objeto de actualización (solo campos proporcionados)
    const updateData = {
      updated_at: new Date(),
      editado_por: req.user.id,
    };

    if (colaboradorId !== undefined) {
      // Verificar que el colaborador existe
      const [colaborador] = await db
        .select()
        .from(colaboradores)
        .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
        .limit(1);

      if (!colaborador) {
        return res.status(404).json({
          error: 'Colaborador no encontrado',
          message: 'El colaborador especificado no existe',
        });
      }

      updateData.colaborador_id = colaboradorId;
    }

    if (departamento !== undefined) updateData.departamento = departamento;
    if (area !== undefined) updateData.area = area;
    if (motivo !== undefined) updateData.motivo = motivo;
    if (autorizadoPor !== undefined) updateData.autorizado_por = autorizadoPor;

    if (fecha !== undefined) {
      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fecha)) {
        return res.status(400).json({
          error: 'Fecha inválida',
          message: 'La fecha debe estar en formato YYYY-MM-DD',
        });
      }
      updateData.fecha = fecha;
    }

    // Si se actualiza horaInicio o horaFin, recalcular horas totales
    let horaInicioFinal = registroExistente.hora_inicio;
    let horaFinFinal = registroExistente.hora_fin;

    if (horaInicio !== undefined) {
      // Validar formato de hora
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(horaInicio)) {
        return res.status(400).json({
          error: 'Hora inválida',
          message: 'La hora de inicio debe estar en formato HH:MM',
        });
      }
      updateData.hora_inicio = horaInicio;
      horaInicioFinal = horaInicio;
    }

    if (horaFin !== undefined) {
      // Validar formato de hora
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(horaFin)) {
        return res.status(400).json({
          error: 'Hora inválida',
          message: 'La hora fin debe estar en formato HH:MM',
        });
      }
      updateData.hora_fin = horaFin;
      horaFinFinal = horaFin;
    }

    // Recalcular horas totales si cambió alguna de las horas
    if (horaInicio !== undefined || horaFin !== undefined) {
      updateData.horas_totales = calcularHorasTotales(horaInicioFinal, horaFinFinal);
    }

    // Actualizar registro
    await db
      .update(tiempoExtra)
      .set(updateData)
      .where(and(eq(tiempoExtra.id, registroId), isNull(tiempoExtra.deleted_at)));

    // Obtener registro actualizado con datos del colaborador
    const [registroActualizado] = await db
      .select({
        id: tiempoExtra.id,
        colaboradorId: tiempoExtra.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`,
        colaboradorFoto: colaboradores.foto,
        departamento: tiempoExtra.departamento,
        puesto: colaboradores.puesto,
        fecha: tiempoExtra.fecha,
        horaInicio: tiempoExtra.hora_inicio,
        horaFin: tiempoExtra.hora_fin,
        horasTotales: tiempoExtra.horas_totales,
        area: tiempoExtra.area,
        motivo: tiempoExtra.motivo,
        autorizadoPor: tiempoExtra.autorizado_por,
        registradoPor: tiempoExtra.registrado_por,
        editadoPor: tiempoExtra.editado_por,
        fechaRegistro: tiempoExtra.created_at,
        fechaEdicion: tiempoExtra.updated_at,
      })
      .from(tiempoExtra)
      .innerJoin(colaboradores, eq(tiempoExtra.colaborador_id, colaboradores.id))
      .where(eq(tiempoExtra.id, registroId))
      .limit(1);

    res.json({
      success: true,
      message: 'Registro de tiempo extra actualizado exitosamente',
      registro: registroActualizado,
    });
  } catch (error) {
    console.error('Error actualizando tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar registro de tiempo extra',
    });
  }
}

/**
 * DELETE /api/tiempo-extra/:id
 * Elimina un registro de tiempo extra (soft delete)
 */
export async function deleteTiempoExtra(req, res) {
  try {
    const registroId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.tiempoExtra) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para eliminar tiempo extra',
      });
    }

    // Soft delete (marcar como eliminado)
    const [deletedRegistro] = await db
      .update(tiempoExtra)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(tiempoExtra.id, registroId), isNull(tiempoExtra.deleted_at)))
      .returning({
        id: tiempoExtra.id,
      });

    if (!deletedRegistro) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de tiempo extra no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Registro de tiempo extra eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar registro de tiempo extra',
    });
  }
}

/**
 * GET /api/tiempo-extra/stats
 * Obtiene estadísticas de tiempo extra por mes
 */
export async function getTiempoExtraStats(req, res) {
  try {
    // Verificar permisos solo si hay usuario autenticado
    if (req.user) {
      if (!req.user.permisos?.tiempoExtra && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver estadísticas de tiempo extra',
        });
      }
    }

    // Obtener mes del query (default: mes actual)
    let { mes } = req.query;
    if (!mes) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      mes = `${year}-${month}`;
    }

    // Validar formato del mes
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({
        error: 'Formato inválido',
        message: 'El mes debe estar en formato YYYY-MM',
      });
    }

    const [year, month] = mes.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    // Estadísticas por departamento
    const statsPorDepartamento = await db
      .select({
        departamento: tiempoExtra.departamento,
        totalHoras: sql`CAST(SUM(${tiempoExtra.horas_totales}) AS DECIMAL(10,2))`,
        totalRegistros: sql`COUNT(*)`,
      })
      .from(tiempoExtra)
      .where(
        and(
          isNull(tiempoExtra.deleted_at),
          gte(tiempoExtra.fecha, startDate),
          lte(tiempoExtra.fecha, endDate)
        )
      )
      .groupBy(tiempoExtra.departamento);

    // Estadísticas por colaborador
    const statsPorColaborador = await db
      .select({
        colaboradorId: tiempoExtra.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`,
        departamento: tiempoExtra.departamento,
        totalHoras: sql`CAST(SUM(${tiempoExtra.horas_totales}) AS DECIMAL(10,2))`,
        totalRegistros: sql`COUNT(*)`,
      })
      .from(tiempoExtra)
      .innerJoin(colaboradores, eq(tiempoExtra.colaborador_id, colaboradores.id))
      .where(
        and(
          isNull(tiempoExtra.deleted_at),
          gte(tiempoExtra.fecha, startDate),
          lte(tiempoExtra.fecha, endDate)
        )
      )
      .groupBy(
        tiempoExtra.colaborador_id,
        colaboradores.nombres,
        colaboradores.apellidos,
        tiempoExtra.departamento
      )
      .orderBy(sql`SUM(${tiempoExtra.horas_totales}) DESC`);

    // Total general
    const [totalGeneral] = await db
      .select({
        totalHoras: sql`CAST(SUM(${tiempoExtra.horas_totales}) AS DECIMAL(10,2))`,
        totalRegistros: sql`COUNT(*)`,
      })
      .from(tiempoExtra)
      .where(
        and(
          isNull(tiempoExtra.deleted_at),
          gte(tiempoExtra.fecha, startDate),
          lte(tiempoExtra.fecha, endDate)
        )
      );

    res.json({
      success: true,
      mes,
      totalGeneral: {
        horas: totalGeneral.totalHoras || '0.00',
        registros: parseInt(totalGeneral.totalRegistros) || 0,
      },
      porDepartamento: statsPorDepartamento.map(stat => ({
        departamento: stat.departamento,
        horas: stat.totalHoras,
        registros: parseInt(stat.totalRegistros),
      })),
      porColaborador: statsPorColaborador.map(stat => ({
        colaboradorId: stat.colaboradorId,
        colaboradorNombre: stat.colaboradorNombre,
        departamento: stat.departamento,
        horas: stat.totalHoras,
        registros: parseInt(stat.totalRegistros),
      })),
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de tiempo extra:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener estadísticas de tiempo extra',
    });
  }
}
