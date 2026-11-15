# Hồ sơ stack: Next.js App Router + TypeScript (Supabase · Drizzle · Prisma · pg)

> **Nhận diện:** `next.config.*` + `app/` hoặc `src/app/`. Biến thể: `@supabase/supabase-js` · `drizzle.config.ts` · `prisma/schema.prisma` · chỉ `pg`.
> **Rút từ:** furama-house-app (Supabase) · giam-sat-du-an, furama_activities_v2 (Drizzle) · acc, dha (Prisma) · furama_cuisine, idea-hub (pg) — Next 16; idea-hub Next 14 JS (11/2026).
> Luật `Nxx` không đổi theo stack. File này chỉ nói luật đó NẰM Ở ĐÂU và CHẠY LỆNH GÌ trong stack này. Lệnh ghi trong
> agent/quy trình là ví dụ Next.js — hồ sơ stack thắng; `CLAUDE.md` của project thắng hồ sơ stack.

## Lệnh

| Việc | Lệnh |
|---|---|
| Cài phụ thuộc | `npm install` (furama_activities_v2: `pnpm`) |
| Chạy dev | `npm run dev` (acc, dha: cổng 3007) |
| Kiểm kiểu / biên dịch | `npm run typecheck`; thiếu script → `npx tsc --noEmit` |
| Lint | `npm run lint` (eslint; furama_cuisine: oxlint) |
| Phép thử | Lệch nhau: `npm test` = Vitest (giam-sat-du-an, furama_activities_v2, furama_cuisine) · `node scripts/check-*.mjs` (furama-house-app) · bash+curl (idea-hub) · không có (acc, dha) |
| Build | `npm run build` |
| Chạy bản production cục bộ | `npm run build && npm start` |
| Migration: tạo / chạy | theo biến thể — bảng dưới |

**Cổng tĩnh** (bước 1 của `/kiem-chung-thuc`): `npm run lint && npm run typecheck && npm test && npm run build`

## Luật nằm ở đâu

| | Supabase | Drizzle | Prisma | pg |
|---|---|---|---|---|
| N12 cửa ghi | `lib/db.ts` (service_role) | `src/server/*/service.ts` hoặc `src/modules/*/features/*.command.ts` | không tầng riêng: route gọi thẳng `src/lib/prisma.ts` | `lib/server/<module>/`; idea-hub `src/services` + `src/repositories` |
| N13 guard | `.update(v).eq("id",id).in("status",[…]).select().maybeSingle()` → `data` null | `.update(t).set(v).where(and(eq(t.id,id),inArray(t.status,[…]))).returning()` → `[]` | `updateMany({where:{id,status:{in:[…]}},data})` → `count===0` | `UPDATE … WHERE id=$1 AND status=ANY($2) RETURNING …` → `rowCount===0` |
| N31 tạo | tay: `supabase/migrations/NNNN_*.sql` | `npm run db:generate` (`db:gen`) → `drizzle/` | `npx prisma db push`, hoặc SQL tay `prisma/migrations/*.sql` + `npx prisma generate` | tay: `db/migrations/NNN_*.sql` |
| N31 chạy | `node scripts/run-migration.mjs <file>` | `npm run db:migrate`; furama_activities_v2 chỉ có `db:push` | như trên | `npm run db:migrate` (Neon: chuỗi unpooled); idea-hub `npm run db:init` (chỉ THÊM) |
| Đã chạy chưa | không có — ghi tay trong `CLAUDE.md` | bảng `__drizzle_migrations` | không có | bảng `_migrations` |
| Đọc lại DB | script qua `scripts/_sb.mjs` | `npm run db:studio` / `psql` | `npx prisma studio` | `npm run db:psql` |

