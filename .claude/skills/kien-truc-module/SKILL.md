---
name: kien-truc-module
description: Dựng hoặc sửa module theo kiến trúc MCA 2.0 (Module + Contract + Vertical Slice + CQRS-lite + Event) — chọn module, viết manifest, đặt slice, mở contract khi có người dùng, gắn phép kiểm ranh giới bằng máy (dependency-cruiser cho web, architecture_test cho Flutter), ghi ADR khi quyết định khó đảo ngược, và di trú code cũ theo strangler fig. Dùng khi người dùng nói "tạo module", "thêm module", "kiến trúc", "MCA", "ranh giới module", "lint:arch", "architecture test", "refactor kiến trúc", "tách module", "ADR", hoặc khi một tính năng mới không rõ thuộc module nào.
---

# Kiến trúc module

Kiến trúc đích: `docs/team/templates/KIEN-TRUC-MCA.md` (mục 1–8 là luật; mục 9 là phần IConcierge học được khi áp
vào code đang chạy). Skill này là thứ tự làm để luật đó có thật trong repo, không chỉ trong tài liệu: ở IConcierge,
cùng một bộ luật đo trên hai module — module được máy canh có 6 import chéo slice, đúng 6 ngoại lệ đã ghi tên;
module không được canh có 22 (N63).

## Khi nào dùng

- Project mới: dựng khung `src/{app,platform,shared,modules}` (hoặc `lib/{core,config,features}` cho Flutter) + phép
  kiểm ngay từ commit đầu (L9).
- Thêm module / slice mới, mở contract, thêm event giữa module.
- Code cũ cần đưa dần vào module (strangler fig).
- Một quyết định kiến trúc cần ghi lại (ADR).

## Các bước

1. **Gọi đúng tên** — giao `kien-truc-su`. Đọc `CONTEXT.md` (tạo từ `docs/team/templates/CONTEXT.template.md` nếu
   chưa có) và `docs/adr/`. Module = một khái niệm nghiệp vụ trong từ điển; trục chia theo ADR đã chốt (vd frontend
   theo vai trò, backend theo entity + permission). Chưa có ADR về trục chia ⇒ đề xuất một (`adr.template.md`) và hỏi
   chủ dự án trước khi dựng thư mục (N68).
   *Xong khi:* biết module nào, slice nào, và vì sao không phải module khác.
2. **Manifest trước code** — `module.manifest.md` từ `docs/team/templates/module.manifest.template.md`: Mục đích ·
   Contract surface · Invariants (kèm hậu quả) · Phụ thuộc · Chưa đạt (N64, N67). Module có sẵn ⇒ ĐỌC manifest trước.
3. **Phân loại slice** — ghi (command: endpoint → handler → domain → port → adapter, transaction ở handler) hay đọc
   (query đọc thẳng read model, không ghi, không luật). Một use case một thư mục trong `features/`; slice không import
   slice khác — dùng chung thì đưa xuống `domain/` (Luật 1–2).
4. **Contract chỉ khi có người dùng** — module khác cần gọi ngay ⇒ thêm vào `contract/public-api`; chỉ cần biết chuyện
   đã xảy ra ⇒ event versioned (`XCreatedV1`, có `eventVersion` + `occurredAt`) trong `contract/events`, bên nhận
   subscribe ở `jobs/`, handler idempotent. Chưa ai cần ⇒ không tạo (N65). Event cần bền mà chưa có outbox ⇒ ghi vào
   manifest mục "Chưa đạt", đừng giả vờ.
5. **Gắn phép kiểm bằng máy** (N63) — một lần mỗi project, giao `ky-su-nghiep-vu` (web) / `ky-su-di-dong` (Flutter):
   - Web TS: chép `docs/team/templates/dependency-cruiser.template.cjs` → `.dependency-cruiser.cjs`, thêm
     `"lint:arch": "depcruise --config .dependency-cruiser.cjs src"`, chạy trong CI.
   - Flutter: chép `docs/team/templates/architecture_test.template.dart` → `test/architecture_test.dart`, đổi `_pkg`.
   - Ngoại lệ: thêm `pathNot` liệt kê TỪNG tên + vì sao trong `comment` của luật — không tắt luật (N66).
   *Xong khi:* phép kiểm chạy, in danh sách vi phạm kèm đường dẫn; số vi phạm hiện có được ghi làm baseline.
6. **Di trú code cũ (nếu có)** — strangler fig, không dời thư mục để khớp trục (N67):
   - Ghi baseline trước khi bắt đầu: số lỗi type-check, số test đỏ có sẵn, số vi phạm `lint:arch`.
   - Chọn MỘT khái niệm đang rải rác (một luật nằm ở nhiều file) ⇒ gom thành module sâu, chuyển chỗ gọi sang dần, so
     hành vi đọc và ghi sau khi gom (đây là lúc lỗ hổng "đọc chặn mà ghi không chặn" lộ ra).
   - Code cũ cần chạm global (hook, context) chỉ qua adapter cầu nối trong `data/adapters/`.
   - Xoá bản cũ khi hết người gọi (`grep` ra 0 chỗ) + build lại.
   *Xong khi:* mỗi commit chứng minh baseline không tăng.
7. **ADR khi quyết định** khó đảo ngược + gây ngạc nhiên + có đánh đổi thật ⇒ `docs/adr/NNNN-<ten>.md` từ
   `adr.template.md`; thuật ngữ mới được chốt ⇒ sửa `CONTEXT.md` trong cùng lượt (N68).
8. **Ghi lại** — `thu-ky-tri-thuc`: `CLAUDE.md` trỏ tới tài liệu kiến trúc, lệnh `lint:arch`, baseline.

## Checklist

- [ ] Module ứng với một thuật ngữ trong `CONTEXT.md`; trục chia khớp ADR (N68).
- [ ] Có `module.manifest.md` 4 mục + "Chưa đạt"; invariant ghi kèm hậu quả (N64, N67).
- [ ] Slice không import slice khác; query không ghi, không import repository port (Luật 1, 2).
- [ ] Cross-module chỉ qua `contract/`; contract chỉ tồn tại khi có người dùng (N65).
- [ ] Event có version + `occurredAt`; handler idempotent; outbox có hoặc ghi rõ là chưa có.
- [ ] `domain/` không import framework/adapter/slice (Luật 5).
- [ ] Phép kiểm ranh giới chạy trong CI, in đường dẫn vi phạm; ngoại lệ ghi đích danh (N63, N66).
- [ ] Di trú: baseline ghi trước, không tăng sau mỗi commit; bản cũ đã xoá khi hết người gọi (N67).

## Mẫu

Dòng trong `CLAUDE.md`:

```markdown
## Kiến trúc
MCA 2.0 — `docs/kien-truc.md` (chép từ docs/team/templates/KIEN-TRUC-MCA.md). Thuật ngữ: `CONTEXT.md`. Quyết định:
`docs/adr/`. Máy kiểm: `npm run lint:arch` (baseline 0 vi phạm, DD/MM/YYYY). Đọc `module.manifest.md` trước khi sửa
một module.
```

## Đầu ra

Module/slice mới đúng chỗ + manifest + (nếu cần) contract/event + phép kiểm ranh giới xanh hoặc baseline đã ghi +
ADR/CONTEXT cập nhật + báo cáo "Đã kiểm / Chưa kiểm" (N40).
