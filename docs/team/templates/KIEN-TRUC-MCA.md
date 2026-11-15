# Kiến trúc: MCA 2.0 — Modular Contract Architecture (Evolutionary)


> Bản gốc: `.claude/agents/architecture.md` của IConcierge. Chép vào project ở `docs/team/templates/KIEN-TRUC-MCA.md`;
> project chọn dùng thì chép tiếp sang `docs/kien-truc.md` và trỏ tới từ `CLAUDE.md`. Mục **9** ở cuối là phần
> rút từ lúc áp dụng thật — đọc nó trước khi tin mục 1–8 nguyên văn.
> Modular monolith lai thế hệ mới: **Module + Contract + Vertical Slice + CQRS-lite + Event-Driven**, sẵn sàng tách microservice khi cần.
>
> Mọi code sinh ra trong dự án này PHẢI tuân thủ tài liệu này. Khi có xung đột giữa "tiện" và "đúng luật", chọn đúng luật.

---

## 0. Triết lý

1. **Chia theo domain, tổ chức theo feature.** Module = bounded context. Bên trong module, code nhóm theo use case (vertical slice), không theo tầng béo.
2. **Ghi và đọc đi hai đường khác nhau.** Command đi qua domain + repository port. Query được đọc thẳng read model (CQRS-lite).
3. **Bất đồng bộ là mặc định giữa các module.** Sync call qua Contract chỉ khi thật sự cần kết quả ngay.
4. **Mọi I/O ra ngoài đều qua port.** DB, message broker, external API, email — không có exception.
5. **Monolith hôm nay, microservice ngày mai — không cần viết lại.** Mỗi module có schema DB riêng, contract riêng, event riêng. Tách = đổi transport, không đổi code nghiệp vụ.
6. **Kiến trúc phải máy-đọc-được.** Cấu trúc lặp lại tuyệt đối + manifest mỗi module + architecture test trong CI, để cả dev mới lẫn AI agent (Claude Code) sinh code đúng chuẩn ngay lần đầu.

---

## 1. Cấu trúc thư mục chuẩn

Mọi module PHẢI giống hệt nhau về cấu trúc:

```
src/
├── shared/                        # Shared kernel: types, errors, utils thuần
├── platform/                      # Hạ tầng dùng chung (không chứa nghiệp vụ):
│   ├── event-bus/                 #   in-process bus + outbox dispatcher
│   ├── persistence/               #   DB connection, unit-of-work, migration runner
│   ├── observability/             #   structured logging, tracing, metrics
│   ├── feature-flags/
│   └── di/                        #   wiring container
├── modules/
│   └── <module-name>/
│       ├── module.manifest.md     # ★ Mô tả module (xem mục 6)
│       ├── contract/              # ★ Phần DUY NHẤT module khác được import
│       │   ├── public-api.*       #   sync interface + DTO
│       │   └── events.*           #   domain events (versioned)
│       ├── features/              # Vertical slices — mỗi use case một thư mục
│       │   ├── create-order/
│       │   │   ├── create-order.endpoint.*   # route + DTO + validation
│       │   │   ├── create-order.command.*    # handler: logic + transaction
│       │   │   └── create-order.spec.*       # test sống cạnh code
│       │   └── get-order-history/
│       │       ├── get-order-history.endpoint.*
│       │       └── get-order-history.query.*  # đọc thẳng read model
│       ├── domain/                # Entity giàu hành vi, value object, invariant
│       ├── data/
│       │   ├── ports/             #   repository interface + external-service ports
│       │   └── adapters/          #   ORM impl, read models, API clients
│       └── jobs/                  # (tùy chọn) event handlers, scheduled jobs
└── app/                           # Bootstrap, compose modules, global middleware
```

---

## 2. Bảy luật bất biến

### Luật 1 — Slice độc lập
Feature KHÔNG import feature khác. Logic dùng chung giữa các feature trong cùng module → đưa xuống `domain/`. Dùng chung giữa các module → cân nhắc `shared/` (hiếm) hoặc qua Contract.

