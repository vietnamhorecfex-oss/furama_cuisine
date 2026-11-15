// Đo tương phản chữ trên NỀN THẬT phía sau nó — bằng điểm ảnh, không bằng mã màu token.
// Chép sang scripts/do-tuong-phan.mjs, sửa CAU_HINH, chạy:  node scripts/do-tuong-phan.mjs <url|đường-dẫn-file.html>
// Thoát ≠ 0 nếu có ô dưới ngưỡng. Cần `playwright` trong project (cùng thứ `kiem-trinh-duyet` dùng).
//
// Vì sao phải đo bằng điểm ảnh: chữ đè lên gradient, ảnh, thẻ kính thì "màu nền" không còn là một token. Lần dựng
// trang mẫu của kit (11/2026) mắt thường thấy ổn nhưng đo ra 1.8:1 trên điện thoại (cần 3:1).
//
// Mỗi dòng "ĐÃ SAI" dưới đây là một lần chính công cụ này cho số sai — đừng gỡ chỗ sửa tương ứng (N39):
//   · đọc `oklch(…)` của getComputedStyle như RGB                    ⇒ vẽ màu ra canvas để lấy RGB thật
//   · ẩn chữ bằng visibility:hidden làm mất luôn nền của phần tử     ⇒ chỉ đổi màu chữ thành trong suốt
//   · đo cả khung chữ nhật: dính góc bo tròn + biểu tượng con        ⇒ chỉ đo tại điểm ảnh là NÉT CHỮ (so hai ảnh)
//   · con mang màu khác (mũi tên trong nút) bị tính bằng màu của cha  ⇒ loại con khác màu, đo riêng bằng bộ chọn của nó
//   · chụp lúc trang còn đang hiện dần sau khi cuộn: 5.669 "nét chữ" ⇒ cuộn trước một lượt, tắt animation khi chụp,
//     chụp ảnh có-chữ HAI lần và từ chối đo nếu hai ảnh khác nhau
//   · mép khử răng cưa của hình bên cạnh bị tính là nét chữ           ⇒ chỉ nhận điểm ảnh đi ≥ 60% quãng từ nền tới màu chữ
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const CAU_HINH = {
  // Mỗi dòng: bộ chọn CSS + ngưỡng. 4.5 cho chữ thường; 3 cho chữ lớn (≥ 24px, hoặc ≥ 18.66px đậm) và biểu tượng.
  // Chọn phần tử MANG CHỮ. GIỚI HẠN ĐÃ BIẾT: biểu tượng/ký hiệu nhỏ nằm trong hình tròn (mũi tên trong nút) cho số sai
  // (mép hình tròn lẫn vào nét) — đừng đưa vào đây, kiểm chúng bằng mắt trên ảnh chụp phóng to.
  o: [
    { chon: "h1", nguong: 3 },
    { chon: "main p", nguong: 4.5 },
    // { chon: ".the-kinh small", nguong: 4.5 },
  ],
  kho: [[1440, 900], [390, 844]],            // khổ màn cần đo
  bienThe: [""],                             // vd ["", "?theme=dark"] — mỗi biến thể màu/trạng thái một lượt đo
  choMs: 400,                                // chờ dàn dựng vào màn xong — đo ở trạng thái NGHỈ
};

const dich = process.argv[2];
if (!dich) { console.error("Thiếu URL hoặc đường dẫn file .html"); process.exit(2); }
const laUrl = /^https?:/.test(dich);
if (!laUrl && !existsSync(resolve(dich))) { console.error(`Không thấy file: ${dich}`); process.exit(2); }
const url = laUrl ? dich : "file://" + resolve(dich);