| Nguyên tắc | Trong stack này |
|---|---|
| N08 luật thuần + N37 phép thử | `lib/*.ts` không I/O, `src/domain/`, `modules/*/domain/`. Vitest: test cạnh code hoặc `tests/unit/`. Không runner: `scripts/check-*.mjs` bằng `node:assert`. |
| N16 định danh từ phiên | Hàm server đọc cookie: `requireAdmin(req)`, `getCurrentUser()`, `requirePermission()`. Thư viện khác nhau: `jose` tự ký · Auth.js v5 · Better Auth. |
| N21 envelope lỗi | Class lỗi + MỘT hàm ánh xạ: `DbError` + `lib/adminError.ts` · `DomainError` + `platform/http/api-error.ts` · `AppError` + `fail()` (`lib/api.js`). Server Action trả `ActionResult`. Envelope mỗi dự án một dạng. |
| N25 ma trận quyền | `lib/adminPermissions.ts` (`API_RULES`) + `scripts/check-admin-permissions.mjs` · `src/server/authz/policy.ts` (`assertCan`) · `requirePermission` đầu mỗi action + guard test (furama_cuisine). acc, dha: không ma trận. |
| N34 purge cache | Data Cache của Next. Server Action: `updateTag(tag)` hoặc `revalidatePath`. Route handler: `revalidateTag(tag, { expire: 0 })`. CDN `s-maxage` không purge theo tag. acc, dha: không có. |

## Kiểm bằng thứ thật

- `npm run build && npm start`, `curl -i localhost:3000/api/<route>` kèm cookie phiên, rồi đọc lại hàng trong DB.
- Playwright: `npm run test:e2e` (3 dự án Vitest). Còn lại: trình duyệt thật.
- Test tích hợp cần Postgres thật: furama_cuisine đòi tên DB kết thúc `_test`; idea-hub `npm test` tự bật Docker.

## Cạm bẫy đã gặp

- **Next 16 khác bản đã học** → `params`, `searchParams`, `cookies()`, `headers()` là Promise; `middleware.ts` thành `proxy.ts` → đọc `node_modules/next/dist/docs/` trước khi viết. *(nguồn: acc, dha, giam-sat-du-an)*
- **`revalidateTag(tag, "max")`** → stale-while-revalidate, admin lưu xong vẫn thấy bản cũ → `{ expire: 0 }`; `updateTag` không chạy trong route handler. *(nguồn: furama-house-app)*
- **Sửa DB bằng tay** → app đọc cache cũ → tắt dev, xoá cả `.next`. *(nguồn: furama-house-app)*
- **Supabase: host DB trực tiếp chỉ IPv6** → `ENOTFOUND` → dùng chuỗi pooler. PostgREST chỉ DML → DDL đi `pg`. *(nguồn: furama-house-app)*
- **Drizzle + driver Neon HTTP** → không transaction nhiều câu, `withTransaction` là no-op → đừng dựa vào rollback. *(nguồn: furama_activities_v2)*
- **Prisma: đổi schema, quên `npx prisma generate` + xoá `.next` + restart** → 500 `undefined.findMany`. `migrate dev` cần shadow DB; `db push` vỡ khi có cột GENERATED tạo bằng SQL tay. *(nguồn: acc, dha)*
- **`cookies()` trong chuỗi import của route** → Turbopack treo → đọc cookie từ `request.headers`. *(nguồn: acc, dha)*
- **pg: pool dựng lúc import** → `next build` hỏng khi thiếu `DATABASE_URL` → tạo LƯỜI. `COUNT(*)` trả chuỗi. *(nguồn: idea-hub)*
- **Script test DROP schema** → mất DB thật nếu shell trỏ production → từ chối DB không phải localhost. *(nguồn: idea-hub)*

## Chưa biết — hỏi khi vào dự án

- Host: Vercel (gói nào — Hobby giới hạn cron, quota ảnh) hay pm2 (acc, dha).
- `vercel-build` có chạy migration trước build không (có: giam-sat-du-an, idea-hub).
- DB dev tách production chưa; Supabase có bật RLS không.
- Prisma: migration đã chạy ghi ở đâu; chưa dự án nào kiểm `count` sau `updateMany`.
- Còn `middleware.ts` (acc, furama_activities_v2) hay đã `proxy.ts`.
