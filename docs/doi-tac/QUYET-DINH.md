# QUYẾT ĐỊNH CỦA CHỦ SẢN PHẨM — Chương trình Đối tác chiến lược

> File này **ưu tiên hơn** mọi mặc định trong `DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md`.
> Cách dùng: sửa cột **"Chốt"** rồi đổi trạng thái thành `ĐÃ CHỐT`. Mục còn `MẶC ĐỊNH` thì Claude Code dùng giá trị mặc định, để cấu hình được, và ghi rõ trong PR.
> Người chốt: BS. Lê Đình Lam · Cập nhật lần cuối: ..../..../2026

| # | Câu hỏi | Mặc định khuyến nghị | Chốt | Trạng thái |
|---|---|---|---|---|
| D1 | Thưởng 5% F1 trên doanh số F2 | Không tính. Engine chỉ 1 cấp, `ALLOW_SECOND_LEVEL=false` | | MẶC ĐỊNH |
| D2 | Thuật ngữ trong app | Không dùng "cổ đông". Dùng Đối tác / Đối tác Quyền lợi 2% / Đối tác Cao cấp 5% / Suất quyền lợi / Kỳ lợi nhuận | | MẶC ĐỊNH |
| D3 | Gói A07 Nhấn mí trị giá 15tr | Trừ 15tr, ví còn 15tr để chọn tiếp | | MẶC ĐỊNH |
| D4 | Tổng giá trị quyền lợi gói 5% | 1.800.000.000đ (60 × 30tr) | | MẶC ĐỊNH |
| D5a | "Doanh số tổng" phạm vi | Chỉ chương trình đối tác | | MẶC ĐỊNH |
| D5b | Tiền đóng 500tr/570tr có tính vào doanh số tổng | Không | | MẶC ĐỊNH |
| D5c | Doanh số tổng tính trên | Thực thu | | MẶC ĐỊNH |
| D6 | Hoa hồng 3tr khi gói bị hoàn tiền sau khi đã trả | Bút toán âm, bù trừ kỳ sau, không đòi tiền mặt | | MẶC ĐỊNH |
| D7 | Lỗ kỳ trước chuyển sang kỳ sau | Không chuyển lỗ | | MẶC ĐỊNH |
| D8 | Giá vốn bình quân 1 gói ("cost 2tr") | 2.000.000đ/gói — cần xác nhận | | MẶC ĐỊNH |
| D9 | Thời hạn dùng gói | 12 tháng, nhắc 90/30/7 ngày | | MẶC ĐỊNH |
| D10 | Người thụ hưởng | Tối đa 3 người, chủ gói xác nhận mỗi lần dùng | | MẶC ĐỊNH |
| D11 | Tỷ lệ hoa hồng ngoài gói | 12% cho cả 8 nhóm, chỉnh theo nhóm sau; bác sĩ không thấy | | MẶC ĐỊNH |
| D12 | Khấu trừ thuế TNCN | Tắt cho tới khi kế toán xác nhận mức hiện hành | | MẶC ĐỊNH |
| D13 | KPI duy trì gói 5% | Đếm hợp đồng gói hợp lệ ghi nhận cho đối tác, không đếm người tuyển | | MẶC ĐỊNH |
| Q2 | Đối tác tự mua gói thứ 2 cho mình có tính KPI | Không | | MẶC ĐỊNH |
| Q3 | Khách cũ đã có cộng tác viên khác, đối tác mới giới thiệu mua gói | Ghi nhận cho đối tác mới đối với hợp đồng gói; giữ cộng tác viên cũ cho dịch vụ cũ | | MẶC ĐỊNH |
| Q6 | Chu kỳ kỳ lợi nhuận | Quý | | MẶC ĐỊNH |
| Q7 | Tự giới thiệu chính mình (người mua = người giới thiệu) | Không cho phép | | MẶC ĐỊNH |
| D14 | Trưởng nhóm thấy thu nhập từng thành viên | Chỉ khi được cấp quyền `income.team`; mặc định chỉ thấy kết quả & chất lượng của đội | | MẶC ĐỊNH |
| D15 | Cổ đông thấy thu nhập ban điều hành | Thấy theo từng người (ban điều hành) + tổng lương nhân viên theo nhóm; không thấy lương từng nhân viên | | MẶC ĐỊNH |
| D16 | "2% doanh số" của Bảo Ngọc, Dương, Tuấn | 2% doanh số tổng | **2% doanh số CÁ NHÂN của từng người.** Cách ghi nhận doanh số cá nhân cho nhân sự truyền thông: xem D16a | ĐÃ CHỐT |
| D16a | Doanh số nào được tính là "cá nhân" của nhân sự truyền thông | Thực thu từ khách có **nguồn ghi nhận** cho người đó: khách đến từ video/kênh/chiến dịch do người đó phụ trách (mã nguồn/UTM/mã giới thiệu nội bộ), hoặc khách người đó trực tiếp tư vấn và chốt. Mỗi khoản thực thu chỉ ghi nhận cho **1** nhân sự truyền thông. Doanh số được tính theo thực thu, trừ hoàn tiền | | MẶC ĐỊNH |
| D17 | Nhân viên so sánh với đồng nghiệp | Chỉ phân vị ẩn danh so với trung vị đội | | MẶC ĐỊNH |
| D18 | Đơn vị/đội nhóm ban đầu | Ban điều hành · Kế toán · Tư vấn & lễ tân · Bác sĩ · Truyền thông & nội dung · Đào tạo (Nguyễn Quyên trưởng) | | MẶC ĐỊNH |
