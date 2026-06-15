import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import db from '../../config/database.js';
import { asistencia, colaboradores } from '../db/schema.js';

/**
 * GET /api/asistencia
 * Lista todos los registros de asistencia activos
 */
export async function listAsistencia(req, res) {
  try {
    // Verificar permisos solo si hay usuario autenticado
    // Si no hay req.user, es acceso público (dashboard RRHH)
    if (req.user) {
      if (!req.user.permisos?.asistencia && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver asistencias',
        });
      }
    }

    // Construir condiciones de filtrado
    const conditions = [isNull(asistencia.deleted_at)];

    // Filtros opcionales
    const { fecha, departamento, colaboradorId } = req.query;

    if (fecha) {
      conditions.push(eq(asistencia.fecha, fecha));
    }

    if (departamento) {
      conditions.push(eq(asistencia.departamento, departamento));
    }

    if (colaboradorId) {
      conditions.push(eq(asistencia.colaborador_id, parseInt(colaboradorId)));
    }

    // JOIN con colaboradores para incluir nombres
    const allAsistencia = await db
      .select({
        id: asistencia.id,
        colaboradorId: asistencia.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`.as('colaborador_nombre'),
        departamento: asistencia.departamento,
        fecha: asistencia.fecha,
        hora: asistencia.hora,
        estado: asistencia.estado,
        tipoInasistencia: asistencia.tipo_inasistencia,
        comentario: asistencia.comentario,
        registradoPor: asistencia.registrado_por,
        fechaRegistro: asistencia.created_at,
      })
      .from(asistencia)
      .leftJoin(colaboradores, eq(asistencia.colaborador_id, colaboradores.id))
      .where(and(...conditions))
      .orderBy(desc(asistencia.fecha), desc(asistencia.hora));

    res.json({
      success: true,
      asistencias: allAsistencia,
      total: allAsistencia.length,
    });
  } catch (error) {
    console.error('Error listando asistencias:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener asistencias',
    });
  }
}

/**
 * POST /api/asistencia
 * Crea un nuevo registro de asistencia
 */
export async function createAsistencia(req, res) {
  try {
    // Verificar permisos: requiere permiso 'pasarAsistencia' o 'asistencia'
    if (!req.user.permisos?.pasarAsistencia && !req.user.permisos?.asistencia) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para registrar asistencias',
      });
    }

    const {
      colaboradorId,
      fecha,
      hora,
      estado,
      tipoInasistencia = null,
      comentario = null,
    } = req.body;

    // Validaciones básicas
    if (!colaboradorId || !fecha || !hora || !estado) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'colaboradorId, fecha, hora y estado son requeridos',
      });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'La fecha debe estar en formato YYYY-MM-DD',
      });
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(hora)) {
      return res.status(400).json({
        error: 'Hora inválida',
        message: 'La hora debe estar en formato HH:MM',
      });
    }

    // Validar estado
    if (!['presente', 'ausente'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'El estado debe ser "presente" o "ausente"',
      });
    }

    // Si estado es ausente, tipoInasistencia es requerido
    if (estado === 'ausente' && !tipoInasistencia) {
      return res.status(400).json({
        error: 'Tipo de inasistencia requerido',
        message: 'Cuando el estado es "ausente", debes especificar el tipo de inasistencia',
      });
    }

    // Validar tipoInasistencia
    const tiposValidos = ['Falta', 'Incapacidad', 'Permiso', 'Vacaciones'];
    if (tipoInasistencia && !tiposValidos.includes(tipoInasistencia)) {
      return res.status(400).json({
        error: 'Tipo de inasistencia inválido',
        message: `El tipo de inasistencia debe ser uno de: ${tiposValidos.join(', ')}`,
      });
    }

    // Verificar que el colaborador existe
    const [colaborador] = await db
      .select({
        id: colaboradores.id,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
      })
      .from(colaboradores)
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({
        error: 'Colaborador no encontrado',
        message: 'El colaborador especificado no existe',
      });
    }

    // Verificar si ya existe un registro para este colaborador en esta fecha
    const [existingAsistencia] = await db
      .select()
      .from(asistencia)
      .where(
        and(
          eq(asistencia.colaborador_id, colaboradorId),
          eq(asistencia.fecha, fecha),
          isNull(asistencia.deleted_at)
        )
      )
      .limit(1);

    if (existingAsistencia) {
      return res.status(409).json({
        error: 'Registro duplicado',
        message: 'Ya existe un registro de asistencia para este colaborador en esta fecha',
      });
    }

    // Crear registro de asistencia
    const [newAsistencia] = await db
      .insert(asistencia)
      .values({
        colaborador_id: colaboradorId,
        departamento: colaborador.departamento,
        fecha,
        hora,
        estado,
        tipo_inasistencia: tipoInasistencia,
        comentario,
        registrado_por: req.user.id,
      })
      .returning({
        id: asistencia.id,
        colaboradorId: asistencia.colaborador_id,
        departamento: asistencia.departamento,
        fecha: asistencia.fecha,
        hora: asistencia.hora,
        estado: asistencia.estado,
        tipoInasistencia: asistencia.tipo_inasistencia,
        comentario: asistencia.comentario,
        registradoPor: asistencia.registrado_por,
        fechaRegistro: asistencia.created_at,
      });

    // Agregar datos del colaborador al response
    const response = {
      ...newAsistencia,
      colaboradorNombre: `${colaborador.nombres} ${colaborador.apellidos}`,
    };

    res.status(201).json({
      success: true,
      message: 'Asistencia registrada exitosamente',
      asistencia: response,
    });
  } catch (error) {
    console.error('Error creando asistencia:', error);

    // Manejar error de constraint único
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Registro duplicado',
        message: 'Ya existe un registro de asistencia para este colaborador en esta fecha',
      });
    }

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al registrar asistencia',
    });
  }
}

/**
 * GET /api/asistencia/:id
 * Obtiene un registro de asistencia específico
 */
export async function getAsistencia(req, res) {
  try {
    const asistenciaId = parseInt(req.params.id);

    // Verificar permisos solo si hay usuario autenticado
    if (req.user) {
      if (!req.user.permisos?.asistencia && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver asistencias',
        });
      }
    }

    // JOIN con colaboradores
    const [registro] = await db
      .select({
        id: asistencia.id,
        colaboradorId: asistencia.colaborador_id,
        colaboradorNombre: sql`CONCAT(${colaboradores.nombres}, ' ', ${colaboradores.apellidos})`.as('colaborador_nombre'),
        departamento: asistencia.departamento,
        fecha: asistencia.fecha,
        hora: asistencia.hora,
        estado: asistencia.estado,
        tipoInasistencia: asistencia.tipo_inasistencia,
        comentario: asistencia.comentario,
        registradoPor: asistencia.registrado_por,
        fechaRegistro: asistencia.created_at,
        updated_at: asistencia.updated_at,
      })
      .from(asistencia)
      .leftJoin(colaboradores, eq(asistencia.colaborador_id, colaboradores.id))
      .where(and(eq(asistencia.id, asistenciaId), isNull(asistencia.deleted_at)))
      .limit(1);

    if (!registro) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de asistencia no encontrado',
      });
    }

    res.json({
      success: true,
      asistencia: registro,
    });
  } catch (error) {
    console.error('Error obteniendo asistencia:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener asistencia',
    });
  }
}

/**
 * PUT /api/asistencia/:id
 * Actualiza un registro de asistencia
 */
export async function updateAsistencia(req, res) {
  try {
    const asistenciaId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.asistencia) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para actualizar asistencias',
      });
    }

    const { fecha, hora, estado, tipoInasistencia, comentario } = req.body;

    // Construir objeto de actualización (solo campos proporcionados)
    const updateData = {};

    if (fecha !== undefined) {
      // Validar formato
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fecha)) {
        return res.status(400).json({
          error: 'Fecha inválida',
          message: 'La fecha debe estar en formato YYYY-MM-DD',
        });
      }
      updateData.fecha = fecha;
    }

    if (hora !== undefined) {
      // Validar formato
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(hora)) {
        return res.status(400).json({
          error: 'Hora inválida',
          message: 'La hora debe estar en formato HH:MM',
        });
      }
      updateData.hora = hora;
    }

    if (estado !== undefined) {
      // Validar estado
      if (!['presente', 'ausente'].includes(estado)) {
        return res.status(400).json({
          error: 'Estado inválido',
          message: 'El estado debe ser "presente" o "ausente"',
        });
      }
      updateData.estado = estado;
    }

    if (tipoInasistencia !== undefined) {
      // Validar tipoInasistencia si se proporciona
      const tiposValidos = ['Falta', 'Incapacidad', 'Permiso', 'Vacaciones'];
      if (tipoInasistencia && !tiposValidos.includes(tipoInasistencia)) {
        return res.status(400).json({
          error: 'Tipo de inasistencia inválido',
          message: `El tipo de inasistencia debe ser uno de: ${tiposValidos.join(', ')}`,
        });
      }
      updateData.tipo_inasistencia = tipoInasistencia;
    }

    if (comentario !== undefined) {
      updateData.comentario = comentario;
    }

    // Validar consistencia estado vs tipoInasistencia
    const estadoFinal = estado || (await db.select({ estado: asistencia.estado }).from(asistencia).where(eq(asistencia.id, asistenciaId)).limit(1))[0]?.estado;
    const tipoFinal = tipoInasistencia !== undefined ? tipoInasistencia : (await db.select({ tipo: asistencia.tipo_inasistencia }).from(asistencia).where(eq(asistencia.id, asistenciaId)).limit(1))[0]?.tipo;

    if (estadoFinal === 'ausente' && !tipoFinal) {
      return res.status(400).json({
        error: 'Tipo de inasistencia requerido',
        message: 'Cuando el estado es "ausente", debes especificar el tipo de inasistencia',
      });
    }

    updateData.updated_at = new Date();

    // Actualizar registro
    const [updatedAsistencia] = await db
      .update(asistencia)
      .set(updateData)
      .where(and(eq(asistencia.id, asistenciaId), isNull(asistencia.deleted_at)))
      .returning({
        id: asistencia.id,
        colaboradorId: asistencia.colaborador_id,
        departamento: asistencia.departamento,
        fecha: asistencia.fecha,
        hora: asistencia.hora,
        estado: asistencia.estado,
        tipoInasistencia: asistencia.tipo_inasistencia,
        comentario: asistencia.comentario,
        registradoPor: asistencia.registrado_por,
        fechaRegistro: asistencia.created_at,
        updated_at: asistencia.updated_at,
      });

    if (!updatedAsistencia) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de asistencia no encontrado',
      });
    }

    // Obtener datos del colaborador
    const [colaborador] = await db
      .select({
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
      })
      .from(colaboradores)
      .where(eq(colaboradores.id, updatedAsistencia.colaboradorId))
      .limit(1);

    const response = {
      ...updatedAsistencia,
      colaboradorNombre: colaborador ? `${colaborador.nombres} ${colaborador.apellidos}` : null,
    };

    res.json({
      success: true,
      message: 'Asistencia actualizada exitosamente',
      asistencia: response,
    });
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar asistencia',
    });
  }
}

/**
 * DELETE /api/asistencia/:id
 * Elimina un registro de asistencia (soft delete)
 */
export async function deleteAsistencia(req, res) {
  try {
    const asistenciaId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.asistencia) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para eliminar asistencias',
      });
    }

    // Soft delete (marcar como eliminado)
    const [deletedAsistencia] = await db
      .update(asistencia)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(asistencia.id, asistenciaId), isNull(asistencia.deleted_at)))
      .returning({
        id: asistencia.id,
        fecha: asistencia.fecha,
      });

    if (!deletedAsistencia) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Registro de asistencia no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Asistencia eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar asistencia',
    });
  }
}

/**
 * GET /api/asistencia/stats
 * Obtiene estadísticas de asistencia por fecha
 */
export async function getAsistenciaStats(req, res) {
  try {
    // Verificar permisos solo si hay usuario autenticado
    if (req.user) {
      if (!req.user.permisos?.asistencia && !req.user.permisos?.historial) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver estadísticas de asistencia',
        });
      }
    }

    // Fecha por defecto: hoy
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'La fecha debe estar en formato YYYY-MM-DD',
      });
    }

    // Obtener estadísticas generales
    const stats = await db
      .select({
        estado: asistencia.estado,
        count: sql`count(*)`.as('count'),
      })
      .from(asistencia)
      .where(and(eq(asistencia.fecha, fecha), isNull(asistencia.deleted_at)))
      .groupBy(asistencia.estado);

    // Obtener estadísticas por departamento
    const statsByDepartamento = await db
      .select({
        departamento: asistencia.departamento,
        estado: asistencia.estado,
        count: sql`count(*)`.as('count'),
      })
      .from(asistencia)
      .where(and(eq(asistencia.fecha, fecha), isNull(asistencia.deleted_at)))
      .groupBy(asistencia.departamento, asistencia.estado);

    // Calcular totales
    let totalPresentes = 0;
    let totalAusentes = 0;

    stats.forEach((stat) => {
      if (stat.estado === 'presente') {
        totalPresentes = parseInt(stat.count);
      } else if (stat.estado === 'ausente') {
        totalAusentes = parseInt(stat.count);
      }
    });

    // Agrupar por departamento
    const porDepartamento = {};
    statsByDepartamento.forEach((stat) => {
      if (!porDepartamento[stat.departamento]) {
        porDepartamento[stat.departamento] = {
          presentes: 0,
          ausentes: 0,
        };
      }

      if (stat.estado === 'presente') {
        porDepartamento[stat.departamento].presentes = parseInt(stat.count);
      } else if (stat.estado === 'ausente') {
        porDepartamento[stat.departamento].ausentes = parseInt(stat.count);
      }
    });

    res.json({
      success: true,
      fecha,
      totalPresentes,
      totalAusentes,
      total: totalPresentes + totalAusentes,
      porDepartamento,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de asistencia:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener estadísticas',
    });
  }
}
