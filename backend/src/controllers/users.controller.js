import { eq, and, isNull, or, ilike } from 'drizzle-orm';
import db from '../config/database.js';
import { users } from '../db/schema.js';
import { hashPassword, validatePassword } from '../utils/password.js';

/**
 * GET /api/users
 * Lista todos los usuarios (solo admin)
 */
export async function listUsers(req, res) {
  try {
    // Solo usuarios con permiso 'usuarios' pueden ver la lista
    if (!req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para ver usuarios',
      });
    }

    // Obtener usuarios activos (no eliminados)
    const allUsers = await db
      .select({
        id: users.id,
        usuario: users.usuario,
        nombre: users.nombre,
        apellido: users.apellido,
        puesto: users.puesto,
        departamento: users.departamento,
        departamentos_pasar_asistencia: users.departamentos_pasar_asistencia,
        departamentos_tiempo_extra: users.departamentos_tiempo_extra,
        photo: users.photo,
        permisos: users.permisos,
        created_at: users.created_at,
        last_login: users.last_login,
      })
      .from(users)
      .where(isNull(users.deleted_at))
      .orderBy(users.created_at);

    res.json({
      success: true,
      users: allUsers,
      total: allUsers.length,
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener usuarios',
    });
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario (solo admin)
 */
export async function createUser(req, res) {
  try {
    // Solo usuarios con permiso 'usuarios' pueden crear
    if (!req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para crear usuarios',
      });
    }

    const {
      usuario,
      password,
      nombre,
      apellido,
      puesto,
      departamento,
      departamentosPasarAsistencia = [],
      departamentosTiempoExtra = [],
      photo = null,
      permisos = {
        usuarios: false,
        asistencia: true,
        pasarAsistencia: false,
        agregarColaborador: false,
        historial: false,
        inasistencia: false,
        colaboradores: false,
        bajas: false,
        tiempoExtra: false,
        miPerfil: true,
      },
    } = req.body;

    // Validaciones
    if (!usuario || !password || !nombre || !apellido) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Usuario, contraseña, nombre y apellido son requeridos',
      });
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Contraseña inválida',
        message: passwordValidation.message,
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.usuario, usuario))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario duplicado',
        message: 'El usuario ya existe',
      });
    }

    // Hash de la contraseña
    const password_hash = await hashPassword(password);

    // Crear usuario
    const [newUser] = await db
      .insert(users)
      .values({
        usuario,
        password_hash,
        nombre,
        apellido,
        puesto: puesto || null,
        departamento: departamento || null,
        departamentos_pasar_asistencia: departamentosPasarAsistencia,
        departamentos_tiempo_extra: departamentosTiempoExtra,
        photo,
        permisos,
      })
      .returning({
        id: users.id,
        usuario: users.usuario,
        nombre: users.nombre,
        apellido: users.apellido,
        puesto: users.puesto,
        departamento: users.departamento,
        departamentos_pasar_asistencia: users.departamentos_pasar_asistencia,
        departamentos_tiempo_extra: users.departamentos_tiempo_extra,
        photo: users.photo,
        permisos: users.permisos,
        created_at: users.created_at,
      });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear usuario',
    });
  }
}

/**
 * GET /api/users/:id
 * Obtiene un usuario específico
 */
export async function getUser(req, res) {
  try {
    const userId = parseInt(req.params.id);

    // Verificar permisos: solo puede ver su propio perfil o si tiene permiso 'usuarios'
    if (req.user.id !== userId && !req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para ver este usuario',
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        usuario: users.usuario,
        nombre: users.nombre,
        apellido: users.apellido,
        puesto: users.puesto,
        departamento: users.departamento,
        departamentos_pasar_asistencia: users.departamentos_pasar_asistencia,
        departamentos_tiempo_extra: users.departamentos_tiempo_extra,
        photo: users.photo,
        security_question: users.security_question,
        permisos: users.permisos,
        created_at: users.created_at,
        last_login: users.last_login,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener usuario',
    });
  }
}

/**
 * PUT /api/users/:id
 * Actualiza un usuario
 */
