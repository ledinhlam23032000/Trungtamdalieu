# Kiểm thử vòng 3: tính ứng dụng thực tế của Trungtamdalieu

Ngày: 21/11/2026. Bản được kiểm: commit `b1a4905` (sau vòng 2). Bản sau nâng cấp: nhánh `claude/wizardly-noether-b1a8jb`.

## 1. Đội kiểm thử

Có 5 nhóm làm việc độc lập. Mỗi nhóm đóng vai người dùng thật, thao tác qua giao diện (Playwright, màn 1280px và iPhone) và viết script kiểm chứng.

| Nhóm | Vai đóng | Trọng tâm |
|---|---|---|
| Chuyên gia | Kế toán trưởng / kiểm toán nội bộ, luật sư doanh nghiệp, giám đốc tài chính | Sổ sách, kiểm soát nội bộ, gian lận, thuế – hoá đơn, đa cấp, dữ liệu cá nhân, giấy tờ |
| Y khoa & vận hành | Bác sĩ trưởng khoa, điều dưỡng / KTV trưởng, quản lý phòng khám, trưởng CSKH | Quy trình khám – chỉ định – thủ thuật, chống chỉ định, vật tư, lịch, chăm sóc sau điều trị |
| Nhân viên tuyến đầu | Lễ tân, tư vấn viên, trưởng nhóm, KTV, kế toán, BGĐ | Một ca đông: số click, thao tác thừa, sửa thao tác nhầm, báo cáo cuối ngày |
| Người dùng ngoài | Khách / đối tác (45 tuổi), đối tác giới thiệu nhiều, khách 60 tuổi, cổ đông, chuyên gia trợ năng | Cổng đối tác dễ hiểu, độ tin cậy, chữ to, tương phản, bàn phím, dashboard cổ đông |
| Kỹ thuật | Kỹ sư bảo mật, kỹ sư hiệu năng / độ bền dữ liệu, kiến trúc sư | XSS, sửa tay dữ liệu, 5.000 khách, quota, hai tab, sao lưu, đường lên bản thật |

Tổng số phát hiện: **136**, gồm Y khoa 27, Chuyên gia 40, Tuyến đầu 26, Người dùng ngoài 23, Kỹ thuật 20 (đã gộp các mục trùng).

## 2. Điểm sẵn sàng dùng thật (1–10)

"Trước" là điểm các nhóm chấm trên commit `b1a4905`. "Sau" là ước tính của người sửa, chưa được các nhóm chấm lại.

| Vai | Trước | Sau (ước tính) | Còn thiếu chính |
|---|---|---|---|
| Bác sĩ trưởng khoa | 3 | 6 | Phiếu khám/bệnh án có chẩn đoán, ảnh trước–sau, đơn thuốc |
| Điều dưỡng / KTV trưởng | 3 | 6 | Thông số buổi theo mẫu, kho vật tư |
| Quản lý vận hành | 3 | 5 | Lịch theo phòng/máy, thời lượng; máy chủ |
| Trưởng CSKH | 4 | 7 | Bấm gọi kèm nhật ký người xem SĐT |
| Kế toán trưởng | 3 | 5 | Hoá đơn điện tử, thuế TNCN, BHXH, đối chiếu ngân hàng |
| Luật sư | 2 | 3 | **Quyết định mô hình** (mục 5), đồng ý dữ liệu theo từng mục đích |
| Giám đốc tài chính | 3 | 5 | Kỳ lợi nhuận dồn tích, giá vốn |
| Lễ tân | 5 | 7 | Tìm khách hiện năm sinh / lần đến gần nhất |
| Tư vấn viên / trưởng nhóm | 6 | 7 | Bảng chi tiết hoa hồng, tổng nhóm |
| KTV | 5 | 7 | Nhập thông số máy theo mẫu |
| Kế toán (vận hành) | 5 | 7 | Bảng lương dạng thẻ trên điện thoại |
| BGĐ | 5 | 7 | Đăng nhập thật |
| Đối tác | 5–6 | 7 | Đường link giới thiệu thật, sao kê PDF |
| Khách 60 tuổi | 4 | 5 | Cỡ chữ theo rem, nút A/A+ |
| Cổ đông | 6 | 8 | — |
| Trợ năng | 5 | 6 | Trả focus sau khi vẽ lại, aria-invalid |