### Luật 2 — Hai đường Command / Query (CQRS-lite)
- **Command** (ghi): endpoint → command handler → domain → repository port. Transaction mở tại command handler. PHẢI đi qua domain entity, không thao tác ORM trực tiếp trong handler.
- **Query** (đọc): endpoint → query handler → đọc THẲNG read model/ORM, bỏ qua domain và repository port. Query KHÔNG được ghi dữ liệu, KHÔNG chứa business rule.
- Đây là cửa thoát hiểm được chính thức hóa: không còn service mỏng pass-through, query cứ đọc thẳng.

### Luật 3 — Cross-module: event trước, sync sau
- Mặc định: module B cần biết chuyện xảy ra ở module A → A publish domain event (định nghĩa trong `a/contract/events`), B subscribe trong `b/jobs/`.
- Chỉ gọi sync qua `a/contract/public-api` khi cần kết quả ngay trong cùng request (vd: kiểm tra tồn kho trước khi tạo đơn).
- ❌ Import bất kỳ thứ gì ngoài `contract/` của module khác — kể cả entity, kể cả "chỉ đọc".

### Luật 4 — Outbox bắt buộc cho event
Event được ghi vào bảng outbox **trong cùng transaction** với thay đổi dữ liệu; dispatcher của `platform/event-bus` đọc outbox và phát đi. Không bao giờ publish event "tay không" sau khi commit — mất event khi crash.

### Luật 5 — Ports & adapters cho mọi I/O
Repository, payment gateway, email, message broker, file storage — handler và domain chỉ biết interface trong `data/ports/`; implementation nằm ở `data/adapters/`. Đổi nhà cung cấp = viết adapter mới, không sửa nghiệp vụ.

### Luật 6 — Dữ liệu riêng từng module (schema-per-module)
- Mỗi module một schema/namespace riêng trong DB (`order.*`, `payment.*`).
- ❌ Query JOIN xuyên schema của module khác. Cần dữ liệu của module khác → gọi Contract, hoặc tự duy trì read model cập nhật qua event.
- Migration của module nào nằm trong module đó.

### Luật 7 — Shared/Platform một chiều
`shared/` và `platform/` KHÔNG BAO GIỜ import từ `modules/`. `platform/` không chứa business logic. Phân vân thì đặt trong module.

---

## 3. Cross-cutting concerns — chỗ đứng cố định

| Concern | Đặt ở |
|---|---|
| Auth, rate-limit | Middleware tầng `app/` |
| Logging, tracing, metrics | `platform/observability` — tự động bọc mọi command/query handler (trace id xuyên suốt, đo latency) |
| Feature flags | `platform/feature-flags` — deploy tách khỏi release; nhánh theo flag đặt tại endpoint hoặc command handler |
| Input validation | `*.endpoint.*` |
| Business rule / invariant | `domain/` (ưu tiên trong entity), phần điều phối ở command handler |
| Transaction | Command handler, qua unit-of-work của `platform/persistence` |
| Caching đọc | Query handler hoặc adapter của read model |
| Idempotency | Command handler (idempotency key) cho mọi command gọi từ ngoài hoặc từ event |

---

## 4. Bảo trì & nâng cấp

### Versioning contract (luật tương thích)
- Public API & event: chỉ thay đổi **cộng thêm** (thêm field optional). Đổi nghĩa/xóa field → tạo version mới (`OrderCreatedV2`), giữ V1 đến khi không còn consumer, đánh dấu `@deprecated` kèm ngày.
- Event PHẢI có `eventVersion` và `occurredAt` trong payload.

### Chống thoái hóa
- Command/query handler >150 dòng → tách logic xuống `domain/`.
- Module có >20 features → xem xét tách module (ranh giới domain có thể sai).
- Hai module gọi sync vòng nhau (A→B và B→A) → một chiều phải chuyển thành event.
- Read model lệch dữ liệu nguồn → viết job reconcile, không vá tay.

