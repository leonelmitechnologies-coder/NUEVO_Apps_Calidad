/* ============================================
   MI Technologies - Dashboard Asistencia RRHH
   Lógica principal del dashboard
   ============================================ */

// Estado global del dashboard
const dashboardState = {
  vistaActual: 'semanal',
  semanaActual: 1,
  añoActual: 2026,
  fechaDiaria: null, // Para vista diaria
  filtros: {
    departamentos: ['Todos'], // Array de departamentos seleccionados
    turnos: ['Todos'], // Array de turnos seleccionados
    busqueda: ''
  },
  datos: {
    colaboradores: [],
    metricas: null,
    vistaSemanal: null,
    vistaDiaria: null,
    vistaTiempoExtra: null
  }
};

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando Dashboard de Asistencia RRHH (Modo Público)...');

  // Establecer fecha actual
  const hoy = new Date();
  dashboardState.semanaActual = asistenciaService.getNumeroSemana(hoy);
  dashboardState.añoActual = hoy.getFullYear();
  dashboardState.fechaDiaria = asistenciaService.formatFecha(hoy);

  // Inicializar inputs
  document.getElementById('inputSemana').value = dashboardState.semanaActual;
  document.getElementById('inputAño').value = dashboardState.añoActual;

  // Inicializar input de fecha diaria si existe
  const inputFechaDiaria = document.getElementById('inputFechaDiaria');
  if (inputFechaDiaria) {
    inputFechaDiaria.value = dashboardState.fechaDiaria;
  }

  // Cargar departamentos en filtro
  await cargarDepartamentos();

  // Cargar turnos en filtro
  await cargarTurnos();

  // Cargar datos iniciales
  await cargarDatos();

  // Configurar event listeners
  configurarEventListeners();

  // Configurar actualización en tiempo real
  configurarActualizacionTiempoReal();

  // Actualizar hora de sync
  actualizarHoraSync();
  setInterval(actualizarHoraSync, 1000);

  console.log('Dashboard inicializado correctamente');
});

/**
 * Carga los departamentos en el filtro multiselect
 */
async function cargarDepartamentos() {
  // Lista completa de departamentos de MI Technologies (siempre se muestran todos)
  const departamentosPredefinidos = [
    'Administración',
    'Almacén',
    'Calidad',
    'Compras',
    'Contabilidad',
    'Dirección',
    'Finanzas',
    'Ingeniería',
    'Logística',
    'Mantenimiento',
    'Producción',
    'Recursos Humanos',
    'Seguridad',
    'Sistemas',
    'Ventas'
  ];

  // Obtener departamentos adicionales de colaboradores desde la API
  const colaboradores = await asistenciaService.getColaboradores();
  const departamentosColaboradores = colaboradores.map(c => c.departamento).filter(d => d);

  // Combinar y eliminar duplicados
  const todosDepartamentos = [...new Set([...departamentosPredefinidos, ...departamentosColaboradores])];
  const departamentos = todosDepartamentos.sort();

  const container = document.getElementById('optionsFiltroDepartamento');

  // Limpiar opciones existentes
  container.innerHTML = '';

  // Agregar opción "Todos"
  const labelTodos = document.createElement('label');
  labelTodos.className = 'multiselect-option';
  labelTodos.innerHTML = `
    <input type="checkbox" value="Todos" checked data-departamento>
    <span>Todos</span>
  `;
  container.appendChild(labelTodos);

  // Agregar TODOS los departamentos (predefinidos + personalizados)
  departamentos.forEach(depto => {
    const label = document.createElement('label');
    label.className = 'multiselect-option';
    label.innerHTML = `
      <input type="checkbox" value="${depto}" data-departamento>
      <span>${depto}</span>
    `;
    container.appendChild(label);
  });

  // Configurar event listeners para los checkboxes
  configurarMultiselectDepartamentos();
}

/**
 * Carga los turnos en el filtro multiselect
 */
async function cargarTurnos() {
  // Turnos predefinidos del sistema (siempre se muestran)
  const turnosPredefinidos = ['Turno 1', 'Turno 2'];

  // Obtener turnos adicionales de colaboradores desde la API
  const colaboradores = await asistenciaService.getColaboradores();
  const turnosColaboradores = colaboradores.map(c => c.turno).filter(t => t);

  // Combinar y eliminar duplicados
  const todosTurnos = [...new Set([...turnosPredefinidos, ...turnosColaboradores])];
  const turnos = todosTurnos.sort();

  const container = document.getElementById('optionsFiltroTurno');

  // Limpiar opciones existentes
  container.innerHTML = '';

  // Agregar opción "Todos"
  const labelTodos = document.createElement('label');
  labelTodos.className = 'multiselect-option';
  labelTodos.innerHTML = `
    <input type="checkbox" value="Todos" checked data-turno>
    <span>Todos</span>
  `;
  container.appendChild(labelTodos);

  // Agregar TODOS los turnos (predefinidos + personalizados)
  turnos.forEach(turno => {
    const label = document.createElement('label');
    label.className = 'multiselect-option';
    label.innerHTML = `
      <input type="checkbox" value="${turno}" data-turno>
      <span>${turno}</span>
    `;
    container.appendChild(label);
  });

  // Configurar event listeners para los checkboxes
  configurarMultiselectTurnos();
}

/**
 * Carga todos los datos del dashboard
 */
async function cargarDatos() {
  try {
    showLoading();

    // Cargar colaboradores
    dashboardState.datos.colaboradores = await asistenciaService.getColaboradoresActivos();

    // Cargar métricas
    dashboardState.datos.metricas = await asistenciaService.getMetricas(getFiltrosActuales());

    // Cargar vista según el tab activo
    if (dashboardState.vistaActual === 'semanal') {
      await cargarVistaSemanal();
    } else if (dashboardState.vistaActual === 'diaria') {
      await cargarVistaDiaria();
    } else if (dashboardState.vistaActual === 'tiempo-extra') {
      await cargarVistaTiempoExtra();
    }

    // Actualizar UI
    actualizarMetricas();
    actualizarEstadisticas();
    actualizarTabla();

    hideLoading();
  } catch (error) {
    console.error('Error cargando datos:', error);
    showToast('Error al cargar datos', 'error');
    hideLoading();
  }
}

/**
 * Obtiene los filtros actuales
 */
