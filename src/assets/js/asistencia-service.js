/* ============================================
   MI Technologies - Asistencia Service
   Capa de servicios para datos de asistencia
   Preparado para migración a API REST
   ============================================ */

/**
 * Servicio de datos de asistencia
 * Actualmente usa localStorage, preparado para API REST
 */
class AsistenciaService {
  constructor() {
    this.baseUrl = '/api'; // Para futura implementación de API
  }

  /**
   * Obtiene todos los colaboradores
   * @returns {Array} Lista de colaboradores
   */
  async getColaboradores() {
    // TODO: Reemplazar con fetch(this.baseUrl + '/colaboradores')
    const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
    return colaboradores;
  }

  /**
   * Obtiene colaboradores activos (no dados de baja)
   * @returns {Array} Lista de colaboradores activos
   */
  async getColaboradoresActivos() {
    const colaboradores = await this.getColaboradores();
    return colaboradores.filter(c => !c.baja);
  }

  /**
   * Obtiene colaboradores dados de baja
   * @returns {Array} Lista de colaboradores de baja
   */
  async getColaboradoresBaja() {
    const colaboradores = await this.getColaboradores();
    return colaboradores.filter(c => c.baja);
  }

  /**
   * Obtiene registros de asistencia
   * @param {Object} filtros - Filtros opcionales (fecha, departamento, etc.)
   * @returns {Array} Lista de registros de asistencia
   */
  async getRegistrosAsistencia(filtros = {}) {
    // TODO: Reemplazar con fetch(this.baseUrl + '/asistencia', { params: filtros })
    const registros = JSON.parse(localStorage.getItem('registrosAsistencia') || '[]');

    let resultado = registros;

    // Aplicar filtros
    if (filtros.departamento && filtros.departamento !== 'Todos') {
      resultado = resultado.filter(r => {
        const colaborador = this.getColaboradorById(r.colaboradorId);
        return colaborador && colaborador.departamento === filtros.departamento;
      });
    }

    if (filtros.fechaInicio) {
      resultado = resultado.filter(r => r.fecha >= filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      resultado = resultado.filter(r => r.fecha <= filtros.fechaFin);
    }

    return resultado;
  }

  /**
   * Obtiene registros de tiempo extra
   * @param {Object} filtros - Filtros opcionales
   * @returns {Array} Lista de registros de tiempo extra
   */
  async getTiemposExtra(filtros = {}) {
    // TODO: Reemplazar con fetch(this.baseUrl + '/tiempo-extra', { params: filtros })
    const tiempos = JSON.parse(localStorage.getItem('tiemposExtra') || '[]');

    let resultado = tiempos;

    if (filtros.departamento && filtros.departamento !== 'Todos') {
      resultado = resultado.filter(t => t.departamento === filtros.departamento);
    }

    if (filtros.fechaInicio) {
      resultado = resultado.filter(t => t.fecha >= filtros.fechaInicio);
    }

    if (filtros.fechaFin) {
      resultado = resultado.filter(t => t.fecha <= filtros.fechaFin);
    }

    return resultado;
  }

  /**
   * Obtiene un colaborador por ID
   * @param {number} id - ID del colaborador
   * @returns {Object|null} Colaborador o null
   */
  getColaboradorById(id) {
    const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
    return colaboradores.find(c => c.id === id) || null;
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
    const colaboradores = await this.getColaboradoresActivos();
    const registros = await this.getRegistrosAsistencia(filtros);
    const tiemposExtra = await this.getTiemposExtra(filtros);

    // Contar presentes y ausentes
    const presentes = registros.filter(r => r.estado === 'Presente').length;
    const ausentes = registros.filter(r => r.estado === 'Ausente').length;
    const totalRegistros = registros.length;

    // Calcular colaboradores sin registrar en el periodo
    const colaboradoresConRegistro = new Set(registros.map(r => r.colaboradorId));
    const sinRegistrar = colaboradores.length - colaboradoresConRegistro.size;

    // Calcular asistencia promedio
    const asistenciaPromedio = totalRegistros > 0
      ? Math.round((presentes / totalRegistros) * 100)
      : 0;

    // Encontrar departamento con más faltas
    const faltasPorDepto = {};
    registros.filter(r => r.estado === 'Ausente').forEach(r => {
      const colaborador = this.getColaboradorById(r.colaboradorId);
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
    const colaboradores = await this.getColaboradoresActivos();
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
        asistenciaPorDia[dia.fecha] = registro ? registro.estado : '-';
      });

      return {
        ...colaborador,
        diasSemana: asistenciaPorDia,
        totalPresentes: registrosColaborador.filter(r => r.estado === 'Presente').length,
        totalAusentes: registrosColaborador.filter(r => r.estado === 'Ausente').length
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
    const diasHastaPrimerLunes = diaSemana === 0 ? 1 : (8 - diaSemana);
    const primerLunes = new Date(año, 0, diasHastaPrimerLunes);

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
    const primerDia = new Date(fecha.getFullYear(), 0, 1);
    const diasTranscurridos = Math.floor((fecha - primerDia) / (24 * 60 * 60 * 1000));
    return Math.ceil((diasTranscurridos + primerDia.getDay() + 1) / 7);
  }
}

// Exportar instancia única (singleton)
const asistenciaService = new AsistenciaService();
