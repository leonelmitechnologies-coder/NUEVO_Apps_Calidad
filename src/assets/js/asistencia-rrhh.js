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
    departamento: 'Todos',
    turno: 'Todos',
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
  console.log('Inicializando Dashboard de Asistencia RRHH...');

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

  // Cargar datos iniciales
  await cargarDatos();

  // Configurar event listeners
  configurarEventListeners();

  // Actualizar hora de sync
  actualizarHoraSync();
  setInterval(actualizarHoraSync, 1000);

  console.log('Dashboard inicializado correctamente');
});

/**
 * Carga los departamentos en el filtro
 */
async function cargarDepartamentos() {
  const departamentos = await asistenciaService.getDepartamentos();
  const select = document.getElementById('filtroDepartamento');

  // Limpiar opciones existentes (excepto "Todos")
  select.innerHTML = '<option value="Todos">Todos</option>';

  // Agregar departamentos
  departamentos.forEach(depto => {
    const option = document.createElement('option');
    option.value = depto;
    option.textContent = depto;
    select.appendChild(option);
  });
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

  return {
    departamento: dashboardState.filtros.departamento,
    turno: dashboardState.filtros.turno,
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
    { departamento: dashboardState.filtros.departamento }
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
    colaboradoresFiltrados = colaboradoresFiltrados.filter(c =>
      c.nombre.toLowerCase().includes(busqueda) ||
      c.numeroNomina.toString().includes(busqueda) ||
      (c.puesto && c.puesto.toLowerCase().includes(busqueda)) ||
      (c.departamento && c.departamento.toLowerCase().includes(busqueda))
    );
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
    if (colaborador.photo) {
      tdFoto.innerHTML = `<img src="${colaborador.photo}" alt="${colaborador.nombre}" class="colaborador-foto">`;
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
        ${colaborador.nombre}
        <span class="badge-baja">BAJA</span>
      `;
    } else {
      tdNombre.textContent = colaborador.nombre;
    }
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = colaborador.numeroNomina;
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
      const estado = colaborador.diasSemana[dia.fecha];

      tdDia.classList.add('asistencia-cell');

      // Renderizar según el tipo de estado
      if (estado === 'Presente') {
        tdDia.innerHTML = '<span class="badge badge-presente-mini">✓</span>';
      } else if (estado === 'Ausente') {
        tdDia.innerHTML = '<span class="badge badge-ausente-mini">✗</span>';
      } else if (estado === 'Falta Injustificada' || estado === 'FI') {
        tdDia.innerHTML = '<span class="badge badge-falta">FI</span>';
      } else if (estado === 'Vacaciones') {
        tdDia.innerHTML = '<span class="badge badge-vacaciones">Vacaciones</span>';
      } else if (estado === 'Incapacidad') {
        tdDia.innerHTML = '<span class="badge badge-incapacidad-mini">Inc</span>';
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
  const colaboradores = await asistenciaService.getColaboradoresActivos();
  const registros = await asistenciaService.getRegistrosAsistencia({
    departamento: dashboardState.filtros.departamento,
    fechaInicio: dashboardState.fechaDiaria,
    fechaFin: dashboardState.fechaDiaria
  });

  // Mapear registros por colaborador
  const datosPorColaborador = colaboradores.map(colaborador => {
    const registro = registros.find(r => r.colaboradorId === colaborador.id);
    return {
      ...colaborador,
      estado: registro ? registro.estado : '-',
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

  const tiemposExtra = await asistenciaService.getTiemposExtra({
    departamento: dashboardState.filtros.departamento,
    fechaInicio,
    fechaFin
  });

  // Agrupar por colaborador
  const tiemposPorColaborador = {};

  tiemposExtra.forEach(te => {
    if (!tiemposPorColaborador[te.colaboradorId]) {
      tiemposPorColaborador[te.colaboradorId] = {
        colaborador: asistenciaService.getColaboradorById(te.colaboradorId),
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
    colaboradoresFiltrados = colaboradoresFiltrados.filter(c =>
      c.nombre.toLowerCase().includes(busqueda) ||
      c.numeroNomina.toString().includes(busqueda) ||
      (c.puesto && c.puesto.toLowerCase().includes(busqueda)) ||
      (c.departamento && c.departamento.toLowerCase().includes(busqueda))
    );
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
    if (colaborador.photo) {
      tdFoto.innerHTML = `<img src="${colaborador.photo}" alt="${colaborador.nombre}" class="colaborador-foto">`;
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
        ${colaborador.nombre}
        <span class="badge-baja">BAJA</span>
      `;
    } else {
      tdNombre.textContent = colaborador.nombre;
    }
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = colaborador.numeroNomina || 'N/A';
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

    if (colaborador.estado === 'Presente') {
      tdEstado.innerHTML = '<span class="badge badge-presente">✓ Presente</span>';
    } else if (colaborador.estado === 'Ausente') {
      tdEstado.innerHTML = '<span class="badge badge-ausente">✗ Ausente</span>';
    } else if (colaborador.incapacidad === 'Temporal') {
      tdEstado.innerHTML = '<span class="badge badge-incapacidad">Incapacidad Temporal</span>';
    } else {
      tdEstado.innerHTML = '<span class="badge badge-default">-</span>';
    }

    tr.appendChild(tdEstado);

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
    registrosFiltrados = todosLosRegistros.filter(r =>
      r.colaborador.nombre.toLowerCase().includes(busqueda) ||
      r.colaborador.numeroNomina.toString().includes(busqueda)
    );
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
    if (registro.colaborador.photo) {
      tdFoto.innerHTML = `<img src="${registro.colaborador.photo}" alt="${registro.colaborador.nombre}" class="colaborador-foto">`;
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
    tdNombre.textContent = registro.colaborador.nombre;
    tdNombre.classList.add('nombre-cell');
    tr.appendChild(tdNombre);

    // Número de nómina
    const tdNomina = document.createElement('td');
    tdNomina.textContent = registro.colaborador.numeroNomina || 'N/A';
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

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const diaInicio = fechaInicio.getDate();
  const diaFin = fechaFin.getDate();
  const mesInicio = meses[fechaInicio.getMonth()];
  const mesFin = meses[fechaFin.getMonth()];
  const añoFin = fechaFin.getFullYear();

  let texto = '';
  if (mesInicio === mesFin) {
    texto = `Lun ${diaInicio} - Vie ${diaFin} ${mesFin} ${añoFin}`;
  } else {
    texto = `Lun ${diaInicio} ${mesInicio} - Vie ${diaFin} ${mesFin} ${añoFin}`;
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

/**
 * Configura todos los event listeners
 */
function configurarEventListeners() {
  // Tabs de vista
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => cambiarVista(e.target.dataset.view));
  });

  // Filtros
  document.getElementById('filtroDepartamento').addEventListener('change', (e) => {
    dashboardState.filtros.departamento = e.target.value;
    cargarDatos();
  });

  document.getElementById('filtroTurno').addEventListener('change', (e) => {
    dashboardState.filtros.turno = e.target.value;
    cargarDatos();
  });

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
    csv += `${colaborador.numeroNomina},`;
    csv += `"${colaborador.puesto || '-'}",`;
    csv += `"${colaborador.departamento || '-'}"`;

    vistaSemanal.diasSemana.forEach(dia => {
      const estado = colaborador.diasSemana[dia.fecha];
      csv += `,${estado === 'Presente' ? 'P' : estado === 'Ausente' ? 'A' : '-'}`;
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