function getFiltrosActuales() {
  const { fechaInicio, fechaFin } = asistenciaService.getRangoSemana(
    dashboardState.semanaActual,
    dashboardState.añoActual
  );

  const departamentos = dashboardState.filtros.departamentos;
  const todosDeptosSeleccionado = departamentos.includes('Todos') || departamentos.length === 0;

  const turnos = dashboardState.filtros.turnos;
  const todosTurnosSeleccionado = turnos.includes('Todos') || turnos.length === 0;

  return {
    departamentos: todosDeptosSeleccionado ? null : departamentos, // null = todos
    turnos: todosTurnosSeleccionado ? null : turnos, // null = todos
    fechaInicio,
    fechaFin
  };
}

/**
 * Carga los datos de la vista semanal
 */
async function cargarVistaSemanal() {
  dashboardState.datos.vistaSemanal = await asistenciaService.getVistaSemanal(
    dashboardState.semanaActual,
    dashboardState.añoActual,
    getFiltrosActuales()
  );

  // Actualizar rango de fechas
  actualizarRangoFechas();
}

/**
 * Actualiza las métricas en las cards
 */
function actualizarMetricas() {
  const metricas = dashboardState.datos.metricas;

  if (!metricas) return;

  document.getElementById('metricActivos').textContent = metricas.colaboradoresActivos;
  document.getElementById('metricBajas').textContent = metricas.colaboradoresBaja;

  document.getElementById('metricPromedio').textContent = `${metricas.asistenciaPromedio}%`;
  document.getElementById('metricPromedioDetalle').textContent =
    `${metricas.presentes} presentes de ${metricas.totalRegistros} registros`;

  document.getElementById('metricInasistencias').textContent = metricas.inasistencias;

  document.getElementById('metricPresentes').textContent = metricas.presentes;
  document.getElementById('metricAusentes').textContent = metricas.ausentes;
  document.getElementById('metricSinRegistrar').textContent = metricas.sinRegistrar;

  document.getElementById('metricDeptoFaltas').textContent = metricas.deptoConMasFaltas;
}

/**
 * Actualiza las estadísticas superiores
 */
function actualizarEstadisticas() {
  const metricas = dashboardState.datos.metricas;

  if (!metricas) return;

  const totalColaboradores = metricas.colaboradoresActivos + metricas.colaboradoresBaja;
  document.getElementById('totalColaboradores').textContent = `${totalColaboradores} colaboradores`;
  document.getElementById('totalRegistros').textContent = `${metricas.totalRegistros} registros`;
  document.getElementById('totalTE').textContent = `${metricas.tiemposExtra} TE`;
}

/**
 * Actualiza la tabla de asistencia
 */
function actualizarTabla() {
  if (dashboardState.vistaActual === 'semanal') {
    actualizarTablaSemanal();
  } else if (dashboardState.vistaActual === 'diaria') {
    actualizarTablaDiaria();
  } else if (dashboardState.vistaActual === 'tiempo-extra') {
    actualizarTablaTiempoExtra();
  }
}

/**
 * Actualiza la tabla en vista semanal
 */
