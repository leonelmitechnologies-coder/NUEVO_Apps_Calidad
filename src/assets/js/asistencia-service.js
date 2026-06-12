/* ============================================
   MI Technologies - Asistencia Service
   Capa de servicios para datos de asistencia
   Migrado a API REST de PostgreSQL
   ============================================ */

// ========================================
// CONFIGURACIÓN API
// ========================================
const API_BASE_URL = 'http://localhost:3001/api';

// Helper para fetch SIN autenticación (dashboard público)
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Servicio de datos de asistencia
 * Conectado a API REST de PostgreSQL
 */
class AsistenciaService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Obtiene todos los colaboradores
   * @returns {Array} Lista de colaboradores
   */
  async getColaboradores() {
    try {
      const data = await fetchAPI('/colaboradores');
      return data.colaboradores || [];
    } catch (error) {
      console.error('Error al cargar colaboradores:', error);
      return [];
    }
  }

  /**
   * Obtiene colaboradores activos (no dados de baja)
   * @returns {Array} Lista de colaboradores activos
   */
  async getColaboradoresActivos() {
    try {
      const data = await fetchAPI('/colaboradores?estatus=Activo');
      return data.colaboradores || [];
    } catch (error) {
      console.error('Error al cargar colaboradores activos:', error);
      return [];
    }
  }

  /**
   * Obtiene colaboradores dados de baja
   * @returns {Array} Lista de colaboradores de baja
   */
  async getColaboradoresBaja() {
    try {
      const data = await fetchAPI('/colaboradores?estatus=Baja');
      return data.colaboradores || [];
    } catch (error) {
      console.error('Error al cargar colaboradores de baja:', error);
      return [];
    }
  }

  /**
   * Obtiene registros de asistencia
   * @param {Object} filtros - Filtros opcionales (fecha, departamento, etc.)
   * @returns {Array} Lista de registros de asistencia
   */
  async getRegistrosAsistencia(filtros = {}) {
    try {
      const params = new URLSearchParams();

      if (filtros.fechaInicio) params.append('fecha', filtros.fechaInicio);
      if (filtros.colaboradorId) params.append('colaboradorId', filtros.colaboradorId);

      // Manejar filtros de departamentos (array)
      if (filtros.departamentos && filtros.departamentos.length > 0) {
        // Si hay múltiples departamentos, necesitamos hacer requests por cada uno
        // o filtrar en el cliente. Por simplicidad, filtraremos en el cliente.
        const allRegistros = [];
        for (const depto of filtros.departamentos) {
          params.set('departamento', depto);
          const queryString = params.toString();
          const endpoint = `/asistencia${queryString ? '?' + queryString : ''}`;
          const data = await fetchAPI(endpoint);
          allRegistros.push(...(data.asistencias || []));
        }

        let registros = allRegistros;

        // Filtrar por rango de fechas si se especificó fechaFin
        if (filtros.fechaFin && filtros.fechaInicio) {
          registros = registros.filter(r => {
            return r.fecha >= filtros.fechaInicio && r.fecha <= filtros.fechaFin;
          });
        }

        return registros;
      }

      const queryString = params.toString();
      const endpoint = `/asistencia${queryString ? '?' + queryString : ''}`;

      const data = await fetchAPI(endpoint);
      let registros = data.asistencias || [];

      // Filtrar por rango de fechas si se especificó fechaFin
      if (filtros.fechaFin && filtros.fechaInicio) {
        registros = registros.filter(r => {
          return r.fecha >= filtros.fechaInicio && r.fecha <= filtros.fechaFin;
        });
      }

      return registros;
    } catch (error) {
      console.error('Error al cargar registros de asistencia:', error);
      return [];
    }
  }

  /**
   * Obtiene registros de tiempo extra
   * @param {Object} filtros - Filtros opcionales
   * @returns {Array} Lista de registros de tiempo extra
   */
  async getTiemposExtra(filtros = {}) {
    try {
      const params = new URLSearchParams();

      if (filtros.fechaInicio) params.append('fecha', filtros.fechaInicio);
      if (filtros.mes) params.append('mes', filtros.mes);

      // Manejar filtros de departamentos (array)
      if (filtros.departamentos && filtros.departamentos.length > 0) {
        const allRegistros = [];
        for (const depto of filtros.departamentos) {
          params.set('departamento', depto);
          const queryString = params.toString();
          const endpoint = `/tiempo-extra${queryString ? '?' + queryString : ''}`;
          const data = await fetchAPI(endpoint);
          allRegistros.push(...(data.registros || []));
        }

        let registros = allRegistros;

        // Filtrar por rango si se especificó fechaFin
        if (filtros.fechaFin && filtros.fechaInicio) {
          registros = registros.filter(r => {
            return r.fecha >= filtros.fechaInicio && r.fecha <= filtros.fechaFin;
          });
        }

        return registros;
      }

      const queryString = params.toString();
      const endpoint = `/tiempo-extra${queryString ? '?' + queryString : ''}`;

      const data = await fetchAPI(endpoint);
      let registros = data.registros || [];

      // Filtrar por rango si se especificó fechaFin
      if (filtros.fechaFin && filtros.fechaInicio) {
        registros = registros.filter(r => {
          return r.fecha >= filtros.fechaInicio && r.fecha <= filtros.fechaFin;
        });
      }

      return registros;
    } catch (error) {
      console.error('Error al cargar tiempos extra:', error);
      return [];
    }
  }

  /**
   * Obtiene un colaborador por ID
   * @param {number} id - ID del colaborador
   * @returns {Object|null} Colaborador o null
   */
  async getColaboradorById(id) {
    try {
      const data = await fetchAPI(`/colaboradores/${id}`);
      return data.colaborador || null;
    } catch (error) {
      console.error('Error al cargar colaborador:', error);
      return null;
    }
  }

  /**
   * Obtiene lista de departamentos únicos
   * @returns {Array} Lista de departamentos
   */
  async getDepartamentos() {
    const colaboradores = await this.getColaboradores();
    const departamentos = [...new Set(colaboradores.map(c => c.departamento).filter(d => d))];
    return departamentos.sort();
  }

  /**
   * Calcula métricas generales de asistencia
   * @param {Object} filtros - Filtros opcionales
   * @returns {Object} Métricas calculadas
   */
  async getMetricas(filtros = {}) {
    let colaboradores = await this.getColaboradoresActivos();

    // Filtrar colaboradores por departamentos si aplica
    if (filtros.departamentos && filtros.departamentos.length > 0) {
      colaboradores = colaboradores.filter(c =>
        filtros.departamentos.includes(c.departamento)
      );
    }

    // Filtrar colaboradores por turnos si aplica
    if (filtros.turnos && filtros.turnos.length > 0) {
      colaboradores = colaboradores.filter(c =>
        filtros.turnos.includes(c.turno)
      );
    }

    const registros = await this.getRegistrosAsistencia(filtros);
    const tiemposExtra = await this.getTiemposExtra(filtros);

    // Contar presentes y ausentes
    const presentes = registros.filter(r => r.estado === 'presente').length;
    const ausentes = registros.filter(r => r.estado === 'ausente').length;
    const totalRegistros = registros.length;

    // Calcular colaboradores sin registrar en el periodo
    const colaboradoresConRegistro = new Set(registros.map(r => r.colaboradorId));
    const sinRegistrar = colaboradores.length - colaboradoresConRegistro.size;

    // Calcular asistencia promedio
    const asistenciaPromedio = totalRegistros > 0
      ? Math.round((presentes / totalRegistros) * 100)
      : 0;

    // Encontrar departamento con más faltas
    // Optimización: crear un mapa de colaboradores para evitar múltiples requests
    const colaboradoresMap = new Map();
    colaboradores.forEach(c => colaboradoresMap.set(c.id, c));

    const faltasPorDepto = {};
    registros.filter(r => r.estado === 'ausente').forEach(r => {
      const colaborador = colaboradoresMap.get(r.colaboradorId);
      if (colaborador && colaborador.departamento) {
        faltasPorDepto[colaborador.departamento] = (faltasPorDepto[colaborador.departamento] || 0) + 1;
      }
    });

    let deptoConMasFaltas = '-';
    let maxFaltas = 0;
    Object.entries(faltasPorDepto).forEach(([depto, faltas]) => {
      if (faltas > maxFaltas) {
        maxFaltas = faltas;
        deptoConMasFaltas = depto;
      }
    });

    return {
      colaboradoresActivos: colaboradores.length,
      colaboradoresBaja: (await this.getColaboradoresBaja()).length,
      totalRegistros,
      asistenciaPromedio,
      inasistencias: ausentes,
      presentes,
      ausentes,
      sinRegistrar,
      deptoConMasFaltas,
      tiemposExtra: tiemposExtra.length
    };
  }

  /**
   * Obtiene datos para la vista semanal
   * @param {number} semana - Número de semana
   * @param {number} año - Año
   * @param {Object} filtros - Filtros adicionales
   * @returns {Object} Datos de la semana
   */
  async getVistaSemanal(semana, año, filtros = {}) {
    let colaboradores = await this.getColaboradoresActivos();

    // Filtrar colaboradores por departamentos si aplica
    if (filtros.departamentos && filtros.departamentos.length > 0) {
      colaboradores = colaboradores.filter(c =>
        filtros.departamentos.includes(c.departamento)
      );
    }

    // Filtrar colaboradores por turnos si aplica
    if (filtros.turnos && filtros.turnos.length > 0) {
      colaboradores = colaboradores.filter(c =>
        filtros.turnos.includes(c.turno)
      );
    }

    const { fechaInicio, fechaFin } = this.getRangoSemana(semana, año);

    const registros = await this.getRegistrosAsistencia({
      ...filtros,
      fechaInicio,
      fechaFin
    });

    // Agrupar registros por colaborador y fecha
    const datosPorColaborador = colaboradores.map(colaborador => {
      const registrosColaborador = registros.filter(r => r.colaboradorId === colaborador.id);

      // Crear mapa de días de la semana
      const diasSemana = this.getDiasSemana(fechaInicio, fechaFin);
      const asistenciaPorDia = {};

      diasSemana.forEach(dia => {
        const registro = registrosColaborador.find(r => r.fecha === dia.fecha);
        if (registro) {
          // Guardar objeto con estado y tipo de inasistencia
          asistenciaPorDia[dia.fecha] = {
            estado: registro.estado,
            tipoInasistencia: registro.tipoInasistencia
          };
        } else {
          asistenciaPorDia[dia.fecha] = '-';
        }
      });

      return {
        ...colaborador,
        diasSemana: asistenciaPorDia,
        totalPresentes: registrosColaborador.filter(r => r.estado === 'presente').length,
        totalAusentes: registrosColaborador.filter(r => r.estado === 'ausente').length
      };
    });

    return {
      colaboradores: datosPorColaborador,
      fechaInicio,
      fechaFin,
      diasSemana: this.getDiasSemana(fechaInicio, fechaFin)
    };
  }

  /**
   * Calcula el rango de fechas de una semana
   * @param {number} semana - Número de semana
   * @param {number} año - Año
   * @returns {Object} Rango de fechas {fechaInicio, fechaFin}
   */
  getRangoSemana(semana, año) {
    // Obtener el primer día del año
    const primerDia = new Date(año, 0, 1);

    // Encontrar el primer lunes del año
    const diaSemana = primerDia.getDay();
    // Si ya es lunes (1), usar ese día. Si es domingo (0), avanzar 1 día. Para otros días, calcular días hasta el próximo lunes
    const diasHastaPrimerLunes = (7 - diaSemana + 1) % 7;
    const primerLunes = new Date(año, 0, 1 + diasHastaPrimerLunes);

    // Calcular el lunes de la semana solicitada
    const lunesSemana = new Date(primerLunes);
    lunesSemana.setDate(primerLunes.getDate() + (semana - 1) * 7);

    // Calcular el domingo de la semana
    const domingoSemana = new Date(lunesSemana);
    domingoSemana.setDate(lunesSemana.getDate() + 6);

    return {
      fechaInicio: this.formatFecha(lunesSemana),
      fechaFin: this.formatFecha(domingoSemana)
    };
  }

  /**
   * Obtiene los días de una semana
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Array} Lista de días con formato
   */
  getDiasSemana(fechaInicio, fechaFin) {
    const dias = [];
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T00:00:00');

    const diasSemanaTexto = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = diasSemanaTexto[fecha.getDay()];
      const dia = fecha.getDate();

      dias.push({
        fecha: this.formatFecha(fecha),
        diaSemana,
        dia,
        textoCompleto: `${diaSemana} ${dia}`
      });
    }

    return dias;
  }

  /**
   * Formatea una fecha a YYYY-MM-DD
   * @param {Date} fecha - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  /**
   * Obtiene el número de semana de una fecha
   * @param {Date} fecha - Fecha
   * @returns {number} Número de semana
   */
  getNumeroSemana(fecha) {
    const año = fecha.getFullYear();

    // Obtener el primer día del año
    const primerDia = new Date(año, 0, 1);
    const diaSemana = primerDia.getDay();

    // Calcular el primer lunes del año (usando la misma lógica que getRangoSemana)
    const diasHastaPrimerLunes = (7 - diaSemana + 1) % 7;
    const primerLunes = new Date(año, 0, 1 + diasHastaPrimerLunes);

    // Si la fecha es antes del primer lunes, pertenece a la última semana del año anterior
    if (fecha < primerLunes) {
      return this.getNumeroSemana(new Date(año - 1, 11, 31));
    }

    // Calcular cuántas semanas completas han pasado desde el primer lunes
    const diasDesdeInicio = Math.floor((fecha - primerLunes) / (24 * 60 * 60 * 1000));
    return Math.floor(diasDesdeInicio / 7) + 1;
  }
}

// Exportar instancia única (singleton)
const asistenciaService = new AsistenciaService();
