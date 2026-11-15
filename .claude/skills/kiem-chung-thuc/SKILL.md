---
name: kiem-chung-thuc
description: Giao thức chứng minh một thay đổi đã "xong" bằng thứ thật — cổng build/lint/phép thử, gọi API thật, mở trình duyệt thật, đọc lại DB, ma trận kiểm hạ tầng, kiểm theo đặc tính — rồi báo cáo tách Đã kiểm / Chưa kiểm. Dùng khi người dùng nói "kiểm tra lại", "verify", "test thử", "chắc chưa", "xong chưa", "chạy thử", hoặc trước khi tuyên bố hoàn thành bất kỳ việc gì.
---

# Kiểm chứng thật

Build xanh không chứng minh hành vi. Ở Furama, lỗi 404 toàn bộ ảnh local, prefetch khi hover không hoạt động, 28 ảnh
sai tỉ lệ — tất cả đều có build xanh và phép kiểm xanh. Chúng bị bắt bằng `curl`, trình duyệt, và đo đặc tính
(N38, N40).

## Khi nào dùng

Trước MỌI câu "đã xong / đã sửa / đã chạy". Bắt buộc ở bước 5 của `/quy-trinh-tinh-nang`. Giao `kiem-dinh-vien`
khi việc lớn; việc nhỏ thì tự làm nhưng vẫn đủ các bước áp dụng được.

## Các bước

1. **Cổng tĩnh** (chạy song song được) — dùng dòng **Cổng tĩnh** của hồ sơ stack (`docs/team/stacks/*.md`) hoặc mục
   Lệnh của `CLAUDE.md`; dưới đây là bản Next.js:
   ```bash
   npx tsc --noEmit
   npm run lint
   for f in scripts/check-*.mjs; do node --no-warnings "$f" || echo "HỎNG: $f"; done
   npm test --if-present
   npm run build
   ```
   *Xong khi:* tất cả thoát 0. Một cái đỏ thì dừng, sửa, chạy lại — không "chắc là không liên quan".
2. **Kịch bản hành vi** — lấy từ "Thành công khi" của spec và "Trọng điểm review" của plan; việc không có spec thì
   tự viết 3–5 kịch bản "làm X → thấy Y" trước khi kiểm.
3. **API thật** (dev server hoặc production build `npm start`): mỗi kịch bản một `curl`, kiểm **mã trạng thái +
   envelope + nội dung**, gồm cả ca phải bị TỪ CHỐI (thiếu quyền 403, ngoài phạm vi 404, dữ liệu sai 400, gửi lại
   cùng idempotency key ⇒ cùng bản ghi). *Xong khi:* bảng kịch bản có cột "kỳ vọng" và "thực tế" khớp.
4. **Trình duyệt thật** cho mọi thứ khách nhìn/bấm: hiển thị, hydration (console không lỗi), focus/bàn phím, khổ
   390px và 1440px, ngôn ngữ khác mặc định, F5 giữa chừng, phiên hết hạn giữa chừng. Hành vi framework (prefetch,
   cache, chuyển trang) chỉ tin trình duyệt + tab Network, không tin trí nhớ (N40).
   Công cụ: chép `docs/team/templates/kiem-trinh-duyet.template.mjs` → `scripts/kiem-trinh-duyet.mjs` (Playwright —
   console, request 4xx/5xx, tràn ngang, focus, nội dung khi tắt JS, ảnh chụp hai khổ, cộng kịch bản riêng của tính
   năng). Có trình duyệt điều khiển được (Claude in Chrome, trình duyệt trong app) thì dùng thêm cho thao tác tay.
   Không có cách nào mở trình duyệt ⇒ ghi phần UI vào "Chưa kiểm", KHÔNG suy ra từ đọc code.
5. **Đọc lại DB** sau mỗi ghi: dòng mới đúng cột, trạng thái đúng, không có dòng thừa (đếm trước/sau).
6. **Ma trận hạ tầng** nếu đụng định tuyến, middleware, cache, ảnh, i18n: chạy lại ma trận ghi trong `CLAUDE.md`
   (N41).
7. **Kiểm theo đặc tính** khi có biến đổi hàng loạt: tỉ lệ ảnh, kích thước, alpha, số dòng mỗi ngôn ngữ, khứ hồi
   parse/format trên toàn bộ dữ liệu thật — không chỉ "giống bản cũ" (N38). Phép kiểm báo 0 lỗi ngay lượt đầu ⇒ cố
   ý gài một lỗi để chắc nó bắt được (N39).