export async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);

    // Verificar permisos: solo puede actualizar su propio perfil o si tiene permiso 'usuarios'
    if (req.user.id !== userId && !req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para actualizar este usuario',
      });
    }

    const {
      nombre,
      apellido,
      puesto,
      departamento,
      departamentosPasarAsistencia,
      departamentosTiempoExtra,
      photo,
      permisos,
    } = req.body;

    // Construir objeto de actualización (solo campos proporcionados)
    const updateData = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (puesto !== undefined) updateData.puesto = puesto;
    if (departamento !== undefined) updateData.departamento = departamento;
    if (departamentosPasarAsistencia !== undefined)
      updateData.departamentos_pasar_asistencia = departamentosPasarAsistencia;
    if (departamentosTiempoExtra !== undefined)
      updateData.departamentos_tiempo_extra = departamentosTiempoExtra;
    if (photo !== undefined) updateData.photo = photo;

    // Solo admin puede cambiar permisos
    if (permisos !== undefined) {
      if (!req.user.permisos?.usuarios) {
        return res.status(403).json({
          error: 'Prohibido',
          message: 'No tienes permiso para cambiar permisos',
        });
      }
      updateData.permisos = permisos;
    }

    updateData.updated_at = new Date();

    // Actualizar usuario
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .returning({
        id: users.id,
        usuario: users.usuario,
        nombre: users.nombre,
        apellido: users.apellido,
        puesto: users.puesto,
        departamento: users.departamento,
        departamentos_pasar_asistencia: users.departamentos_pasar_asistencia,
        departamentos_tiempo_extra: users.departamentos_tiempo_extra,
        photo: users.photo,
        permisos: users.permisos,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar usuario',
    });
  }
}

/**
 * DELETE /api/users/:id
 * Elimina un usuario (soft delete)
 */
export async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);

    // Solo admin puede eliminar usuarios
    if (!req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para eliminar usuarios',
      });
    }

    // No puede eliminarse a sí mismo
    if (req.user.id === userId) {
      return res.status(400).json({
        error: 'Operación inválida',
        message: 'No puedes eliminar tu propio usuario',
      });
    }

    // Soft delete (marcar como eliminado)
    const [deletedUser] = await db
      .update(users)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .returning({
        id: users.id,
        usuario: users.usuario,
      });

    if (!deletedUser) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar usuario',
    });
  }
}

/**
 * PUT /api/users/:id/password
 * Cambia la contraseña de un usuario
 */
export async function changePassword(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;

    // Verificar permisos: solo puede cambiar su propia contraseña o si es admin
    if (req.user.id !== userId && !req.user.permisos?.usuarios) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para cambiar esta contraseña',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Nueva contraseña es requerida',
      });
    }

    // Validar contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Contraseña inválida',
        message: passwordValidation.message,
      });
    }

    // Hash de la nueva contraseña
    const password_hash = await hashPassword(newPassword);

    // Actualizar contraseña
    const [updatedUser] = await db
      .update(users)
      .set({
        password_hash,
        updated_at: new Date(),
      })
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .returning({
        id: users.id,
        usuario: users.usuario,
      });

    if (!updatedUser) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al cambiar contraseña',
    });
  }
}

/**
 * PUT /api/users/:id/security-question
 * Actualiza la pregunta de seguridad
 */
export async function updateSecurityQuestion(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { securityQuestion, securityAnswer } = req.body;

    // Verificar permisos: solo puede actualizar su propia pregunta
    if (req.user.id !== userId) {
      return res.status(403).json({
        error: 'Prohibido',
        message: 'No tienes permiso para actualizar esta pregunta de seguridad',
      });
    }

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Pregunta y respuesta son requeridas',
      });
    }

    if (securityAnswer.trim().length < 2) {
      return res.status(400).json({
        error: 'Respuesta inválida',
        message: 'La respuesta debe tener al menos 2 caracteres',
      });
    }

    // Hash de la respuesta de seguridad
    const security_answer_hash = await hashPassword(securityAnswer.toLowerCase());

    // Actualizar pregunta de seguridad
    const [updatedUser] = await db
      .update(users)
      .set({
        security_question: securityQuestion,
        security_answer_hash,
        updated_at: new Date(),
      })
      .where(and(eq(users.id, userId), isNull(users.deleted_at)))
      .returning({
        id: users.id,
        usuario: users.usuario,
        security_question: users.security_question,
      });

    if (!updatedUser) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Pregunta de seguridad actualizada exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando pregunta de seguridad:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar pregunta de seguridad',
    });
  }
}
