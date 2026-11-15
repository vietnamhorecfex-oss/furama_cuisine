---
name: cua-ghi-moi
description: Checklist bắt buộc khi thêm hoặc sửa MỌI cửa ghi dữ liệu — API POST/PATCH/DELETE, form submit, server action, webhook, cron có ghi — gồm quyền, định danh từ phiên, kiểm hình dạng, chống gửi trùng ba lớp, giữ tài nguyên nguyên tử, lỗi chuẩn. Dùng khi người dùng nói "thêm API", "thêm endpoint", "form gửi", "lưu dữ liệu", "webhook", "cửa đặt/nộp/đăng ký mới".
---

# Cửa ghi mới

Một cửa ghi là chỗ dữ liệu sai đi vào DB vĩnh viễn. Ở Furama, nhiều sự cố dữ liệu bắt nguồn từ một cửa ghi
thiếu một lớp — và nhiều lần là vì **chỉ vá một cửa** trong khi cửa anh em cùng loại vẫn hở (N14, N17).

## Khi nào dùng

Trước khi viết code cho bất kỳ đường nào ghi DB, gửi thư, giữ tài nguyên (voucher, lượt, tiền), hoặc đổi trạng thái.

## Các bước

1. **Liệt kê các cửa CÙNG LOẠI đã có.** Cùng tạo/sửa một thực thể thì phải chịu cùng luật.
   `grep -rn "from(\"<bang>\")\.\(insert\|update\|upsert\|delete\)" lib app` + đọc mục tương ứng trong
   `CLAUDE.md`. *Xong khi:* có danh sách cửa (khách / nhân viên / admin / cron / script) và chính sách từng cửa.
2. **Đặt luật ở hàm tầng dữ liệu dùng chung** cho mọi cửa trong danh sách (N12). Chính sách khác nhau giữa các cửa
   ⇒ tham số BẮT BUỘC kiểu union, không mặc định (N14). *Xong khi:* bỏ tham số ở một cửa là lỗi `tsc`.
3. **Đi qua checklist dưới**, từng dòng, ghi "đã áp / không áp vì …" vào PR hoặc báo cáo.
4. **Viết phép thử** cho luật thuần (`/phep-thu-thuan`) và kịch bản curl cho route (`/kiem-chung-thuc`).
5. **Thêm route vào ma trận quyền** và chạy script kiểm route-thiếu-luật (N25).

Giao việc: `ky-su-nghiep-vu` làm bước 1–2–5; `ky-su-giao-dien` làm phần client (lớp 1–2 chống trùng, giữ dữ liệu
khi lỗi); `kiem-toan-vien` (bảo mật) soát lại trước merge nếu cửa công khai hoặc đụng tiền.

## Checklist

**Ai được ghi**
- [ ] Xác thực trước mọi thứ; chưa đăng nhập 401, thiếu quyền 403, bản ghi ngoài phạm vi 404 (N21, N25, N26).
- [ ] Định danh (`user_id`, `created_by`, mã giới thiệu, chủ tài khoản) lấy từ PHIÊN, không đọc từ body (N16).
- [ ] Route có dòng trong ma trận quyền; script kiểm quyền xanh (N25).

**Dữ liệu vào**
- [ ] Gọi `assert<Thu>Shape(input)` ở tầng dữ liệu: ngày giờ CÓ THẬT, số trong biên, email/SĐT đúng dạng (N15).
- [ ] Body chỉ là nguyện vọng; server kẹp lại theo sự thật (số dư, giới hạn, giá) (N16).
- [ ] Whitelist field được ghi — client gửi cột lạ (vd `used_count`) không vào được DB.

**Chống trùng ba lớp (N17)**
- [ ] Lớp 1: `submittingRef` đồng bộ ở client.
- [ ] Lớp 2: `idempotency_key` sinh MỘT lần mỗi lần gửi, giữ qua các lần thử lại, xoá sau khi thành công.
- [ ] Lớp 3: server tra khoá trước; UNIQUE một phần trong DB; đụng `23505` → trả bản ghi của kẻ thắng, KHÔNG chạy
      side effect lần hai, và NHẢ mọi thứ kẻ thua đã giữ.

