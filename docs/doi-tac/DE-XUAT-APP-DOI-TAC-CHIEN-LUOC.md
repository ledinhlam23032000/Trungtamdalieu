# ĐỀ XUẤT SẢN PHẨM — "HỒNG PHÚC ALLIANCE"
### Hệ thống quản trị chương trình Đối tác chiến lược (Gói 15 triệu · Quyền lợi 2% · Quyền lợi 5%)
**Chủ sản phẩm:** BS. Lê Đình Lam · **Đơn vị:** BVĐK Hồng Phúc · **Ngày:** 19/11/2026 · **Phiên bản đề xuất:** v1.0
**Người thực thi:** Claude Code, trên repo `ledinhlam23032000/ZenithTasks`

---

## 0. LỜI NHẮN CHO CLAUDE CODE (đọc trước tiên)

1. Đây là **đề xuất sản phẩm + đặc tả nghiệp vụ**, không phải lệnh code ngay. Phiên đầu tiên: đọc tài liệu repo (`web/CLAUDE.md`, `web/BAN-GIAO.md`, `docs/INDEX.md`, `docs/AI-ADMIN-GATEWAY.md`, `FINANCE-DEFINITIONS.md`), đọc mục 3 và mục 6 của tài liệu này, rồi **lập kế hoạch thi công theo Giai đoạn P0 (mục 12)** và trình chủ duyệt trước khi sửa schema.
2. **Xây như một module bên trong ZenithTasks**, không tạo app riêng. Lý do ở mục 2.
3. Các mục đánh dấu **⛔ QUYẾT ĐỊNH CẦN CHỐT** (mục 3) phải được chủ trả lời trước khi code phần liên quan. Câu trả lời của chủ nằm ở `docs/doi-tac/QUYET-DINH.md` — file đó **ưu tiên hơn** mặc định trong tài liệu này. Nếu chưa có câu trả lời: dùng **mặc định khuyến nghị** đã ghi, để cấu hình được, và ghi rõ trong PR.
4. Tiền: số nguyên VND, `Decimal(14,0)`, sổ cái **chỉ ghi thêm** (append-only), sửa sai bằng bút toán đảo. Không bao giờ sửa/xoá dòng tiền đã ghi.
5. Mọi công thức ở mục 6 có **bộ test số vàng ở mục 13**: test phải xanh trước khi merge.
6. Giao diện tiếng Việt toàn bộ. Thuật ngữ trong UI theo **Bảng thuật ngữ** (mục 3, D2).
7. File `MOCKUP-ALLIANCE.html` đi kèm là **mục tiêu thị giác** cho cổng đối tác và Đài chỉ huy (màu, nhịp chữ, mật độ thông tin). Bám theo nó; số liệu trong đó là minh hoạ.

---

## 1. BÀI TOÁN TRONG MỘT ĐOẠN

Bệnh viện bán **Gói 15 triệu** cho khách. Người mua nhận **30 triệu giá trị chương trình** (dịch vụ thẩm mỹ, chăm sóc sức khỏe, sản phẩm) tự tích chọn theo danh mục, và trở thành **Đối tác** của bệnh viện: giới thiệu người khác mua gói thì nhận **3.000.000đ/hợp đồng**, tư vấn khách làm thêm dịch vụ ngoài gói thì nhận **10–15%** trên tiền thực thu. Đối tác đạt mốc **50 hợp đồng** (hoặc đóng 500 triệu) được **quyền hưởng 2% lợi nhuận** (tối đa 10 suất); đạt **60 hợp đồng** (đóng 570 triệu) được **quyền hưởng 5%** (tối đa 5 suất) kèm phòng làm việc riêng. Quyền hưởng gắn với **điều kiện duy trì hằng tháng** và mất vĩnh viễn nếu ngừng hoạt động 2 tháng liên tiếp theo đúng quy trình thông báo.

App phải trả lời được bốn câu hỏi bất kỳ lúc nào, cho đúng người:
- **Ban điều hành:** Chương trình đang lãi hay lỗ thật? Bệnh viện đang **nợ bao nhiêu dịch vụ** chưa thực hiện? Ai sắp đủ điều kiện, ai sắp mất quyền?
- **Nhân viên:** Khách này còn bao nhiêu quyền lợi, được làm gì hôm nay, ghi nhận cho đối tác nào?
- **Đối tác:** Tôi còn bao nhiêu trong ví, đã kiếm được bao nhiêu, khi nào được trả, còn bao xa tới mốc tiếp theo, tháng này tôi đã đạt duy trì chưa?
- **Kế toán:** Kỳ này phải trả ai bao nhiêu, căn cứ chứng từ nào, đã khoá sổ chưa?

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC: MODULE TRONG ZENITHTASKS

**Chốt: xây module `Đối tác chiến lược` (route `/doi-tac`) trong ZenithTasks + cổng đối tác PWA riêng (route `/p`).** Không làm app độc lập.

Lý do: Zenith đã có đúng những khối mà chương trình này cần, và một app riêng sẽ tạo ra **hai nguồn sự thật về khách hàng và tiền**, đúng loại lỗi mà `FINANCE-DEFINITIONS.md` đang phải dọn.

| Nhu cầu của chương trình | Đã có trong Zenith | Cách dùng lại |
|---|---|---|
| Khách hàng, hồ sơ điều trị, thanh toán | `Customer`, `CaseRecord`, `CaseService`, `Payment` | Người mua gói = `Customer`. Mỗi lần sử dụng quyền lợi dịch vụ gắn vào một `CaseRecord` thật |
| Ghi nhận người giới thiệu | `Collaborator` + `collaboratorId` trên Customer/Lead/Appointment/CaseRecord | Mỗi Đối tác có đúng 1 `Collaborator` làm mỏ neo ghi nhận. **Kiểm tra cửa sổ 6 tháng** (`COLLABORATOR_VISIBILITY_MONTHS`) có xung đột với luật ghi nhận của chương trình không |
| Luật hoa hồng có phiên bản, có test, có duyệt | `ZMechanismDefinition` / `ZMechanismVersion` (COMMISSION, BONUS, REVENUE_SHARE, `ruleSpec`, `testCases`, `effectiveFrom`, duyệt) | Mọi tỷ lệ (3 triệu, 10–15%, 2%, 5%, mốc 50/60) là **mechanism có phiên bản**, không hard-code |
| Dự án đối tác | `ZProject` kiểu `PARTNERSHIP` | Tạo project `DT-15TR` chứa mechanism, nhân sự, cấu hình |
| Kho hàng hóa | `Material`, `StockMovement` | Quyền lợi dạng sản phẩm trừ kho thật |
| Đối soát, khoá kỳ, kỳ kế toán | `AccountingPeriod`, reconciliation, period lock | Kỳ chi trả hoa hồng và kỳ lợi nhuận dùng chung cơ chế khoá |
| Phân quyền, audit, mã hoá SĐT, AI có duyệt | RBAC, `AuditLog`, AES-GCM phone, AI approval gate | Dùng nguyên |

**Cảnh báo phân quyền:** vai trò `SHAREHOLDER` hiện tại được **xem toàn bộ** hệ thống. Đối tác 2%/5% **không phải cổ đông** và **tuyệt đối không được gán role SHAREHOLDER**. Thêm role mới `PARTNER`.

---

## 3. ⛔ QUYẾT ĐỊNH CẦN CHỐT TRƯỚC KHI CODE

Đọc 4 hợp đồng và 7 infographic, tôi thấy chúng **mâu thuẫn nhau ở những điểm quyết định cách app tính tiền**. App chỉ có thể có một luật. Dưới đây là từng điểm, kèm mặc định tôi khuyến nghị.

