---
name: script-du-lieu
description: Viết và chạy script ghi dữ liệu hàng loạt an toàn — seed, backfill, dịch máy, gắn ảnh, dọn kho, đồng bộ — với chạy khô mặc định, --apply, idempotent, MERGE thay vì ghi đè, tự dừng khi kết quả co lại hoặc đọc lỗi. Dùng khi người dùng nói "viết script", "seed dữ liệu", "backfill", "import hàng loạt", "cập nhật cả bảng", "dọn dữ liệu", "xoá file thừa", "chạy script lên DB".
---

# Script dữ liệu

Bốn sự cố dữ liệu ở Furama đều đến từ script "chạy thành công": ghi đè nguyên cột bản dịch (mất RU + TH), reseed
không bê cột bản dịch (131 món), gắn ảnh đè lên ảnh admin vừa sửa, dọn kho gặp lỗi đọc tạm thời suýt xoá vĩnh viễn
mọi ảnh của một bảng (N33). Script không báo lỗi không có nghĩa là script đúng.

## Khi nào dùng

Mọi script Node/SQL ghi vào DB, kho file, hoặc dịch vụ ngoài — kể cả script "chạy một lần".

## Các bước

1. **Bắt đầu từ khung** `docs/team/templates/script-du-lieu.template.mjs` → `scripts/<dong-tu>-<doi-tuong>.mjs`.
   Kết nối qua module dùng chung `scripts/_db.mjs` (đọc `.env.local`, bóc dấu nháy quanh giá trị — để nguyên dấu
   `"` là URL hỏng và lỗi trông y như sai mật khẩu).
2. **Đọc trước, tính kế hoạch, in kế hoạch.** Script tính toàn bộ thay đổi trong bộ nhớ, in tóm tắt (bao nhiêu
   thêm / sửa / xoá / bỏ qua vì sao) và **dừng** nếu không có `--apply`. *Xong khi:* chạy khô in được con số mà
   người vận hành đọc và gật đầu.
3. **Hàng rào trước khi ghi** (mỗi cái là một lần mất dữ liệu đã xảy ra):
   - **Co lại ⇒ DỪNG**: tập kết quả nhỏ hơn lần trước (map, manifest, danh sách khoá) ⇒ thoát ≠ 0, cờ thoát
     `--allow-shrink`. Nguồn nằm ngoài repo (thư mục ảnh gốc chỉ có trên một máy) là ca điển hình.
   - **Đọc lỗi ở thao tác PHÁ HUỶ ⇒ DỪNG**: không coi "không đọc được" là "rỗng". Thao tác vô hại (bỏ qua một mục)
     thì được đi tiếp kèm cảnh báo — chọn theo mức thiệt hại.
   - **Không đè việc người khác**: giá trị trông như do người sửa tay (URL tuyệt đối thay vì đường dẫn seed, cột
     khác seed) ⇒ giữ, in danh sách đã giữ, cờ `--force` mới đè.
   - **MERGE, không thay cả cột** JSON: `translations = {...cũ, [loc]: {...cũ[loc], ...mới}}`.
   - **Bê nguyên cột không sinh từ seed** khi xoá-rồi-chèn (danh sách `carry()` khai tường minh).
4. **Idempotent**: chạy lại lần hai không đổi gì (chỉ ghi ô trống / khác giá trị; khoá theo id cố định).
5. **Ghi để lùi được**: thao tác đổi URL/id thì ghi map cũ → mới vào file commit được; thao tác xoá thì in danh
   sách đã xoá ra file.
6. **Dịch vụ ngoài có hạn mức** (HTTP 420/429, quota): ghi tiến độ sau MỖI mục, gặp hạn mức thì dừng gọn với thông
   báo "chạy lại sau <mốc>", lần sau tiếp từ chỗ dừng. Phân loại lỗi tạm thời (timeout, abort, 429, 5xx, lỗi mạng)
   khác lỗi cấu hình (401/403/404) — phân loại sai là cả lô rơi sang đường kém (N54).
7. **Chạy nền cho lô dài**, theo dõi bằng cách đếm trong DB, KHÔNG bọc lệnh bằng `| tail -N` (tail giữ hết output tới
   lúc tiến trình thoát — log rỗng trông y như treo).
8. **Kiểm lại sau khi chạy** bằng đặc tính (đếm dòng, đọc lại vài bản ghi, kiểm file đang được phục vụ — N56),
   rồi purge cache nếu app đọc qua cache (N34).

