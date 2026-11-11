process.env.NODE_ENV = 'test';
process.env.USE_MOCK_DB = 'true';
process.env.JWT_SECRET = 'super_secreto_para_firmar_tokens_jwt_32_chars_min';
process.env.DATABASE_URL = 'postgresql://usuario:password@localhost:5432/trackwise';

import http from 'http';

let server: http.Server;
let baseUrl = '';

async function startServer(): Promise<void> {
  const { createApp } = await import('../app');
  const app = createApp();
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://127.0.0.1:${address.port}/api`;
      }
      resolve();
    });
  });
}

async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, extra?: unknown): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (extra) console.error('     Detalle:', extra);
    throw new Error(`Test fallido: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('🧪 INICIANDO BATERÍA DE PRUEBAS AUTOMATIZADAS E2E (TrackWise)');
  console.log('============================================================\n');

  const { mockDb } = await import('../db/mockDb');
  await startServer();
  mockDb.reset();

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECK
    // -------------------------------------------------------------
    console.log('🔹 1. Verificando Health Check y disponibilidad básica');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json() as { status: string };
    assert(healthRes.status === 200, 'Health check responde HTTP 200');
    assert(healthJson.status === 'ok', 'Health check devuelve { status: "ok" }');

    // -------------------------------------------------------------
    // 2. FLUJO DE AUTENTICACIÓN (Registro -> OTP -> Login -> JWT)
    // -------------------------------------------------------------
    console.log('\n🔹 2. Flujo de Autenticación (Registro -> OTP -> Login -> JWT)');

    // 2.1 Registro
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Mateo Dev',
        email: 'mateo@test.com',
        password: 'password123',
      }),
    });
    const regJson = await regRes.json() as { success: boolean; devOtp: string };
    assert(regRes.status === 201, 'Registro de usuario devuelve HTTP 201');
    assert(regJson.success === true, 'Respuesta de registro contiene success: true');
    assert(typeof regJson.devOtp === 'string' && regJson.devOtp.length === 6, 'Genera código OTP de 6 dígitos');
    const otpCode = regJson.devOtp;

    // 2.2 Intento de Login antes de verificar (debe fallar con 403)
    const unverifiedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mateo@test.com',
        password: 'password123',
      }),
    });
    assert(unverifiedLoginRes.status === 403, 'Login bloqueado (HTTP 403) para cuentas no verificadas');

    // 2.3 Verificación OTP con código erróneo (debe fallar con 400)
    const invalidOtpRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mateo@test.com',
        code: '000000',
      }),
    });
    assert(invalidOtpRes.status === 400, 'Verificación rechaza código erróneo con HTTP 400');

    // 2.4 Verificación OTP correcta (activa cuenta y emite JWT)
    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mateo@test.com',
        code: otpCode,
      }),
    });
    const verifyJson = await verifyRes.json() as { success: boolean; token: string; user: { is_verified: boolean } };
    assert(verifyRes.status === 200, 'Verificación OTP correcta devuelve HTTP 200');
    assert(typeof verifyJson.token === 'string' && verifyJson.token.length > 20, 'Emite token JWT válido');
    assert(verifyJson.user.is_verified === true, 'El usuario queda marcado con is_verified = true');

    // 2.5 Login tras verificación exitosa
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mateo@test.com',
        password: 'password123',
      }),
    });
    const loginJson = await loginRes.json() as { success: boolean; token: string };
    assert(loginRes.status === 200, 'Login devuelve HTTP 200 tras verificación');
    const token = loginJson.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2.6 Endpoint protegido /api/auth/me
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: authHeaders });
    const meJson = await meRes.json() as { user: { username: string; email: string } };
    assert(meRes.status === 200, 'GET /api/auth/me responde HTTP 200 con token');
    assert(meJson.user.username === 'Mateo Dev', 'GET /api/auth/me retorna los datos del usuario logueado');

    // -------------------------------------------------------------
    // 3. FLUJO DE FINANZAS (Categorías, Transacciones y Resumen)
    // -------------------------------------------------------------
    console.log('\n🔹 3. Flujo de Finanzas (Categorías, Transacciones y Resumen)');

    // 3.1 Listado de categorías (debe incluir las del sistema)
    const catListRes = await fetch(`${baseUrl}/finance/categories`, { headers: authHeaders });
    const catListJson = await catListRes.json() as { data: Array<{ id: string; name: string }> };
    assert(catListRes.status === 200, 'GET /api/finance/categories responde HTTP 200');
    assert(catListJson.data.length >= 8, 'Listado contiene al menos las 8 categorías predeterminadas');
    const defaultFoodCat = catListJson.data.find((c) => c.name === 'Comida')!;
    assert(!!defaultFoodCat, 'Categoría predeterminada "Comida" está presente');

    // 3.2 Creación de categoría personalizada
    const newCatRes = await fetch(`${baseUrl}/finance/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Inversiones Cripto',
        icon: 'Coins',
        color: '#8B5CF6',
        type: 'BOTH',
      }),
    });
    const newCatJson = await newCatRes.json() as { data: { id: string; name: string } };
    assert(newCatRes.status === 201, 'POST /api/finance/categories crea categoría personalizada (HTTP 201)');
    const customCatId = newCatJson.data.id;

    // 3.3 Registro de Gasto con descripción provista
    const dNow = new Date();
    const todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
    const expenseRes = await fetch(`${baseUrl}/finance/transactions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: defaultFoodCat.id,
        type: 'EXPENSE',
        amount: 3500.5,
        date: todayStr,
        description: 'Almuerzo de trabajo',
      }),
    });
    const expenseJson = await expenseRes.json() as { data: { id: string; amount: number; description: string } };
    assert(expenseRes.status === 201, 'POST /api/finance/transactions registra gasto (HTTP 201)');
    assert(expenseJson.data.amount === 3500.5, 'Monto del gasto coincide exactamente');
    assert(expenseJson.data.description === 'Almuerzo de trabajo', 'Descripción del gasto guardada correctamente');

    // 3.4 Registro de Ingreso CON DESCRIPCIÓN OMITIDA (Nullabilidad probada)
    const incomeRes = await fetch(`${baseUrl}/finance/transactions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: customCatId,
        type: 'INCOME',
        amount: 120000,
        date: todayStr,
        // description omitida deliberadamente
      }),
    });
    const incomeJson = await incomeRes.json() as { data: { id: string; amount: number; description: string | null } };
    assert(incomeRes.status === 201, 'POST /api/finance/transactions permite omitir description (HTTP 201)');
    assert(incomeJson.data.description === null, 'La descripción omitida se almacena estrictamente como NULL');

    // 3.5 Listado y filtros de transacciones
    const txListRes = await fetch(`${baseUrl}/finance/transactions`, { headers: authHeaders });
    const txListJson = await txListRes.json() as { data: Array<{ id: string; type: string }> };
    assert(txListRes.status === 200, 'GET /api/finance/transactions responde HTTP 200');
    assert(txListJson.data.length === 2, 'Devuelve las 2 transacciones registradas');

    // 3.6 Resumen Financiero (Dashboard)
    const summaryRes = await fetch(`${baseUrl}/finance/summary`, { headers: authHeaders });
    const summaryJson = await summaryRes.json() as {
      data: {
        total_income: number;
        total_expense: number;
        net_balance: number;
        by_category: Array<{ category_name: string; total: number }>;
      };
    };
    assert(summaryRes.status === 200, 'GET /api/finance/summary responde HTTP 200');
    assert(summaryJson.data.total_income === 120000, 'Total de ingresos coincide');
    assert(summaryJson.data.total_expense === 3500.5, 'Total de gastos coincide');
    assert(summaryJson.data.net_balance === 116499.5, 'Balance neto calculado con precisión');
    assert(summaryJson.data.by_category.length > 0, 'Desglose por categorías para Pie Chart generado');

    // -------------------------------------------------------------
    // 4. FLUJO DE HÁBITOS (Creación, Check-in, Rachas y Heatmap)
    // -------------------------------------------------------------
    console.log('\n🔹 4. Flujo de Tracker de Hábitos (Creación, Check-in, Rachas y Heatmap)');

    // 4.1 Creación de Hábito
    const habitRes = await fetch(`${baseUrl}/habits`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Leer 20 páginas diarias',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        color: '#10B981',
      }),
    });
    const habitJson = await habitRes.json() as { data: { id: string; name: string; days_of_week: number[] } };
    assert(habitRes.status === 201, 'POST /api/habits crea nuevo hábito (HTTP 201)');
    const habitId = habitJson.data.id;

    // 4.2 Check-in de cumplimiento para hoy
    const checkRes = await fetch(`${baseUrl}/habits/check`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        habitId,
        date: todayStr,
        completed: true,
      }),
    });
    const checkJson = await checkRes.json() as { success: boolean; data: { completed: boolean } };
    assert(checkRes.status === 200, 'POST /api/habits/check registra check-in (HTTP 200)');
    assert(checkJson.data.completed === true, 'Estado completed marcado como true');

    // 4.3 Listado de Hábitos con cálculo de rachas
    const habitListRes = await fetch(`${baseUrl}/habits`, { headers: authHeaders });
    const habitListJson = await habitListRes.json() as {
      data: Array<{ id: string; completed_today: boolean; current_streak: number }>;
    };
    assert(habitListRes.status === 200, 'GET /api/habits responde HTTP 200');
    const myHabit = habitListJson.data.find((h) => h.id === habitId);
    assert(!!myHabit, 'El hábito creado aparece en el listado');
    assert(myHabit?.completed_today === true, 'Hábito marcado como completed_today = true');
    assert(myHabit?.current_streak === 1, 'Racha calculada correctamente (streak = 1)');

    // 4.4 Matriz del Mapa de Calor (Heatmap)
    const heatmapRes = await fetch(`${baseUrl}/habits/heatmap`, { headers: authHeaders });
    const heatmapJson = await heatmapRes.json() as { data: Array<{ date: string; count: number }> };
    assert(heatmapRes.status === 200, 'GET /api/habits/heatmap responde HTTP 200');
    const todayHeatmap = heatmapJson.data.find((d) => d.date === todayStr);
    assert(todayHeatmap !== undefined && todayHeatmap.count >= 1, 'Heatmap registra la actividad de hoy');

    console.log('\n============================================================');
    console.log(`🎉 TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO: ${passedTests}/${totalTests} PASSED`);
    console.log('============================================================\n');
  } catch (error) {
    console.error('\n💥 ERROR DURANTE LA EJECUCIÓN DE PRUEBAS:', error);
    process.exitCode = 1;
  } finally {
    await stopServer();
  }
}

void runTestSuite();