| # | Vấn đề | Bằng chứng | Mặc định khuyến nghị |
|---|---|---|---|
| **D1** | **Thưởng 5% F1 trên doanh số F2** | Infographic "Chính sách đối tác": F1 nhận 5% tổng doanh số F2. Hợp đồng 2%: *"không cộng kết quả tuyển người qua nhiều cấp"*. Hợp đồng 5%: *"không cộng qua nhiều cấp"* | **Bỏ khỏi v1.** Engine chỉ tính **1 cấp** (người giới thiệu trực tiếp). Hưởng từ kết quả bán hàng của người khác trong mạng lưới là dấu hiệu định danh của kinh doanh đa cấp theo NĐ 40/2018 (sửa bởi NĐ 18/2023) và cần giấy phép riêng. Nếu ban lãnh đạo vẫn muốn, chỉ bật sau khi có ý kiến luật sư bằng văn bản, qua cờ cấu hình `ALLOW_SECOND_LEVEL=false` |
| **D2** | **Thuật ngữ "cổ đông"** | Infographic dùng "Cổ đông F1/F2", "Quyền lợi cổ đông", "chia lợi nhuận theo tỷ lệ góp vốn". Hợp đồng ghi rõ *"không tự xác lập sở hữu cổ phần, quyền biểu quyết"* | Cấm chữ "cổ đông" trong UI, thông báo, bản in sinh ra từ app. Dùng: **Đối tác** (mua gói), **Đối tác Quyền lợi 2%**, **Đối tác Cao cấp 5%**, **Suất quyền lợi**, **Kỳ lợi nhuận**. Lint rule chặn chuỗi "cổ đông" trong `src/app/(app)/doi-tac` và `src/app/p` |
| **D3** | **Phương án 07 "Nhấn mí" chỉ trị giá 15 triệu** | Phiếu chọn: 6 gói trị giá 30tr, gói 07 trị giá 15tr. Hợp đồng gói: *"nhận 30.000.000 đồng sản phẩm hoặc dịch vụ"* | Mô hình **ví quyền lợi 30tr**: chọn gói 07 trừ 15tr, **còn 15tr trong ví** để chọn tiếp. Không bao giờ để khách mất giá trị đã hứa |
| **D4** | **Tổng giá trị gói 5% để trống** | HĐ 5% Điều 1: *"Tổng giá trị sản phẩm/dịch vụ Bên B được nhận: ........ đồng"*. HĐ 2% có số 1,5 tỷ | Mặc định **1,8 tỷ** (60 × 30tr) theo cùng logic gói 2%. Tỷ lệ quy đổi khi quyết toán = 570/1.800. Phải điền vào hợp đồng trước khi thu cọc |
| **D5** | **"Doanh số tổng" là gì** | Bảng chi phí cố định: 3 giám đốc mỗi người **10% doanh số tổng**, kế toán 2%, 3 nhân sự truyền thông mỗi người 2% → **38% doanh số tổng** chi trước khi ra lợi nhuận | Phải định nghĩa bằng văn bản: (a) phạm vi (chỉ chương trình đối tác hay toàn trung tâm/toàn viện), (b) có tính **tiền đóng 500tr/570tr** của đối tác 2%/5% vào doanh số tổng không, (c) tính trên thực thu hay giá trị hợp đồng. App để 3 tham số này cấu hình được và **hiển thị công khai cho đối tác 2%/5% trong Phòng dữ liệu kỳ** (xem mục 7.3) |
| **D6** | **Hoa hồng 3 triệu trả lúc nào, hoàn tiền thì sao** | HĐ: tính hợp đồng *"đã thanh toán đủ, chưa hủy/hoàn tiền tại ngày đối soát"* | Ghi nhận **Chờ** khi khách thanh toán đủ → **Đủ điều kiện** tại kỳ đối soát tháng → **Đã trả**. Gói bị hoàn tiền **sau** khi đã trả: tạo bút toán âm, **bù trừ vào hoa hồng kỳ sau**, không đòi tiền mặt trừ khi chủ chọn khác |
| **D7** | **Lỗ kỳ trước có chuyển sang kỳ sau không** | HĐ: *"Không có lợi nhuận dương thì không chi trả; Bên B không phải bù lỗ"*. Không nói về chuyển lỗ | Mặc định **không chuyển lỗ** (mỗi kỳ độc lập), đúng câu chữ hợp đồng. Cấu hình `LOSS_CARRY_FORWARD=false`. Đây là điểm bệnh viện sẽ bị thiệt nếu có kỳ lỗ lớn; cân nhắc sửa hợp đồng |
| **D8** | **Giá vốn của quyền lợi** | Tên file phiếu chọn có "cost 2tr" | Mỗi mục danh mục có **giá trị chương trình** và **giá vốn dự kiến**. Cần xác nhận "2tr" là giá vốn bình quân một gói hay con số khác |
| **D9** | **Thời hạn gói & hoàn phần chưa dùng khi hết hạn** | HĐ gói: *"Khi chấm dứt hoặc hết hạn, Bên A hoàn phần chưa dùng trong 15 ngày làm việc"* | Mặc định thời hạn **12 tháng**, nhắc khách ở mốc 90/30/7 ngày trước hạn. Lưu ý: điều khoản này nghĩa là **mọi số dư không dùng đều thành tiền phải hoàn**, app phải dự phòng khoản này |
| **D10** | **Người mua có cho người thân dùng không** | Không quy định | Cho phép chủ gói chỉ định tối đa **3 người thụ hưởng**, mỗi lần dùng chủ gói xác nhận (OTP/ký) |
| **D11** | **Tỷ lệ 10–15% ngoài gói ai chốt** | HĐ gói Điều 3: *"......% (chốt từ 10–15%)"*; infographic: *"Theo đơn bác sĩ chốt, tùy từng dịch vụ"* | Bảng tỷ lệ **theo nhóm dịch vụ** (8 nhóm), cấu hình bởi Ban điều hành, có phiên bản. **Bác sĩ không nhìn thấy tỷ lệ hoa hồng** khi chỉ định (tách chỉ định chuyên môn khỏi động cơ tài chính) |
| **D12** | **Khấu trừ thuế TNCN hoa hồng** | HĐ: *"thuế thực hiện theo quy định"* | Cấu hình khấu trừ tại nguồn (mặc định 10% cho khoản chi trả từ 2 triệu/lần cho cá nhân không ký HĐLĐ). **Kế toán xác nhận mức hiện hành trước khi bật** |
| **D13** | **Đối tác 5% "tuyển trực tiếp 03 người"** | HĐ 5% Điều 4 | KPI duy trì chỉ đếm **hợp đồng gói hợp lệ được ghi nhận cho đối tác**, không đếm số người được tuyển. Mỗi hợp đồng ghi nhận cho đúng 1 đối tác, tính 1 lần |

**Một nhận xét thẳng:** cấu trúc hiện tại có ba yếu tố mà cơ quan quản lý thường soi khi đánh giá đa cấp trá hình: (1) người tham gia trả tiền để có quyền giới thiệu và hưởng thưởng, (2) thưởng từ doanh số của người mình tuyển, (3) điều kiện duy trì đo bằng số người tuyển thêm. Hợp đồng đã được soạn cẩn thận để né (2) và (3), nhưng infographic thì không. App là nơi luật thực sự được thi hành, nên app phải đi theo **hợp đồng**, không theo infographic. Tôi khuyến nghị cho luật sư rà lại infographic trước khi phát hành tiếp, vì tài liệu quảng bá cũng là chứng cứ.

---

## 4. NGUYÊN TẮC SẢN PHẨM (mượn từ các ngành khác)