Giao việc: `van-hanh-trien-khai` viết và chạy; `kiem-dinh-vien` kiểm lại sau khi chạy. Script ghi production cần
chủ dự án đồng ý trước lần `--apply` đầu tiên (N59). DB dùng chung production thì xem thêm N32 về thứ tự.

## Khi script chạy ĐỊNH KỲ (đồng bộ, ETL, báo cáo tự động)

Mọi luật trên vẫn áp, cộng thêm — vì không còn người ngồi nhìn lúc nó chạy (giao `ky-su-ai-du-lieu` viết,
`van-hanh-trien-khai` đặt lịch):

- **Mỗi lượt để lại một dòng nhật ký** trong DB: bắt đầu, kết thúc, đọc bao nhiêu, ghi bao nhiêu, bỏ qua bao nhiêu,
  trạng thái `ok | skipped | failed` + lý do máy đọc (N19). Không có dòng = không biết nó có chạy hay không.
- **Chồng lượt**: lượt trước chưa xong thì lượt sau TỪ CHỐI chạy (khoá bằng một câu UPDATE có guard — N13), không chạy
  song song. Lượt kẹt `running` quá hạn được đánh `failed` ở lượt kế.
- **Nguồn rỗng/co lại bất thường ⇒ dừng, không ghi đè** (nguồn lỗi trả 0 dòng là chuyện thường, xoá sạch đích là sự cố).
- **Lỗi thì kêu**: báo động nói được nên làm gì (N24) — theo `/dung-ci-giam-sat`. Route được cron gọi gác bằng bí mật,
  thiếu bí mật thì từ chối (N61).
- **Báo cáo Excel/CSV**: con số lấy từ cùng truy vấn với màn hình (N09); ghi ngày giờ lập theo múi giờ địa điểm (N53);
  ô trống là "chưa có dữ liệu", không phải 0 (N19).

## Checklist

- [ ] Không có `--apply` thì không ghi gì (kiểm: chạy khô hai lần, đếm DB không đổi).
- [ ] Chạy `--apply` hai lần: lần hai in "0 thay đổi" (idempotent).
- [ ] Có hàng rào co lại + cờ `--allow-shrink` (nếu script dựng map/manifest).
- [ ] Thao tác xoá dừng khi bất kỳ lượt đọc nào lỗi.
- [ ] Giá trị người sửa tay được giữ, chỉ `--force` mới đè; danh sách đã giữ được in ra.
- [ ] Cột JSON được merge; khi xoá-chèn thì cột ngoài seed được bê sang.
- [ ] Có map/nhật ký để lùi cho thao tác đổi URL/id/xoá.
- [ ] Lệnh chạy + cờ + "đã chạy ngày…" ghi vào tri thức nếu script là một phần quy trình (N02).

## Mẫu

Bộ khung tối thiểu (bản đủ ở template):

```js
// Gắn ảnh seed cho món chưa có ảnh. Chạy khô mặc định.
// node scripts/gan-anh-mon.mjs [--apply] [--force]
import { db } from "./_db.mjs"; // module kết nối dùng chung — khuôn ở docs/team/templates/_db.template.mjs
import { SEED_IMAGES } from "./seed-images.mjs"; // { [id]: "/img/…" }

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");

const { data: rows, error } = await db.from("menu_items").select("id, image_url");
if (error) throw new Error(`Đọc menu_items lỗi — DỪNG, không ghi gì: ${error.message}`);

const plan = [];
const kept = [];
for (const r of rows) {
  const seed = SEED_IMAGES[r.id];
  if (!seed || r.image_url === seed) continue;
  if (r.image_url?.startsWith("http") && !FORCE) {
    kept.push(r.id); // URL tuyệt đối = admin tự đặt → không đè
    continue;
  }
  plan.push({ id: r.id, from: r.image_url, to: seed });
}

console.log(`Sẽ sửa ${plan.length} · giữ ${kept.length} (admin tự đặt — dùng --force để đè)`);
if (kept.length) console.log("  giữ:", kept.join(", "));
if (!APPLY) {
  console.log("Chạy khô — thêm --apply để ghi.");
  process.exit(0);
}
for (const p of plan) {
  const { error: e } = await db.from("menu_items").update({ image_url: p.to }).eq("id", p.id);
  if (e) throw new Error(`Ghi ${p.id} lỗi: ${e.message}`);
}
console.log(`Đã ghi ${plan.length}. Nhớ purge cache bảng menu_items.`);
```

## Đầu ra

Script + output chạy khô + output `--apply` (con số) + kết quả kiểm lại + map/nhật ký lùi (nếu có) + dòng tri thức.
