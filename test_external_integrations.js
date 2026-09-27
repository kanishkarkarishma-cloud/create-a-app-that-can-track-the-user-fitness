// External Integration & API Scope Verification Test
const BASE_URL = 'http://localhost:3000';
const FULL_ACCESS_KEY = 'mospi_live_api_key_sec_89412a8f9c'; // All scopes

async function testExternalIntegrations() {
  console.log('🌐 Starting External Integration & API Security Tests...\n');
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

  // 1. External Course Catalog Query
  const coursesRes = await fetch(`${BASE_URL}/api/v1/courses?search=Statistical&category=Survey%20Methodology`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const coursesData = await coursesRes.json();
  assert(coursesRes.status === 200 && coursesData.success, 'External Query: GET /courses with filters', `(Matches: ${coursesData.data?.length})`);

  // 2. External Module Hierarchy Query
  const firstCourseId = coursesData.data[0]?.id || 1;
  const modulesRes = await fetch(`${BASE_URL}/api/v1/courses/${firstCourseId}/modules`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const modulesData = await modulesRes.json();
  assert(modulesRes.status === 200 && Array.isArray(modulesData.data?.modules), 'External Query: GET /courses/:id/modules', `(Modules: ${modulesData.data?.modules?.length})`);

  // 3. External Occupations Query
  const occRes = await fetch(`${BASE_URL}/api/v1/occupations`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const occData = await occRes.json();
  assert(occRes.status === 200 && occData.data?.length >= 21, 'External Query: GET /occupations', `(Occupations: ${occData.data?.length})`);

  // 4. External User Profile Query
  const userRes = await fetch(`${BASE_URL}/api/v1/users/3`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const userData = await userRes.json();
  assert(userRes.status === 200 && userData.data?.email === 'rajesh.sharma@mospi.gov.in', 'External Query: GET /users/:id', `(Officer: ${userData.data?.full_name})`);

  // 5. External User Enrolled Courses Query
  const userCoursesRes = await fetch(`${BASE_URL}/api/v1/users/3/courses`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const userCoursesData = await userCoursesRes.json();
  assert(userCoursesRes.status === 200 && Array.isArray(userCoursesData.data), 'External Query: GET /users/:id/courses', `(Enrolled courses: ${userCoursesData.data?.length})`);

  // 6. External User Progress Summary Query
  const userProgRes = await fetch(`${BASE_URL}/api/v1/users/3/progress`, {
    headers: { 'x-api-key': FULL_ACCESS_KEY }
  });
  const userProgData = await userProgRes.json();
  assert(userProgRes.status === 200 && typeof userProgData.data?.overall_completion_percentage === 'number', 'External Query: GET /users/:id/progress', `(Avg: ${userProgData.data?.overall_completion_percentage}%)`);

  // 7. External Course Enrollment Creation (enrollment:write)
  const extEnrollRes = await fetch(`${BASE_URL}/api/v1/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': FULL_ACCESS_KEY
    },
    body: JSON.stringify({
      user_id: 3,
      course_id: 10
    })
  });
  const extEnrollData = await extEnrollRes.json();
  assert(
    (extEnrollRes.status === 201 && extEnrollData.success) ||
    (extEnrollRes.status === 409 && extEnrollData.error?.code === 'ALREADY_ENROLLED'),
    'External Action: POST /enrollments via API key',
    `(Status: ${extEnrollRes.status})`
  );

  // 8. Scope Violation Test: Use an invalid/restricted API key or missing key
  const invalidKeyRes = await fetch(`${BASE_URL}/api/v1/courses`, {
    headers: { 'x-api-key': 'non_existent_api_key_123' }
  });
  assert(invalidKeyRes.status === 401, 'Security: Invalid API Key Rejection', `(HTTP ${invalidKeyRes.status})`);

  // 9. Unauthorized Write: attempt to update progress without auth
  const noAuthRes = await fetch(`${BASE_URL}/api/v1/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 3, course_id: 1, module_id: 1, completed: true })
  });
  assert(noAuthRes.status === 401, 'Security: Missing Auth Rejection', `(HTTP ${noAuthRes.status})`);

  console.log(`\n========================================`);
  console.log(`🌐 Integration Summary: ${passCount} / ${totalCount} passed`);
  console.log(`========================================\n`);
}

testExternalIntegrations().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
