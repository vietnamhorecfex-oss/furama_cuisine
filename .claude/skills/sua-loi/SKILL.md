---
name: sua-loi
description: Sửa một bug có kỷ luật — tái hiện bằng thứ thật trước, viết phép thử ĐỎ bắt đúng lỗi, tìm gốc thay vì vá triệu chứng, sửa ở cửa ghi thật, soát mọi cửa anh em cùng loại, kiểm lại bằng thứ thật, ghi bài học cạnh code. Dùng khi người dùng nói "bị lỗi", "bug", "sửa lỗi", "fix", "không chạy", "sai rồi", "lỗi 500", "bấm không ăn", "dữ liệu sai", "trước chạy được giờ hỏng", hoặc dán một stack trace / ảnh chụp lỗi.
---

# Sửa lỗi

Ở Furama, lỗi tốn kém nhất không phải lỗi đầu tiên mà là **lần thứ hai của cùng một lỗi**: vá luồng khách xong, luồng
lễ tân vẫn đẻ booking trùng thêm gần một tháng vì không ai soát cửa anh em (N14, N17). Bản vá không kèm phép thử và
không kèm lý do thì lượt dọn code sau gỡ nó đi, và lỗi cũ quay lại (N01). Quy trình này buộc mỗi lần sửa để lại ba
thứ: một phép thử từng đỏ, một danh sách cửa anh em đã soát, và một dòng "vì sao" ở đúng chỗ.

## Khi nào dùng

- Hành vi sai so với kỳ vọng đã biết: lỗi 4xx/5xx, dữ liệu sai, nút không phản hồi, sai ngôn ngữ, sai múi giờ.
- **Không dùng** khi production đang hỏng với người dùng thật ngay lúc này ⇒ `/xu-ly-su-co` trước (cầm máu), quay lại
  đây để sửa gốc.
- Sửa đúng phải đổi schema, quyền, hoặc thiết kế luồng ⇒ dừng sau bước 3, chuyển `/quy-trinh-tinh-nang` (cần spec).
- Thực ra là yêu cầu mới ("lỗi" vì chưa từng làm) ⇒ nói rõ với chủ dự án, chuyển `/quy-trinh-tinh-nang`.

## Các bước

1. **Tái hiện bằng thứ thật.** Ghi ra: đầu vào/thao tác → kết quả thực tế → kết quả kỳ vọng. Tái hiện bằng `curl`,
   trình duyệt (`docs/team/templates/kiem-trinh-duyet.template.mjs`), hoặc đọc DB — không phải bằng đọc code.
   Lỗi có trạng thái (chỉ khi đã đăng nhập, chỉ ở ngôn ngữ X, chỉ sau nửa đêm) thì ghi đủ điều kiện.
   *Xong khi:* có một kịch bản tái hiện chạy lại được, kèm output nguyên văn. Không tái hiện được ⇒ dừng, báo chủ dự án
   những gì đã thử và xin thêm dữ liệu (log, thời điểm, tài khoản) — KHÔNG sửa mò.

2. **Phép thử đỏ.** Viết phép thử bắt ĐÚNG lỗi này trước khi sửa: luật thuần ⇒ thêm ca vào `scripts/check-<chu-de>.mjs`
   hoặc test `node --test` (theo `/phep-thu-thuan`); lỗi ở API ⇒ một lệnh `curl` kỳ vọng mã + envelope; lỗi giao diện
   ⇒ một bước trong script Playwright. Chạy và **thấy nó đỏ vì đúng lý do** (N39).
   *Xong khi:* phép thử đỏ, thông báo lỗi khớp triệu chứng ở bước 1.

3. **Tìm gốc, không vá triệu chứng.** Hỏi "vì sao" tới khi chạm tầng có luật: dữ liệu vào sai hình dạng (N15)? luật
   nằm ở route/form thay vì cửa ghi thật (N12)? hai nguồn sự thật lệch nhau (N09, N10)? lỗi bị nuốt ở chốt chặn (N22)?
   phân loại lỗi theo chỗ bắt (N21)? `git log -S '<chuỗi>'` / `git bisect` khi "trước chạy được".
   *Xong khi:* viết được một câu "Gốc: <file:dòng> — <vì sao sai>" và giải thích được VÌ SAO phép thử cũ không bắt.

4. **Sửa ở đúng tầng.** Sửa tại cửa ghi thật / module thuần, không thêm guard thứ hai ở UI để che (N08, N12). Tham số
   chính sách bắt buộc nếu nhiều cửa dùng chung hàm (N14). Đi kèm: comment ngay cạnh chỗ sửa nói "vì sao" và "đừng gỡ
   vì …" nếu bản sửa trông thừa (N01, N02). Giao `ky-su-nghiep-vu` (dữ liệu/API) hoặc `ky-su-giao-dien` (UI).
   *Xong khi:* phép thử bước 2 xanh, mọi phép thử khác vẫn xanh.

5. **Soát cửa anh em.** Liệt kê mọi chỗ cùng loại với chỗ vừa hỏng — cửa ghi cùng bảng, form cùng kiểu submit, script
   cùng ghi cột đó, luồng khách ↔ luồng nhân viên ↔ app di động (N69):
   `grep -rn "<tên hàm|tên bảng|tên cột>" src app lib scripts`. Mỗi chỗ ghi: CÙNG LỖI (sửa luôn) / AN TOÀN (vì sao).
   *Xong khi:* bảng cửa anh em đầy đủ, không còn dòng "chưa xem".

