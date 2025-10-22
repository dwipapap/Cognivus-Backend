function sanitize(input, allowedFields = []) {
  const result = {};
  const allowedSet = new Set(allowedFields);

  for (const field of allowedFields) {
    // Skip fields that don't exist in input
    if (!(field in input)) continue;

    const value = input[field];

    // Skip undefined values
    if (value === undefined) continue;

    // Handle null values
    if (value === null) {
      result[field] = null;
      continue;
    }

    const type = typeof value;

    // Handle strings (including empty/whitespace)
    if (type === 'string') {
      result[field] = value.trim() === '' ? null : value;
      continue;
    }

    // Handle numbers and booleans
    if (type === 'number' || type === 'boolean') {
      result[field] = value;
      continue;
    }

    // Skip arrays and objects silently
  }

  return result;
}

const allowed = {
  student: [
    'fullname', 'gender', 'birthdate', 'birthplace', 'address', 'phone',
    'parentname', 'parentphone', 'photo', 'classid', 'programid', 'levelid', 'is_active'
  ],
  lecturer: [
    'fullname', 'gender', 'birthdate', 'birthplace', 'address', 'phone',
    'photo', 'classid', 'lasteducation'
  ],
  user: [
    'username', 'email', 'password', 'roleid', 'is_active'
  ],
  level: [
    'name', 'description'
  ],
  teacher_level: [
    'levelid', 'lecturerid'
  ],
  program: [
    'name', 'description'
  ],
  price: [
    'levelid', 'programid', 'harga'
  ],
  course: [
    'title', 'upload_date', 'video_link', 'description', 'classid', 'course_code'
  ],
  class: [
    'levelid', 'class_code', 'description', 'lecturerid'
  ],
  grade: [
    'studentid', 'test_type', 'listening_score', 'reading_score',
    'speaking_score', 'writing_score', 'final_score', 'description', 'date_taken'
  ],
  report: [
    'studentid', 'test_type', 'grade_id', 'report_code', 'upload_date'
  ],
  course_files: [
    'courseid', 'path', 'url'
  ]
};

// Helper to ensure we handle null/undefined in the exported functions
function createSanitizer(allowedFields) {
  return (input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return {};
    }
    return sanitize(input, allowedFields);
  };
}

module.exports = {
  student: createSanitizer(allowed.student),
  lecturer: createSanitizer(allowed.lecturer),
  user: createSanitizer(allowed.user),
  level: createSanitizer(allowed.level),
  teacher_level: createSanitizer(allowed.teacher_level),
  program: createSanitizer(allowed.program),
  price: createSanitizer(allowed.price),
  course: createSanitizer(allowed.course),
  class: createSanitizer(allowed.class),
  grade: createSanitizer(allowed.grade),
  report: createSanitizer(allowed.report),
  course_files: createSanitizer(allowed.course_files)
};