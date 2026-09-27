// Comprehensive E2E Verification Test for MoSPI Learning Platform
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🏛 Starting MoSPI AI Learning & Course Management System E2E Tests...\n');
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

  try {
    // 1. Health Endpoint
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'UP', 'Health Check', `(${healthData.platform})`);

    // 2. Occupations Endpoint (21 MoSPI Staff Roles)
    const occRes = await fetch(`${BASE_URL}/api/v1/occupations`);
    const occData = await occRes.json();
    assert(occRes.status === 200 && occData.success && occData.data.length >= 21, 'MoSPI Occupations Config', `(Count: ${occData.data?.length})`);

    // 3. User Login (Statistical Officer)
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'rajesh.sharma@mospi.gov.in',
        password: 'Password@123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success && loginData.data?.token, 'Officer Login Authentication', `(Officer: ${loginData.data?.user?.full_name})`);
    const token = loginData.data.token;
    const userId = loginData.data.user.id;

    // 4. Session Info & Stats (/api/v1/auth/me)
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.data?.user?.email === 'rajesh.sharma@mospi.gov.in',
      'Current User Profile & Stats',
      `(Role: ${meData.data?.user?.role}, Enrolled: ${meData.data?.stats?.total_courses}, Avg Completion: ${meData.data?.stats?.overall_completion_percentage}%)`
    );

    // 5. Courses Catalog List
    const coursesRes = await fetch(`${BASE_URL}/api/v1/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const coursesData = await coursesRes.json();
    assert(coursesRes.status === 200 && coursesData.data?.length >= 10, 'Courses Catalog Retrieval', `(Found ${coursesData.data?.length} courses)`);

    // 6. User Enrolled Courses & Progress API
    const userCoursesRes = await fetch(`${BASE_URL}/api/v1/users/${userId}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userCoursesData = await userCoursesRes.json();
    assert(userCoursesRes.status === 200 && Array.isArray(userCoursesData.data), 'User Enrolled Courses', `(Enrolled: ${userCoursesData.data?.length})`);

    const userProgressRes = await fetch(`${BASE_URL}/api/v1/users/${userId}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userProgressData = await userProgressRes.json();
    assert(
      userProgressRes.status === 200 && Array.isArray(userProgressData.data?.completed_courses),
      'Progress Calculation API',
      `(Completed: ${userProgressData.data?.completed_courses?.length}, Ongoing: ${userProgressData.data?.ongoing_courses?.length}, Overall: ${userProgressData.data?.overall_completion_percentage}%)`
    );

    // 7. Personalized AI Recommendations
    const recRes = await fetch(`${BASE_URL}/api/v1/users/${userId}/recommendations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const recData = await recRes.json();
    assert(recRes.status === 200 && recData.data?.length > 0, 'Personalized AI Recommendations', `(Recommendations: ${recData.data?.length})`);

    // 8. New Enrollment & Progress Auto-Calculation Test
    const enrolledIds = new Set(userCoursesData.data.map(c => c.course_id));
    const availableCourse = coursesData.data.find(c => !enrolledIds.has(c.id));
    if (availableCourse) {
      const enrollRes = await fetch(`${BASE_URL}/api/v1/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: availableCourse.id
        })
      });
      const enrollData = await enrollRes.json();
      assert(enrollRes.status === 201 && enrollData.success, 'Course Enrollment Creation', `(Course: ${availableCourse.title})`);

      // 9. Module Progress Auto-Calculation Test
      const courseDetailsRes = await fetch(`${BASE_URL}/api/v1/courses/${availableCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseDetails = await courseDetailsRes.json();
      const firstModule = courseDetails.data?.modules?.[0];

      if (firstModule) {
        const progressUpdateRes = await fetch(`${BASE_URL}/api/v1/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            course_id: availableCourse.id,
            module_id: firstModule.id,
            completed: true,
            score: 95
          })
        });
        const progressUpdateData = await progressUpdateRes.json();
        assert(
          progressUpdateRes.status === 200 &&
          progressUpdateData.data?.completion_percentage > 0 &&
          progressUpdateData.data?.status === 'Ongoing',
          'Automatic Progress Calculation & Status Transition',
          `(Calculated: ${progressUpdateData.data?.completion_percentage}%, Status: ${progressUpdateData.data?.status})`
        );
      }
    } else {
      // User is already enrolled in test courses; test toggle on an existing course
      const existingCourse = userCoursesData.data[0];
      const courseDetailsRes = await fetch(`${BASE_URL}/api/v1/courses/${existingCourse.course_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseDetails = await courseDetailsRes.json();
      const firstModule = courseDetails.data?.modules?.[0];
      if (firstModule) {
        const progressUpdateRes = await fetch(`${BASE_URL}/api/v1/progress`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            course_id: existingCourse.course_id,
            module_id: firstModule.id,
            completed: true,
            score: 100
          })
        });
        const progressUpdateData = await progressUpdateRes.json();
        assert(
          progressUpdateRes.status === 200 &&
          typeof progressUpdateData.data?.completion_percentage === 'number',
          'Automatic Progress Calculation & Status Transition',
          `(Calculated: ${progressUpdateData.data?.completion_percentage}%, Status: ${progressUpdateData.data?.status})`
        );
      }
    }

    // 10. External API Key Authentication (x-api-key with courses:read scope)
    const externalRes = await fetch(`${BASE_URL}/api/v1/courses?limit=3`, {
      headers: {
        'x-api-key': 'mospi_live_api_key_sec_89412a8f9c'
      }
    });
    const externalData = await externalRes.json();
    assert(externalRes.status === 200 && externalData.success, 'External REST API via x-api-key', `(Returned: ${externalData.data?.length} courses)`);

    // 11. Swagger OpenAPI Specification & Interactive Docs
    const openapiRes = await fetch(`${BASE_URL}/api/v1/openapi.json`);
    const openapiData = await openapiRes.json();
    assert(openapiRes.status === 200 && openapiData.openapi === '3.0.0', 'OpenAPI 3.0.0 JSON Spec', `(${Object.keys(openapiData.paths || {}).length} endpoints documented)`);

    const docsRes = await fetch(`${BASE_URL}/api/docs`);
    assert(docsRes.status === 200, 'Interactive Swagger UI Documentation Page', `(Status: ${docsRes.status})`);

    // 12. Frontend Web Portal Assets
    const portalRes = await fetch(`${BASE_URL}/`);
    const htmlText = await portalRes.text();
    assert(portalRes.status === 200 && htmlText.includes('MoSPI AI Learning'), 'Single Page Web Portal Shell', `(HTML size: ${htmlText.length} bytes)`);

    console.log(`\n========================================`);
    console.log(`📊 Test Summary: ${passCount} / ${totalCount} passed`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    process.exitCode = 1;
  }
}

runTests();