const doSang = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const tiLe = (a, b) => { const [x, y] = [doSang(a), doSang(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
const AN_CHU = "[data-dang-do],[data-dang-do] *:not([data-khac-mau]):not([data-khac-mau] *){color:transparent!important;" +
  "-webkit-text-fill-color:transparent!important;text-shadow:none!important}" +
  "[data-khac-mau],[data-khac-mau] *{-webkit-text-fill-color:currentcolor!important}";   // text-fill-color KẾ THỪA — phải trả lại cho con khác màu

const trinhDuyet = await chromium.launch();
let truot = 0, daDo = 0;
for (const [rong, cao] of CAU_HINH.kho) for (const bt of CAU_HINH.bienThe) {
  const trang = await trinhDuyet.newPage({ viewport: { width: rong, height: cao } });
  await trang.goto(url + bt);
  await trang.addStyleTag({ content: AN_CHU });
  // Cuộn hết trang một lượt để mọi hiệu ứng "lộ diện khi cuộn" chạy xong TRƯỚC khi đo.
  await trang.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * .7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); });
  await trang.waitForTimeout(CAU_HINH.choMs);
  const nhan = `${rong}px${bt}`;
  for (const { chon, nguong } of CAU_HINH.o) {
    const cac = await trang.locator(chon).all();
    if (!cac.length) { console.log(`✗ ${nhan} ${chon}: không thấy phần tử`); truot++; continue; }
    for (const [i, el] of cac.entries()) {
      if (!(await el.isVisible())) continue;
      const ten = `${nhan} ${chon}${cac.length > 1 ? `[${i}]` : ""}`;
      const mauChu = await el.evaluate(e => { const c = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }), g = c.getContext("2d");
        g.fillStyle = getComputedStyle(e).color; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); });
      await el.evaluate(e => e.scrollIntoView({ block: "center", inline: "nearest" }));   // cuộn MỘT lần, ba ảnh cùng vị trí
      const chup = () => el.screenshot({ animations: "disabled" });
      let coChu, anChu, coChu2, dungYen = false;
      for (let lan = 0; lan < 3 && !dungYen; lan++) {
        coChu = await chup();
        await el.evaluate(e => { const mau = getComputedStyle(e).color; e.setAttribute("data-dang-do", "");
          e.querySelectorAll("*").forEach(c => getComputedStyle(c).color !== mau && c.setAttribute("data-khac-mau", "")); });
        anChu = await chup();
        await el.evaluate(e => { e.removeAttribute("data-dang-do"); e.querySelectorAll("[data-khac-mau]").forEach(c => c.removeAttribute("data-khac-mau")); });
        coChu2 = await chup();
        // Cho phép < 0,5% điểm ảnh lệch (khử răng cưa chữ vẽ lại không trùng từng bit); hơn thế là nền đang chuyển động.
        dungYen = coChu.equals(coChu2) || await trang.evaluate(async ([a, b]) => {
          const doc = async d => { const im = new Image(); im.src = "data:image/png;base64," + d; await im.decode();
            const c = Object.assign(document.createElement("canvas"), { width: im.width, height: im.height }), g = c.getContext("2d"); g.drawImage(im, 0, 0);
            return g.getImageData(0, 0, im.width, im.height).data; };
          const [x, y] = [await doc(a), await doc(b)]; if (x.length !== y.length) return false; let khac = 0;
          for (let k = 0; k < x.length; k += 4) if (Math.abs(x[k] - y[k]) + Math.abs(x[k + 1] - y[k + 1]) + Math.abs(x[k + 2] - y[k + 2]) > 24) khac++;
          return khac / (x.length / 4) < .005; }, [coChu.toString("base64"), coChu2.toString("base64")]);
        if (!dungYen) await trang.waitForTimeout(150);
      }
      daDo++;
      if (!dungYen) { console.log(`✗ ${ten}: nền không đứng yên giữa hai lần chụp — đo ở trạng thái nghỉ (tăng choMs, hoặc dùng bản giảm chuyển động)`); truot++; continue; }
      const nen = await trang.evaluate(async ([a, b, t]) => {
        const doc = async d => { const im = new Image(); im.src = "data:image/png;base64," + d; await im.decode();
          const c = Object.assign(document.createElement("canvas"), { width: im.width, height: im.height }), g = c.getContext("2d"); g.drawImage(im, 0, 0);
          return g.getImageData(0, 0, im.width, im.height).data; };
        const [x, y] = [await doc(a), await doc(b)], ra = [], phu = [];
        for (let k = 0; k < x.length; k += 4) {
          const doi = Math.abs(x[k] - y[k]) + Math.abs(x[k + 1] - y[k + 1]) + Math.abs(x[k + 2] - y[k + 2]);
          if (doi <= 24) continue;
          // Nét chữ thật thì điểm ảnh đi GẦN HẾT quãng từ nền tới màu chữ. Mép khử răng cưa của hình bên cạnh cũng đổi
          // vài chục đơn vị khi chữ biến mất nhưng chỉ đi một phần nhỏ quãng đó — không lọc thì ra 1.46:1 oan.
          const quang = Math.abs(t[0] - y[k]) + Math.abs(t[1] - y[k + 1]) + Math.abs(t[2] - y[k + 2]);
          (quang && doi / quang >= .6 ? ra : phu).push([y[k], y[k + 1], y[k + 2]]);
        }
        return ra.length ? ra : phu; }, [coChu.toString("base64"), anChu.toString("base64"), mauChu]);
      if (!nen.length) { console.log(`✗ ${ten}: không thấy nét chữ nào — chữ trùng màu nền, hoặc phần tử không có chữ cùng màu với nó`); truot++; continue; }
      const cacTiLe = nen.map(p => tiLe(mauChu, p)).sort((m, n) => m - n);
      const teNhat = cacTiLe[Math.floor(cacTiLe.length * .02)];        // bỏ 2% điểm lẻ (khử răng cưa)
      const dat = teNhat >= nguong; if (!dat) truot++;
      console.log(`${dat ? "✓" : "✗"} ${ten}: tệ nhất ${teNhat.toFixed(2)}:1 (cần ${nguong})`);
    }
  }
  await trang.close();
}
await trinhDuyet.close();
console.log(truot ? `\n${truot} ô dưới ngưỡng hoặc không đo được / ${daDo} ô.` : `\nĐạt: ${daDo} ô.`);
process.exit(truot ? 1 : 0);