function actualizarTablaSemanal() {
  const vistaSemanal = dashboardState.datos.vistaSemanal;

  if (!vistaSemanal) return;

  const thead = document.querySelector('#tablaAsistencia thead tr');
  const tbody = document.getElementById('tablaBody');

  // Limpiar tabla
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Crear encabezados base
  thead.innerHTML = `
    <th>#</th>
    <th>FOTO</th>
    <th>NOMBRE</th>
    <th>NO. NÓMINA</th>
    <th>PUESTO</th>
    <th>DEPTO</th>
  `;

  // Agregar columnas de días
  vistaSemanal.diasSemana.forEach(dia => {
    const th = document.createElement('th');
    th.innerHTML = `${dia.diaSemana}<br>${dia.dia}`;
    thead.appendChild(th);
  });

  // Agregar columna total
  const thTotal = document.createElement('th');
  thTotal.textContent = 'SEMANA';
  thead.appendChild(thTotal);

  // Aplicar filtro de búsqueda
  let colaboradoresFiltrados = vistaSemanal.colaboradores;
  if (dashboardState.filtros.busqueda) {
    const busqueda = dashboardState.filtros.busqueda.toLowerCase();
    colaboradoresFiltrados = colaboradoresFiltrados.filter(c => {
      const nombreCompleto = `${c.nombres} ${c.apellidos}`.toLowerCase();
      return nombreCompleto.includes(busqueda) ||
        (c.numeroEmpleado && c.numeroEmpleado.toString().includes(busqueda)) ||
        (c.puesto && c.puesto.toLowerCase().includes(busqueda)) ||
        (c.departamento && c.departamento.toLowerCase().includes(busqueda));
    });
  }

  // Crear filas
  colaboradoresFiltrados.forEach((colaborador, index) => {
    const tr = document.createElement('tr');

    // Número
    const tdNum = document.createElement('td');
    tdNum.textContent = index + 1;
    tr.appendChild(tdNum);

    // Foto
    const tdFoto = document.createElement('td');
    const nombreCompleto = `${colaborador.nombres} ${colaborador.apellidos}`;
    if (colaborador.foto) {
      tdFoto.innerHTML = `<img src="${colaborador.foto}" alt="${nombreCompleto}" class="colaborador-foto">`;
    } else {
      tdFoto.innerHTML = `<div class="colaborador-foto-placeholder">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>
      </div>`;
    }
    tr.appendChild(tdFoto);

    // Nombre + Badge BAJA si aplica
    const tdNombre = document.createElement('td');
    tdNombre.classList.add('nombre-cell');
    if (colaborador.baja) {
      tdNombre.innerHTML = `
        ${nombreCompleto}
        <span class="badge-baja">BAJA</span>
      `;
    } else {
      tdNombre.textContent = nombreCompleto;
    }
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = colaborador.numeroEmpleado || '-';
    tr.appendChild(tdNomina);

    // Puesto
    const tdPuesto = document.createElement('td');
    tdPuesto.textContent = colaborador.puesto || '-';
    tr.appendChild(tdPuesto);

    // Departamento
    const tdDepto = document.createElement('td');
    tdDepto.textContent = colaborador.departamento || '-';
    tr.appendChild(tdDepto);

    // Días de la semana
    vistaSemanal.diasSemana.forEach(dia => {
      const tdDia = document.createElement('td');
      const registro = colaborador.diasSemana[dia.fecha];

      tdDia.classList.add('asistencia-cell');

      // Si es un string simple (por compatibilidad con datos antiguos)
      if (typeof registro === 'string') {
        if (registro === 'presente') {
          tdDia.innerHTML = '<span class="badge badge-presente-mini">✓</span>';
        } else if (registro === 'ausente') {
          tdDia.innerHTML = '<span class="badge badge-ausente-mini">✗</span>';
        } else {
          tdDia.innerHTML = '<span class="badge badge-default">-</span>';
        }
      } else if (registro && typeof registro === 'object') {
        // Nuevo formato con objeto {estado, tipoInasistencia}
        if (registro.estado === 'presente') {
          tdDia.innerHTML = '<span class="badge badge-presente-mini">✓</span>';
        } else if (registro.estado === 'ausente' && registro.tipoInasistencia) {
          // Mostrar las iniciales del tipo de inasistencia
          const tipo = registro.tipoInasistencia;
          let badgeClass = 'badge-ausente-mini';

          // Asignar clase específica según el tipo
          if (tipo === 'FI') badgeClass = 'badge-falta';
          else if (tipo === 'FJ') badgeClass = 'badge-falta-justificada';
          else if (tipo === 'Vacaciones') badgeClass = 'badge-vacaciones';
          else if (tipo === 'IT') badgeClass = 'badge-incapacidad-mini';
          else if (tipo === 'PSG' || tipo === 'PCG') badgeClass = 'badge-permiso';
          else if (tipo === 'RET') badgeClass = 'badge-retardo';

          tdDia.innerHTML = `<span class="badge ${badgeClass}">${tipo}</span>`;
        } else {
          tdDia.innerHTML = '<span class="badge badge-default">-</span>';
        }
      } else {
        tdDia.innerHTML = '<span class="badge badge-default">-</span>';
      }

      tr.appendChild(tdDia);
    });

    // Total de la semana
    const tdTotal = document.createElement('td');
    tdTotal.innerHTML = `
      <span class="semana-total">
        <span class="total-presente">${colaborador.totalPresentes || 0}</span> /
        <span class="total-ausente">${colaborador.totalAusentes || 0}</span>
      </span>
    `;
    tr.appendChild(tdTotal);

    // Hacer la fila clickeable
    tr.style.cursor = 'pointer';
    tr.onclick = () => abrirModalDetalleColaborador(colaborador.id);

    tbody.appendChild(tr);
  });

  // Mostrar mensaje si no hay resultados
  if (colaboradoresFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${6 + vistaSemanal.diasSemana.length + 1}" class="no-results">
          No se encontraron colaboradores con los filtros aplicados
        </td>
      </tr>
    `;
  }
}

/**
 * Carga los datos de la vista diaria
 */
async function cargarVistaDiaria() {
  let colaboradores = await asistenciaService.getColaboradoresActivos();

  // Aplicar filtros de departamentos y turnos
  const filtros = getFiltrosActuales();
  if (filtros.departamentos && filtros.departamentos.length > 0) {
    colaboradores = colaboradores.filter(c =>
      filtros.departamentos.includes(c.departamento)
    );
  }

  if (filtros.turnos && filtros.turnos.length > 0) {
    colaboradores = colaboradores.filter(c =>
      filtros.turnos.includes(c.turno)
    );
  }

  const registros = await asistenciaService.getRegistrosAsistencia({
    ...filtros,
    fechaInicio: dashboardState.fechaDiaria,
    fechaFin: dashboardState.fechaDiaria
  });

  // Mapear registros por colaborador
  const datosPorColaborador = colaboradores.map(colaborador => {
    const registro = registros.find(r => r.colaboradorId === colaborador.id);
    return {
      ...colaborador,
      estado: registro ? registro.estado : '-',
      tipoInasistencia: registro ? registro.tipoInasistencia : null,
      incapacidad: registro ? registro.incapacidad : null,
      observaciones: registro ? registro.observaciones : null
    };
  });

  dashboardState.datos.vistaDiaria = {
    colaboradores: datosPorColaborador,
    fecha: dashboardState.fechaDiaria
  };
}

/**
 * Carga los datos de la vista de tiempo extra
 */
async function cargarVistaTiempoExtra() {
  const { fechaInicio, fechaFin } = asistenciaService.getRangoSemana(
    dashboardState.semanaActual,
    dashboardState.añoActual
  );

  const filtros = getFiltrosActuales();
  const tiemposExtra = await asistenciaService.getTiemposExtra({
    ...filtros,
    fechaInicio,
    fechaFin
  });

  // Agrupar por colaborador
  const tiemposPorColaborador = {};

  // Obtener todos los colaboradores únicos
  const colaboradorIds = [...new Set(tiemposExtra.map(te => te.colaboradorId))];

  // Cargar todos los colaboradores en paralelo
  const colaboradoresPromises = colaboradorIds.map(id => asistenciaService.getColaboradorById(id));
  const colaboradores = await Promise.all(colaboradoresPromises);

  // Crear un mapa de colaboradores
  const colaboradoresMap = new Map();
  colaboradores.forEach(colab => {
    if (colab) colaboradoresMap.set(colab.id, colab);
  });

  // Agrupar tiempos extra por colaborador
  tiemposExtra.forEach(te => {
    if (!tiemposPorColaborador[te.colaboradorId]) {
      tiemposPorColaborador[te.colaboradorId] = {
        colaborador: colaboradoresMap.get(te.colaboradorId),
        registros: []
      };
    }
    tiemposPorColaborador[te.colaboradorId].registros.push(te);
  });

  dashboardState.datos.vistaTiempoExtra = {
    tiemposPorColaborador,
    fechaInicio,
    fechaFin
  };
}

/**
 * Actualiza la tabla en vista diaria
 */
function actualizarTablaDiaria() {
  const vistaDiaria = dashboardState.datos.vistaDiaria;

  if (!vistaDiaria) return;

  const thead = document.querySelector('#tablaAsistencia thead tr');
  const tbody = document.getElementById('tablaBody');

  // Limpiar tabla
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Obtener día de la semana y fecha
  const fecha = new Date(vistaDiaria.fecha + 'T00:00:00');
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const diaSemana = diasSemana[fecha.getDay()];
  const dia = fecha.getDate();

  // Crear encabezados
  thead.innerHTML = `
    <th>#</th>
    <th>FOTO</th>
    <th>NOMBRE ▼</th>
    <th>NO. NÓMINA ▲</th>
    <th>PUESTO ▲</th>
    <th>DEPTO ▲</th>
    <th>${diaSemana} ${dia}</th>
  `;

  // Aplicar filtro de búsqueda
  let colaboradoresFiltrados = vistaDiaria.colaboradores;
  if (dashboardState.filtros.busqueda) {
    const busqueda = dashboardState.filtros.busqueda.toLowerCase();
    colaboradoresFiltrados = colaboradoresFiltrados.filter(c => {
      const nombreCompleto = `${c.nombres} ${c.apellidos}`.toLowerCase();
      return nombreCompleto.includes(busqueda) ||
        (c.numeroEmpleado && c.numeroEmpleado.toString().includes(busqueda)) ||
        (c.puesto && c.puesto.toLowerCase().includes(busqueda)) ||
        (c.departamento && c.departamento.toLowerCase().includes(busqueda));
    });
  }

  // Crear filas
  colaboradoresFiltrados.forEach((colaborador, index) => {
    const tr = document.createElement('tr');

    // Número
    const tdNum = document.createElement('td');
    tdNum.textContent = index + 1;
    tr.appendChild(tdNum);

    // Foto
    const tdFoto = document.createElement('td');
    const nombreCompleto = `${colaborador.nombres} ${colaborador.apellidos}`;
    if (colaborador.foto) {
      tdFoto.innerHTML = `<img src="${colaborador.foto}" alt="${nombreCompleto}" class="colaborador-foto">`;
    } else {
      tdFoto.innerHTML = `<div class="colaborador-foto-placeholder">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>
      </div>`;
    }
    tr.appendChild(tdFoto);

    // Nombre + Badge BAJA si aplica
    const tdNombre = document.createElement('td');
    tdNombre.classList.add('nombre-cell');
    if (colaborador.baja) {
      tdNombre.innerHTML = `
        ${nombreCompleto}
        <span class="badge-baja">BAJA</span>
      `;
    } else {
      tdNombre.textContent = nombreCompleto;
    }
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = colaborador.numeroEmpleado || '-';
    tr.appendChild(tdNomina);

    // Puesto
    const tdPuesto = document.createElement('td');
    tdPuesto.textContent = colaborador.puesto || '-';
    tr.appendChild(tdPuesto);

    // Departamento
    const tdDepto = document.createElement('td');
    tdDepto.textContent = colaborador.departamento || '-';
    tr.appendChild(tdDepto);

    // Estado del día
    const tdEstado = document.createElement('td');
    tdEstado.classList.add('asistencia-cell');

    if (colaborador.estado === 'presente') {
      tdEstado.innerHTML = '<span class="badge badge-presente">✓ Presente</span>';
    } else if (colaborador.estado === 'ausente') {
      // Si hay tipo de inasistencia, mostrarlo
      if (colaborador.tipoInasistencia) {
        const tipo = colaborador.tipoInasistencia;
        let badgeClass = 'badge-ausente';
        let tipoTexto = tipo;

        // Asignar clase y texto completo según el tipo
        if (tipo === 'FI') {
          badgeClass = 'badge-falta';
          tipoTexto = 'Falta Injustificada (FI)';
        } else if (tipo === 'FJ') {
          badgeClass = 'badge-falta-justificada';
          tipoTexto = 'Falta Justificada (FJ)';
        } else if (tipo === 'Vacaciones') {
          badgeClass = 'badge-vacaciones';
          tipoTexto = 'Vacaciones';
        } else if (tipo === 'IT') {
          badgeClass = 'badge-incapacidad';
          tipoTexto = 'Incapacidad Temporal (IT)';
        } else if (tipo === 'PSG') {
          badgeClass = 'badge-permiso';
          tipoTexto = 'Permiso Sin Goce (PSG)';
        } else if (tipo === 'PCG') {
          badgeClass = 'badge-permiso';
          tipoTexto = 'Permiso Con Goce (PCG)';
        } else if (tipo === 'RET') {
          badgeClass = 'badge-retardo';
          tipoTexto = 'Retardo (RET)';
        } else if (tipo === 'Suspension') {
          badgeClass = 'badge-suspension';
          tipoTexto = 'Suspensión';
        } else if (tipo === 'CUM') {
          badgeClass = 'badge-cumpleanos';
          tipoTexto = 'Cumpleaños (CUM)';
        } else if (tipo === 'FES') {
          badgeClass = 'badge-festivo';
          tipoTexto = 'Festivo (FES)';
        }

        tdEstado.innerHTML = `<span class="badge ${badgeClass}">${tipoTexto}</span>`;
      } else {
        tdEstado.innerHTML = '<span class="badge badge-ausente">✗ Ausente</span>';
      }
    } else if (colaborador.incapacidad === 'Temporal') {
      tdEstado.innerHTML = '<span class="badge badge-incapacidad">Incapacidad Temporal</span>';
    } else {
      tdEstado.innerHTML = '<span class="badge badge-default">-</span>';
    }

    tr.appendChild(tdEstado);

    // Hacer la fila clickeable
    tr.style.cursor = 'pointer';
    tr.onclick = () => abrirModalDetalleColaborador(colaborador.id);

    tbody.appendChild(tr);
  });

  // Mostrar mensaje si no hay resultados
  if (colaboradoresFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-results">
          No se encontraron colaboradores con los filtros aplicados
        </td>
      </tr>
    `;
  }
}

