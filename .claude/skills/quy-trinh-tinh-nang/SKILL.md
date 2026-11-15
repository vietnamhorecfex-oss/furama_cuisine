---
name: quy-trinh-tinh-nang
description: Vòng đời một tính năng có cổng kiểm soát — từ câu hỏi chính sách, spec, plan, làm, rà soát, kiểm chứng thật, triển khai đúng thứ tự tới ghi tri thức — và phân việc cho đúng subagent. Dùng khi người dùng nói "làm tính năng", "thêm chức năng", "build feature", "triển khai yêu cầu", "làm theo quy trình", hoặc giao một việc dài hơn một buổi.
---

# Quy trình tính năng

Đây là khuôn Furama dùng cho 21 tính năng có spec. Các lần sập ghi trong `NGUYEN-TAC.md` thường rơi đúng vào một
bước bị bỏ qua: vá một cửa mà không rà cửa cùng loại (N14, N17), ghi dữ liệu trước khi deploy file (N32), tin dòng
"Xong" mà không kiểm bằng thứ thật (N39–N40).

## Khi nào dùng

- Mọi việc dài hơn một buổi, hoặc đụng dữ liệu, quyền, tiền, thư gửi khách, hay trang công khai.
- Việc nhỏ hơn: xem mục "Rút gọn cho việc nhỏ" — được bỏ spec/plan, **không được bỏ bước 5 và 7**.
- Việc là sửa bug ⇒ `/sua-loi` (chỉ quay lại đây khi bản sửa đúng phải đổi schema/quyền/thiết kế). Production đang
  hỏng ⇒ `/xu-ly-su-co` trước.

## Các bước

0. **Hiểu + câu hỏi chính sách.** Việc chưa rõ loại/cỡ ⇒ `/tiep-nhan` trước; chưa rõ có đáng làm ⇒ `/danh-gia-y-tuong`;
   phải chọn công nghệ ⇒ `/nghien-cuu`. Đọc `CLAUDE.md` + mục liên quan của `docs/team/NGUYEN-TAC.md`. Liệt kê
   câu hỏi mà chỉ chủ dự án trả lời được (ai bị chặn, ai được vượt, huỷ thì nhả gì, có báo khách không) và hỏi
   MỘT lượt. *Xong khi:* mọi câu hỏi chính sách có câu trả lời ghi lại kèm người quyết (N57).

1. **Spec** — giao `kien-truc-su`, viết `docs/specs/YYYY-MM-DD-<ten>-design.md` từ
   `docs/team/templates/spec.template.md`: Yêu cầu (sự cố khởi nguồn + "Thành công khi" là kịch bản đầu-cuối) ·
   bảng Quyết định (vì sao + phương án đã loại) · Dữ liệu/migration + thứ tự chạy · Thành phần · Không làm ·
   Kiểm tra · Rollback · Cập nhật tri thức (N06, N36). Yêu cầu có mã `YC-xx`, tiêu chí đo được `TC-xx`, nhiều phần
   thì chia lát P1/P2 kiểm riêng được (N81); chỗ chưa rõ đánh `[CẦN LÀM RÕ]`, mặc định tự chọn ghi *Giả định* (N82).
   Bản nháp xong ⇒ chạy `/lam-ro-yeu-cau` (≤ 5 câu, một lượt, ghi ngược vào spec).
   *Xong khi:* **cổng duyệt** — 0 dấu `[CẦN LÀM RÕ · chính sách]`, chủ dự án đọc và đồng ý (cả các Giả định). Không
   duyệt thì không viết code.

1b. **Thiết kế** — khi tính năng có màn/luồng mới hoặc là trang công khai (bỏ qua nếu chỉ đổi dữ liệu/API):
   - `nha-thiet-ke` viết `docs/design/<YYYY-MM-DD>-<ten>-ux.md` từ `thiet-ke-ux.template.md`: luồng, phân cấp, ma trận
     trạng thái, câu cho MỌI `error.code` của spec, tiếp cận.
   - rồi `giam-doc-sang-tao` — bắt đầu từ ảnh mẫu/tham chiếu của chủ dự án (chưa có thì hỏi): dự án CHƯA có
     `docs/design/huong-thiet-ke.md` ⇒ mục A (giải mã tham chiếu, 2–3 hướng có bản mẫu chạy được) và **cổng — chủ dự án
     chọn hướng**; đã có ⇒ mục B: bảng chuyển động + micro-interaction + tối đa một khoảnh khắc chữ ký, trong hướng đã chốt.
   - Bản mẫu nào cũng qua **vòng tự nhìn** trước khi tới chủ dự án: chụp 1440px + 390px → nhìn ảnh, tự chấm theo thang 7
     tiêu chí (`docs/team/templates/nghe-thi-giac.md`) → `do-tuong-phan` → sửa → chụp lại; ≥ 2 vòng, ≥ 11/14 và qua mọi
     cổng cứng.
   *Xong khi:* chủ dự án xem bản mẫu CHẠY + ảnh chụp + điểm tự chấm và đồng ý. Câu hỏi chính sách phát sinh quay về bước 0.

