# Student Information Management System (Final Practical Exam)

Node.js (Express) + MySQL (Aiven) + Render deployment

## Features (CRUD)
- Create student records
- Read/view all student records
- Update student information
- Delete student records

## Required / Included Files
- `package.json`
- `crud_final_exam.js`
- `README.md`

## Frontend
Served from `/public`:
- `index.html` (Homepage)
- `register.html` (Add student)
- `students.html` (Student list table)
- `edit.html` (Edit student)
- `styles.css`, `app.js`

## Backend
REST API:
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:studentId`
- `DELETE /api/students/:studentId`

## Database (Aiven MySQL)
### Students table
```sql
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
```

### Environment Variables
Set these on Render (do NOT commit secrets to GitHub):
- `DB_HOST`
- `DB_PORT` (optional, default 3306)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL` (set `true` if required by Aiven)

Local template:
- `.env.example`

## Run locally
```bash
npm install
npm start
```
Then open:
- http://localhost:10000

## Render Deployment Link
- **Deployment Link:** (fill after deploying)

## Notes for the instructor
Screenshots to collect:
1. GitHub repository page
2. Aiven database dashboard
3. Render deployment dashboard
4. Running application
5. Database records

