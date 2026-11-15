---
name: tiep-nhan
description: Cửa vào của mọi việc — phân loại một yêu cầu (ý tưởng, nghiên cứu, tính năng, tính năng AI, lỗi, sự cố, phép thử, hạ tầng, dữ liệu, nội dung, bàn giao), ước cỡ nhỏ / vừa / lớn, rồi chỉ đúng quy trình, đúng nhánh và đúng số cổng duyệt. Dùng khi người dùng giao một việc mà chưa rõ thuộc quy trình nào, giao nhiều việc một lúc, nói "làm cái này giúp", "bắt đầu từ đâu", "việc này ai làm", hoặc ở đầu một phiên làm việc mới trong project đã cài đội.
---

# Tiếp nhận

Việc đi sai đường tốn hơn việc làm chậm: một ý tưởng chưa ai cần mà đi thẳng vào spec là viết spec cho thứ sẽ bị bỏ; một
sự cố production mà đi vào quy trình tính năng là để khách chịu trong lúc đội viết tài liệu. Bước này mất hai phút và
quyết định đội nào vào việc, qua mấy cổng.

Mới từ bản 2.0, CHƯA qua dự án thật.

## Khi nào dùng

- Yêu cầu tới mà chưa khớp rõ một quy trình; hoặc nhiều việc lẫn trong một tin nhắn.
- KHÔNG dùng khi người dùng đã gọi đích danh một quy trình (`/sua-loi`…) — làm thẳng quy trình đó.

## Các bước

1. **Đọc bối cảnh tối thiểu**: `CLAUDE.md` (sản phẩm, luật bất biến), `docs/team/VERSION` (nhánh đã cài, stack),
   `docs/san-pham/viec-can-lam.md` nếu có. Tách tin nhắn thành TỪNG việc — mỗi việc phân loại riêng.

2. **Hỏi câu cắt đường đầu tiên**: người dùng thật có đang bị ảnh hưởng NGAY LÚC NÀY không (site sập, 5xx hàng loạt, mất
   dữ liệu, thanh toán hỏng)? Có ⇒ `/xu-ly-su-co` ngay, bỏ qua mọi bước dưới.

3. **Phân loại** theo bảng:

   | Dấu hiệu | Loại | Đường đi | Nhánh chính |
   |---|---|---|---|
   | "có nên làm", ý tưởng, chưa rõ ai cần | ý tưởng | `/danh-gia-y-tuong` | Sản phẩm |
   | "dùng cái nào", "so sánh", chọn công nghệ | nghiên cứu | `/nghien-cuu` | Sản phẩm |
   | hành vi mới, màn mới, API mới | tính năng | `/quy-trinh-tinh-nang` | mọi nhánh liên quan |
   | chatbot, LLM, RAG, trích xuất bằng AI | tính năng AI | `/tinh-nang-ai` (nằm trong quy trình tính năng) | Nền tảng |
   | "bị lỗi", "sai", "không chạy" | lỗi | `/sua-loi` | Nền tảng / Trải nghiệm |
   | thiếu phép thử, test chập chờn | phép thử | `/viet-kiem-thu` | Chất lượng |
   | CI, deploy tự động, giám sát, cảnh báo | hạ tầng | `/dung-ci-giam-sat` | Nền tảng |
   | đổi schema, phát hành | hạ tầng | `/migration-va-trien-khai` | Nền tảng |
   | nhập/sửa dữ liệu hàng loạt, báo cáo, đồng bộ | dữ liệu | `/script-du-lieu` | Nền tảng |
   | chậm, giật, điểm thấp | hiệu năng | `/do-hieu-nang` | Chất lượng |
   | bài viết, email, bài mạng xã hội | nội dung | `/chien-dich-noi-dung` | Tăng trưởng |
   | lên Google chưa, AI nói sai về mình | tìm kiếm | `/kiem-tra-seo-geo` | Tăng trưởng |
   | giao cho khách, nghiệm thu, hướng dẫn sử dụng | bàn giao | `/ban-giao` | mọi nhánh |
   | project mới / chưa có nền nếp | khởi động | `/khoi-dong-du-an` | mọi nhánh |

   "Lỗi" mà thực ra chưa từng được làm ⇒ là tính năng, nói rõ với chủ dự án. Sửa lỗi phải đổi schema/quyền/thiết kế ⇒
   chuyển tính năng sau bước tìm gốc.

4. **Ước cỡ** — quyết định số cổng (không quyết định có kiểm hay không):

   | Cỡ | Dấu hiệu | Cổng |
   |---|---|---|
   | **Nhỏ** | < 1 buổi, 1–3 file, KHÔNG đổi schema / quyền / tiền / thư gửi khách / trang công khai | bỏ spec + plan; 3–5 dòng "định làm gì · đụng file nào · kiểm bằng gì"; một reviewer |
   | **Vừa** | 1–5 buổi, hoặc chạm một trong các thứ trên | spec + plan + soát chéo + rà soát + kiểm định |
   | **Lớn** | > 4 lát, nhiều tuần, nhiều nhánh | lộ trình trước, rồi mỗi dòng lộ trình là một việc Vừa |

   Không chắc giữa hai cỡ ⇒ chọn cỡ LỚN hơn. Mọi cỡ: kiểm bằng thứ thật (`/kiem-chung-thuc`) và ghi tri thức
   (`/ghi-bai-hoc`) không bao giờ bỏ.

5. **Kiểm nhánh**: quy trình cần agent của nhánh chưa cài (xem `docs/team/VERSION`) ⇒ báo người dùng lệnh cài thêm
   `install.sh . --nhanh <ten>`, hoặc giao `general-purpose` với thân file agent trong skill team-agency.

6. **Báo một dòng mỗi việc rồi LÀM** — không chờ duyệt bước phân loại, trừ khi: nhiều việc tranh nhau thứ tự (hỏi chủ dự
   án ưu tiên), hoặc cỡ Lớn (xác nhận phạm vi trước).

## Checklist

- [ ] Đã hỏi câu "có người dùng đang bị ảnh hưởng ngay lúc này không" trước mọi thứ khác.
- [ ] Mỗi việc trong tin nhắn có một dòng: loại · cỡ · quy trình · nhánh.
- [ ] Cỡ Nhỏ chỉ khi KHÔNG chạm schema, quyền, tiền, thư gửi khách, trang công khai.
- [ ] Nhánh cần mà chưa cài đã được nói rõ kèm lệnh.
- [ ] Không việc nào bị bỏ kiểm chứng thật và ghi tri thức vì "nhỏ".

## Mẫu

```
Tiếp nhận (3 việc):
1. "Trang đặt bàn báo 500 từ sáng" → SỰ CỐ · /xu-ly-su-co — làm NGAY
2. "Thêm nút xuất Excel danh sách khách" → tính năng · Nhỏ · làm thẳng, kiểm bằng file xuất thật · Nền tảng
3. "Có nên làm chatbot trả lời khách không" → ý tưởng · /danh-gia-y-tuong · Sản phẩm — sau việc 1
```

## Đầu ra

Một dòng phân loại cho mỗi việc + thứ tự làm, rồi chuyển sang quy trình tương ứng.
