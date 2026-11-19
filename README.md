# Trungtamdalieu — Hồng Phúc Alliance

Hệ thống quản trị chương trình **Đối tác chiến lược** của Bệnh viện Đa khoa Hồng Phúc: Gói 15 triệu (ví quyền lợi 30 triệu), hoa hồng giới thiệu, Suất quyền lợi 2%/5%, phân quyền 4 lớp (mục · hành động · phạm vi dữ liệu · trường nhạy cảm), phân tích tăng trưởng nhân sự/đội nhóm/lãnh đạo, cổng đối tác PWA.

**Trạng thái:** đặc tả xong, chưa có code. Ứng dụng sẽ nằm trong `web/` (Next.js 16 · Prisma 7 · PostgreSQL), cùng công nghệ với repo tham chiếu `ZenithTasks`.

## Tài liệu

| File | Nội dung |
|---|---|
| [`docs/doi-tac/DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md`](docs/doi-tac/DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md) | Đặc tả sản phẩm & nghiệp vụ đầy đủ |
| [`docs/doi-tac/QUYET-DINH.md`](docs/doi-tac/QUYET-DINH.md) | Quyết định của chủ sản phẩm (ưu tiên hơn đặc tả) |
| [`docs/doi-tac/PROMPTS-CLAUDE-CODE.md`](docs/doi-tac/PROMPTS-CLAUDE-CODE.md) | Bộ prompt thi công từng giai đoạn cho Claude Code |
| [`docs/doi-tac/MOCKUP-ALLIANCE.html`](docs/doi-tac/MOCKUP-ALLIANCE.html) | Mockup giao diện tham chiếu (tải về, mở bằng trình duyệt) |
| [`docs/doi-tac/nguon/`](docs/doi-tac/nguon/) | Hợp đồng gốc, phiếu chọn, 7 infographic chương trình |
| [`CLAUDE.md`](CLAUDE.md) | Luật làm việc mà Claude Code tự nạp mỗi phiên |

## Bắt đầu

1. Điền `docs/doi-tac/QUYET-DINH.md`.
2. Mở Claude Code trên repo này, dán **Prompt 0** trong `docs/doi-tac/PROMPTS-CLAUDE-CODE.md`.
