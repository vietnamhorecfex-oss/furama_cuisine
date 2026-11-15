---
name: migration-va-trien-khai
description: Viết migration an toàn và đưa thay đổi lên production đúng thứ tự — migration trên mọi DB, deploy code, script dữ liệu trỏ tới file mới, purge cache — kèm checklist trước deploy, kế hoạch rollback và ma trận kiểm sau deploy. Dùng khi người dùng nói "migration", "đổi schema", "thêm cột/bảng", "deploy", "lên production", "release", "rollback", "cron".
---

# Migration và triển khai

Ở Furama, lỗi triển khai đắt nhất không nằm trong code mà trong THỨ TỰ: ghi dữ liệu trỏ tới file chưa deploy (54/153
ảnh 404, hai lần một ngày — N32), deploy code ghi cột chưa có (cả form CMS bị từ chối — N31), rollback trả code cũ
mà quên khoá tài khoản mới (nhân viên thành toàn quyền — N36). Skill này là thứ tự cố định để không đoán.

## Khi nào dùng

Mọi thay đổi schema, mọi lần đưa code lên production, mọi script ghi dữ liệu production, mọi cron mới.

## Các bước

1. **Viết migration** — giao `ky-su-nghiep-vu`, `van-hanh-trien-khai` soát.
   - File `supabase/migrations/NNNN_<ten>.sql` (hoặc thư mục migration của stack), số tăng dần, không sửa file đã
     chạy — sai thì viết migration mới.
   - **Additive**: `create table if not exists`, `add column if not exists`, `create index if not exists`; cột mới
     nullable hoặc có default. Xoá/đổi tên cột là việc của một migration RIÊNG, sau khi code cũ đã ngừng dùng.
   - Ràng buộc nằm ở DB khi được: `check`, UNIQUE một phần (`where … is not null`), FK có `on delete` rõ ràng.
   - Bật RLS cho bảng mới nếu dùng Supabase (`enable row level security`), dữ liệu cá nhân thì `force`.
   - Không backfill bằng phỏng đoán: số đoán ngược ghi vào cột dùng để đối chiếu là số sai (để NULL + nhãn
     "không ghi nhận" còn hơn).
   *Xong khi:* chạy được hai lần liên tiếp không lỗi (idempotent).
2. **Ghi thứ tự vào spec** (mục Dữ liệu): "PHẢI chạy TRƯỚC deploy vì code mới ghi cột X" hoặc "chạy SAU vì …".
3. **Chuẩn bị rollback** từng câu lệnh (xem Mẫu). Câu hỏi bắt buộc: *nếu trả code cũ ngay bây giờ, dữ liệu mới
   sinh ra có làm code cũ hiểu sai không?* Có ⇒ bước rollback phải vô hiệu dữ liệu đó TRƯỚC (N36).
4. **Chạy migration trên MỌI DB** (dev, staging, production, DB phụ nếu có) bằng một script dùng chung, sau đó reload
   schema cache nếu dùng PostgREST: `notify pgrst, 'reload schema';`. *Xong khi:* đọc lại `information_schema` thấy
   cột/bảng mới ở từng DB.
5. **Deploy code** — chỉ khi chủ dự án cho phép push/deploy (N59). Biến môi trường mới khai TRƯỚC (bí mật đánh dấu
   Sensitive/Secret); thiếu env bắt buộc thì code phải NÉM rõ ràng lúc khởi động, không chạy với giá trị rỗng.
6. **Script dữ liệu trỏ tới thứ vừa deploy** (URL file mới, slug mới) chạy SAU khi deploy đã live — kiểm bằng
   `curl -I <url-file-mới>` trả 200 trước (N32). Dùng `/script-du-lieu`.
7. **Purge cache** của mọi bảng/trang bị đổi (N34). Không có đường purge ngoài app thì gọi một mutation no-op qua
   API admin, hoặc ghi rõ "app còn đọc bản cũ tới <TTL>".
8. **Kiểm sau deploy** — giao `kiem-dinh-vien` chạy ma trận (Mẫu) trên production. *Xong khi:* mọi dòng xanh.
9. **Ghi trạng thái** vào tri thức: "migration NNNN ĐÃ CHẠY DD/MM/YYYY trên <DB chính, DB phụ>" (N31).

## Cron

- Lịch cron của hầu hết nền tảng chạy theo **UTC**: 00:05 giờ VN = `5 17 * * *` (N53).
- Route cron gác `Authorization: Bearer $CRON_SECRET`; **thiếu biến env thì TỪ CHỐI**, không cho qua.
- Thao tác cron idempotent bằng điều kiện trong chính câu UPDATE (`.eq("status","scheduled")`).
- Cron là lớp ĐÚNG GIỜ, không phải cổng chặn duy nhất: cổng đọc vẫn phải tự lọc theo thời gian, để cron chết thì
  nội dung trễ chứ không bao giờ hỏng.

## Checklist trước deploy

- [ ] Migration additive, idempotent, đã chạy trên mọi DB; schema cache đã reload (N31).
- [ ] Spec ghi thứ tự chạy; rollback viết sẵn từng câu lệnh (N36).
- [ ] Env mới đã khai ở mọi môi trường; bí mật đánh dấu Sensitive (N30).
- [ ] `npx tsc --noEmit && npm run lint && npm run build` xanh trên đúng commit sẽ deploy.
- [ ] Mọi phép thử `scripts/check-*.mjs` / `npm test` xanh.
- [ ] Không còn script nào sẽ ghi dữ liệu trỏ tới file CHƯA deploy (N32).
- [ ] Chủ dự án đã cho phép push/deploy (N59).

## Mẫu

Khối "Dữ liệu" trong spec:

```markdown
## 3. Dữ liệu — migration `0012_<ten>.sql` (additive, chạy TRƯỚC deploy)
Vì sao trước: form admin gửi cột `x` mỗi lần lưu; thiếu cột thì PostgREST từ chối cả lần lưu.
Chạy trên: DB chính, DB phụ — `node scripts/run-migration.mjs supabase/migrations/0012_<ten>.sql`.
Rollback:
1. `update accounts set is_active = false where permissions is not null;`  ← vô hiệu dữ liệu mới TRƯỚC
2. Redeploy commit <hash cũ>.
3. (Không xoá cột — code cũ bỏ qua cột thừa.)
```

Ma trận kiểm sau deploy (điều chỉnh theo project):

```bash
BASE=https://example.com
for p in / /menus /en/menus /vi/menus /robots.txt /sitemap.xml /api/health /khong-ton-tai; do
  printf '%-18s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")"
done
# Kỳ vọng ghi trong CLAUDE.md, vd: / 200 · /menus 200 · /vi/menus 308 · /khong-ton-tai 404
```

## Đầu ra

Migration + ghi chú thứ tự trong spec + kế hoạch rollback + bảng ma trận sau deploy (kỳ vọng vs thực tế) + dòng
"ĐÃ CHẠY" trong tri thức.