**Trạng thái & tài nguyên**
- [ ] Đổi trạng thái bằng động từ; guard trạng thái nguồn nằm trong chính câu UPDATE (N13).
- [ ] Giữ tài nguyên giới hạn bằng UPDATE có điều kiện/RPC; danh sách MỌI đường nhả viết ra; hàm nhả không ném,
      idempotent (N18).

**Đầu ra**
- [ ] Envelope `{ error: { code, message } }`, mã trạng thái đúng nguồn lỗi, `message` theo ngôn ngữ người dùng;
      lỗi nhiều lý do có `reason` máy đọc (N21).
- [ ] Trả bản ghi qua hàm view WHITELIST, không `select("*")` thẳng ra client (N27).
- [ ] Side effect sau khi ghi (thư, webhook ra ngoài) bọc try/catch, KHÔNG ném; ghi trạng thái thật (N19, N20).
- [ ] Mọi bảng có cache công khai bị đổi đều được purge cứng ngay sau khi ghi (N34).

**Cửa công khai (không đăng nhập)**
- [ ] Rate limit hai tầng qua module chung (N29).
- [ ] Honeypot tên VÔ NGHĨA (`hp_trap` — đặt "website"/"company" là trình duyệt tự điền hộ người thật) + thời gian
      điền tối thiểu (~2,5s). Bị bắt ⇒ trả **201 giả**, không ghi, không báo lỗi (kẻ dò không học được gì).
- [ ] Không rò tồn tại: câu trả lời giống nhau dù bản ghi có hay không (N26).

## Mẫu

`lib/idempotency.ts` — `crypto.randomUUID()` không có ngoài secure context (site chạy qua HTTP trong mạng LAN):

```ts
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  try {
    if (typeof c?.randomUUID === "function") return c.randomUUID();
  } catch {
    /* không phải secure context — dùng đường dưới */
  }
  if (typeof c?.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}
```

Client — lớp 1 + 2, giữ dữ liệu khi lỗi (N48):

```tsx
const submittingRef = useRef(false);
const keyRef = useRef<string | null>(null);

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (submittingRef.current) return;              // lớp 1: chặn cú bấm thứ hai NGAY
  submittingRef.current = true;
  setLoading(true);
  keyRef.current ??= newIdempotencyKey();         // lớp 2: một khoá cho một lần đặt
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, idempotency_key: keyRef.current }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setError(json.error?.message ?? t.genericError); // form giữ nguyên
    keyRef.current = null;                        // xong — lần đặt sau là đơn MỚI
    onDone(json.order);
  } catch {
    setError(t.networkError);                     // giữ khoá: bấm lại sẽ được khử trùng
  } finally {
    submittingRef.current = false;
    setLoading(false);
  }
}
```

Tầng dữ liệu — lớp 3:

```ts
export async function createOrder(input: CreateOrderInput, actorId: string, policy: OrderPolicy) {
  assertOrderShape(input);
  const key = cleanIdempotencyKey(input.idempotency_key);
  if (key) {
    const existing = await getOrderByIdempotencyKey(key);
    if (existing) return existing;
  }
  const claim = await claimResources(input, policy);          // nguyên tử (N18)
  const { data, error } = await sb()
    .from("orders")
    .insert({ ...pickWritable(input), created_by: actorId, idempotency_key: key })
    .select()
    .single();
  if (error) {
    await releaseResources(claim);                            // đường nhả #1 và #2
    if (error.code === "23505" && key) {
      const winner = await getOrderByIdempotencyKey(key);
      if (winner) return winner;                              // không notify lần hai
    }
    throw new DbError(error.message);
  }
  await notifyOrderCreated(data);                             // không bao giờ ném (N20)
  return data;
}
```

Migration:

```sql
alter table orders add column if not exists idempotency_key text;
create unique index if not exists orders_idempotency_key_uniq
  on orders (idempotency_key) where idempotency_key is not null;
```

Stack khác: lớp 3 vẫn là "khoá duy nhất ở DB + trả bản ghi đã có"; mã lỗi vi phạm unique của Postgres là `23505`,
MySQL là `1062`.

## Đầu ra

- Code cửa ghi + migration (nếu cần) + phép thử + dòng ma trận quyền.
- Bảng checklist đã điền "đã áp / không áp vì …", kèm danh sách cửa cùng loại và xác nhận đã áp cùng luật.
