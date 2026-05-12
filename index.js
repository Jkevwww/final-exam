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
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { studentId, fullName, course, yearLevel, emailAddress } = req.body || {};

    // Basic validation
    if (!studentId || !fullName || !course || !yearLevel || !emailAddress) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const result = await createStudent({ studentId, fullName, course, yearLevel, emailAddress });
    res.status(201).json({ message: 'Student created.', student: result });
  } catch (err) {
    // MySQL duplicate key
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists.' });
    }
    res.status(500).json({ error: 'Failed to create student.' });
  }
});

app.put('/api/students/:studentId', async (req, res) => {
  try {
    const { studentId: paramId } = req.params;
    const { fullName, course, yearLevel, emailAddress } = req.body || {};

    if (!paramId || !fullName || !course || !yearLevel || !emailAddress) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const updated = await updateStudent({
      studentId: paramId,
      fullName,
      course,
      yearLevel,
      emailAddress
    });

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
    // If the user prefers manual DDL in Aiven, this can fail; app still starts.
  }

  const port = process.env.PORT || 10000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();