2. **Plan** — `kien-truc-su` viết `docs/plans/YYYY-MM-DD-<ten>.md` từ `plan.template.md`. Bắt buộc có
   *Ràng buộc chung*, *Cổng đối chiếu luật bất biến* (ngoại lệ phải có chủ dự án duyệt) và *Trọng điểm review*: 3–6
   chỗ dễ sai nhất, mỗi chỗ ghim vào task nào sẽ kiểm nó. Task ghi `→ YC-xx` và `[P]` khi chạy song song được.
   *Xong khi:* mỗi task có file đụng tới + bước kiểm cụ thể (lệnh hoặc thao tác).

2b. **Soát chéo** — giao `kiem-dinh-vien` (người KHÔNG viết plan) chạy `/soat-cheo-tai-lieu`: spec ↔ thiết kế ↔ plan,
   phủ YC hai chiều, vi phạm luật bất biến/Nxx, dấu CẦN LÀM RÕ sót, thuật ngữ lệch, thứ tự task. Chỉ đọc; sửa ở tài
   liệu sở hữu rồi soát lại. *Xong khi:* kết luận ĐẠT (0 phát hiện Cao).

3. **Làm theo task.** Phân việc:
   - tầng dữ liệu, API, migration, luật thuần → `ky-su-nghiep-vu`
   - trang, form, component, a11y, dựng chuyển động theo bảng của bước 1b → `ky-su-giao-dien`
   - chữ UI, từ điển, bản dịch nội dung → `chuyen-gia-da-ngu`
   - metadata, JSON-LD, sitemap → `chuyen-gia-seo-geo`
   - bài viết, nội dung dài → `bien-tap-noi-dung`
   - bước gọi mô hình ngôn ngữ, RAG, đường ống dữ liệu → `ky-su-ai-du-lieu` theo `/tinh-nang-ai`
   - phép thử tự động cho YC chưa được phủ (API, đầu-cuối) → `ky-su-kiem-thu` theo `/viet-kiem-thu`
   - màn/luồng trong app di động, quyền OS, chạy nền, đóng gói APK → `ky-su-di-dong` (luật nghiệp vụ vẫn ở server
     qua `ky-su-nghiep-vu` — N69; backend live TRƯỚC khi phát APK mới, phát qua `/phat-hanh-apk`)
   Task độc lập (khác file, không phụ thuộc kết quả của nhau) chạy **song song**; task phụ thuộc (UI cần API) chạy
   nối tiếp. Mỗi cửa ghi mới đi qua `/cua-ghi-moi`; mỗi luật mới đi qua `/phep-thu-thuan`.
   *Xong khi:* mọi task đánh dấu xong và phép thử của task đó xanh.

4. **Rà soát** — chạy `/ra-soat-truoc-merge` trên diff nhánh. *Xong khi:* kết luận ĐẠT, hoặc mọi phát hiện mức
   cao đã sửa và rà lại.

5. **Kiểm chứng thật** — giao `kiem-dinh-vien` chạy `/kiem-chung-thuc`, kịch bản lấy đúng từ "Thành công khi"
   của spec, kịch bản Cho/Khi/Thì của từng lát và "Trọng điểm review" của plan, cộng **đối chiếu yêu cầu**: mỗi YC/TC
   Đạt / Thiếu / Một phần / Trái + mục Ngoài yêu cầu (N83). Khoảng trống ⇒ `kien-truc-su` thêm *Đợt bổ sung* vào cuối
   plan ⇒ quay lại bước 3 cho đúng các task đó ⇒ kiểm lại; Ngoài yêu cầu ⇒ chủ dự án chọn thêm YC hay gỡ code.
   *Xong khi:* báo cáo có "Đã kiểm chứng" phủ mọi trọng điểm (N40) và đối chiếu không còn khoảng trống.

6. **Triển khai** — giao `van-hanh-trien-khai` chạy `/migration-va-trien-khai`. Không push/deploy khi chủ dự án
   chưa cho phép (N59). *Xong khi:* ma trận kiểm sau deploy xanh và trạng thái migration đã ghi "ĐÃ CHẠY".

7. **Ghi tri thức** — giao `thu-ky-tri-thuc` chạy `/ghi-bai-hoc`: luật bất biến, cạm bẫy gặp trong lúc làm, số
   đo, lệnh kiểm, đánh đổi đã biết, còn nợ (N01, N58). Spec đổi *Trạng thái* thành "Đã triển khai DD/MM (commit)";
   tính năng này thay một phần spec cũ ⇒ ghi "Bị thay YC-xx bởi …" vào spec cũ — không viết lại spec cũ (N03).
   *Xong khi:* `CLAUDE.md` (hoặc `docs/tri-thuc/…`) có mục mới và câu cũ sai đã sửa.