| Nguyên tắc | Học từ | Áp dụng cụ thể |
|---|---|---|
| **Tiền là sổ cái, không phải con số** | Ngân hàng, Stripe | Mọi số dư (ví quyền lợi, hoa hồng, quyền lợi kỳ) đều tính từ các bút toán. Số dư hiển thị luôn bấm vào được để xem từng dòng tạo ra nó |
| **Chờ / Khả dụng / Đã trả** | Stripe Balance, ví điện tử | Hoa hồng có 3 trạng thái hiển thị rõ ràng; đối tác không bao giờ phải hỏi "tiền của tôi đâu" |
| **Hạng và duy trì hạng** | Hạng thẻ hàng không (Vietnam Airlines Lotusmiles) | Đối tác → Đối tác 2% → Đối tác Cao cấp 5%. Thanh tiến độ tới mốc. Duy trì hạng theo tháng như requalification |
| **Vòng duy trì tháng** | Apple Fitness rings | 2 vòng mỗi tháng: **Hợp đồng** (1/1 hoặc 3/3) và **Nhiệm vụ chung** (≥1). Đóng đủ 2 vòng = tháng đạt |
| **Sao kê tháng** | Ngân hàng | Mỗi đối tác có sao kê PDF hằng tháng: số dư đầu, phát sinh, số dư cuối, đã trả |
| **Phòng dữ liệu** | Cổng nhà đầu tư (Carta) | Đối tác 2%/5% xem bảng thu chi kỳ, chứng từ, cách tính, phản hồi trong hạn hợp đồng |
| **Quyết toán minh bạch từng dòng** | Bồi thường bảo hiểm | Màn hình quyết toán khi dừng hợp tác hiện công thức và từng dòng, có xuất PDF ký hai bên |
| **Hồ sơ vụ việc có đồng hồ** | Quản lý vụ việc pháp lý | Quy trình chấm dứt quyền hưởng là một "vụ việc" có mốc thời gian, chứng cứ, đếm 10 ngày làm việc |
| **Liên kết giới thiệu + QR** | Affiliate (Shopee Affiliate) | Mỗi đối tác có mã, link, QR; quét tại quầy để ghi nhận ngay |
| **Bàn phím và lệnh nhanh** | Linear | Nhân viên bán gói/ghi nhận sử dụng trong ≤ 60 giây, có command palette sẵn của Zenith |
| **Sơ đồ ghế** | Đặt vé máy bay | Suất 2% (10 ghế) và 5% (5 ghế) hiển thị như sơ đồ ghế: đã có chủ, đang chờ, trống |

### 4.1 Những thứ KHÔNG xây (anti-features)

1. **Không có cây phả hệ / sơ đồ tuyến dưới.** Đây là giao diện đặc trưng của đa cấp. Chỉ hiển thị danh sách người mình **trực tiếp** giới thiệu.
2. **Không có bảng xếp hạng theo số người tuyển.** Bảng vinh danh (nếu có) xếp theo **mức hài lòng khách hàng** hoặc số khách sử dụng dịch vụ.
3. **Không hiển thị "thu nhập tiềm năng"** cho người chưa mua gói.
4. **Đối tác không xem được hồ sơ y khoa, ảnh trước/sau, chỉ định của khách mình giới thiệu.** Chỉ thấy: tên viết tắt, SĐT che, trạng thái gói, số tiền làm căn cứ hoa hồng.
5. **Không sửa/xoá bút toán.** Chỉ huỷ bằng bút toán đảo có lý do.
6. **Không tự động chuyển khoản.** Mọi lô chi trả cần kế toán lập + giám đốc duyệt.
7. **Không cho bác sĩ thấy hoa hồng** gắn với dịch vụ mình chỉ định.
8. **Không gamification gây áp lực mua thêm** (đếm ngược khuyến mãi giả, "chỉ còn 1 suất" khi không đúng).

---

## 5. VAI TRÒ & QUYỀN

| Vai trò | Ai | Thấy gì | Làm gì |
|---|---|---|---|
| `ADMIN` Ban điều hành | BS Lam, Lê Vân, Nguyễn Quyên | Toàn bộ module | Duyệt mechanism, duyệt công nhận suất 2%/5%, duyệt chấm dứt, duyệt lô chi trả, khoá kỳ lợi nhuận |
| `MANAGER` Kế toán | Bích | Toàn bộ số liệu tiền, chứng từ | Lập đối soát, lập lô chi trả, lập bảng thu chi kỳ, quyết toán |
| `CONSULTANT` / `RECEPTION` | Tư vấn, lễ tân | Khách của ca, ví quyền lợi khi quét mã | Bán gói, thu tiền, ghi nhận đối tác, đặt lịch sử dụng, ghi nhận sử dụng |
| `DOCTOR` | Bác sĩ | Phiếu chọn của khách, hồ sơ điều trị | Xác nhận/điều chỉnh chỉ định trên dịch vụ khách đã chọn; chốt dịch vụ ngoài gói. **Không thấy hoa hồng** |
| `CARE` / Media | Bảo Ngọc, Dương, Tuấn | Lịch đào tạo, yêu cầu quay dựng | Điểm danh Zoom/chương trình, xử lý yêu cầu quay video của đối tác |
| `PARTNER` (mới) | Mọi người mua gói | Chỉ dữ liệu của chính mình (ví, hoa hồng, người mình giới thiệu ở mức tối thiểu) | Chọn quyền lợi, chia sẻ mã, đăng ký lịch, tải tài liệu, xem sao kê |
| `PARTNER` + suất 2%/5% | Đối tác quyền lợi | Thêm: Phòng dữ liệu kỳ lợi nhuận, KPI duy trì, hồ sơ hợp đồng | Phản hồi/khiếu nại bảng thu chi trong hạn, giải trình khi có thông báo |

Ma trận chi tiết theo trang phải đưa vào hệ RBAC hiện có (`permissions`), kèm test từ chối ghi (`qa:write-denial`).

---

## 6. MÔ HÌNH NGHIỆP VỤ & CÔNG THỨC

### 6.1 Thực thể chính (đề xuất, Claude Code tinh chỉnh theo schema hiện tại)

