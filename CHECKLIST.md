# Demo / Grading Checklist

## Repository / Setup
- [ ] `npm install` completed locally
- [ ] Server starts successfully: `npm start`
- [ ] Open: `http://localhost:10000` (homepage loads)

## Frontend CRUD Flow
- [ ] Register student (POST) works
- [ ] Student list loads (GET) and shows created record
- [ ] Edit student (PUT) updates record successfully
- [ ] Delete student (DELETE) removes record successfully

## Validation (Expected Behavior)
- [ ] Frontend blocks empty required fields before calling backend
- [ ] Frontend blocks invalid emails before calling backend
- [ ] Backend returns `400 Validation failed` for invalid payloads
- [ ] Backend returns `409` on duplicate Student ID
- [ ] Backend returns `404` when updating/deleting a non-existent Student ID

## Render Deployment
- [ ] Render Web Service created
- [ ] Environment variables set on Render: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` (as needed)
- [ ] Start command set to `npm start`
- [ ] `GET /health` returns `{ "ok": true }`
- [ ] All CRUD operations work on Render
- [ ] Deployment link recorded in `README.md`

## Screenshots (Collect for Submission)
- [ ] GitHub repository page
- [ ] Aiven database dashboard
- [ ] Render deployment dashboard
- [ ] Running application (homepage)
- [ ] Database records (show inserted rows)

## Final
- [ ] README includes Render instructions and env var notes
- [ ] `.env.example` present in repo