## Tính năng quá lớn cho một spec

Hơn ~4 lát, hoặc nhiều nhóm làm song song nhiều tuần ⇒ trước tiên `kien-truc-su` viết **lộ trình**
`docs/specs/YYYY-MM-DD-<ten>-lo-trinh.md`: bảng `Mã (R1, R2…) · Mục tiêu · Ranh giới phạm vi · Phụ thuộc · Trạng
thái · Spec con`. Chủ dự án duyệt lộ trình; mỗi dòng R thành một spec con đi trọn quy trình này, spec con ghi dòng
"Thuộc lộ trình: `<file>` → R3". Mã R không bao giờ đổi số; bỏ thì ghi "(bỏ DD/MM — vì …)".

## Rút gọn cho việc nhỏ

Việc < 1 buổi, KHÔNG đổi schema, quyền, tiền, thư gửi khách:
- Bỏ bước 1–2 (cả 1b, 2b); thay bằng 3–5 dòng "định làm gì · đụng file nào · kiểm bằng gì" trong câu trả lời. Việc
  giao diện nhỏ dùng token + khuôn có sẵn, không tự đặt màu/thời lượng mới — cần cái mới ⇒ hỏi `giam-doc-sang-tao`.
- Bước 4 thu về một reviewer phù hợp nhất (hoặc tự soi theo bảng của `/ra-soat-truoc-merge`).
- Bước 5 và 7 **giữ nguyên**: lỗi nhỏ không được kiểm vẫn lên production, và bài học nhỏ không ghi vẫn bị
  phạm lại. Nếu không có bài học nào, ghi rõ "không có tri thức mới" trong báo cáo.

## Checklist

- [ ] Có người quyết cho mọi câu hỏi chính sách (N57).
- [ ] Spec có "Thành công khi", "Không làm", "Rollback" (N06, N36) — `grep -c "^## " docs/specs/<file>` ≥ 7.
- [ ] Màn/luồng mới có thiết kế UX (ma trận trạng thái + câu cho mọi `error.code`) và bảng chuyển động trong hướng
      đã chốt; bản mẫu đã qua vòng tự nhìn (ảnh chụp, điểm ≥ 11/14, `do-tuong-phan` đạt); chủ dự án đã xem bản mẫu chạy.
- [ ] Spec: YC/TC có mã; `grep -c "CẦN LÀM RÕ"` = 0 trước cổng duyệt; Giả định đã được chủ dự án đọc (N81, N82).
- [ ] Plan có "Trọng điểm review", mỗi điểm trỏ tới một task; Cổng đối chiếu luật bất biến điền xong.
- [ ] `/soat-cheo-tai-lieu` ĐẠT trước task đầu tiên.
- [ ] Đối chiếu yêu cầu ở bước 5 không còn khoảng trống; Ngoài yêu cầu đã có quyết định (N83).
- [ ] Mọi cửa ghi mới đã qua checklist `/cua-ghi-moi` (N12–N18).
- [ ] Mọi luật mới có `scripts/check-<chu-de>.mjs` hoặc test `node --test` (N37).
- [ ] Cổng tĩnh của hồ sơ stack xanh (Next.js: `npx tsc --noEmit && npm run lint && npm run build`).
- [ ] Báo cáo kiểm chứng tách "Đã kiểm chứng" / "Chưa kiểm" (kèm lý do) (N40).
- [ ] Migration ghi "PHẢI chạy trước deploy" trong spec và "ĐÃ CHẠY ngày…" trong tri thức (N31).
- [ ] Tri thức đã cập nhật; `CLAUDE.md` vẫn < 40KB (N05).

## Mẫu

Báo cáo trạng thái giữa chừng (một dòng mỗi lần đổi bước):

```
[3/7 Làm] Task 2/6 xong (luật thuần + phép thử 14 ca xanh). Đang: Task 3 db.ts — chốt chặn trong assert<Thu>Window.
```

Báo cáo kết thúc:

```markdown
## <Tên tính năng> — xong
- Spec: docs/specs/… · Thiết kế: docs/design/… · Plan: docs/plans/…
- Đối chiếu yêu cầu: YC 9/9 Đạt · TC 3/3 Đạt · Ngoài yêu cầu: không có (1 đợt bổ sung — YC-06)
- Đã kiểm chứng: <kịch bản 1 → kết quả>, <kịch bản 2 → kết quả>
- Chưa kiểm: <gì> — vì <lý do>
- Triển khai: migration <số> ĐÃ CHẠY <ngày> trên <DB>; deploy <commit>
- Tri thức: CLAUDE.md mục "<tên>" (+N dòng)
- Đánh đổi đã biết / Còn nợ: …
```

## Đầu ra

Spec + thiết kế + plan (việc lớn), code + phép thử, báo cáo rà soát, báo cáo kiểm chứng, ghi chú triển khai, mục tri thức.
