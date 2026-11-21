# Trungtamdalieu

Ứng dụng quản trị **Trung tâm Da liễu — Bệnh viện Đa khoa Hồng Phúc**: khách hàng, điều trị, thu tiền, gói 15 triệu, mạng lưới đối tác 2 cấp và truy nguồn khách, hoa hồng, thu chi, lương, giấy tờ, phân quyền theo vai trò.

Tham khảo cách tổ chức của app Trung tâm PTTM (ZenithTasks) nhưng gọn hơn: bỏ "dự án", trợ lý AI và các cấu hình đa công ty.

## Chạy thử

- Mở `app/index.html` bằng trình duyệt (Chrome/Edge/Safari). Không cần cài đặt, không cần mạng.
- Dữ liệu mẫu 6 tháng tự nạp lần đầu; lưu trên trình duyệt đó. Nút **Khôi phục dữ liệu mẫu** đưa về ban đầu.
- Ô **Bạn đang là** ở góc trên: đổi vai trò để xem mỗi người thấy gì.
- Lần đầu: bấm **Bắt đầu kịch bản thử** để được dẫn qua 13 bước.

## Cấu trúc

| File | Nội dung |
|---|---|
| `app/engine.js` | Bộ máy nghiệp vụ: tiền, sổ cái chỉ ghi thêm, phân quyền, mạng lưới, lương, sổ quỹ, truy nguồn. Chạy được trong trình duyệt và Node. |
| `app/catalog.js` | Gói chính A01–A07 (từ phiếu chọn) và **bảng giá da liễu mẫu** (thay bằng giá thật). |
| `app/seed.js` | Dữ liệu mẫu sinh bằng chính bộ máy (6 tháng vận hành). |
| `app/docs.js` | Giấy tờ A4 điền sẵn: hợp đồng gói, phiếu thu/chi (có số tiền bằng chữ), phiếu chọn, phiếu đồng ý điều trị, đề nghị thanh toán, sao kê đối tác, danh sách công nhận mốc, bảng lương, biên bản hoàn tiền. |
| `app/ui.js`, `app/styles.css`, `app/index.html` | Giao diện theo vai trò. |
| `tests/engine.test.js` | Kiểm thử tự động: `node --test tests/` |
| `docs/doi-tac/` | Đặc tả chương trình đối tác, quyết định của chủ, hợp đồng nguồn, kế hoạch thi công. |
| `docs/HUONG-DAN-SU-DUNG.md` | Hướng dẫn theo vai trò. |
| `prototype/alliance/` | Bản chạy thử đầu tiên (lưu để đối chiếu). |

## Giới hạn của bản này

- Chạy trên trình duyệt, dữ liệu nằm trên từng máy. Để nhiều người dùng chung cần chuyển bộ máy `engine.js` lên máy chủ có cơ sở dữ liệu (kế hoạch ở `docs/doi-tac/KE-HOACH-THI-CONG.md`).
- Chọn vai trò ở ô trên cùng thay cho đăng nhập; bản chính thức cần tài khoản và mật khẩu cho từng người.
- Bảng giá dịch vụ da liễu là **mẫu**.
- Thưởng tầng 2 khoá cho tới khi có giấy chứng nhận đăng ký bán hàng đa cấp và ý kiến luật sư.


Báo cáo kiểm thử độc lập vòng 3 (5 nhóm: chuyên gia, y khoa, tuyến đầu, người dùng ngoài, kỹ thuật) và việc đã nâng cấp: [docs/KIEM-THU-VONG-3.md](docs/KIEM-THU-VONG-3.md).