/**
 * Actualiza la tabla en vista de tiempo extra
 */
function actualizarTablaTiempoExtra() {
  const vistaTiempoExtra = dashboardState.datos.vistaTiempoExtra;

  if (!vistaTiempoExtra) return;

  const thead = document.querySelector('#tablaAsistencia thead tr');
  const tbody = document.getElementById('tablaBody');

  // Limpiar tabla
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Crear encabezados
  thead.innerHTML = `
    <th>#</th>
    <th>FOTO</th>
    <th>NOMBRE</th>
    <th>NO. NÓMINA</th>
    <th>PUESTO</th>
    <th>DEPTO</th>
    <th>FECHA</th>
    <th>HORAS</th>
    <th>MOTIVO</th>
    <th>AUTORIZADO POR</th>
  `;

  // Obtener todos los registros y ordenarlos
  const todosLosRegistros = [];
  Object.values(vistaTiempoExtra.tiemposPorColaborador).forEach(({ colaborador, registros }) => {
    registros.forEach(registro => {
      todosLosRegistros.push({
        colaborador,
        ...registro
      });
    });
  });

  // Aplicar filtro de búsqueda
  let registrosFiltrados = todosLosRegistros;
  if (dashboardState.filtros.busqueda) {
    const busqueda = dashboardState.filtros.busqueda.toLowerCase();
    registrosFiltrados = todosLosRegistros.filter(r => {
      const nombreCompleto = `${r.colaborador.nombres} ${r.colaborador.apellidos}`.toLowerCase();
      return nombreCompleto.includes(busqueda) ||
        (r.colaborador.numeroEmpleado && r.colaborador.numeroEmpleado.toString().includes(busqueda));
    });
  }

  // Crear filas
  registrosFiltrados.forEach((registro, index) => {
    const tr = document.createElement('tr');

    // Número
    const tdNum = document.createElement('td');
    tdNum.textContent = index + 1;
    tr.appendChild(tdNum);

    // Foto
    const tdFoto = document.createElement('td');
    const nombreCompleto = `${registro.colaborador.nombres} ${registro.colaborador.apellidos}`;
    if (registro.colaborador.foto) {
      tdFoto.innerHTML = `<img src="${registro.colaborador.foto}" alt="${nombreCompleto}" class="colaborador-foto">`;
    } else {
      tdFoto.innerHTML = `<div class="colaborador-foto-placeholder">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>
      </div>`;
    }
    tr.appendChild(tdFoto);

    // Nombre
    const tdNombre = document.createElement('td');
    tdNombre.textContent = nombreCompleto;
    tdNombre.classList.add('nombre-cell');
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = registro.colaborador.numeroEmpleado || '-';
    tr.appendChild(tdNomina);

    // Puesto
    const tdPuesto = document.createElement('td');
    tdPuesto.textContent = registro.colaborador.puesto || '-';
    tr.appendChild(tdPuesto);

    // Departamento
    const tdDepto = document.createElement('td');
    tdDepto.textContent = registro.colaborador.departamento || '-';
    tr.appendChild(tdDepto);

    // Fecha
    const tdFecha = document.createElement('td');
    tdFecha.textContent = registro.fecha;
    tr.appendChild(tdFecha);

    // Horas
    const tdHoras = document.createElement('td');
    tdHoras.innerHTML = `<span class="badge badge-horas">${registro.horas || 0}h</span>`;
    tr.appendChild(tdHoras);

    // Motivo
    const tdMotivo = document.createElement('td');
    tdMotivo.textContent = registro.motivo || '-';
    tr.appendChild(tdMotivo);

    // Autorizado por
    const tdAutorizado = document.createElement('td');
    tdAutorizado.textContent = registro.autorizadoPor || '-';
    tr.appendChild(tdAutorizado);

    // Hacer la fila clickeable
    tr.style.cursor = 'pointer';
    tr.onclick = () => abrirModalDetalleColaborador(registro.colaborador.id);

    tbody.appendChild(tr);
  });

  // Mostrar mensaje si no hay resultados
  if (registrosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="no-results">
          No hay registros de tiempo extra en este periodo
        </td>
      </tr>
    `;
  }
}

/**
 * Actualiza el rango de fechas mostrado
 */
function actualizarRangoFechas() {
  const vistaSemanal = dashboardState.datos.vistaSemanal;

  if (!vistaSemanal) return;

  const fechaInicio = new Date(vistaSemanal.fechaInicio + 'T00:00:00');
  const fechaFin = new Date(vistaSemanal.fechaFin + 'T00:00:00');

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const diaInicioSemana = diasSemana[fechaInicio.getDay()];
  const diaFinSemana = diasSemana[fechaFin.getDay()];
  const diaInicio = fechaInicio.getDate();
  const diaFin = fechaFin.getDate();
  const mesInicio = meses[fechaInicio.getMonth()];
  const mesFin = meses[fechaFin.getMonth()];
  const añoFin = fechaFin.getFullYear();

  let texto = '';
  if (mesInicio === mesFin) {
    texto = `${diaInicioSemana} ${diaInicio} - ${diaFinSemana} ${diaFin} ${mesFin} ${añoFin}`;
  } else {
    texto = `${diaInicioSemana} ${diaInicio} ${mesInicio} - ${diaFinSemana} ${diaFin} ${mesFin} ${añoFin}`;
  }

  document.getElementById('rangoFechas').textContent = texto;
}

/**
 * Actualiza la hora del último sync
 */
function actualizarHoraSync() {
  const ahora = new Date();
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const ampm = ahora.getHours() >= 12 ? 'p.m.' : 'a.m.';

  document.getElementById('lastSync').textContent = `${hora}:${minutos}:${segundos} ${ampm}`;
}

/* ============================================
   MULTISELECT DEPARTAMENTOS
   ============================================ */

/**
 * Configura el multiselect de departamentos
 */
function configurarMultiselectDepartamentos() {
  const button = document.getElementById('btnFiltroDepartamento');
  const dropdown = document.getElementById('dropdownFiltroDepartamento');
  const searchInput = document.getElementById('searchFiltroDepartamento');
  const checkboxes = document.querySelectorAll('[data-departamento]');

  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    button.classList.toggle('active', !isOpen);
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== button) {
      dropdown.style.display = 'none';
      button.classList.remove('active');
    }
  });

  // Búsqueda en departamentos
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const options = dropdown.querySelectorAll('.multiselect-option');

    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
  });

  // Manejar selección de checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;

      if (value === 'Todos') {
        // Si se selecciona "Todos", desmarcar todos los demás
        if (e.target.checked) {
          checkboxes.forEach(cb => {
            if (cb.value !== 'Todos') {
              cb.checked = false;
            }
          });
        }
      } else {
        // Si se selecciona un departamento específico, desmarcar "Todos"
        const todosCheckbox = document.querySelector('[data-departamento][value="Todos"]');
        if (todosCheckbox) {
          todosCheckbox.checked = false;
        }

        // Si no hay ninguno seleccionado, volver a marcar "Todos"
        const algunoSeleccionado = Array.from(checkboxes).some(cb =>
          cb.value !== 'Todos' && cb.checked
        );

        if (!algunoSeleccionado && todosCheckbox) {
          todosCheckbox.checked = true;
        }
      }

      actualizarLabelDepartamentos();
      aplicarFiltros();
    });
  });

  actualizarLabelDepartamentos();
}

/**
 * Actualiza el label del botón con los departamentos seleccionados
 */
function actualizarLabelDepartamentos() {
  const checkboxes = document.querySelectorAll('[data-departamento]');
  const seleccionados = Array.from(checkboxes).filter(cb => cb.checked && cb.value !== 'Todos');
  const label = document.getElementById('labelFiltroDepartamento');
  const todosCheckbox = document.querySelector('[data-departamento][value="Todos"]');

  if (todosCheckbox && todosCheckbox.checked) {
    label.innerHTML = 'Todos los departamentos';
  } else if (seleccionados.length === 0) {
    label.innerHTML = 'Seleccionar departamentos...';
  } else if (seleccionados.length === 1) {
    label.innerHTML = seleccionados[0].value;
  } else {
    label.innerHTML = `${seleccionados.length} departamentos <span class="filter-badge">${seleccionados.length}</span>`;
  }
}

/**
 * Aplica los filtros seleccionados
 */
function aplicarFiltros() {
  const checkboxes = document.querySelectorAll('[data-departamento]');
  const todosCheckbox = document.querySelector('[data-departamento][value="Todos"]');

  if (todosCheckbox && todosCheckbox.checked) {
    dashboardState.filtros.departamentos = ['Todos'];
  } else {
    dashboardState.filtros.departamentos = Array.from(checkboxes)
      .filter(cb => cb.checked && cb.value !== 'Todos')
      .map(cb => cb.value);
  }

  cargarDatos();
}

/* ============================================
   MULTISELECT TURNOS
   ============================================ */

/**
 * Configura el multiselect de turnos
 */
function configurarMultiselectTurnos() {
  const button = document.getElementById('btnFiltroTurno');
  const dropdown = document.getElementById('dropdownFiltroTurno');
  const checkboxes = document.querySelectorAll('[data-turno]');

  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
    button.classList.toggle('active', !isOpen);
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== button) {
      dropdown.style.display = 'none';
      button.classList.remove('active');
    }
  });

  // Manejar selección de checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;

      if (value === 'Todos') {
        // Si se selecciona "Todos", desmarcar todos los demás
        if (e.target.checked) {
          checkboxes.forEach(cb => {
            if (cb.value !== 'Todos') {
              cb.checked = false;
            }
          });
        }
      } else {
        // Si se selecciona un turno específico, desmarcar "Todos"
        const todosCheckbox = document.querySelector('[data-turno][value="Todos"]');
        if (todosCheckbox) {
          todosCheckbox.checked = false;
        }

        // Si no hay ninguno seleccionado, volver a marcar "Todos"
        const algunoSeleccionado = Array.from(checkboxes).some(cb =>
          cb.value !== 'Todos' && cb.checked
        );

        if (!algunoSeleccionado && todosCheckbox) {
          todosCheckbox.checked = true;
        }
      }

      actualizarLabelTurnos();
      aplicarFiltrosTurnos();
    });
  });

  actualizarLabelTurnos();
}

/**
 * Actualiza el label del botón con los turnos seleccionados
 */
function actualizarLabelTurnos() {
  const checkboxes = document.querySelectorAll('[data-turno]');
  const seleccionados = Array.from(checkboxes).filter(cb => cb.checked && cb.value !== 'Todos');
  const label = document.getElementById('labelFiltroTurno');
  const todosCheckbox = document.querySelector('[data-turno][value="Todos"]');

  if (todosCheckbox && todosCheckbox.checked) {
    label.innerHTML = 'Todos los turnos';
  } else if (seleccionados.length === 0) {
    label.innerHTML = 'Seleccionar turnos...';
  } else if (seleccionados.length === 1) {
    label.innerHTML = seleccionados[0].value;
  } else {
    label.innerHTML = `${seleccionados.length} turnos <span class="filter-badge">${seleccionados.length}</span>`;
  }
}

/**
 * Aplica los filtros de turnos seleccionados
 */
function aplicarFiltrosTurnos() {
  const checkboxes = document.querySelectorAll('[data-turno]');
  const todosCheckbox = document.querySelector('[data-turno][value="Todos"]');

  if (todosCheckbox && todosCheckbox.checked) {
    dashboardState.filtros.turnos = ['Todos'];
  } else {
    dashboardState.filtros.turnos = Array.from(checkboxes)
      .filter(cb => cb.checked && cb.value !== 'Todos')
      .map(cb => cb.value);
  }

  cargarDatos();
}

/**
 * Configura todos los event listeners
 */
function configurarEventListeners() {
  // Tabs de vista
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => cambiarVista(e.target.dataset.view));
  });

  // Filtros
  // Filtro de departamento ahora usa multiselect (manejado en configurarMultiselectDepartamentos)
  // Filtro de turno ahora usa multiselect (manejado en configurarMultiselectTurnos)

  // Búsqueda
  document.getElementById('searchInput').addEventListener('input', (e) => {
    dashboardState.filtros.busqueda = e.target.value;
    actualizarTabla();
  });

  // Navegación de semana
  document.getElementById('btnSemanaAnterior').addEventListener('click', () => {
    dashboardState.semanaActual--;
    if (dashboardState.semanaActual < 1) {
      dashboardState.semanaActual = 52;
      dashboardState.añoActual--;
      document.getElementById('inputAño').value = dashboardState.añoActual;
    }
    document.getElementById('inputSemana').value = dashboardState.semanaActual;
    cargarDatos();
  });

  document.getElementById('btnSemanaSiguiente').addEventListener('click', () => {
    dashboardState.semanaActual++;
    if (dashboardState.semanaActual > 52) {
      dashboardState.semanaActual = 1;
      dashboardState.añoActual++;
      document.getElementById('inputAño').value = dashboardState.añoActual;
    }
    document.getElementById('inputSemana').value = dashboardState.semanaActual;
    cargarDatos();
  });

  document.getElementById('btnHoy').addEventListener('click', () => {
    const hoy = new Date();
    dashboardState.semanaActual = asistenciaService.getNumeroSemana(hoy);
    dashboardState.añoActual = hoy.getFullYear();
    document.getElementById('inputSemana').value = dashboardState.semanaActual;
    document.getElementById('inputAño').value = dashboardState.añoActual;
    cargarDatos();
  });

  // Inputs de semana y año
  document.getElementById('inputSemana').addEventListener('change', (e) => {
    let semana = parseInt(e.target.value);
    if (semana < 1) semana = 1;
    if (semana > 52) semana = 52;
    dashboardState.semanaActual = semana;
    e.target.value = semana;
    cargarDatos();
  });

  document.getElementById('inputAño').addEventListener('change', (e) => {
    dashboardState.añoActual = parseInt(e.target.value);
    cargarDatos();
  });

  // Navegación vista diaria
  const inputFechaDiaria = document.getElementById('inputFechaDiaria');
  if (inputFechaDiaria) {
    inputFechaDiaria.addEventListener('change', (e) => {
      dashboardState.fechaDiaria = e.target.value;
      cargarDatos();
    });
  }

  const btnDiaAnterior = document.getElementById('btnDiaAnterior');
  if (btnDiaAnterior) {
    btnDiaAnterior.addEventListener('click', () => {
      const fecha = new Date(dashboardState.fechaDiaria + 'T00:00:00');
      fecha.setDate(fecha.getDate() - 1);
      dashboardState.fechaDiaria = asistenciaService.formatFecha(fecha);
      document.getElementById('inputFechaDiaria').value = dashboardState.fechaDiaria;
      cargarDatos();
    });
  }

  const btnDiaSiguiente = document.getElementById('btnDiaSiguiente');
  if (btnDiaSiguiente) {
    btnDiaSiguiente.addEventListener('click', () => {
      const fecha = new Date(dashboardState.fechaDiaria + 'T00:00:00');
      fecha.setDate(fecha.getDate() + 1);
      dashboardState.fechaDiaria = asistenciaService.formatFecha(fecha);
      document.getElementById('inputFechaDiaria').value = dashboardState.fechaDiaria;
      cargarDatos();
    });
  }

  const btnHoyDiario = document.getElementById('btnHoyDiario');
  if (btnHoyDiario) {
    btnHoyDiario.addEventListener('click', () => {
      const hoy = new Date();
      dashboardState.fechaDiaria = asistenciaService.formatFecha(hoy);
      document.getElementById('inputFechaDiaria').value = dashboardState.fechaDiaria;
      cargarDatos();
    });
  }

  // Botones de exportar e imprimir
  document.getElementById('btnExportarTabla').addEventListener('click', exportarCSV);
  document.getElementById('btnExportarCSV').addEventListener('click', exportarCSV);
  document.getElementById('btnImprimir').addEventListener('click', imprimirTabla);
  document.getElementById('btnImprimirTabla').addEventListener('click', imprimirTabla);

  // Botón volver
  document.getElementById('btnVolver').addEventListener('click', () => {
    window.location.href = 'index1000.html';
  });

  // Botón modo oscuro
  document.getElementById('btnModoOscuro').addEventListener('click', toggleModoOscuro);

  // Botón reportes
  document.getElementById('btnReportes').addEventListener('click', () => {
    showToast('Funcionalidad de reportes en desarrollo', 'info');
  });

  // Botón conexión app
  document.getElementById('btnConexionApp').addEventListener('click', () => {
    showToast('Funcionalidad de conexión en vivo en desarrollo', 'info');
  });
}

/**
 * Configura la actualización en tiempo real
 * Actualiza datos cuando la página recibe foco
 */
function configurarActualizacionTiempoReal() {
  // ELIMINADO: Ya no usamos localStorage para datos
  // El sistema ahora obtiene datos en tiempo real de la API

  // Listener para cuando la página se vuelve visible (cambio de pestaña o ventana)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      console.log('Página visible, actualizando datos desde API...');

      // Mostrar notificación al usuario
      showToast('Actualizando datos...', 'info');

      // Recargar todos los datos del dashboard desde la API
      await cargarDatos();
    }
  });

  // Listener para cuando se navega de vuelta a la página
  window.addEventListener('pageshow', async (event) => {
    // event.persisted indica que la página viene del cache (navegación hacia atrás)
    if (event.persisted) {
      console.log('Página restaurada desde caché, actualizando datos...');
      await cargarDatos();
    }
  });

  console.log('Actualización en tiempo real configurada (API REST)');
}

/**
 * Cambia la vista activa (semanal/diaria/tiempo-extra)
 */
async function cambiarVista(vista) {
  dashboardState.vistaActual = vista;

  // Actualizar tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === vista);
  });

  // Mostrar/ocultar selectores de periodo
  const selectorSemanal = document.getElementById('selectorSemanal');
  const selectorDiario = document.getElementById('selectorDiario');

  selectorSemanal.style.display = vista === 'semanal' ? 'flex' : 'none';
  selectorDiario.style.display = vista === 'diaria' ? 'flex' : 'none';

  // Vista tiempo extra usa selector semanal
  if (vista === 'tiempo-extra') {
    selectorSemanal.style.display = 'flex';
  }

  // Cargar datos según la vista
  await cargarDatos();
}

/**
 * Exporta los datos a CSV
 */
function exportarCSV() {
  if (!dashboardState.datos.vistaSemanal) {
    showToast('No hay datos para exportar', 'warning');
    return;
  }

  const vistaSemanal = dashboardState.datos.vistaSemanal;
  let csv = 'No.,Nombre,No. Nómina,Puesto,Departamento';

  // Agregar encabezados de días
  vistaSemanal.diasSemana.forEach(dia => {
    csv += `,${dia.diaSemana} ${dia.dia}`;
  });
  csv += ',Total Presentes,Total Ausentes\n';

  // Agregar filas
  vistaSemanal.colaboradores.forEach((colaborador, index) => {
    csv += `${index + 1},`;
    csv += `"${colaborador.nombre}",`;
    csv += `${colaborador.numeroEmpleado},`;
    csv += `"${colaborador.puesto || '-'}",`;
    csv += `"${colaborador.departamento || '-'}"`;

    vistaSemanal.diasSemana.forEach(dia => {
      const estado = colaborador.diasSemana[dia.fecha];
      csv += `,${estado === 'presente' ? 'P' : estado === 'ausente' ? 'A' : '-'}`;
    });

    csv += `,${colaborador.totalPresentes || 0}`;
    csv += `,${colaborador.totalAusentes || 0}\n`;
  });

  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `asistencia-semana-${dashboardState.semanaActual}-${dashboardState.añoActual}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('CSV exportado correctamente', 'success');
}

/**
 * Imprime la tabla
 */
function imprimirTabla() {
  window.print();
}

/**
 * Alterna modo oscuro
 */
function toggleModoOscuro() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  showToast(`Modo ${isDark ? 'oscuro' : 'claro'} activado`, 'info');
}

