# Oracle Java Exam Prep (Nuxt 4 + TypeScript)

Web app luyen thi chung chi Java (OCA/OCP/OCM) voi:
- Practice mode (submit tung cau, hien dap an + explanation ngay)
- Mock exam mode (countdown timer, submit cuoi bai)
- Auth + phan quyen free/premium
- Pricing/Upgrade (mock payment)
- Exam history theo quyen mua goi
- i18n vi/en
- Du lieu user/attempt/purchase/history luu encrypted (AES-GCM) qua Google Sheet gateway

## Stack
- Nuxt 4 + TypeScript
- Pinia
- VueUse
- TailwindCSS
- Nuxt i18n
- Nitro server routes (SSR compatible, deploy Vercel)

## Folder structure
```text
app/
  components/
  layouts/
  middleware/
  pages/
  plugins/
  stores/
assets/css/
data/
  courses.ts
  questions/*.json
locales/
server/
  api/
    auth/
    questions/
    exam/
    history/
    billing/
    sheet/
    crypto/
  utils/
types/
.env.example
```

## Core pages
- `/` Home
- `/courses` Course list
- `/courses/:id` Course detail
- `/practice/:courseId`
- `/mock/:courseId`
- `/result/:sessionId`
- `/login`
- `/register`
- `/pricing`
- `/history`

## Free vs Premium rules implemented
- Chua login:
  - Duoc vao Home/Courses/Practice
  - Khong duoc vao Mock exam (middleware `auth-required`)
- Free account:
  - Practice khong gioi han
  - Mock exam 2 lan/course
  - Tu lan thu 3 -> redirect `/pricing`
  - History van luu, nhung `/history` khong hien thi
  - Result detail (mock explanations) bi khoa
- Premium theo course:
  - Mock khong gioi han cho course do
  - Xem history cua course do
  - Xem full explanation cho mock result cua course do
- Premium full:
  - Mo tat ca course

## Question JSON schema
```json
{
  "questions": [
    {
      "topic": "Assessment Test",
      "question_number": 1,
      "question": "question",
      "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "...", "F": "...", "G": "..." },
      "correct_answers": ["E"],
      "explanation": "...",
      "multi": false
    }
  ]
}
```

## Google Sheet storage design
User-side data duoc ma hoa AES-GCM truoc khi ghi:
- `users` table: encrypted row ch?a `id, email, displayName, passwordHash, role, createdAt`
- `purchases` table: encrypted row ch?a `id, userId, scope, courseId, createdAt`
- `exam_history` table: encrypted row ch?a ket qua mock exam + details

### Gateway assumptions
`GOOGLE_APPS_SCRIPT_URL` nhan POST JSON:
- read: `{ action: "read", table: "users" }`
- write: `{ action: "write", table: "users", rows: [...] }`

Tra ve JSON:
- `{ ok: true, rows: [...] }`

Neu khong cau hinh gateway, app fallback local file `.data/sheet-local.json` de dev.

## Local run
```bash
npm install
cp .env.example .env
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Vercel deploy
```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

Set env vars tren Vercel project:
- `AES_KEY`
- `TOKEN_SECRET`
- `PASS_THRESHOLD`
- `GOOGLE_SHEET_URL`
- `GOOGLE_APPS_SCRIPT_URL`
- `NUXT_PUBLIC_APP_NAME`
- `NUXT_PUBLIC_FREE_MOCK_LIMIT`

## Short technical assumptions
- Payment la mock state (khong goi cong thanh toan that)
- Google Sheet read/write thong qua Apps Script endpoint do ban quan ly
- Questions source la public JSON URL hoac local sample fallback