## 3. Đã nâng cấp trong vòng này

### An toàn chuyên môn (YT-01, 02, 03, 08, 17, 19, 21, 27; PL-32, 37)
- Mỗi dịch vụ có hồ sơ chuyên môn (`catalog.js` → `CLIN`): cần bác sĩ chỉ định, chỉ bác sĩ thực hiện, bắt buộc số lô, chống chỉ định, khoảng cách buổi, mốc gọi hỏi thăm. **Bản mẫu này cần Giám đốc chuyên môn duyệt.**
- Dịch vụ do tư vấn viên thêm ở trạng thái **"Chờ bác sĩ khám & chỉ định"**. Bác sĩ bấm Chỉ định, hoặc Không chỉ định kèm lý do; khi không chỉ định, giá về 0.
- KTV **không ghi được buổi** filler / botox / căng chỉ / tiểu phẫu. Bác sĩ ghi buổi và bắt buộc nhập **số lô vật tư**.
- **Chống chỉ định có cấu trúc** (10 mục: lidocaine, latex, isotretinoin, mang thai, sẹo lồi…), hỏi ngay khi tiếp nhận; ghi chú "dị ứng thuốc tê" cũng được nhận ra. Gặp chống chỉ định thì chỉ bác sĩ thêm được dịch vụ, và phải ghi lý do.
- **Phiếu đồng ý bắt buộc:** chưa bấm "Khách đã ký" thì không ghi buổi. Phiếu in ra nêu nguy cơ riêng theo nhóm (peel, laser, HIFU, tiêm, kể cả tắc mạch / giảm thị lực), phương án thay thế, đồng ý chụp ảnh, dòng người giám hộ cho khách dưới 18 tuổi.
- Mọi nhân sự lâm sàng được **thêm** dị ứng; chỉ bác sĩ được bỏ.
- Không ghi 2 buổi cùng một dịch vụ trong một ngày. **Huỷ buổi ghi nhầm** (có lý do) và nút **Hoàn tác** ngay sau khi ghi. Buổi đã huỷ không tính thù lao KTV.
- Bác sĩ / KTV không thấy chuỗi đối tác giới thiệu.

### Chăm sóc khách & vận hành (YT-10, 11, 12, 13, 14, 15, 25; TD-01, 05–08, 12, 17, 19)
- Danh sách gọi mới:
  - hỏi thăm **sau 24 giờ / 3 / 7 ngày** theo loại thủ thuật (thủ thuật tiêm xếp đầu);
  - **đến hạn buổi kế / bỏ dở liệu trình**;
  - **khách không đến chưa hẹn lại**;
  - nhắc hết hạn gói ở mốc 90 / 30 / 7 ngày.
- Thêm **Sự cố / khiếu nại / biến chứng**: mức 1–3, hạn xử lý trong ngày / 24 giờ / 3 ngày, hiện đỏ trên Việc hôm nay của bác sĩ và BGĐ, đóng phải ghi kết quả.
- Lịch hẹn:
  - **cảnh báo bác sĩ trùng giờ** (±30 phút);
  - **Dời / Huỷ** (huỷ cần lý do);
  - "Không đến" chuyển được thành **"Khách tới muộn"** trong ngày; nút "Bấm nhầm".
- Lưu **SĐT đầy đủ** (hiển thị che số). Tìm khách bỏ dấu, gõ đủ 10 số cũng ra. **Chống trùng hồ sơ bỏ dấu.**
- KTV có ô tìm khách; mặc định chỉ hiện khách đã đến / có hẹn hôm nay.
- **Huỷ phiếu thu nhầm trong ngày** bằng bút toán đảo; **đổi hình thức thanh toán** trong ngày. Lễ tân lập được đề nghị hoàn tiền.
- Bấm trùng thì có thông báo "đã ghi rồi", không còn im lặng.