### Lộ trình tách microservice (khi và chỉ khi cần)
Điều kiện đủ để tách module X: cần scale độc lập, hoặc team riêng, hoặc deploy độc lập. Khi đó:
1. `x/contract/public-api` → HTTP/gRPC API (giữ nguyên signature)
2. `x/contract/events` → topic trên message broker (outbox đã sẵn)
3. Schema `x.*` → database riêng (đã tách sẵn từ Luật 6)
4. Code trong `modules/x/` chuyển nguyên khối sang repo/service mới
Không bước nào yêu cầu viết lại nghiệp vụ.

---

## 5. Điều khoản thi hành (CI) — fail = chặn merge

1. Cấm import cross-module trừ `modules/*/contract` (Luật 3)
2. Cấm feature import feature khác (Luật 1)
3. Cấm `shared/`, `platform/` import từ `modules/` (Luật 7)
4. Cấm `domain/` import từ `data/adapters/`, `features/`, framework HTTP/ORM (Luật 5)
5. Cấm file `*.query.*` import repository port hoặc gọi hàm ghi (Luật 2)
6. Lint SQL/migration: schema của module nào chỉ được sửa trong module đó (Luật 6)

Công cụ theo stack: `dependency-cruiser` / `eslint-plugin-boundaries` (TS/JS), ArchUnit (Java/Kotlin), `internal/` package (Go), NetArchTest (.NET), `import-linter` (Python).

---

## 6. module.manifest.md — bắt buộc mỗi module

Mẫu (giữ dưới 40 dòng, cập nhật cùng PR khi đổi contract):

```markdown
# Module: order
## Mục đích
Quản lý vòng đời đơn hàng từ tạo đến hoàn tất.
## Contract surface
- Public API: OrderPublicApi.getOrderSummary(orderId)
- Events phát ra: OrderCreatedV1, OrderCancelledV1
- Events tiêu thụ: PaymentConfirmedV1 (từ payment)
## Invariants quan trọng
- Đơn đã CONFIRMED không được sửa line items
## Phụ thuộc sync
- inventory.contract (kiểm tra tồn kho khi tạo đơn)
```

Manifest là nguồn sự thật cho dev mới và AI agent — đọc manifest trước khi sửa module.

---

## 7. Checklist thêm tính năng mới

1. Xác định module. Domain mới rõ rệt → tạo module mới đúng mục 1 + manifest.
2. Đọc `module.manifest.md` của module liên quan.
3. Phân loại: Command hay Query? → tạo thư mục slice mới trong `features/`.
4. Cần module khác? → event nếu không cần kết quả ngay; sync qua contract nếu cần. Contract thiếu → bổ sung contract (additive) trước.
5. Viết theo chiều: endpoint (validate) → handler → domain → port → adapter. Test đặt cạnh slice.
6. Có side effect cần tin cậy? → event qua outbox, handler idempotent.
7. Cập nhật manifest nếu contract surface thay đổi. Chạy architecture test.

## 8. Checklist review code

- [ ] Không vi phạm 6 rule CI (mục 5)
- [ ] Command đi qua domain; query không ghi, không chứa business rule
- [ ] Event mới có version + được ghi qua outbox
- [ ] Event handler idempotent
- [ ] Không JOIN xuyên schema module khác
- [ ] Handler ≤150 dòng; logic nghiệp vụ nằm ở domain
- [ ] Manifest cập nhật khớp với contract thực tế
---

## 9. Áp dụng thực tế — IConcierge (05–11/2026)

MCA 2.0 là kiến trúc ĐÍCH. IConcierge áp nó vào một codebase đã chạy production, ở ba nơi, mỗi nơi một mức:

