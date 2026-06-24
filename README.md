# Internal Ticketing App

Aplikasi ticketing internal sederhana untuk kebutuhan tes programmer. Project ini terdiri dari frontend Next.js dan backend NestJS dengan database PostgreSQL.

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT
- API docs: Swagger

## Struktur project

- `frontend/` → aplikasi web Next.js
- `backend/` → REST API NestJS

## Cara menjalankan frontend Next.js

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di:

[http://localhost:3000](http://localhost:3000)

## Cara menjalankan backend NestJS

```bash
cd backend
npm install
npm run start:dev
```

Backend berjalan di:

[http://localhost:3001](http://localhost:3001)

Swagger API docs:

[http://localhost:3001/api](http://localhost:3001/api)

## Cara setup PostgreSQL

Project ini menggunakan PostgreSQL lokal. Saya menjalankannya dengan DBngin, tetapi bisa juga menggunakan PostgreSQL lokal biasa.

1. Buat database baru, misalnya:

```text
internal-ticketing
```

2. Buat file `.env` di folder `backend/`

Contoh:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/internal-ticketing"
JWT_SECRET="SECRET_KEY_SAYA"
PORT=3001
```

Catatan:

- Sesuaikan `username`, `password`, `port`, dan nama database dengan PostgreSQL lokal Anda
- Pada setup saya, port PostgreSQL sempat berjalan di `5433`, jadi silakan cek port aktif masing-masing

## Cara menjalankan migration dan seeder

Masuk ke folder backend:

```bash
cd backend
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration:

```bash
npx prisma migrate dev --name init
```

Jalankan seed:

```bash
npx prisma db seed
```

## Akun login demo

Semua akun demo menggunakan password:

```text
password
```

Daftar akun:

- Admin
  - `admin@example.com`
  - `admin2@example.com`

- User
  - `user@example.com`
  - `user2@example.com`
  - `user3@example.com`

## Fitur yang selesai

### Backend

- Login dengan JWT
- Endpoint `auth/me`
- Dashboard summary
- List ticket dengan filter:
  - search
  - status
  - multi status
  - category
  - pagination
- Create ticket
- Detail ticket
- Update status ticket
- Assign ticket ke admin / IT support
- Tambah komentar
- Activity log ticket
- Endpoint daftar admin untuk assignment
- Swagger
- Seeder dummy
- Upload attachment lokal ke folder `uploads/`

### Frontend

- Login page
- Protected routes
- Dashboard admin dan user
- Ticket list page
- Ticket detail page
- Create ticket page
- Filter ticket
- Badge status dan priority reusable
- Alert message reusable untuk notifikasi sederhana
- Validasi form sederhana
- Upload attachment file maksimal 2 MB
- Dark mode mengikuti preferensi device

## Fitur yang belum selesai / belum difokuskan

- Export ticket ke Excel / PDF
- Notifikasi realtime belum ada, saat ini notifikasi masih berupa feedback UI sederhana
- Unit test sederhana belum ditambahkan khusus untuk fitur utama
- Penyimpanan attachment masih lokal, belum memakai cloud storage

## Penggunaan AI tools

Project ini dibantu AI tools sebagai coding assistant untuk mempercepat beberapa bagian pengerjaan, terutama:

- brainstorming solusi
- drafting sebagian code / boilerplate
- membantu debugging
- membantu merapikan dokumentasi teknis
- membantu dalam membiasakan penulisan pada TypeScript

Tools yang digunakan:

- OpenAI Codex

Bagian yang dibantu AI:

- penyiapan struktur awal project
- sebagian implementasi frontend/backend
- refactor kecil dan troubleshooting
- penyusunan README

Catatan:

- Requirement analysis, penyesuaian implementasi dengan soal, setup environment, integrasi antar bagian, serta pengujian/verifikasi tetap dilakukan selama proses pengerjaan project
- Perbantuan yang dilakukan Codex sengaja diketik manual dengan tujuan untuk membiasakan penulisan code dan memahami apa yang dilakukan sistem

## Catatan tambahan / asumsi teknis

- Role yang digunakan hanya:
  - `ADMIN`
  - `USER`
- Assignee ticket dibatasi ke role `ADMIN`, sesuai interpretasi “staff IT / IT Support”
- Attachment disimpan sebagai file lokal dan path-nya disimpan ke database pada field `attachmentUrl`
- Batas upload attachment: maksimal `2 MB`
- Format attachment yang diterima:
  - `png`
  - `jpg`
  - `jpeg`
  - `pdf`
- Swagger aktif di endpoint `/api`
- Folder upload berada di:

```text
backend/uploads
```

- Jika ingin menyiapkan demo dengan data dummy dari nol, jalankan:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```