```
Partner                 — 1-1 Customer (người mua), 1-1 Collaborator (mỏ neo ghi nhận), 0-1 User (role PARTNER)
                          code (mã giới thiệu), tier: MEMBER | SEAT_2 | SEAT_5, status, referredByPartnerId (CHỈ để lưu nguồn, không tính tiền cấp 2)

PackageContract         — Hợp đồng gói 15tr. partnerId (chủ gói), soldById, attributedPartnerId (người giới thiệu, ≤1),
                          price=15.000.000, entitlementValue=30.000.000, paidAmount, status, signedAt, expiresAt,
                          fullyPaidAt, cancelledAt, refundedAt, contractDocId
                          RÀNG BUỘC: attributedPartnerId ≠ partnerId (không tự giới thiệu chính mình — xác nhận với chủ)

EntitlementWallet       — 1-1 PackageContract. Số dư = Σ WalletEntry. Không lưu cột số dư "cứng" (hoặc lưu kèm snapshot + kiểm toàn vẹn)
WalletEntry             — append-only: GRANT(+30tr) | REDEEM(-x) | REVERSAL | EXPIRE | REFUND_CONVERSION
Beneficiary             — tối đa 3 người thụ hưởng / gói (D10)

CatalogItem             — mục danh mục: kind = BUNDLE (gói chính A01–A07) | SERVICE | PRODUCT
                          programValue (trị giá chương trình), costEstimate (giá vốn), group (8 nhóm), requiresDoctor, maxPicks…
CatalogVersion          — danh mục có phiên bản; hợp đồng ký với phiên bản nào thì dùng phiên bản đó
Selection (Phiếu chọn)  — khách tích chọn (mong muốn) → bác sĩ xác nhận chỉ định → thành Redemption
Redemption              — 1 lần sử dụng: walletEntry + CaseRecord/CaseService (dịch vụ) hoặc StockMovement (sản phẩm)
                          customerConfirmation (OTP/chữ ký) bắt buộc; overage (vượt ví) phải có đồng ý trước

AddOnSale               — dịch vụ ngoài gói (bảng giá ưu đãi B), liên kết CaseService + Payment thật
CommissionEntry         — append-only. type: REFERRAL_FLAT (3tr) | ADDON_PCT | MILESTONE_BONUS | OFFSET (cấn trừ) | CLAWBACK
                          state: PENDING → ELIGIBLE → IN_BATCH → PAID | VOID; sourceRef; mechanismVersionId; taxWithheld
PayoutBatch             — lô chi trả theo kỳ: lập (kế toán) → duyệt (admin) → đã chuyển (chứng từ)

ProfitSeat              — suất quyền lợi: rate (2%/5%), seatNo (1..10 / 1..5), partnerId, path: A_REFERRALS | B_PURCHASE | PREMIUM_PURCHASE,
                          recognizedAt, effectiveFrom, status: ACTIVE | WARNED | IN_TERMINATION | TERMINATED | WITHDRAWN
SeatPurchase            — phương án B / gói 5%: totalValue, listPrice, offset, netPayable, deposit, installments, dueDate
ProfitScope             — phạm vi pháp nhân/hoạt động tính lợi nhuận (ghi trong hợp đồng), có phiên bản
ProfitPeriod            — kỳ (tháng/quý/năm): revenue, costLines[], profit, status: DRAFT → PUBLISHED (gửi đối tác) → DISPUTE_WINDOW → LOCKED → PAID
ProfitCostLine          — từng khoản chi theo Bảng thu chi ký kèm; category khớp danh mục được phép khấu trừ; chứng từ đính kèm
ProfitShareEntry        — tiền hưởng của từng suất trong kỳ (pro-rata theo ngày nếu suất bắt đầu/chấm dứt giữa kỳ)

MaintenanceMonth        — mỗi suất × mỗi tháng: contractsCount, contractsRequired (1 hoặc 3), activitiesCount, status
PartnerActivity         — nhiệm vụ chung: dự họp lớn, tổ chức chương trình, hỗ trợ khách/đội nhóm; evidence (biên bản/ảnh/điểm danh)
TerminationCase         — vụ việc chấm dứt: mốc nhắc tháng 1, mốc căn cứ tháng 2, hạn giải trình (10 ngày làm việc), quyết định, ngày hiệu lực
Settlement              — quyết toán khi dừng: dòng công thức, số tiền, chứng từ, ký xác nhận
TrainingEvent           — Zoom (2/tuần), chương trình lớn (1/tuần), buổi đào tạo; điểm danh → tự sinh PartnerActivity
MediaRequest            — yêu cầu quay/dựng video của đối tác → giao Dương/Tuấn → trạng thái
PartnerDocument         — hợp đồng, phụ lục, bảng giá ký kèm, biên bản công nhận, thông báo
WorkingCalendar         — ngày nghỉ lễ VN để đếm "ngày làm việc"
```

### 6.2 Máy trạng thái hợp đồng gói

```
DRAFT ──ký──▶ SIGNED ──thu đủ 15tr──▶ ACTIVE ──hết ví──▶ CONSUMED
                │                        │
                │                        ├─ hết hạn ──▶ EXPIRED ──▶ (hoàn phần chưa dùng, D9)
                │                        └─ chấm dứt ──▶ TERMINATED ──▶ (hoàn phần chưa dùng)
                └─ huỷ trước khi thu đủ ──▶ CANCELLED (hoàn số đã thu)
```

### 6.3 Công thức bắt buộc (trích nguyên từ hợp đồng)

**F1. Hoàn phần chưa dùng của gói 15tr** (HĐ gói, Điều 4)
```
tiềnHoàn = 15.000.000 × sốDưVí / 30.000.000        (làm tròn xuống đồng)
hạn: 15 ngày làm việc kể từ chấm dứt/hết hạn
```

**F2. Hoa hồng giới thiệu**
```
1 hợp đồng gói hợp lệ = 3.000.000đ cho attributedPartner
hợp lệ = có thật + thanh toán đủ + chưa huỷ/hoàn tại ngày đối soát
```

**F3. Thù lao ngoài gói** (HĐ gói, Điều 3)
```
thùLao = tỷLệ(nhóm dịch vụ, 10–15%) × (tiền dịch vụ ngoài gói THỰC THU − giảm giá − hoàn tiền)
cờ: gồm thuế / chưa thuế (ghi theo hợp đồng của từng đối tác)
chỉ tính khách do đối tác TRỰC TIẾP tư vấn, giới thiệu, được Bên A xác nhận
```

**F4. Công nhận suất 2%**
```
Phương án A: 50 hợp đồng gói hợp lệ ghi nhận trực tiếp cho đối tác, danh sách hai bên ký
Phương án B: giá trị gói 1.500.000.000 | giá 750.000.000 | cấn trừ ưu đãi 250.000.000 | thực đóng 500.000.000
             cọc 50.000.000 (trừ vào 500tr) + 450.000.000 trong 01 tháng kể từ ngày cọc
A và B không cộng trùng. Khoản cấn trừ 250tr ghi vào sổ như OFFSET đã sử dụng, không bao giờ chi tiền mặt lần hai.
Phương án B KHÔNG được sinh 50 hợp đồng khách hàng ảo.
```

**F5. Công nhận suất 5%**
```
mốc 60 × 15.000.000 = 900.000.000
cấn trừ 330.000.000 = 180.000.000 (thưởng trực tiếp) + 150.000.000 (thưởng mốc)
thực đóng 570.000.000 = cọc 50.000.000 + 520.000.000 trong 01 tháng
giá trị quyền lợi nhận: theo D4 (mặc định 1.800.000.000)
```

**F6. Tiền hưởng lợi nhuận mỗi kỳ**
```
lợiNhuậnKỳ = doanhThu(phạm vi) − Σ chi phí hợp lệ theo Bảng thu chi ký kèm (cố định + vận hành + [huấn luyện với suất 5%] + thuế)
tiềnHưởng(suất) = tỷLệ × max(0, lợiNhuậnKỳ) × (sốNgàySuấtHiệuLựcTrongKỳ / sốNgàyKỳ)
không chuyển lỗ (D7); không trừ trùng; không tự thêm khoản chi ngoài danh mục ký kèm
```

**F7. Quyết toán suất 2% phương án B khi xin dừng** (HĐ 2%, Điều 5)
```
quyếtToán = tiềnThựcNộp − giáTrịĐãGiao/SửDụng × (500.000.000 / 1.500.000.000) + thưởngMốcCònPhảiTrảĐãXácNhận
cọc nằm trong tiền thực nộp, KHÔNG tự động mất cọc
hoàn phần dương trong 15 ngày làm việc; phần đang tranh chấp không giữ lại khoản đã thống nhất
```

**F8. Quyết toán suất 5%** (HĐ 5%, Điều 5)
```
quyếtToán = tiềnThựcNộp (gồm cọc) + lợiNhuận/thưởng còn phải trả đã xác nhận
            − giáTrịSảnPhẩm/DịchVụThựcNhận × (570.000.000 / tổngGiáTrịGói)
            − chiPhíTrựcTiếpHợpLýĐãDuyệt (có chứng từ)
```

**F9. Mục tiêu hỗ trợ thu hồi vốn (suất 5%)** (HĐ 5%, Điều 3)
```
thuHồi = Σ dòng tiền hợp pháp đối tác THỰC NHẬN từ hợp tác, sau chi phí và thuế
KHÔNG tính giá niêm yết, số dư dịch vụ, doanh số chưa thu
hiển thị: đã thu hồi X / 570tr trong cửa sổ 3–6 tháng của kế hoạch — đây là mục tiêu, KHÔNG phải bảo lãnh
```

### 6.4 Quy trình duy trì và chấm dứt quyền hưởng (phải đúng từng bước)