### Tiền & kiểm soát nội bộ (PL-01, 02, 03, 05, 13, 14, 16, 17, 26, 27, 30, 31; TD-03, 04, 13, 14, 26)
- **Người lập chứng từ không được tự ghi chi** (trừ bảng lương đã qua người duyệt khác).
- Người vừa **đặt lại PIN** không được ghi nhận sử dụng ví của gói đó trong ngày.
- **Mở lại sổ** phải do người khác người chốt. **"Vẫn chốt"** khi còn chứng từ treo phải ghi lý do. Chốt sổ hỏi xác nhận kèm tổng thu chi.
- **Giảm giá bắt buộc lý do**; nhập được theo %.
- Bật thưởng tầng 2 cần số giấy chứng nhận đúng định dạng và ngày cấp.
- Bán gói:
  - mặc định **phải có đồng ý dữ liệu**;
  - người mua **dưới 18 tuổi bị chặn**;
  - nhân sự không nhận hoa hồng đối tác;
  - ghi **đúng hình thức thanh toán** (trước đây luôn ghi tiền mặt).
- **Sổ quỹ ngày** theo tiền mặt / chuyển khoản / thẻ, **đối chiếu tiền mặt đếm thực tế**, **xuất CSV**. Trang Thu chi mặc định mở tháng hiện tại.
- **Tổng quan** thêm hàng "Sức khoẻ & rủi ro": chênh lệch thu − chi 6 tháng, tỷ trọng tiền gói, % khách qua đối tác, hoàn tiền, "phải trả nếu tất cả dừng". Có biểu đồ **doanh thu ghi nhận** (dịch vụ + phần ví đã dùng × 15/30). Đổi tên "Nghĩa vụ dịch vụ còn nợ" thành "Quyền lợi ví khách chưa dùng". Thêm bảng chuyên môn tháng.
- Việc hôm nay của BGĐ:
  - thẻ **"Hôm qua"** (thu theo hình thức, khách đến / không đến, buổi, gói);
  - **nút Duyệt ngay trong thẻ** và **"Duyệt tất cả"** (có xác nhận).
- Cổ đông **không còn xem hồ sơ từng bệnh nhân**, chỉ xem số tổng hợp.

### Cổng đối tác (ND-01–05, 07, 08, 10, 18, 23)
- Đổi tên 3 ô thành **"Chờ chốt tháng / Sắp nhận / Đã nhận"**, kèm giải thích; mỗi khoản ghi **ngày dự kiến chuyển khoản 05–10 tháng sau**.
- Khoản bị trừ ghi rõ **hợp đồng nào, của ai, vì sao, trừ vào kỳ nào, không phải nộp lại tiền mặt**. Khoản không tính được liệt kê kèm lý do, không còn "biến mất".
- **Bỏ chữ "Tầng 1 / Tầng 2" và thanh "mốc 50"** khỏi cổng. Danh sách đổi thành "Khách tôi giới thiệu", chỉ hiện tên viết tắt và tháng đến.
- Nút **"Sao chép mã"** và **"Gửi cho bạn bè"** (chia sẻ qua Zalo / Messenger). QR chứa câu đọc được.
- Ví hiện **số ngày còn lại** và **phần đang giữ cho mục đã chọn**. Xưng hô "Chị / Anh".