8. **Đối chiếu yêu cầu** (có spec): mỗi YC/TC một dòng Đạt / Thiếu / Một phần / Trái, cộng mục Ngoài yêu cầu
   (N83). Dấu `[x]` và lời "đã xong" không phải bằng chứng. Khoảng trống ⇒ *Đợt bổ sung* ở cuối plan, làm, đối chiếu
   lại — tới khi không còn khoảng trống.
9. **Dọn dữ liệu thử** ngay sau khi kiểm, rồi xác nhận đã dọn (đếm lại).
10. **Báo cáo** theo Mẫu. Không có mục "Chưa kiểm" thì viết rõ "Không có". Kịch bản đã định mà không chạy được ⇒
    không được kết luận "xong", chỉ "xong một phần" + lý do.

## Lá chắn khi DB/dịch vụ dùng chung production

- Dùng ngày xa (+40 ngày) cho dữ liệu thử, tên/mã có tiền tố `test-`.
- Thư thử gửi tới địa chỉ `+tag` của chủ dự án; tạm gỡ danh sách CC/BCC tới nhân viên thật trước khi gửi (N59).
- Không gửi thư/SMS thật cho khách thật, không tạo đơn có tiền thật.
- Hỏi trước khi chạy bất cứ thứ gì không dọn được (thư đã gửi, file đã xoá).

## Checklist

- [ ] Cổng tĩnh xanh trên đúng mã sẽ merge.
- [ ] Mỗi kịch bản "Thành công khi" + mỗi "Trọng điểm review" có một dòng kiểm.
- [ ] Có ít nhất một ca TỪ CHỐI cho mỗi cửa ghi mới (N21, N25).
- [ ] UI đã mở ở trình duyệt thật, console sạch, hai khổ màn hình (`scripts/kiem-trinh-duyet.mjs` hoặc tương đương).
- [ ] DB đã đọc lại; dữ liệu thử đã dọn và đếm lại.
- [ ] Đã gài lỗi thử cho phép kiểm mới (N39).
- [ ] Có spec ⇒ mọi YC/TC có dòng đối chiếu; Ngoài yêu cầu đã liệt kê (N83).
- [ ] Báo cáo tách "Đã kiểm chứng" / "Chưa kiểm" (mỗi dòng kèm lý do) / "Rủi ro còn lại" (N40).

## Mẫu

```bash
# Ca từ chối + ca khử trùng — sửa BASE/đường dẫn/cookie theo project
BASE=http://localhost:3000
curl -s -X POST "$BASE/api/orders" -H 'content-type: application/json' \
  -d '{"date":"2026-02-31","guests":2}' -w '\n%{http_code}\n'          # kỳ vọng 400 VALIDATION_ERROR
KEY=test-$(date +%s)
for i in 1 2; do
  curl -s -X POST "$BASE/api/orders" -H 'content-type: application/json' \
    -d "{\"date\":\"2026-12-05\",\"guests\":2,\"idempotency_key\":\"$KEY\"}" | jq -r '.order.code'
done                                                                    # kỳ vọng: hai lần CÙNG một mã
```

```markdown
## Kiểm chứng — <tên thay đổi>
**Cổng:** tsc ✓ · lint ✓ · check-coupons (14 ca) ✓ · build ✓
**Đã kiểm chứng:**
| Kịch bản | Kỳ vọng | Thực tế |
|---|---|---|
| POST ngày 31/02 | 400 VALIDATION_ERROR | 400 VALIDATION_ERROR ✓ |
| Gửi lại cùng khoá | cùng mã đơn | cùng `OD-7K2M` ✓ |
| /dat-ban 390px, chọn ngày kín | băng báo + nút khoá | ✓ (ảnh chụp) |
**Đối chiếu yêu cầu:** YC-01 Đạt · YC-02 Đạt · YC-03 Đạt · TC-01 Đạt (2 thao tác) · Ngoài yêu cầu: không có.
**Chưa kiểm:** gửi thư thật — vì SMTP production chưa cấu hình.
**Rủi ro còn lại:** trang tĩnh còn bản cũ tới 1 giờ sau deploy; server vẫn chặn.
**Dữ liệu thử:** đã xoá 2 đơn `test-…`, đếm lại 0.
```

## Đầu ra

Báo cáo kiểm chứng theo mẫu, kèm lệnh đã chạy (để người khác chạy lại được).