```
Mỗi tháng, mỗi suất đang hiệu lực:
  vòng 1 — Hợp đồng: ≥1 (suất 2%) hoặc ≥3 (suất 5%) hợp đồng gói hợp lệ ghi nhận cho đối tác
  vòng 2 — Nhiệm vụ chung: ≥1 nhiệm vụ có biên bản/điểm danh

  Thiếu vòng 1, có vòng 2  → CHỈ NHẮC + kế hoạch khắc phục. KHÔNG được coi là ngừng hoạt động.
  Thiếu vòng 2 tháng thứ 1 → hệ thống soạn THÔNG BÁO NHẮC (kèm kế hoạch, yêu cầu phản hồi) → admin duyệt gửi → suất = WARNED
  Thiếu vòng 2 tháng thứ 2 liên tiếp → mở TerminationCase: đóng gói căn cứ, gửi đối tác,
                                      đếm 10 NGÀY LÀM VIỆC giải trình (theo WorkingCalendar) → suất = IN_TERMINATION
  Hết hạn, không giải trình hợp lệ → admin ra QUYẾT ĐỊNH CHẤM DỨT → suất = TERMINATED từ ngày hiệu lực
       → mất vĩnh viễn quyền các kỳ sau; phần đã phát sinh đến ngày hiệu lực vẫn tính pro-rata (F6) và thanh toán

  Không tính vào 2 tháng: tạm nghỉ đã duyệt, bất khả kháng, hoặc Bên A không bố trí/cho phép tham gia
  (app phải ghi nhận cả các trường hợp Bên A không giao kế hoạch — nếu tháng đó Bên A không giao nhiệm vụ, tháng đó KHÔNG tính)
  Hệ thống KHÔNG BAO GIỜ tự chấm dứt. Chỉ người có quyền ADMIN bấm, sau khi đủ các mốc.
```

Lý do làm kỹ: đây là điểm tranh chấp lớn nhất trong tương lai (một quyền hưởng vô thời hạn bị cắt). Mọi thông báo phải có dấu thời gian gửi, kênh gửi, bằng chứng đã nhận.

---

## 7. MÀN HÌNH

### 7.1 Ban điều hành — "Đài chỉ huy Alliance" (`/doi-tac`)

