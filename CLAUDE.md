# Trungtamdalieu — Hồng Phúc Alliance

App quản trị chương trình **Đối tác chiến lược** của BVĐK Hồng Phúc: Gói 15 triệu (ví quyền lợi 30 triệu), hoa hồng giới thiệu, Suất quyền lợi 2%/5%, phân quyền 4 lớp, phân tích tăng trưởng nhân sự/đội nhóm/lãnh đạo, cổng đối tác PWA.

Chủ sản phẩm: BS. Lê Đình Lam. Toàn bộ giao diện, tài liệu, commit message: **tiếng Việt**.

## Nạp ngữ cảnh mỗi phiên

1. `docs/doi-tac/DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md` — đặc tả chính (đọc mục liên quan nhiệm vụ, không cần đọc lại toàn bộ mỗi phiên).
2. `docs/doi-tac/QUYET-DINH.md` — quyết định của chủ, **ưu tiên hơn** mặc định trong đặc tả.
3. `docs/doi-tac/KE-HOACH-THI-CONG.md` — kế hoạch đã duyệt (có sau phiên 0) và nhật ký bàn giao giữa các phiên.
4. Khi đã có code: `web/CLAUDE.md` (quy ước kỹ thuật của ứng dụng).

## Repo tham chiếu (CHỈ ĐỌC)

`ledinhlam23032000/ZenithTasks` — cùng công nghệ, chứa các khối nền đã kiểm chứng để chuyển sang (phân quyền, audit, mã hoá SĐT, rate limiter, khoá kỳ, mechanism hoa hồng, hiệu suất). Đặt ở `../ZenithTasks`. Nếu chưa có:
```
git clone --depth 1 https://github.com/ledinhlam23032000/ZenithTasks ../ZenithTasks
```
Không bao giờ sửa, commit hay push vào ZenithTasks.

## Luật không được vi phạm

- **Tiền:** VND số nguyên `Decimal(14,0)`; sổ cái append-only, sửa sai bằng bút toán đảo; mọi thao tác tiền trong transaction có idempotency key.
- **Phân quyền:** mọi truy vấn dữ liệu nghiệp vụ đi qua `scopeWhere(ctx, resource)` ở server; che trường nhạy cảm ở server (payload), không chỉ trên UI.
- **Không ai tự duyệt khoản của chính mình.** Người lập ≠ người duyệt.
- **Chỉ tính hoa hồng 1 cấp.** Không xây cây tuyến dưới, không bảng xếp hạng theo số người tuyển hoặc theo thu nhập.
- **Không dùng chữ "cổ đông"** trong nội dung hướng tới đối tác. Role `SHAREHOLDER` (chủ sở hữu thật, chỉ xem) giữ nguyên nhãn "Cổ đông".
- **Hệ thống không bao giờ tự chấm dứt Suất quyền lợi.** Chỉ ADMIN quyết định sau đủ các mốc ở mục 6.4 của đặc tả.
- **Bác sĩ không thấy hoa hồng.** Đối tác không thấy hồ sơ y khoa.
- Test số vàng (mục 13 đặc tả) của giai đoạn đang làm phải xanh trước khi bàn giao.

## Quy trình mỗi phiên

Làm trên nhánh `feature/<giai-doan>`. Kết thúc phiên: `npx tsc --noEmit`, `npx vitest run`, cập nhật `CHANGELOG.md`, ghi 5–10 dòng bàn giao vào cuối `docs/doi-tac/KE-HOACH-THI-CONG.md`, commit. **Không push** nếu chủ chưa yêu cầu.
