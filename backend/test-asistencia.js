/**
 * Script de prueba para endpoints de Asistencia
 * Requiere que el servidor esté corriendo en http://localhost:3000
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

// Función auxiliar para hacer requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error.message);
    throw error;
  }
}

// Función para login y obtener token
async function getAuthToken() {
  console.log('1. Obteniendo token de autenticación...');

  // Intentar con diferentes usuarios
  const usuarios = [
    { username: 'jmedina', password: 'password123' },
    { username: 'admin', password: 'admin123' },
  ];

  for (const creds of usuarios) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds),
    });

    if (result.ok) {
      console.log('   ✓ Login exitoso como:', creds.username);
      console.log('   Token:', result.data.accessToken?.substring(0, 20) + '...');
      return result.data.accessToken;
    } else {
      console.log(`   ✗ Login fallido con ${creds.username}:`, result.data.message || result.data.error);
    }
  }

  throw new Error('No se pudo obtener token de autenticación');
}

// Función para obtener o crear un colaborador
async function getOrCreateColaborador(token) {
  console.log('\n2. Obteniendo colaboradores...');

  const result = await apiRequest('/colaboradores', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.ok && result.data.colaboradores?.length > 0) {
    const colaborador = result.data.colaboradores[0];
    console.log(`   ✓ Colaborador encontrado: ${colaborador.nombres} ${colaborador.apellidos} (ID: ${colaborador.id})`);
    return colaborador;
  }

  console.log('   No hay colaboradores. Creando uno de prueba...');

  const createResult = await apiRequest('/colaboradores', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      nombres: 'Juan Carlos',
      apellidos: 'Pérez López',
      departamento: 'Produccion',
      puesto: 'Operador',
      turno: 'Matutino',
      numeroEmpleado: 'EMP001',
      fechaIngreso: '2024-01-15',
    }),
  });

  if (createResult.ok) {
    console.log('   ✓ Colaborador creado:', createResult.data.colaborador.nombres);
    return createResult.data.colaborador;
  } else {
    console.log('   ✗ Error creando colaborador:', createResult.data.message);
    throw new Error('No se pudo crear colaborador');
  }
}

// Test 1: Crear asistencia - PRESENTE
async function testCreateAsistenciaPresente(token, colaborador) {
  console.log('\n3. Test: Crear asistencia PRESENTE...');

  const result = await apiRequest('/asistencia', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      colaboradorId: colaborador.id,
      fecha: '2024-06-12',
      hora: '08:30',
      estado: 'presente',
    }),
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log('   ✓ Asistencia registrada:', result.data.asistencia);
    return result.data.asistencia;
  } else {
    console.log('   ✗ Error:', result.data.message);
    return null;
  }
}

// Test 2: Crear asistencia - AUSENTE con tipo
async function testCreateAsistenciaAusente(token, colaborador) {
  console.log('\n4. Test: Crear asistencia AUSENTE...');

  const result = await apiRequest('/asistencia', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      colaboradorId: colaborador.id,
      fecha: '2024-06-13',
      hora: '08:30',
      estado: 'ausente',
      tipoInasistencia: 'Incapacidad',
      comentario: 'Gripe',
    }),
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log('   ✓ Asistencia registrada:', result.data.asistencia);
    return result.data.asistencia;
  } else {
    console.log('   ✗ Error:', result.data.message);
    return null;
  }
}

// Test 3: Listar asistencias
async function testListAsistencia(token) {
  console.log('\n5. Test: Listar todas las asistencias...');

  const result = await apiRequest('/asistencia', {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log(`   ✓ Total de registros: ${result.data.total}`);
    result.data.asistencias?.forEach((a, i) => {
      console.log(`     ${i + 1}. ${a.colaboradorNombre} - ${a.fecha} ${a.hora} - ${a.estado}`);
    });
  } else {
    console.log('   ✗ Error:', result.data.message);
  }
}

// Test 4: Filtrar por fecha
async function testFilterByFecha(token, fecha) {
  console.log(`\n6. Test: Filtrar por fecha (${fecha})...`);

  const result = await apiRequest(`/asistencia?fecha=${fecha}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log(`   ✓ Registros encontrados: ${result.data.total}`);
  } else {
    console.log('   ✗ Error:', result.data.message);
  }
}

// Test 5: Obtener estadísticas
async function testGetStats(token, fecha) {
  console.log(`\n7. Test: Obtener estadísticas (${fecha})...`);

  const result = await apiRequest(`/asistencia/stats?fecha=${fecha}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log('   ✓ Estadísticas:');
    console.log(`     Total presentes: ${result.data.totalPresentes}`);
    console.log(`     Total ausentes: ${result.data.totalAusentes}`);
    console.log('     Por departamento:', result.data.porDepartamento);
  } else {
    console.log('   ✗ Error:', result.data.message);
  }
}

// Test 6: Actualizar asistencia
async function testUpdateAsistencia(token, asistenciaId) {
  console.log(`\n8. Test: Actualizar asistencia (ID: ${asistenciaId})...`);

  const result = await apiRequest(`/asistencia/${asistenciaId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      hora: '09:00',
      comentario: 'Actualizado por prueba',
    }),
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log('   ✓ Asistencia actualizada');
  } else {
    console.log('   ✗ Error:', result.data.message);
  }
}

// Test 7: Eliminar asistencia
async function testDeleteAsistencia(token, asistenciaId) {
  console.log(`\n9. Test: Eliminar asistencia (ID: ${asistenciaId})...`);

  const result = await apiRequest(`/asistencia/${asistenciaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`   Status: ${result.status}`);
  if (result.ok) {
    console.log('   ✓ Asistencia eliminada');
  } else {
    console.log('   ✗ Error:', result.data.message);
  }
}

// Ejecutar todos los tests
async function runTests() {
  console.log('====================================');
  console.log('TESTS DE API DE ASISTENCIA');
  console.log('====================================\n');

  try {
    // 1. Login y obtener token
    const token = await getAuthToken();

    // 2. Obtener o crear colaborador
    const colaborador = await getOrCreateColaborador(token);

    // 3. Crear asistencia PRESENTE
    const asistencia1 = await testCreateAsistenciaPresente(token, colaborador);

    // 4. Crear asistencia AUSENTE
    const asistencia2 = await testCreateAsistenciaAusente(token, colaborador);

    // 5. Listar todas
    await testListAsistencia(token);

    // 6. Filtrar por fecha
    await testFilterByFecha(token, '2024-06-12');

    // 7. Obtener estadísticas
    await testGetStats(token, '2024-06-12');

    // 8. Actualizar asistencia (si se creó)
    if (asistencia1) {
      await testUpdateAsistencia(token, asistencia1.id);
    }

    // 9. Eliminar asistencia (si se creó)
    if (asistencia2) {
      await testDeleteAsistencia(token, asistencia2.id);
    }

    console.log('\n====================================');
    console.log('TESTS COMPLETADOS');
    console.log('====================================\n');
  } catch (error) {
    console.error('\n❌ Error ejecutando tests:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar
runTests();
