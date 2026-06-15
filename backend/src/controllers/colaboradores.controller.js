import { eq, and, isNull, ilike, desc, asc } from 'drizzle-orm';
import db from '../../config/database.js';
import { colaboradores } from '../db/schema.js';

/**
 * GET /api/colaboradores
 * Lista todos los colaboradores activos
 */
export async function listColaboradores(req, res) {
  try {
    // Verificar permisos solo si hay usuario autenticado
    // Si no hay req.user, es acceso público (dashboard RRHH)
    if (req.user) {
      if (!req.user.permisos?.colaboradores && !req.user.permisos?.asistencia) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver colaboradores',
        });
      }
    }

    // Construir query base
    let query = db
      .select({
        id: colaboradores.id,
        foto: colaboradores.foto,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
        puesto: colaboradores.puesto,
        turno: colaboradores.turno,
        numeroEmpleado: colaboradores.numero_empleado,
        fechaIngreso: colaboradores.fecha_ingreso,
        estatus: colaboradores.estatus,
        fechaRegistro: colaboradores.created_at,
      })
      .from(colaboradores)
      .where(isNull(colaboradores.deleted_at));

    // Filtros opcionales
    const { departamento, estatus } = req.query;
    const conditions = [isNull(colaboradores.deleted_at)];

    if (departamento) {
      conditions.push(eq(colaboradores.departamento, departamento));
    }

    if (estatus) {
      conditions.push(eq(colaboradores.estatus, estatus));
    }

    if (conditions.length > 1) {
      query = db
        .select({
          id: colaboradores.id,
          foto: colaboradores.foto,
          nombres: colaboradores.nombres,
          apellidos: colaboradores.apellidos,
          departamento: colaboradores.departamento,
          puesto: colaboradores.puesto,
          turno: colaboradores.turno,
          numeroEmpleado: colaboradores.numero_empleado,
          fechaIngreso: colaboradores.fecha_ingreso,
          estatus: colaboradores.estatus,
          fechaRegistro: colaboradores.created_at,
        })
        .from(colaboradores)
        .where(and(...conditions));
    }

    // Ordenar por apellidos, nombres
    const allColaboradores = await query.orderBy(
      asc(colaboradores.apellidos),
      asc(colaboradores.nombres)
    );

    res.json({
      success: true,
      colaboradores: allColaboradores,
      total: allColaboradores.length,
    });
  } catch (error) {
    console.error('Error listando colaboradores:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener colaboradores',
    });
  }
}

/**
 * POST /api/colaboradores
 * Crea un nuevo colaborador
 */
export async function createColaborador(req, res) {
  try {
    // Verificar permisos: requiere permiso 'agregarColaborador'
    if (!req.user.permisos?.agregarColaborador && !req.user.permisos?.colaboradores) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para crear colaboradores',
      });
    }

    const {
      foto = null,
      nombres,
      apellidos,
      departamento,
      puesto = null,
      turno = null,
      numeroEmpleado = null,
      fechaIngreso,
      estatus = 'Activo',
    } = req.body;

    // Validaciones
    if (!nombres || !apellidos || !departamento || !fechaIngreso) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Nombres, apellidos, departamento y fecha de ingreso son requeridos',
      });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaIngreso)) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'La fecha de ingreso debe estar en formato YYYY-MM-DD',
      });
    }

    // Verificar si el número de empleado ya existe (si se proporciona)
    if (numeroEmpleado) {
      const [existingColaborador] = await db
        .select()
        .from(colaboradores)
        .where(
          and(
            eq(colaboradores.numero_empleado, numeroEmpleado),
            isNull(colaboradores.deleted_at)
          )
        )
        .limit(1);

      if (existingColaborador) {
        return res.status(409).json({
          error: 'Número de empleado duplicado',
          message: 'El número de empleado ya existe',
        });
      }
    }

    // Crear colaborador
    const [newColaborador] = await db
      .insert(colaboradores)
      .values({
        foto,
        nombres,
        apellidos,
        departamento,
        puesto,
        turno,
        numero_empleado: numeroEmpleado,
        fecha_ingreso: fechaIngreso,
        estatus,
      })
      .returning({
        id: colaboradores.id,
        foto: colaboradores.foto,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
        puesto: colaboradores.puesto,
        turno: colaboradores.turno,
        numeroEmpleado: colaboradores.numero_empleado,
        fechaIngreso: colaboradores.fecha_ingreso,
        estatus: colaboradores.estatus,
        fechaRegistro: colaboradores.created_at,
      });

    res.status(201).json({
      success: true,
      message: 'Colaborador creado exitosamente',
      colaborador: newColaborador,
    });
  } catch (error) {
    console.error('Error creando colaborador:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear colaborador',
    });
  }
}

/**
 * GET /api/colaboradores/:id
 * Obtiene un colaborador específico
 */