| Nơi | Đã đạt | Chưa đạt (ghi thật trong manifest) | Máy kiểm bằng |
|---|---|---|---|
| Webapp React (`src/modules/<miền>/`) | module + manifest + contract + `features/<slice>` + ports/adapters + CQRS-lite + event in-process | outbox, schema-per-module (BE dùng chung schema `public`) | `npm run lint:arch` — dependency-cruiser, 19 luật |
| App nhân viên Flutter (`lib/features/<f>/`) | "MCA-lite": feature = module, `contract/` · `domain/` thuần Dart · `data/` · `jobs/` · `presentation/`, composition root duy nhất | event bus, outbox (không có backend riêng) | `test/architecture_test.dart` — luật R1–R6 |
| Backend Express (`api/`) | chia theo entity + gác bằng permission; luật gom vào module sâu (`requestScope`, `spaOpenRoom`…) | slice dọc, ports cho mọi I/O | quy ước + review (chưa có luật máy) |

### 9.1 Bảng dịch MCA → Flutter (bản "lite" đang chạy)

| MCA 2.0 | Flutter |
|---|---|
| `platform/` | `lib/core/` — network (dio + SSE client tự viết), session, storage, push, theme, i18n, version |
| `shared/` | `lib/features/shared/` — widget thuần trình bày, không state, không gọi API, KHÔNG import feature nào |
| `app/` (composition root) | `main.dart` + `app.dart` + `lib/config/` (router, shell, entry isolate nền) — nơi DUY NHẤT biết mọi feature |
| `domain/` | Dart thuần — cấm `flutter`, `riverpod`, `dio`, `go_router`, `shared_preferences`, `flutter_local_notifications` |
| `data/ports` + `adapters` | `data/` (api client + repository có cache/poll); không tách port khi chỉ có một adapter |
| `jobs/` | handler nghe contract của feature khác; được import `presentation/` của CHÍNH nó |
| Event in-process | `Stream` trong repository + Riverpod provider; SSE frame chỉ là tín hiệu refetch |

Sáu luật import (R1–R6): `core/` không import `features/` · `shared/` không import feature khác · cross-feature chỉ
qua `contract/` · `domain/` thuần · `data/` không import `presentation/` · `features/` + `core/` không import
`config/`. Khuôn phép kiểm: `docs/team/templates/architecture_test.template.dart`.

### 9.2 Bảng dịch MCA → web TypeScript

Khuôn luật: `docs/team/templates/dependency-cruiser.template.cjs`. Hai điều rút ra khi chạy thật:

- **Ngoại lệ ghi đích danh trong comment của luật** (N66). Ví dụ thật: slice `list-requests` là slice dựng màn bảng
  đơn nên được import 5 slice khác — luật liệt kê đúng 5 tên, không mở `features/*`.
- **Adapter cầu nối** (`data/adapters/*.react.ts`) là chỗ duy nhất module được chạm vào global cũ (`hooks/`,
  `contexts/`) trong lúc strangle. Module mới không cần cầu nối thì đừng tạo.

### 9.3 Năm điều không có trong lý thuyết

1. **Đừng dời thư mục để khớp trục** — chỉ đổi chỗ chất keo. Gỡ keo bằng module sâu trước, ranh giới tự thành hình
   (ADR "trục chia module", N67).
2. **Trục chia khác nhau theo tầng là bình thường**: frontend theo vai trò người dùng (mỗi vai một app), trong một
   vai theo bộ phận/nghiệp vụ, backend theo entity + permission. Chia backend theo vai trò = nhân bản logic N lần.
3. **Contract và slice mọc khi có người dùng** (N65) — 5/12 module Flutter có `contract/`; 5 slice chat dựng sẵn ở
   web đã phải xoá.
4. **Manifest là chỗ của bẫy vận hành**, không chỉ của danh sách export (N64).
5. **Strangler fig cần một mốc "baseline"**: số lỗi tsc, số test đỏ có sẵn, số vi phạm `lint:arch` ghi lại trước khi
   bắt đầu; mỗi commit di trú chứng minh "không tăng" chứ không đòi "về 0".