/**
 * Muestra un toast de notificación
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Muestra indicador de carga
 */
function showLoading() {
  // Implementar spinner si es necesario
}

/**
 * Oculta indicador de carga
 */
function hideLoading() {
  // Implementar ocultar spinner
}

// Aplicar modo oscuro si está guardado
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

/* ============================================
   MODAL DETALLE COLABORADOR
   ============================================ */

/**
 * Abre el modal con el detalle del colaborador
 */
async function abrirModalDetalleColaborador(colaboradorId) {
  const colaborador = dashboardState.datos.colaboradores.find(c => c.id === colaboradorId);

  if (!colaborador) {
    showToast('Colaborador no encontrado', 'error');
    return;
  }

  // Obtener registros de asistencia del colaborador
  const registros = await asistenciaService.getRegistrosAsistencia({
    departamento: dashboardState.filtros.departamento === 'Todos' ? null : dashboardState.filtros.departamento
  });

  const registrosColaborador = registros.filter(r => r.colaboradorId === colaboradorId);

  // Calcular métricas
  const presentes = registrosColaborador.filter(r => r.estado === 'presente').length;
  const ausentes = registrosColaborador.filter(r => r.estado === 'ausente').length;
  const totalDias = registrosColaborador.length;
  const porcentajeAsistencia = totalDias > 0 ? Math.round((presentes / totalDias) * 100) : 0;

  // Actualizar modal - Título
  document.getElementById('modalTitulo').textContent = `${colaborador.nombres} ${colaborador.apellidos}`;

  // Actualizar modal - Foto
  const modalFoto = document.getElementById('modalFoto');
  const nombreCompleto = `${colaborador.nombres} ${colaborador.apellidos}`;
  if (colaborador.foto) {
    modalFoto.innerHTML = `<img src="${colaborador.foto}" alt="${nombreCompleto}">`;
  } else {
    const initials = (colaborador.nombres.charAt(0) + colaborador.apellidos.charAt(0)).toUpperCase();
    modalFoto.innerHTML = initials;
    modalFoto.style.fontSize = '48px';
  }

  // Actualizar modal - Datos principales
  document.getElementById('modalNombre').textContent = nombreCompleto;
  document.getElementById('modalDepartamento').textContent = colaborador.departamento || '-';
  document.getElementById('modalPuesto').textContent = colaborador.puesto || '-';
  document.getElementById('modalTurno').textContent = colaborador.turno || '-';
  document.getElementById('modalNumero').textContent = colaborador.numeroEmpleado || '-';

  const fechaIngreso = colaborador.fechaIngreso
    ? new Date(colaborador.fechaIngreso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';
  document.getElementById('modalFechaIngreso').textContent = fechaIngreso;

  const estatusBadge = document.getElementById('modalEstatus');
  const estatus = colaborador.estatus || 'Activo';
  estatusBadge.textContent = estatus;
  estatusBadge.style.background = estatus === 'Activo' ? '#d4edda' : '#f8d7da';
  estatusBadge.style.color = estatus === 'Activo' ? 'var(--color-success)' : 'var(--color-danger)';

  // Actualizar métricas
  document.getElementById('modalTotalDias').textContent = totalDias;
  document.getElementById('modalPresentes').textContent = presentes;
  document.getElementById('modalAusentes').textContent = ausentes;
  document.getElementById('modalPorcentaje').textContent = porcentajeAsistencia + '%';

  // Desglose de inasistencias
  const desglose = {};
  registrosColaborador.filter(r => r.estado === 'ausente').forEach(r => {
    const tipo = r.tipo || 'Falta';
    desglose[tipo] = (desglose[tipo] || 0) + 1;
  });

  const modalDesglose = document.getElementById('modalDesglose');
  if (Object.keys(desglose).length === 0) {
    modalDesglose.innerHTML = '<p class="mensaje-vacio">Sin inasistencias en este periodo</p>';
  } else {
    modalDesglose.innerHTML = `
      <div class="desglose-lista">
        ${Object.entries(desglose).map(([tipo, cantidad]) => `
          <div class="desglose-item">
            <span class="desglose-item-cantidad">${cantidad}</span>
            <span>${tipo}${cantidad > 1 ? 's' : ''}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Historial de inasistencias
  const ausencias = registrosColaborador.filter(r => r.estado === 'ausente').slice(-10);
  const modalHistorial = document.getElementById('modalHistorial');

  if (ausencias.length === 0) {
    modalHistorial.innerHTML = '<p class="mensaje-vacio">Sin inasistencias en este periodo</p>';
  } else {
    modalHistorial.innerHTML = `
      <div class="historial-lista">
        ${ausencias.map(r => {
          const fecha = new Date(r.fecha + 'T00:00:00');
          const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          return `
            <div class="historial-item">
              <span class="historial-fecha">${fechaFormateada}</span>
              <span class="historial-tipo">${r.tipo || 'Falta'}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Asistencia de la semana
  if (dashboardState.vistaActual === 'semanal' && dashboardState.datos.vistaSemanal) {
    const vistaSemanal = dashboardState.datos.vistaSemanal;
    const colabData = vistaSemanal.colaboradores.find(c => c.id === colaboradorId);

    if (colabData) {
      const fechaInicio = new Date(vistaSemanal.fechaInicio + 'T00:00:00');
      const fechaFin = new Date(vistaSemanal.fechaFin + 'T00:00:00');

      document.getElementById('modalTituloSemana').textContent =
        `Asistencia de la Semana (${fechaInicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${fechaFin.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })})`;

      const modalAsistenciaSemana = document.getElementById('modalAsistenciaSemana');
      const diasSemana = vistaSemanal.diasSemana;

      modalAsistenciaSemana.innerHTML = `
        <div class="asistencia-semana-dias">
          ${diasSemana.map(dia => {
            const estado = colabData.diasSemana[dia.fecha] || '-';
            const claseEstado = estado === 'presente' ? 'presente' : estado === 'ausente' ? 'ausente' : '';

            return `
              <div class="dia-item ${claseEstado}">
                <div class="dia-nombre">${dia.diaSemana}</div>
                <div class="dia-numero">${dia.dia}</div>
                <div class="dia-estado">${estado}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  } else {
    document.getElementById('modalAsistenciaSemana').innerHTML =
      '<p class="mensaje-vacio">Cambia a vista semanal para ver este dato</p>';
  }

  // Mostrar modal
  document.getElementById('modalDetalleColaborador').style.display = 'flex';
}

/**
 * Cierra el modal de detalle
 */
function cerrarModalDetalle() {
  document.getElementById('modalDetalleColaborador').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modalDetalleColaborador');
  if (e.target === modal) {
    cerrarModalDetalle();
  }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarModalDetalle();
  }
});