export async function getColaborador(req, res) {
  try {
    const colaboradorId = parseInt(req.params.id);

    // Verificar permisos solo si hay usuario autenticado
    if (req.user) {
      if (!req.user.permisos?.colaboradores && !req.user.permisos?.asistencia) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para ver colaboradores',
        });
      }
    }

    const [colaborador] = await db
      .select({
        id: colaboradores.id,
        foto: colaboradores.foto,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
        puesto: colaboradores.puesto,
        turno: colaboradores.turno,
        numeroEmpleado: colaboradores.numero_empleado,
        fechaIngreso: colaboradores.fecha_ingreso,
        estatus: colaboradores.estatus,
        fechaRegistro: colaboradores.created_at,
      })
      .from(colaboradores)
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Colaborador no encontrado',
      });
    }

    res.json({
      success: true,
      colaborador,
    });
  } catch (error) {
    console.error('Error obteniendo colaborador:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener colaborador',
    });
  }
}

/**
 * PUT /api/colaboradores/:id
 * Actualiza un colaborador
 */
export async function updateColaborador(req, res) {
  try {
    const colaboradorId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.colaboradores) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para actualizar colaboradores',
      });
    }

    const {
      foto,
      nombres,
      apellidos,
      departamento,
      puesto,
      turno,
      numeroEmpleado,
      fechaIngreso,
      estatus,
    } = req.body;

    // Construir objeto de actualización (solo campos proporcionados)
    const updateData = {};

    if (foto !== undefined) updateData.foto = foto;
    if (nombres !== undefined) updateData.nombres = nombres;
    if (apellidos !== undefined) updateData.apellidos = apellidos;
    if (departamento !== undefined) updateData.departamento = departamento;
    if (puesto !== undefined) updateData.puesto = puesto;
    if (turno !== undefined) updateData.turno = turno;
    if (numeroEmpleado !== undefined) updateData.numero_empleado = numeroEmpleado;
    if (fechaIngreso !== undefined) {
      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaIngreso)) {
        return res.status(400).json({
          error: 'Fecha inválida',
          message: 'La fecha de ingreso debe estar en formato YYYY-MM-DD',
        });
      }
      updateData.fecha_ingreso = fechaIngreso;
    }
    if (estatus !== undefined) updateData.estatus = estatus;

    // Validar número de empleado único (excepto el propio)
    if (numeroEmpleado) {
      const [existingColaborador] = await db
        .select()
        .from(colaboradores)
        .where(
          and(
            eq(colaboradores.numero_empleado, numeroEmpleado),
            isNull(colaboradores.deleted_at)
          )
        )
        .limit(1);

      if (existingColaborador && existingColaborador.id !== colaboradorId) {
        return res.status(409).json({
          error: 'Número de empleado duplicado',
          message: 'El número de empleado ya existe',
        });
      }
    }

    updateData.updated_at = new Date();

    // Actualizar colaborador
    const [updatedColaborador] = await db
      .update(colaboradores)
      .set(updateData)
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .returning({
        id: colaboradores.id,
        foto: colaboradores.foto,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
        puesto: colaboradores.puesto,
        turno: colaboradores.turno,
        numeroEmpleado: colaboradores.numero_empleado,
        fechaIngreso: colaboradores.fecha_ingreso,
        estatus: colaboradores.estatus,
        fechaRegistro: colaboradores.created_at,
        updated_at: colaboradores.updated_at,
      });

    if (!updatedColaborador) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Colaborador no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Colaborador actualizado exitosamente',
      colaborador: updatedColaborador,
    });
  } catch (error) {
    console.error('Error actualizando colaborador:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar colaborador',
    });
  }
}

/**
 * DELETE /api/colaboradores/:id
 * Elimina un colaborador (soft delete)
 */
export async function deleteColaborador(req, res) {
  try {
    const colaboradorId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.colaboradores) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para eliminar colaboradores',
      });
    }

    // Soft delete (marcar como eliminado)
    const [deletedColaborador] = await db
      .update(colaboradores)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .returning({
        id: colaboradores.id,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
      });

    if (!deletedColaborador) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Colaborador no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Colaborador eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando colaborador:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar colaborador',
    });
  }
}

/**
 * PUT /api/colaboradores/:id/baja
 * Dar de baja a un colaborador (cambiar estatus a "Baja")
 */
export async function darDeBajaColaborador(req, res) {
  try {
    const colaboradorId = parseInt(req.params.id);

    // Verificar permisos
    if (!req.user.permisos?.bajas && !req.user.permisos?.colaboradores) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para dar de baja colaboradores',
      });
    }

    // Actualizar estatus a "Baja"
    const [colaboradorBaja] = await db
      .update(colaboradores)
      .set({
        estatus: 'Baja',
        updated_at: new Date(),
      })
      .where(and(eq(colaboradores.id, colaboradorId), isNull(colaboradores.deleted_at)))
      .returning({
        id: colaboradores.id,
        foto: colaboradores.foto,
        nombres: colaboradores.nombres,
        apellidos: colaboradores.apellidos,
        departamento: colaboradores.departamento,
        puesto: colaboradores.puesto,
        turno: colaboradores.turno,
        numeroEmpleado: colaboradores.numero_empleado,
        fechaIngreso: colaboradores.fecha_ingreso,
        estatus: colaboradores.estatus,
        fechaRegistro: colaboradores.created_at,
        updated_at: colaboradores.updated_at,
      });

    if (!colaboradorBaja) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Colaborador no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Colaborador dado de baja exitosamente',
      colaborador: colaboradorBaja,
    });
  } catch (error) {
    console.error('Error dando de baja colaborador:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al dar de baja colaborador',
    });
  }
}
