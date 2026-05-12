const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  ensureStudentsTable
} = require('./crud_final_exam');

dotenv.config();

const app = express();
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// CRUD REST API
app.get('/api/students', async (_req, res) => {
  try {
    const students = await getAllStudents();
    res.json({ students });
  } catch (err) {
    console.error('getAllStudents failed:', err);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});


function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateStudentPayload(payload) {
  const {
    studentId,
    fullName,
    course,
    yearLevel,
    emailAddress
  } = payload || {};

  const errors = [];

  const email = typeof emailAddress === 'string' ? emailAddress.trim() : '';
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!isNonEmptyString(studentId)) errors.push('Student ID is required.');
  if (!isNonEmptyString(fullName)) errors.push('Full Name is required.');
  if (!isNonEmptyString(course)) errors.push('Course is required.');
  if (!isNonEmptyString(yearLevel)) errors.push('Year Level is required.');
  if (!isNonEmptyString(emailAddress)) errors.push('Email Address is required.');

  // Length checks aligned with DB schema
  if (typeof studentId === 'string' && studentId.trim().length > 50) errors.push('Student ID must be 50 characters or less.');
  if (typeof fullName === 'string' && fullName.trim().length > 120) errors.push('Full Name must be 120 characters or less.');
  if (typeof course === 'string' && course.trim().length > 120) errors.push('Course must be 120 characters or less.');
  if (typeof yearLevel === 'string' && yearLevel.trim().length > 50) errors.push('Year Level must be 50 characters or less.');
  if (typeof emailAddress === 'string' && emailAddress.trim().length > 200) errors.push('Email Address must be 200 characters or less.');

  // Basic format
  if (isNonEmptyString(emailAddress) && !emailRegex.test(email)) {
    errors.push('Invalid email address.');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: {
      studentId: String(studentId || '').trim(),
      fullName: String(fullName || '').trim(),
      course: String(course || '').trim(),
      yearLevel: String(yearLevel || '').trim(),
      emailAddress: String(emailAddress || '').trim()
    }
  };
}

function sendValidation(res, errors) {
  return res.status(400).json({ error: 'Validation failed.', details: errors });
}


app.post('/api/students', async (req, res) => {

  try {
    const validation = validateStudentPayload(req.body);
    if (!validation.valid) return sendValidation(res, validation.errors);

    const result = await createStudent(validation.normalized);
    res.status(201).json({ message: 'Student created.', student: result });
  } catch (err) {
    console.error('createStudent failed:', err);

    // MySQL duplicate key
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists.' });
    }

    // Common DB connection/config errors (safe, no secrets)
    if (err && (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'EAUTH')) {
      return res.status(500).json({ error: 'Database authentication failed. Check DB_USER/DB_PASSWORD.' });
    }
    if (err && (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT')) {
      return res.status(500).json({ error: 'Database connection failed. Check DB_HOST/DB_PORT (and network/Render/Aiven connectivity).' });
    }

    // If we already have a safe-ish message, surface it for debugging.
    const msg = err && typeof err.message === 'string' && err.message.length < 300 ? err.message : null;
    return res.status(500).json({
      error: msg ? `Failed to create student: ${msg}` : 'Failed to create student.'
    });
  }
});

app.put('/api/students/:studentId', async (req, res) => {

  try {
    const { studentId: paramId } = req.params;

    const validation = validateStudentPayload({
      ...req.body,
      studentId: paramId
    });

    if (!validation.valid) return sendValidation(res, validation.errors);

    const updated = await updateStudent(validation.normalized);

    res.json({ message: 'Student updated.', student: updated });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Duplicate entry.' });
    }
    if (err && err.status === 404) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.status(500).json({ error: 'Failed to update student.' });
  }
});



app.delete('/api/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const deleted = await deleteStudent(studentId);
    res.json({ message: 'Student deleted.', deleted });
  } catch (err) {
    if (err && err.status === 404) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

async function start() {
  // Ensure table exists (optional auto-create for demo convenience)
  try {
    await ensureStudentsTable();
  } catch (_e) {
    console.warn('ensureStudentsTable() failed; app will still start. Error:', _e);
  }


  const port = process.env.PORT || 10000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();