6. **Dữ liệu đã hỏng.** Lỗi đã ghi dữ liệu sai vào DB (bản ghi trùng, trạng thái sai, cột rỗng)? ⇒ đếm bằng truy vấn
   chỉ-đọc, báo con số cho chủ dự án; sửa dữ liệu bằng `/script-du-lieu` (chạy khô trước) — chỉ khi được đồng ý (N33,
   N59). Có người dùng đã bị ảnh hưởng (thư sai, tiền sai)? ⇒ đây là câu hỏi chính sách, hỏi chủ dự án (N57).
   *Xong khi:* có con số "bao nhiêu bản ghi bị ảnh hưởng" (kể cả "0, đã kiểm bằng …") và quyết định xử lý.

7. **Kiểm chứng thật** — `/kiem-chung-thuc`: chạy lại đúng kịch bản bước 1 (giờ phải ra kết quả kỳ vọng) + một ca lân
   cận chưa hỏng (để chắc không làm vỡ cái khác) + cửa anh em đã sửa. Lỗi giao diện ⇒ trình duyệt thật.
   *Xong khi:* báo cáo tách Đã kiểm / Chưa kiểm (N40).

8. **Ghi bài học** — `/ghi-bai-hoc` dạng ngắn: cạm bẫy đã sập (MM/YYYY) vào mục chủ đề của `CLAUDE.md`, lệnh phép thử
   mới cạnh mục đó. Lỗi lộ ra một lớp lỗi dùng chung mọi dự án ⇒ đề xuất mục Nxx mới. Không có gì mới ⇒ ghi rõ
   "không có tri thức mới".

## Checklist

- [ ] Kịch bản tái hiện bằng thứ thật, có output nguyên văn — trước khi sửa.
- [ ] Phép thử từng ĐỎ vì đúng lý do, giờ xanh (N37, N39).
- [ ] Câu "Gốc: …" chỉ ra tầng có luật, không dừng ở triệu chứng (N12).
- [ ] Bảng cửa anh em: mọi dòng có kết luận CÙNG LỖI / AN TOÀN (N14, N17).
- [ ] Dữ liệu đã hỏng được đếm; sửa dữ liệu (nếu có) qua `/script-du-lieu` và có đồng ý (N33, N59).
- [ ] Comment "vì sao / đừng gỡ" cạnh bản sửa nếu nó trông thừa (N01).
- [ ] Mọi thay đổi ngoài gốc lỗi + cửa anh em đều có trong mục "Ngoài phạm vi sửa" kèm lý do — hoặc đã tách ra.
- [ ] Kịch bản tái hiện định chạy lại mà không chạy được ⇒ báo "sửa một phần", không báo "đã sửa" (N40, N83).
- [ ] Cổng tĩnh của hồ sơ stack xanh (Next.js: `npx tsc --noEmit && npm run lint && npm run build`); báo cáo tách Đã kiểm / Chưa kiểm (N40).
- [ ] Tri thức đã ghi hoặc ghi rõ "không có tri thức mới".

## Mẫu

```markdown
## Sửa lỗi: <mô tả một dòng>

**Tái hiện:** `curl -X POST $BASE/api/staff/orders -d '{"date":"2026-02-31"}'` → 201, DB có `scheduled_at` rác.
Kỳ vọng: 400 VALIDATION_ERROR.
**Phép thử đỏ:** `scripts/check-order-shape.mjs` ca "ngày có thật: từ chối 31/02" — ĐỎ trước sửa ✓, XANH sau sửa ✓
**Gốc:** `lib/db.ts:812` — `createStaffOrder` không gọi `assertOrderShape` (N15). Phép thử cũ chỉ phủ cửa khách.
**Sửa:** đưa assert vào `insertOrder` dùng chung cho mọi cửa; comment "mọi cửa ghi đơn đi qua đây — N15".

**Cửa anh em:**
| Chỗ | Kết luận |
|---|---|
| `createPublicOrder` | AN TOÀN — đã assert |
| `importOrdersCsv` (script) | CÙNG LỖI — đã sửa, thêm ca vào phép thử |
| app di động `OrderRepository.create` | AN TOÀN — gọi cùng API, luật ở server (N69) |

**Dữ liệu hỏng:** 3 đơn `scheduled_at` không hợp lệ (truy vấn chỉ-đọc 03/11). Chờ chủ dự án quyết: xoá hay sửa tay.
**Ngoài phạm vi sửa:** không có. <Có sửa thêm thứ không thuộc gốc lỗi (dọn code, đổi tên…) ⇒ liệt kê từng thứ + vì sao;
không có lý do thì tách sang việc khác — bản sửa lỗi càng hẹp càng dễ review và dễ lùi.>
**Đã kiểm:** kịch bản trên → 400 ✓ · đơn ngày hợp lệ → 201 ✓ · CSV có dòng 31/02 → dòng đó bị từ chối ✓
**Chưa kiểm:** không có.
**Tri thức:** CLAUDE.md mục "Đơn hàng" + 2 dòng (cạm bẫy 11/2026 + lệnh phép thử).
```

## Đầu ra

Bản sửa + phép thử từng đỏ + bảng cửa anh em + số bản ghi bị ảnh hưởng + báo cáo kiểm chứng + dòng tri thức.
