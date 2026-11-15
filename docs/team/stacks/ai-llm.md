# Hồ sơ stack (bổ sung): gọi LLM — chat, RAG, trích tài liệu

> **Nhận diện:** dependency `anthropic`, `@anthropic-ai/sdk`, `openai`, `ai` + `@ai-sdk/*`, `langchain-*`, `@google/genai`.
> **Rút từ (11/2026):** content-calendar (CC) · internal_chatbot (IC) · resort_hub (RH) · digital-hotel-chatbot (DHC) ·
> furama_docflow (DF) · phulong_dx (PL) · ariyana-event-intelligence-crm (AR).
> Hồ sơ BỔ SUNG, chồng lên hồ sơ web/API. `CLAUDE.md` của project thắng file này.
> **Model id: đọc từ cấu hình của project; không gõ cứng theo trí nhớ.** Bản SDK đọc trong lockfile; DF và PL khai
> SDK mà không file nào import — đọc code, đừng suy từ `package.json`.

Các dự án KHÔNG thống nhất — đọc project trước:

| Thứ | Đã thấy |
|---|---|
| Một cửa gọi | `call()` trong `lib/services/ai/client.ts` (CC) · `callAI()` (DF) · `get_provider()` (IC, DHC) · route gọi thẳng SDK (AR) |
| Model id | env + mặc định trong code (CC, RH, DHC, IC) · DB do admin sửa (DF) · gõ cứng từng route (AR) · nhận từ body (PL) |
| Prompt | `services/ai/prompts/` có test (AR) · `prompts.py` (DHC) · hằng trong `core/rag.py` (IC) · file tính năng (CC, DF) |
| Vector | pgvector HNSW (DHC, PL) · FAISS file (RH) · Postgres FTS local, Azure AI Search production (IC) |

## Lệnh — chỉ thứ đã thấy

| Việc | Lệnh |
|---|---|
| Chạy không gọi mạng | `AI_PROVIDER=mock` (CC) · `llm_provider` mặc định `mock` (IC) |
| Nạp tài liệu | `python -m ingestion.pipeline --root ./data --folder <thư-mục>` (IC) · `npx tsx scripts/embed-snapshots.ts` (PL) |
| Bộ câu hỏi vàng | `python -m jobs.golden_eval` (IC) |
| Phép thử, LLM giả | `pytest -v` (IC) · `pnpm test` (CC) · `python -B -m unittest discover -s tests/python -t .` (RH) |
| Gọi thử provider thật | `npm run ai:vertex` thêm `--test` (DF) — GHI cấu hình vào DB, hỏi trước |

## Luật nằm ở đâu

| Luật | Khi gọi LLM |
|---|---|
| N15 | Đầu ra model là dữ liệu KHÔNG tin cậy: parse → kiểm từng trường → mới ghi. Bị từ chối/cắt cụt ⇒ lỗi, không parse dở; id, enum ngoài danh sách đã gửi ⇒ bỏ (CC, DF). SQL do model sinh ⇒ `sql_guard` + role DB chỉ đọc (RH) |
| N19 | Rơi về công thức ghi `fallback`, không ghi `ok` (CC); thiếu căn cứ ⇒ `grounded=false` kèm lý do (IC) |
| N20 | LLM chạy SAU khi đã ghi mà lỗi ⇒ bản ghi vẫn còn, trả cờ lỗi, NHỚ lỗi (RH) |
| N22 | Truy hồi, quyền, hạn mức lỗi ⇒ từ chối; không có đoạn nguồn ⇒ "không tìm thấy" (IC). Phản ví dụ đã thấy: RAG lỗi vẫn gọi model với ngữ cảnh rỗng |
| N23 | Bắt trích `[n]`, hậu kiểm chỉ số + độ chồng lấp với nguồn (IC `guardrail.py`); quy ước dữ liệu (−1 = hết phòng) vào prompt từ MỘT nguồn (RH) |
| N28 | Dữ liệu người dùng vào prompt qua MỘT hàm bọc: thẻ `<data>` + escape `<` (CC `dataBlock`) |
| N30 | Khoá chỉ ở server; API cấu hình trả khoá đã che, có nút gọi thử (DF); lỗi parse khoá không trích nội dung khoá (CC) |
| N35 | Lượt theo người/giờ, site/ngày (CC `ai_usage`, DF); timeout + số lần thử lại đặt TƯỜNG MINH; trần vòng tool 5–7 |
| N59 | Phép thử chạy provider giả, tool gửi email không chạy thật. AI chỉ ĐỀ XUẤT, người duyệt mới ghi (CC, DF) |
| N39 | Bộ vàng chạy provider giả chỉ chứng minh truy hồi + quyền + guardrail, KHÔNG chứng minh model |

## Kiểm bằng thứ thật

- Bộ câu hỏi CỐ ĐỊNH (JSONL: `q`, `groups`, `expected_contains`, `should_refuse`): ca trả lời được, ca ngoài phạm vi,
  ca CHÉO QUYỀN phải từ chối — mẫu `jobs/golden_eval.py` (IC). `expected_contains` rỗng không được tự qua.
- Hai lượt: provider giả (cổng CI), provider thật (tốn tiền ⇒ hỏi chủ dự án, N59).
- Ghi mỗi lượt: ngày · provider + model id từ cấu hình · số ca · accuracy / groundedness / từ chối đúng · token vào-ra
  · độ trễ · số lượt `fallback` · nguyên văn ca sai. Đổi prompt, model, cách cắt đoạn ⇒ chạy lại CÙNG bộ (N42).
- Đọc lại DB: dòng usage đúng `status`; người chưa duyệt thì chưa có dòng nghiệp vụ.

## Cạm bẫy đã gặp

Sự cố dự án đã ghi:

- **SDK tự thử lại** → timeout 15 s thành 31 s; cộng retry của app, một lượt dịch giữ luồng ~4 phút (server 4 luồng)
  → đường chạy lúc mở trang: 1 lần thử, timeout ngắn. *(RH)*
- **Lỗi provider không được nhớ** → trang mất 23–27 s mỗi lần mở → negative cache; lỗi quota/kết nối thì tạm
  ngưng provider, lỗi 400 thì không. *(RH)*
- **Model id gõ theo trí nhớ, không tồn tại** → nút AI lỗi suốt một bản phát hành. *(CC)* Cùng tên, vùng này 404 vùng
  khác chạy. *(DF)*

Thấy khi đọc code các dự án, chưa là sự cố — soát ở MỌI dự án mới vào:

- **Stream trước, hậu kiểm sau** → người dùng đã đọc chữ chưa qua guardrail; sentinel cắt qua hai delta lọt nửa đầu.
- **Hàm che dữ liệu nhạy cảm viết xong không ai gọi** → đường stream chỉ chặn một từ khoá → grep nơi GỌI, không chỉ nơi định nghĩa.
- **`str(e)` của SDK ra thẳng client**, lỗi tool thô đưa cho model → model chép lại → câu chung ra client, nguyên văn vào log (N21).
- **Tool `send_email` chạy ngay khi model gọi**, không bước duyệt; log ghi email + nguyên văn câu hỏi → tool có hậu quả phải qua người duyệt (N59).

## Chưa biết — hỏi khi vào dự án

- Vùng, hạn mức thật của tài khoản; ai trả tiền, trần chi mỗi tháng.
- Được lưu prompt/câu trả lời không, bao lâu (PII): có dự án lưu, có dự án cấm — quyết định chính sách (N57).
- Ai duyệt bộ câu hỏi vàng, ngưỡng đạt.
