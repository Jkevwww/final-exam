const mysql = require('mysql2/promise');
require('dotenv').config();

function getDbConfig() {
  // Aiven MySQL credentials should be provided via environment variables on Render.
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    DB_CONNECTION_LIMIT
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Missing DB_HOST/DB_USER/DB_NAME environment variables.');
  }

  const sslEnabled = String(DB_SSL || '').toLowerCase() === 'true';

  return {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT ? Number(DB_CONNECTION_LIMIT) : 10,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
  };
}

async function getConn() {
  const cfg = getDbConfig();
  return mysql.createConnection(cfg);
}

async function ensureStudentsTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS students (
      student_id VARCHAR(50) NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      course VARCHAR(120) NOT NULL,
      year_level VARCHAR(50) NOT NULL,
      email_address VARCHAR(200) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id)
    );
  `;

  const conn = await getConn();
  try {
    await conn.execute(ddl);
  } finally {
    await conn.end();
  }
}

async function createStudent({ studentId, fullName, course, yearLevel, emailAddress }) {
  const conn = await getConn();
  try {
    const sql = `
      INSERT INTO students (student_id, full_name, course, year_level, email_address)
      VALUES (?, ?, ?, ?, ?)
    `;

    await conn.execute(sql, [studentId, fullName, course, yearLevel, emailAddress]);

    return {
      studentId,
      fullName,
      course,
      yearLevel,
      emailAddress
    };
  } finally {
    await conn.end();
  }
}

async function getAllStudents() {
  const conn = await getConn();
  try {
    const sql = `
      SELECT student_id, full_name, course, year_level, email_address
      FROM students
      ORDER BY student_id ASC
    `;
    const [rows] = await conn.execute(sql);
    return rows.map((r) => ({
      studentId: r.student_id,
      fullName: r.full_name,
      course: r.course,
      yearLevel: r.year_level,
      emailAddress: r.email_address
    }));
  } finally {
    await conn.end();
  }
}

async function updateStudent({ studentId, fullName, course, yearLevel, emailAddress }) {
  const conn = await getConn();
  try {
    const sql = `
      UPDATE students
      SET full_name = ?, course = ?, year_level = ?, email_address = ?
      WHERE student_id = ?
    `;

    const [result] = await conn.execute(sql, [fullName, course, yearLevel, emailAddress, studentId]);

    if (result.affectedRows === 0) {
      const err = new Error('Student not found');
      err.status = 404;
      throw err;
    }

    return {
      studentId,
      fullName,
      course,
      yearLevel,
      emailAddress
    };
  } finally {
    await conn.end();
  }
}

async function deleteStudent(studentId) {
  const conn = await getConn();
  try {
    const sql = `DELETE FROM students WHERE student_id = ?`;
    const [result] = await conn.execute(sql, [studentId]);

    if (result.affectedRows === 0) {
      const err = new Error('Student not found');
      err.status = 404;
      throw err;
    }

    return { studentId };
  } finally {
    await conn.end();
  }
}

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  ensureStudentsTable
};