### Kỹ thuật & độ bền dữ liệu (KT-03–09, 13, 17)
- **Hiệu năng:** danh sách chăm sóc tính bằng chỉ mục và được ghi nhớ. Ở 1.243 khách: trang của BGĐ từ **3,6 giây → dưới 15ms**; thu tiền từ 2,1 giây → khoảng 50ms.
- **Không còn mất dữ liệu im lặng:** lưu thất bại (đầy bộ nhớ) thì thao tác bị huỷ và báo đỏ.
- **Hai tab:** mỗi lần lưu có số phiên bản; tab đã cũ không ghi đè được, có thông báo và tự cập nhật bản mới.
- **Dữ liệu hỏng / sai phiên bản không bị ghi đè:** bản gốc được cất sang khoá `.broken-…`. Dữ liệu được kiểm khi nạp và khi khôi phục (cấu trúc, số tiền nguyên, mã / id an toàn); điều này cũng chặn XSS qua mã chứng từ (KT-15).
- **Sao lưu / khôi phục JSON** ở Cài đặt; nhắc trên Việc hôm nay nếu quá 7 ngày chưa sao lưu.
- Giới hạn độ dài văn bản; đóng băng bảng quyền; chặn `__proto__` trong gom nhóm.
- Thêm `<!doctype html>` + `lang="vi"`; tăng tương phản màu; toast có `role=status`; thêm `aria-current` và liên kết "Bỏ qua tới nội dung".

### Giấy tờ (PL-34, 35, 37, 38)
- **Hợp đồng gói** khôi phục các điều khoản:
  - thù lao giới thiệu **"không bao gồm thưởng tuyển đối tác, không trả theo số người tham gia"**;
  - khấu trừ thuế TNCN;
  - PIN;
  - dữ liệu cá nhân;
  - vi phạm 10 ngày khắc phục, tranh chấp tại Toà án;
  - ô gồm / chưa gồm thuế GTGT.
- **Phiếu thu** liệt kê dịch vụ, giảm giá, tổng / đã thu / còn nợ; có phiếu huỷ.
- Biên bản hoàn tiền ghi trạng thái bằng tiếng Việt. Sao kê không còn ghi cứng "thuế 0đ".

### Kịch bản thử
Thêm bước **"Bác sĩ khám: chỉ định, ghi nhận khách ký phiếu đồng ý"**, nay là 14 bước. Chạy hết cả 14 bước ở 1280px và 390px.

## 4. Kết quả kiểm tra sau nâng cấp
- `npm test`: **33/33** đạt, gồm 2 nhóm test mới cho an toàn chuyên môn, vận hành và chống gian lận.
- Trang Kiểm thử trong app: 14/14.
- Smoke mọi vai, mọi trang: không có lỗi JS.
- Kịch bản 14 bước: đạt ở 1280px và 390px, không cuộn ngang.
- Đầy bộ nhớ: thao tác bị huỷ, có báo lỗi. Hai tab: không mất thao tác, không trùng số chứng từ.

## 5. Việc cần chủ sản phẩm / luật sư quyết (app không tự quyết thay)
1. **Mô hình chương trình (PL-25, nghiêm trọng).** Hiện "mua gói thì thành đối tác + 3tr mỗi khách giới thiệu + mốc 50 hợp đồng xét chia lợi nhuận" có dấu hiệu bán hàng đa cấp, kể cả khi tầng 2 đang tắt. Cần ý kiến luật sư **bằng văn bản**. Các hướng: tách hợp đồng giới thiệu (miễn phí) khỏi việc mua gói; trả theo dịch vụ khách đã dùng; hoặc đăng ký đa cấp đầy đủ. App đã bỏ chữ "tầng" khỏi cổng đối tác, nhưng trang nội bộ "Mạng lưới" vẫn có sơ đồ 2 cấp phục vụ truy nguồn.
2. **Giữ lại hoa hồng (holdback)** để chặn gian lận "mua hộ rồi huỷ" (PL-12): chỉ chi sau khi khách đã dùng dịch vụ hoặc hết thời hạn được huỷ?
3. **Khi chấm dứt gói sau khi đã chi 3tr** có trừ lại không (hiện chỉ trừ khi huỷ)?
4. **Thuế TNCN hoa hồng** áp 10% vãng lai hay 5% theo ngưỡng năm; **thuế GTGT** theo từng mã dịch vụ; thời điểm xuất hoá đơn cho gói trả trước.
5. **Thưởng 38% doanh thu chương trình** cho BGĐ / kế toán / truyền thông tính trên tiền thu hay doanh thu ghi nhận, có trần không; ai duyệt dòng lương của chính BGĐ (PL-18).
6. Thưởng bác sĩ theo doanh thu (động cơ chỉ định quá mức, PL-33); có giữ không.
7. Tư vấn viên được tự thu tiền mặt hay chỉ lễ tân / thu ngân (PL-15).
8. Bảng giá thật, giá vốn thật; **Giám đốc chuyên môn duyệt bảng `CLIN`** (cần bác sĩ, chỉ bác sĩ làm, số lô, chống chỉ định, khoảng cách, mốc gọi).
9. Phạm vi dữ liệu đối tác / cổ đông được xem; văn bản đồng ý xử lý dữ liệu cá nhân theo từng mục đích; thời hạn lưu trữ bệnh án.
10. Thu hồi hoặc sửa infographic "Cổ đông F1/F2" (PL-28).