Một màn hình, đọc trong 10 giây. Bố cục desktop 12 cột:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Kỳ: Tháng 11/2026 ▾     [Mô phỏng]  [Xuất báo cáo]           ⌘K Tìm đối tác…  │
├──────────────┬──────────────┬──────────────┬──────────────┬───────────────────┤
│ GÓI BÁN THÁNG│ THỰC THU     │ NGHĨA VỤ     │ HOA HỒNG     │ LỢI NHUẬN KỲ (ƯỚC)│
│ 42  ▲12%     │ 630tr        │ DỊCH VỤ CÒN  │ PHẢI TRẢ     │ 118tr             │
│              │              │ NỢ 1,92 tỷ   │ 146tr        │ quỹ đối tác 29%   │
│              │              │ (giá vốn ≈?) │ chờ/khả dụng │                   │
├──────────────┴──────────────┴──────────────┴──────────────┴───────────────────┤
│ PHỄU: Quan tâm → Ký → Thu đủ → Đã dùng lần 1 → Dùng hết → Mua thêm ngoài gói  │
├───────────────────────────────────────────┬───────────────────────────────────┤
│ SƠ ĐỒ GHẾ                                  │ CẦN XỬ LÝ HÔM NAY                  │
│ Suất 2%  ● ● ● ● ● ● ● ○ ○ ○   7/10        │ ⚠ 2 suất thiếu nhiệm vụ tháng này  │
│ Suất 5%  ★ ★ ★ ○ ○              3/5        │ ⏱ 1 vụ chấm dứt: còn 4 ngày LV     │
│ Gần mốc: Nguyễn A 46/50 · Trần B 57/60     │ 💳 Lô chi trả T10 chờ duyệt        │
│                                            │ 📅 118 gói hết hạn trong 30 ngày   │
├───────────────────────────────────────────┴───────────────────────────────────┤
│ BẢN ĐỒ NHIỆT DUY TRÌ (suất × 6 tháng gần nhất): ■ đạt  ▣ thiếu HĐ  □ thiếu NV  │
└───────────────────────────────────────────────────────────────────────────────┘
```

Thẻ **Nghĩa vụ dịch vụ còn nợ** là thẻ quan trọng nhất: mỗi gói bán ra là một khoản bệnh viện **nợ khách 30 triệu giá trị**. Hiển thị cả theo giá trị chương trình và theo giá vốn dự kiến (D8), kèm dự phòng tiền phải hoàn khi hết hạn (D9).

Trang con:
- `/doi-tac/danh-sach` — bảng đối tác: hạng, ví, hoa hồng chờ/khả dụng, KPI tháng, trạng thái suất. Lọc nhanh "có rủi ro".
- `/doi-tac/[id]` — hồ sơ 360: dòng thời gian (ký gói, giới thiệu, sử dụng, hoa hồng, nhiệm vụ, thông báo), hợp đồng, sao kê.
- `/doi-tac/suat` — sơ đồ ghế, công nhận suất (wizard theo F4/F5), danh sách chờ.
- `/doi-tac/duy-tri` — bản đồ nhiệt, hàng đợi thông báo nhắc, vụ việc chấm dứt có đồng hồ đếm ngày làm việc.
- `/doi-tac/hoa-hong` — đối soát tháng, lô chi trả, khấu trừ thuế.
- `/doi-tac/loi-nhuan` — kỳ lợi nhuận: nhập/import bảng thu chi, xem trước tiền hưởng từng suất, công bố, cửa sổ phản hồi, khoá, trả.
- `/doi-tac/danh-muc` — danh mục quyền lợi có phiên bản (gói chính A01–A07, dịch vụ ngoài gói 8 nhóm, sản phẩm), giá trị chương trình, giá vốn.
- `/doi-tac/co-che` — tỷ lệ/mốc dưới dạng mechanism có phiên bản; chạy test case trước khi kích hoạt.
- `/doi-tac/mo-phong` — **Mô phỏng kinh tế đơn vị** (mục 9).
- `/doi-tac/hoc-vien` — lịch Zoom/chương trình lớn, điểm danh, lộ trình 4 bước xây kênh, yêu cầu quay dựng.

### 7.2 Nhân viên — 3 luồng nhanh

**Bán gói (≤ 90 giây):** Tìm/tạo khách (5 số cuối SĐT như Tiếp nhận) → quét QR/nhập mã đối tác giới thiệu (hiện tên + ảnh để xác nhận đúng người) → chọn phiên bản danh mục → sinh hợp đồng từ mẫu (điền sẵn) → thu tiền (một phần/đủ) → in phiếu thu → kích hoạt ví khi thu đủ.

**Phiếu chọn số hoá:** Khách tích trên máy tính bảng tại quầy hoặc trên điện thoại (cổng đối tác). Ràng buộc theo danh mục: gói chính chọn 1; A01 tối đa 3/5 vùng; A02 chọn 1/2; A04 nhiều vùng nhưng ghi chú "số vùng do bác sĩ quyết sau khám". Phần B hiện giá ưu đãi, thanh toán riêng. Kết quả là **mong muốn**, chưa phải chỉ định.

**Ghi nhận sử dụng tại quầy:** Quét mã khách → thẻ ví (số dư, hạn, người thụ hưởng) → chọn mục đã được bác sĩ chỉ định → hiện "trừ 30.000.000 → còn 0" → khách xác nhận OTP/ký → tạo CaseService + WalletEntry trong một transaction. Vượt ví → bắt buộc màn hình đồng ý trước, rồi mới tạo AddOnSale.

### 7.3 Đối tác — Cổng PWA `/p` (mobile-first)

```
┌──────────────────────────────┐
│ Chào chị Hạnh      🔔  ⚙     │
│ ┌──────────────────────────┐ │
│ │ HỒNG PHÚC ALLIANCE       │ │  ← thẻ ví kiểu thẻ ngân hàng, nền xanh lục đậm, viền vàng
│ │ Ví quyền lợi             │ │
│ │ 18.000.000đ / 30.000.000 │ │
│ │ ▓▓▓▓▓▓▓▓░░░░  hạn 11/2027│ │
│ │ ĐỐI TÁC · HP-2K7Q        │ │
│ └──────────────────────────┘ │
│ [Chọn quyền lợi] [Đặt lịch]   │
│                               │
│ THU NHẬP                      │
│ Khả dụng 6.000.000  ·  Chờ 3tr│
│ Đã nhận từ đầu: 21.600.000     │
│                               │
│ HÀNH TRÌNH LÊN HẠNG           │
│ ◯────────●──────────◎         │
│ 0     12 hợp đồng    50 → 2%  │
│                               │
│ THÁNG NÀY  (nếu có suất)      │
│ ◐ Hợp đồng 1/1  ◑ Nhiệm vụ 0/1│
│ ▸ Zoom thứ Năm 20:00 — đăng ký│
│                               │
│ [ Chia sẻ mã giới thiệu  QR ] │
├──────────────────────────────┤
│ Trang chủ · Ví · Thu nhập ·   │
│ Học viện · Tôi               │
└──────────────────────────────┘
```

Tab:
- **Ví:** lịch sử dùng (sao kê), chọn quyền lợi (phiếu chọn), người thụ hưởng, hạn dùng, yêu cầu hoàn phần chưa dùng.
- **Thu nhập:** dòng thời gian từng khoản: *"Chị Lan (SĐT ***482) thanh toán đủ gói — +3.000.000 — Chờ đối soát 30/11"*. Lô chi trả, chứng từ, thuế đã khấu trừ. Sao kê PDF tháng.
- **Học viện:** lộ trình 4 bước (Định hướng kênh → Thực hành quay–dựng–đăng → Góp ý & hỗ trợ online → Kết nối & triển khai), lịch Zoom 2 buổi/tuần, chương trình lớn hằng tuần, gửi yêu cầu quay dựng, kho nội dung **đã được bệnh viện duyệt** để đăng (hợp đồng cấm đối tác tự cam kết hiệu quả).
- **Tôi:** hợp đồng & phụ lục, mã/QR, tài khoản nhận tiền, CCCD/MST (mã hoá), cài đặt thông báo.

Riêng đối tác có suất 2%/5%, thêm tab **Quyền lợi**:
- Thẻ suất (số ghế, ngày hiệu lực, trạng thái), vòng duy trì tháng, lịch sử 12 tháng.
- **Phòng dữ liệu kỳ:** bảng thu chi kỳ theo đúng danh mục khấu trừ đã ký, chứng từ, công thức tiền hưởng, nút **Phản hồi** (mở trong số ngày hợp đồng quy định), trạng thái thanh toán.
- Suất 5%: tiến độ mục tiêu thu hồi vốn (F9) với dòng chữ cố định "Mục tiêu hỗ trợ, không phải bảo lãnh hoàn vốn".
- Thông báo pháp lý (nhắc, căn cứ, quyết định) có xác nhận đã đọc.

---

## 8. NGÔN NGỮ THIẾT KẾ

**Hai lớp thương hiệu, một hệ thống:**
- **Nội bộ** giữ nguyên token Zenith (đỏ hoa phượng `brand-*`, vàng `accent-*`, Be Vietnam Pro) để nhân viên không phải học giao diện mới.
- **Cổng đối tác** dùng sub-brand **Alliance**: xanh lục đậm + vàng ánh kim, **khớp với bộ infographic và bảng giá đối tác đã phát** — đối tác mở app thấy ngay đúng "thương hiệu chương trình" mình đã ký.

```css
/* Token bổ sung cho cổng đối tác (thêm vào @theme, không sửa token Zenith) */
--color-alliance-950: #052e25;   /* nền thẻ ví, header */
--color-alliance-900: #073b30;
--color-alliance-800: #0b4d3e;
--color-alliance-700: #0f6650;
--color-alliance-600: #13805f;   /* nút chính */
--color-alliance-100: #dcf2e9;
--color-alliance-50:  #f0faf6;
--color-gold-500: #c9a24a;       /* viền, số tiền nhấn mạnh, hạng */
--color-gold-300: #e6cf8f;
--color-gold-100: #f8efd6;
--color-ink: #0f1a17;
--color-positive: #15803d; --color-pending: #b45309; --color-negative: #b91c1c;
```

Quy tắc:
1. **Số tiền là nhân vật chính:** chữ số `tabular-nums`, nhóm nghìn bằng dấu chấm, đơn vị "đ" nhỏ hơn 40%. Số lớn rút gọn có tooltip đủ số (1,92 tỷ → 1.920.000.000đ).
2. **Màu trạng thái chỉ có 3 nghĩa:** xanh = đã chắc chắn (đã trả, đã đạt), hổ phách = đang chờ, đỏ = cần hành động. Không dùng màu để trang trí.
3. **Mỗi con số bấm vào được** để mở các bút toán tạo ra nó (drill-down kiểu Stripe).
4. **Vàng dùng tiết kiệm:** chỉ cho hạng, mốc, viền thẻ. Không phủ vàng toàn trang như infographic in.
5. **Mobile-first cho cổng đối tác:** vùng chạm ≥ 44px, thanh tab dưới, hoạt động tốt trên Android tầm trung, tải trang đầu < 2s trên 4G.
6. **Trạng thái rỗng có hướng dẫn hành động** (ví dụ: "Chưa có hợp đồng nào tháng này — chia sẻ mã của bạn" + nút QR).
7. **Chuyển động tối thiểu:** vòng duy trì tự lấp khi mở tháng, thanh tiến độ trượt khi có hợp đồng mới. Tôn trọng `prefers-reduced-motion`.
8. **Truy cập:** tương phản AA, không truyền thông tin chỉ bằng màu (luôn kèm biểu tượng/chữ).

---

## 9. MÔ PHỎNG KINH TẾ ĐƠN VỊ (màn hình `/doi-tac/mo-phong`)

Đây là màn hình tôi đề nghị làm sớm, vì nó trả lời câu hỏi chương trình có bền không trước khi bán thêm suất.

Tham số (thanh trượt): số gói/tháng, tỷ lệ khách mua thêm ngoài gói và giá trị trung bình, tỷ lệ hoa hồng ngoài gói, giá vốn bình quân/gói, tỷ lệ dùng hết ví, tỷ lệ hoàn khi hết hạn, chi phí cố định/tháng, số suất 2%/5% đang hiệu lực, cách hiểu "doanh số tổng" (D5).

**Ví dụ minh hoạ với giả định cần xác nhận** (1 gói, không mua thêm, giá vốn 2tr theo tên file, 38% doanh số tổng chi theo bảng chi phí cố định):

| Dòng | Số tiền |
|---|---|
| Thu gói | 15.000.000 |
| Hoa hồng giới thiệu (20%) | −3.000.000 |
| 38% doanh số tổng cho nhân sự/ban điều hành | −5.700.000 |
| Giá vốn quyền lợi (giả định) | −2.000.000 |
| **Đóng góp mỗi gói, trước lương cố định, mặt bằng, marketing, thuế** | **4.300.000** |

Lương cố định trong bảng là 44.000.000/tháng (3 × 8tr + 20tr), nên **riêng phần lương cố định đã cần khoảng 10–11 gói/tháng để hoà vốn**, chưa kể mặt bằng, marketing, thuế. Sau đó, tối đa **45% lợi nhuận còn lại** (10 × 2% + 5 × 5%) thuộc về các suất quyền lợi. Nếu giá vốn thực tế cao hơn 2tr (30 triệu giá trị dịch vụ thẩm mỹ thường không chỉ tốn 2tr), con số này âm nhanh. Mô phỏng phải cho thấy điều đó bằng một biểu đồ thác nước (waterfall) trước khi ai đó ký thêm suất.

---

## 10. YÊU CẦU PHI CHỨC NĂNG

- **Toàn vẹn tiền:** mọi thao tác tiền trong 1 transaction; khoá idempotency cho thu tiền, ghi nhận sử dụng, lập lô chi trả; script kiểm toàn vẹn thêm vào `db:check-integrity` (Σ WalletEntry = số dư; Σ CommissionEntry theo lô = số tiền lô; không có hợp đồng ghi nhận cho 2 đối tác).
- **Khoá kỳ:** kỳ hoa hồng và kỳ lợi nhuận đã khoá thì không ghi thêm; sửa sai đi vào kỳ mở kế tiếp.
- **Audit before/after** cho mọi thay đổi trên: tỷ lệ, người được ghi nhận, trạng thái suất, khoản chi trong kỳ lợi nhuận. (Rút kinh nghiệm SEC-004 trong đợt red-team 08/2026: chủ hồ sơ tự đặt `commissionAmount` mà audit thiếu before/after.)
- **Tách quyền hai người:** người lập ≠ người duyệt cho: công nhận suất, lô chi trả, khoá kỳ lợi nhuận, quyết định chấm dứt.
- **Bảo mật dữ liệu cá nhân:** SĐT, CCCD, tài khoản ngân hàng mã hoá như SĐT hiện tại; đối tác chỉ thấy SĐT che của người mình giới thiệu; tuân thủ đồng ý xử lý dữ liệu (đã có `consent`).
- **Rate limit** cho đăng nhập cổng đối tác và OTP (dùng rate limiter đã vá SEC-001).
- **Phiên bản hoá:** danh mục, mechanism, mẫu hợp đồng, bảng thu chi đều có phiên bản; mọi bút toán lưu id phiên bản đã dùng.
- **Ngày làm việc:** mọi hạn "ngày làm việc" tính theo `WorkingCalendar` (lễ Tết VN do admin cấu hình hằng năm).
- **Thông báo:** web push (đã có) + Zalo OA (đã có kênh) cho: hoa hồng mới, lô đã trả, nhắc hạn ví, nhắc duy trì, thông báo pháp lý.
- **Xuất:** sao kê đối tác PDF, danh sách hợp đồng phục vụ công nhận suất (để hai bên ký), biên bản quyết toán, bảng thu chi kỳ.

---

## 11. AI TRONG MODULE (dùng governance AI sẵn có, mọi hành động có duyệt)

1. **Trợ lý đối soát:** đề xuất danh sách hoa hồng đủ điều kiện kỳ, chỉ ra hợp đồng bất thường (cùng người giới thiệu nhiều gói trong ngày, cùng tài khoản thanh toán, hoàn tiền ngay sau khi đủ mốc).
2. **Soạn thông báo duy trì/chấm dứt** đúng mẫu hợp đồng, admin duyệt trước khi gửi.
3. **Trả lời đối tác trong cổng** các câu "vì sao khoản này đang chờ", dựa trên bút toán thật, không bịa.
4. **Kiểm tra nội dung đối tác muốn đăng** so với danh sách cấm (cam kết hiệu quả, dùng hình ảnh bác sĩ không được duyệt) trước khi xin bệnh viện xác nhận.

---

## 12. LỘ TRÌNH THI CÔNG

Mỗi giai đoạn kết thúc bằng: typecheck, test xanh (gồm test số vàng mục 13), cập nhật VERSION/CHANGELOG/checks theo quy ước repo, demo trên seed.

| Giai đoạn | Phạm vi | Tiêu chí nghiệm thu |
|---|---|---|
| **P0 — Nền móng** (1–2 phiên) | Role `PARTNER`; schema Partner/PackageContract/Wallet/Catalog/CommissionEntry/WorkingCalendar; ZProject `DT-15TR` + mechanism REFERRAL_FLAT, ADDON_PCT; seed danh mục từ phiếu chọn hiện có (A01–A07, B 8 nhóm) | Migration chạy sạch; seed tạo đúng 7 gói chính + toàn bộ dịch vụ B với giá; test F1, F2 xanh |
| **P1 — Gói 15tr vận hành được** | Luồng bán gói, thu tiền, kích hoạt ví, phiếu chọn số hoá, bác sĩ xác nhận chỉ định, ghi nhận sử dụng, hoàn phần chưa dùng, nhắc hạn | Bán → dùng → hết ví trên seed; số dư ví luôn = Σ bút toán; OTP xác nhận bắt buộc |
| **P2 — Hoa hồng & cổng đối tác** | Ghi nhận giới thiệu (mã/QR), hoa hồng 3tr và 10–15%, đối soát tháng, lô chi trả 2 bước, khấu trừ thuế; cổng `/p`: ví, thu nhập, chia sẻ mã, sao kê | Đối tác tự xem được mọi khoản với trạng thái đúng; hoàn tiền sinh bút toán bù trừ (D6) |
| **P3 — Suất 2%/5% & duy trì** | Wizard công nhận suất (A/B/5%), cấn trừ, cọc + trả góp, sơ đồ ghế, vòng duy trì tháng, hoạt động + bằng chứng, quy trình nhắc → vụ việc chấm dứt có đếm ngày làm việc | Toàn bộ kịch bản T6–T9, T12 xanh; không có đường nào để hệ thống tự chấm dứt |
| **P4 — Kỳ lợi nhuận & quyết toán** | Phạm vi lợi nhuận, bảng thu chi kỳ + chứng từ, công bố, cửa sổ phản hồi, khoá, chi trả pro-rata; quyết toán F7/F8; tab Quyền lợi + Phòng dữ liệu trong cổng | T5, T2–T4 xanh; đối tác 2% xem được bảng thu chi và gửi phản hồi trong hạn |
| **P5 — Đài chỉ huy, mô phỏng, học viện** | Dashboard mục 7.1 (gồm thẻ Nghĩa vụ dịch vụ còn nợ), mô phỏng kinh tế mục 9, lịch Zoom/chương trình + điểm danh tự sinh hoạt động, yêu cầu quay dựng, AI mục 11 | Ban điều hành trả lời được 4 câu hỏi ở mục 1 trong một màn hình |

Nếu cần ưu tiên: **P0 → P1 → P2** là đủ để chương trình vận hành hợp pháp và minh bạch với đối tác thường. P3–P4 chỉ cần trước khi ký suất 2%/5% đầu tiên — và **không nên ký suất nào trước khi P3 xong**, vì điều kiện duy trì và quy trình chấm dứt không thể quản bằng Excel mà không phát sinh tranh chấp.

---

## 13. BỘ TEST SỐ VÀNG (bắt buộc)

| ID | Kịch bản | Kết quả đúng |
|---|---|---|
| T1 | Gói 15tr, đã dùng 18tr, số dư 12tr, hết hạn | Hoàn 15.000.000 × 12/30 = **6.000.000đ**, hạn 15 ngày làm việc |
| T2 | Suất 2% phương án B: đã nộp 500tr, đã dùng 600tr giá trị, không thưởng mốc tồn | 500 − 600 × 500/1.500 = **300.000.000đ** hoàn |
| T3 | Phương án B: mới cọc 50tr, chưa dùng, xin dừng | Hoàn **50.000.000đ** (không mất cọc) |
| T4 | Suất 5% (D4 = 1,8 tỷ): đã nộp 570tr, lợi nhuận còn phải trả đã xác nhận 12tr, đã nhận 540tr giá trị, không chi phí trực tiếp | 570 + 12 − 540 × 570/1.800 = **411.000.000đ** |
| T5 | Suất 2%, kỳ Q1 lợi nhuận −50tr, kỳ Q2 +200tr, D7 không chuyển lỗ | Q1 = **0**; Q2 = 2% × 200tr = **4.000.000đ** |
| T6 | Suất 2% bắt đầu ngày 16 của kỳ tháng 30 ngày, lợi nhuận kỳ 300tr | 2% × 300tr × 15/30 = **3.000.000đ** |
| T7 | Suất 2%, tháng M có nhiệm vụ nhưng 0 hợp đồng | Chỉ **nhắc**, trạng thái không chuyển WARNED |
| T8 | Suất 2%, M1 và M2 không nhiệm vụ, M2 bệnh viện không giao kế hoạch | M2 **không tính**; không mở vụ chấm dứt |
| T9 | M1, M2 không nhiệm vụ, có giao kế hoạch; giải trình nộp ngày làm việc thứ 11 | Vụ việc cho phép admin quyết định chấm dứt; quyền hưởng đến ngày hiệu lực vẫn tính pro-rata |
| T10 | Đăng ký suất 2% thứ 11 | Bị từ chối / vào danh sách chờ |
| T11 | Một hợp đồng gói gán cho 2 đối tác | Bị chặn ở tầng DB (unique) và tầng nghiệp vụ |
| T12 | Khách trả 10tr/15tr | Hoa hồng **không** đủ điều kiện; trả đủ → đủ điều kiện ở kỳ đối soát; hoàn tiền sau khi trả → bút toán **−3.000.000** bù trừ kỳ sau |
| T13 | Dịch vụ ngoài gói 20tr, giảm 2tr, tỷ lệ 12% | Thù lao 12% × 18tr = **2.160.000đ** |
| T14 | Suất 5%: 330tr đã cấn trừ, sau đó 60 hợp đồng thật được ghi nhận | Không chi lại 180tr thưởng trực tiếp / 150tr thưởng mốc đã cấn trừ |
| T15 | Chọn gói A07 (15tr giá trị) | Ví còn **15.000.000đ** để chọn tiếp (D3) |
| T16 | Ghi nhận sử dụng vượt ví 5tr không có đồng ý trước | Bị chặn |
| T17 | Engine nhận yêu cầu tính thưởng F1 từ doanh số F2 khi `ALLOW_SECOND_LEVEL=false` | Từ chối, ghi log |

---

## 14. CÂU HỎI CÒN MỞ (chủ trả lời dần, không chặn P0)

1. Phiếu chọn bản đầy đủ cho nhóm **chăm sóc sức khỏe, spa, sản phẩm Tasy** khi nào có? (Phiếu thẩm mỹ hiện tại sẽ dùng làm danh mục v0; app nhập danh mục mới qua import Excel theo phiên bản.)
2. Đối tác có được tự mua gói thứ hai cho chính mình và tính vào KPI không?
3. Một khách đã là khách cũ của bệnh viện (đã có `collaboratorId` khác) được đối tác mới giới thiệu mua gói — ghi nhận cho ai?
4. Sản phẩm Tasy trong quyền lợi: trừ kho tại bệnh viện hay giao từ nhà sản xuất?
5. Chương trình có mở cho cơ sở Hà Nội / bệnh viện tiếp theo không? (Ảnh hưởng `ProfitScope` và việc quyền lợi "không tự áp dụng cho bệnh viện mới".)
6. Kỳ đối soát lợi nhuận: tháng, quý hay năm? (Mặc định đề xuất: **quý**.)

---

## PHỤ LỤC A — Dữ liệu seed danh mục v0 (từ phiếu chọn hiện có)

**Gói chính (BUNDLE), chọn 1:**
| Mã | Tên | Trị giá chương trình | Ràng buộc |
|---|---|---|---|
| A01 | Xoá nhăn / thon gọn hàm | 30.000.000 | chọn tối đa 3/5: nhăn trán, cau mày, ấn đường, đuôi mắt, thon gọn hàm |
| A02 | Giảm tiết mồ hôi nách / thon gọn vai | 30.000.000 | chọn 1/2 |
| A03 | HIFU nâng cơ — 2 buổi | 30.000.000 | 2 buổi |
| A04 | HA làm đầy — 5 hộp | 30.000.000 | 12 vùng; số vùng do bác sĩ quyết sau khám |
| A05 | Căng chỉ mặt — 4 sợi | 30.000.000 | |
| A06 | Nâng mũi bằng chỉ — 4 sợi | 30.000.000 | |
| A07 | Nhấn mí | 15.000.000 | xem D3 |

**Dịch vụ ngoài gói (SERVICE), 8 nhóm, giá ưu đãi:** Thẩm mỹ mắt (14 mục, 3.599.000–24.999.000) · Thẩm mỹ mũi (16 mục, 4.999.000–55.999.000; thay sụn cộng vật liệu) · Cằm & miệng (9 mục, 5.000.000–18.500.000) · Má, thái dương & căng da mặt (13 mục, 3.999.000–31.999.000) · Thẩm mỹ ngực (18 mục, 4.999.000–89.999.000) · Hút mỡ & cấy mỡ (12 mục, 5.999.000–54.999.000) · Tân trang vùng kín (12 mục, 6.499.000–23.999.000) · Chỉ – Filler – Botox (13 mục; đơn vị /sợi, /đv, /lần). Claude Code đọc `docs/doi-tac/nguon/phieu-chon-tham-my.md` (bản gốc .docx cùng thư mục) để nhập đủ từng dòng.

> Lưu ý dữ liệu: "Hút mỡ mặt trước/sau (6 vùng)" ghi **29.999.999** — nghi gõ nhầm từ 29.999.000, cần xác nhận. "Hút mỡ má" xuất hiện ở cả nhóm 04 và 06 cùng giá 21.999.000 — một mục, hai nhóm hiển thị.

## PHỤ LỤC B — Nhân sự & vai trò theo tài liệu chương trình

| Người | Vai trò trong chương trình | Gán trong app |
|---|---|---|
| BS. Lê Đình Lam | Giám đốc chuyên môn & pháp lý; hỗ trợ pháp lý cho đối tác (lộ trình tuần 1–4, tháng 2, từ tháng 3) | ADMIN; người duyệt nội dung chuyên môn |
| Lê Vân | Founder Tasy — sản phẩm, spa, liên kết đào tạo, cấp chứng chỉ | ADMIN; chủ danh mục sản phẩm |
| Nguyễn Quyên | Giám đốc đào tạo, chiến lược & vận hành; phụ trách chính xây kênh | ADMIN; chủ Học viện |
| Bích | Kế toán tổng & quản lý tài chính | MANAGER; lập đối soát, lô chi trả, kỳ lợi nhuận |
| Bảo Ngọc | Trợ lý điều phối, video ngắn | CARE; điều phối lịch, điểm danh |
| Dương, Tuấn | Quay dựng | CARE; xử lý yêu cầu quay dựng |

Lịch hỗ trợ cố định (cấu hình được): túc trực tại văn phòng hằng ngày · 2 buổi Zoom/tuần · 1 chương trình lớn/tuần.

---
*Hết đề xuất. Tài liệu căn cứ: Hợp đồng gói 15 triệu, Hợp đồng quyền lợi 2%, Hợp đồng quyền lợi 5% (bản dự thảo), Phiếu chọn thẩm mỹ, 7 infographic chương trình (Chính sách đối tác; Bảng chi phí cố định; Bảng giá ưu đãi làm thêm; Bảng phân công; Đào tạo xây kênh; Hợp tác 2%; Đối tác cao cấp 5%), mã nguồn ZenithTasks (Next.js 16, Prisma 7, PostgreSQL).*
