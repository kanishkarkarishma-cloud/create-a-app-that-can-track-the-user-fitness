// Admin and Edge Cases Verification Test
const BASE_URL = 'http://localhost:3000';

async function testAdminAndCompletion() {
  console.log('🛡 Starting MoSPI Admin & Lifecycle Tests...\n');
  let passCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details}`);
      process.exitCode = 1;
    }
  }

  // 1. Super Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'alok.verma@mospi.gov.in',
      password: 'Admin@2026'
    })
  });
  const adminLogin = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && (adminLogin.data?.user?.role === 'Super Admin' || adminLogin.data?.user?.role === 'Admin'), 'Super Admin Login', `(User: ${adminLogin.data?.user?.full_name}, Role: ${adminLogin.data?.user?.role})`);
  const adminToken = adminLogin.data.token;

  // 2. Admin Analytics
  const analyticsRes = await fetch(`${BASE_URL}/api/v1/admin/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const analytics = await analyticsRes.json();
  assert(
    analyticsRes.status === 200 && analytics.data?.metrics?.total_registered_users > 0,
    'Admin Analytics Overview',
    `(Total Users: ${analytics.data?.metrics?.total_registered_users}, Courses: ${analytics.data?.metrics?.total_courses}, Enrollments: ${analytics.data?.metrics?.total_enrollments})`
  );

  // 3. Admin Users List
  const usersRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const usersData = await usersRes.json();
  assert(usersRes.status === 200 && usersData.data?.length >= 10, 'Admin User Management List', `(Count: ${usersData.data?.length})`);

  // 4. Admin Security Audit Trail
  const auditRes = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const auditData = await auditRes.json();
  assert(auditRes.status === 200 && auditData.data?.length > 0, 'Admin Security Audit Trail', `(Logs Count: ${auditData.data?.length})`);

  // 5. Admin API Keys List
  const keysRes = await fetch(`${BASE_URL}/api/v1/admin/api-keys`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const keysData = await keysRes.json();
  assert(keysRes.status === 200 && keysData.data?.length >= 3, 'API Key Management', `(Active Keys: ${keysData.data?.length})`);

  // 6. User Registration Flow with Occupation
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
  const regPayload = {
    full_name: `Test Officer ${randomSuffix}`,
    email: `test.officer.${randomSuffix}@mospi.gov.in`,
    employee_id: `MOSPI${randomSuffix}`,
    password: 'Password@123',
    confirm_password: 'Password@123',
    occupation_id: 1,
    department: 'National Statistical Systems Training Academy (NSSTA)',
    state_ut: 'Uttar Pradesh'
  };

  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success && regData.data?.token, 'New Officer Registration Flow', `(ID: ${regData.data?.user?.employee_id})`);
  const newOfficerToken = regData.data?.token;
  const newOfficerId = regData.data?.user?.id;

  // 7. Course 100% Completion Rule Verification
  // Enroll new officer in Course 1
  await fetch(`${BASE_URL}/api/v1/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newOfficerToken}` },
    body: JSON.stringify({ user_id: newOfficerId, course_id: 1 })
  });

  // Get modules for course 1
  const c1ModulesRes = await fetch(`${BASE_URL}/api/v1/courses/1/modules`, {
    headers: { Authorization: `Bearer ${newOfficerToken}` }
  });
  const c1ModulesData = await c1ModulesRes.json();
  const modules = c1ModulesData.data.modules;

  // Complete all modules one by one
  let lastProgress = null;
  for (const m of modules) {
    const progRes = await fetch(`${BASE_URL}/api/v1/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newOfficerToken}` },
      body: JSON.stringify({
        user_id: newOfficerId,
        course_id: 1,
        module_id: m.id,
        completed: true,
        score: 100
      })
    });
    lastProgress = await progRes.json();
  }

  assert(
    lastProgress?.data?.completion_percentage === 100 &&
    lastProgress?.data?.status === 'Completed' &&
    lastProgress?.data?.completion_date !== null,
    '100% Completion Calculation & Status Transition',
    `(Percentage: ${lastProgress?.data?.completion_percentage}%, Status: ${lastProgress?.data?.status}, Completion Date: ${lastProgress?.data?.completion_date})`
  );

  console.log(`\n========================================`);
  console.log(`🛡 Lifecycle Summary: ${passCount} / ${totalCount} passed`);
  console.log(`========================================\n`);
}

testAdminAndCompletion().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