## 6. Còn lại (chưa làm trong vòng này)

**Cố hữu của bản thử, chỉ hết khi có máy chủ:**
- đăng nhập thật / 2FA (ô "Bạn đang là" chỉ để demo);
- dữ liệu và PIN dạng rõ trong trình duyệt;
- console sửa được dữ liệu;
- nhật ký xoá được;
- ngày hệ thống do client giữ;
- hoá đơn điện tử.

**Làm được ở vòng sau trong bản hiện tại:**
- Phiếu khám / bệnh án có chẩn đoán ICD-10, mức độ, kế hoạch (YT-04).
- Thông số buổi theo mẫu cho từng máy (YT-05).
- Tra "số lô → danh sách khách" (YT-06).
- Ảnh trước–sau lưu IndexedDB (YT-09).
- Kho vật tư (YT-07).
- Đơn thuốc / bán mỹ phẩm (YT-20).
- Lịch theo phòng / máy / thời lượng (YT-13).
- Buổi dặm gói HA (YT-22).
- Báo cáo tuổi nợ, chặn ghi buổi khi nợ vượt ngưỡng (PL-04, YT-18).
- Phải thu đối tác khi số âm treo lâu (PL-06).
- Kỳ lợi nhuận suất 2% / 5% (PL-07).
- Cột BHXH / TNCN trong bảng lương (PL-08).
- Hoá đơn đầu vào / đính kèm (PL-09).
- Hồ sơ thuế đối tác (CCCD, MST, tài khoản) và bảng khấu trừ (PL-23).
- Người thụ hưởng (PL-40).
- Tìm khách hiện năm sinh / lần đến gần nhất (TD-09); ô chọn khách khi đặt lịch (TD-10); dùng chung một form đặt lịch (TD-23).
- Hiệu suất ghi rõ kỳ so sánh + tổng nhóm (TD-18); bảng lương dạng thẻ trên điện thoại (TD-25); thu gọn banner trên điện thoại (TD-20).
- Cỡ chữ theo rem và nút A/A+ (ND-12); trả focus sau khi vẽ lại (ND-13); aria-invalid, focus hộp thoại (ND-14); biểu đồ ghi số mọi cột (ND-20).
- Tự host thư viện QR + CSP (KT-14).

**Lộ trình lên bản thật** (theo nhóm kỹ thuật):
- P1 nền máy chủ (Supabase / Postgres: tiền `bigint`, sổ cái append-only bằng trigger, Auth + TOTP, RLS theo vai);
- P2 lệnh tiền qua RPC trong transaction, số chứng từ bằng sequence;
- P3 cổng đối tác OTP + PDF bất biến + PIN phía server;
- P4 vận hành (PITR, sao lưu, xuất Excel, hồ sơ NĐ 13/2023, chạy song song 1 tháng với sổ giấy).

Chi tiết từng phát hiện (mã YT / PL / TD / ND / KT, cách tái hiện, đề xuất) nằm trong báo cáo gốc của từng nhóm. Script tái hiện nằm ở thư mục kiểm thử của phiên làm việc.
