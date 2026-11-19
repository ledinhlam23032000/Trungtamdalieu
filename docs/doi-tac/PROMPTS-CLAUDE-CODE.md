# BỘ PROMPT GỬI CLAUDE CODE — Hồng Phúc Alliance

Mỗi prompt dưới đây dùng cho **một phiên** Claude Code. Dán nguyên khối trong ``` ```. Không gộp nhiều giai đoạn vào một phiên.

---

## PROMPT 0 — Khởi động & lập kế hoạch (phiên đầu tiên, KHÔNG code)

```
Bạn là kỹ sư chính của ZenithTasks. Nhiệm vụ phiên này: ĐỌC, ĐỐI CHIẾU và LẬP KẾ HOẠCH cho module mới "Đối tác chiến lược" (Hồng Phúc Alliance). KHÔNG sửa code, KHÔNG tạo migration trong phiên này.

Đọc theo thứ tự:
1. web/CLAUDE.md, web/AGENTS.md, web/BAN-GIAO.md, docs/INDEX.md, docs/AI-ADMIN-GATEWAY.md, FINANCE-DEFINITIONS.md
2. docs/doi-tac/DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md  (đặc tả chính — đọc hết)
3. docs/doi-tac/QUYET-DINH.md  (quyết định của chủ — ưu tiên hơn mặc định trong đặc tả)
4. docs/doi-tac/nguon/*.md  (hợp đồng gốc + phiếu chọn đã chuyển sang markdown; bản .docx cùng tên là bản gốc)
5. docs/doi-tac/nguon/anh/*.jpg  (7 infographic chương trình — xem ảnh)
6. docs/doi-tac/MOCKUP-ALLIANCE.html  (mục tiêu thị giác)
7. Code hiện có liên quan: prisma/schema.prisma (Collaborator, ZProject, ZMechanism*, CaseRecord, Payment, AccountingPeriod), src/lib/collaborator-*.ts, src/lib/commission*.ts, hệ RBAC/permissions, src/app/(app)/du-an, src/app/khach/[token]

Sau khi đọc, tạo file docs/doi-tac/KE-HOACH-THI-CONG.md gồm:
A. Bản đồ tái sử dụng: model/lib/route nào của Zenith dùng lại, chỗ nào phải mở rộng, chỗ nào tạo mới — kèm đường dẫn file thật.
B. Xung đột phát hiện được giữa đặc tả và code hiện tại (ví dụ: cửa sổ 6 tháng COLLABORATOR_VISIBILITY_MONTHS, role SHAREHOLDER, cách tính hoa hồng hiện có). Mỗi xung đột: đề xuất cách xử lý.
C. Thiết kế schema Prisma cho P0 (code block), danh sách migration, chiến lược seed danh mục từ phieu-chon-tham-my.md.
D. Danh sách nhiệm vụ P0 → P5, mỗi nhiệm vụ vừa 1 phiên, có tiêu chí nghiệm thu và test số vàng tương ứng (mục 13 đặc tả).
E. Câu hỏi cần chủ trả lời thêm (chỉ những câu chưa có trong QUYET-DINH.md).

Quy tắc: tiếng Việt; tiền VND số nguyên Decimal(14,0); sổ cái append-only; không dùng chữ "cổ đông" trong UI; không tính thưởng cấp 2. Kết thúc phiên bằng bản tóm tắt ≤ 15 dòng và DỪNG chờ tôi duyệt.
```

---

## PROMPT 1 — Thi công P0: Nền móng

```
Đọc docs/doi-tac/KE-HOACH-THI-CONG.md (đã được chủ duyệt), DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md mục 2, 6, 10, 12, 13 và QUYET-DINH.md.

Thi công GIAI ĐOẠN P0:
- Tạo nhánh feature/doi-tac-p0.
- Thêm role PARTNER vào RBAC (không đụng quyền SHAREHOLDER hiện có).
- Schema + migration: Partner, PackageContract, EntitlementWallet/WalletEntry, CatalogItem/CatalogVersion, Beneficiary, CommissionEntry, WorkingCalendar.
- ZProject "DT-15TR" kiểu PARTNERSHIP + mechanism REFERRAL_FLAT (3.000.000) và ADDON_PCT (theo QUYET-DINH D11), có testCases.
- Seed danh mục v0 từ docs/doi-tac/nguon/phieu-chon-tham-my.md: 7 gói chính A01–A07 (kèm ràng buộc chọn vùng) + toàn bộ dịch vụ ngoài gói 8 nhóm, đúng từng giá.
- Hàm thuần (pure) + unit test cho F1 (hoàn phần chưa dùng) và F2 (hoa hồng giới thiệu); test T1, T11, T12, T15 phải xanh.
- Thêm kiểm tra toàn vẹn vào db:check-integrity: Σ WalletEntry = số dư ví; 1 hợp đồng chỉ ghi nhận cho ≤1 đối tác.

Chưa làm UI trong P0. Chạy npx tsc --noEmit và npx vitest run; cập nhật VERSION/CHANGELOG/checks theo quy ước repo. Commit, KHÔNG push. Báo cáo: file đã đổi, test, rủi ro còn lại.
```

---

## PROMPT 2 — Thi công P1: Gói 15 triệu vận hành được

```
Đọc KE-HOACH-THI-CONG.md, đặc tả mục 6.2, 6.3 (F1), 7.2, 8 và MOCKUP-ALLIANCE.html. Nhánh feature/doi-tac-p1 từ P0.

Thi công P1:
1. Luồng Bán gói (≤90 giây): tìm khách bằng 5 số cuối SĐT, quét/nhập mã đối tác giới thiệu (hiện tên để xác nhận), sinh hợp đồng từ mẫu hop-dong-goi-15-trieu, thu tiền một phần/đủ, kích hoạt ví khi thu đủ.
2. Phiếu chọn số hoá: ràng buộc theo danh mục (chọn 1 gói chính; A01 tối đa 3/5; A02 chọn 1/2; A04 ghi chú bác sĩ quyết số vùng). Kết quả là "mong muốn".
3. Bác sĩ xác nhận/điều chỉnh chỉ định trên dịch vụ khách đã chọn — bác sĩ KHÔNG thấy bất kỳ con số hoa hồng nào.
4. Ghi nhận sử dụng tại quầy: thẻ ví, trừ giá trị, khách xác nhận OTP/ký, tạo CaseService + WalletEntry trong 1 transaction có idempotency key. Vượt ví bắt buộc màn hình đồng ý trước (T16).
5. Hết hạn & hoàn phần chưa dùng theo F1, nhắc 90/30/7 ngày (web push + Zalo OA sẵn có).

Giao diện nội bộ dùng token Zenith hiện có. Test T1, T15, T16 xanh + test từ chối ghi theo role. tsc + vitest + cập nhật VERSION/CHANGELOG. Commit, không push. Chụp màn hình các trang mới để tôi duyệt.
```

---

## PROMPT 3 — Thi công P2: Hoa hồng & Cổng đối tác

```
Đọc KE-HOACH-THI-CONG.md, đặc tả mục 4, 4.1, 6.3 (F2, F3), 7.3, 8, 10 và MOCKUP-ALLIANCE.html (bám sát phần điện thoại). Nhánh feature/doi-tac-p2.

Thi công P2:
1. Ghi nhận giới thiệu bằng mã/link/QR; chặn tự giới thiệu; 1 hợp đồng ≤1 đối tác.
2. CommissionEntry: REFERRAL_FLAT 3tr và ADDON_PCT theo F3 (trên thực thu sau giảm giá, hoàn tiền). Trạng thái PENDING → ELIGIBLE (đối soát tháng) → IN_BATCH → PAID; hoàn tiền sau khi trả sinh CLAWBACK bù trừ kỳ sau (D6).
3. Đối soát tháng + PayoutBatch 2 bước (kế toán lập, admin duyệt, người lập ≠ người duyệt), khấu trừ thuế theo QUYET-DINH D12.
4. Cổng đối tác PWA tại /p với sub-brand Alliance (thêm token --color-alliance-*, --color-gold-* vào @theme, KHÔNG sửa token Zenith): Trang chủ (thẻ ví, thu nhập Khả dụng/Chờ, hành trình lên hạng), Ví, Thu nhập (dòng thời gian, sao kê PDF tháng), Tôi. Mobile-first, vùng chạm ≥44px.
5. Đối tác chỉ thấy dữ liệu của mình; người được giới thiệu hiển thị tên viết tắt + SĐT che; không xem hồ sơ y khoa. Rate limit đăng nhập/OTP.

Anti-feature bắt buộc: không cây tuyến dưới, không bảng xếp hạng theo số người tuyển, không chữ "cổ đông" (thêm lint/test chặn chuỗi này trong src/app/p và src/app/(app)/doi-tac).
Test T12, T13, T17 xanh. tsc + vitest + VERSION/CHANGELOG. Commit, không push. Chụp màn hình cổng /p ở khổ 390px.
```

---

## PROMPT 4 — Thi công P3: Suất 2%/5% & Duy trì

```
Đọc đặc tả mục 6.1, 6.3 (F4, F5), 6.4 (đọc thật kỹ), 7.1 (sơ đồ ghế, bản đồ nhiệt), 13 và QUYET-DINH.md (D4, D13). Nhánh feature/doi-tac-p3.

Thi công P3:
1. ProfitSeat với giới hạn 10 suất 2%, 5 suất 5%; danh sách chờ (T10).
2. Wizard công nhận suất: phương án A (50 HĐ hợp lệ, xuất danh sách để hai bên ký), phương án B (1,5 tỷ / 750tr / cấn trừ 250tr / thực đóng 500tr, cọc 50tr + 450tr trong 1 tháng), gói 5% (900tr / cấn trừ 330tr / thực đóng 570tr). Cấn trừ ghi thành OFFSET đã dùng, không bao giờ chi lại (T14). Không sinh hợp đồng khách ảo.
3. MaintenanceMonth 2 vòng (hợp đồng + nhiệm vụ chung), PartnerActivity có bằng chứng, TrainingEvent điểm danh tự sinh hoạt động.
4. TerminationCase đúng từng bước mục 6.4: nhắc sau tháng 1 → vụ việc sau tháng 2 → đếm 10 ngày làm việc theo WorkingCalendar → chỉ ADMIN quyết định. Tháng bệnh viện không giao kế hoạch thì không tính. Hệ thống KHÔNG BAO GIỜ tự chấm dứt. Lưu dấu thời gian gửi/nhận mọi thông báo.
5. Trang /doi-tac/suat (sơ đồ ghế) và /doi-tac/duy-tri (bản đồ nhiệt + hàng đợi + đồng hồ vụ việc) theo mockup.

Test T7, T8, T9, T10, T14 xanh. Audit before/after cho mọi đổi trạng thái suất. tsc + vitest + VERSION/CHANGELOG. Commit, không push.
```

---

## PROMPT 5 — Thi công P4: Kỳ lợi nhuận & Quyết toán

```
Đọc đặc tả mục 6.3 (F6, F7, F8, F9), 7.3 (Phòng dữ liệu kỳ), 10, 13 và QUYET-DINH.md (D5, D7, Q6). Nhánh feature/doi-tac-p4.

Thi công P4:
1. ProfitScope có phiên bản; ProfitPeriod DRAFT → PUBLISHED → DISPUTE_WINDOW → LOCKED → PAID; ProfitCostLine chỉ nhận category nằm trong danh mục khấu trừ đã ký, bắt buộc chứng từ.
2. Tiền hưởng theo F6, pro-rata theo ngày, không chuyển lỗ nếu D7 = không (T5, T6).
3. Quyết toán khi dừng theo F7 (2% phương án B) và F8 (5%), màn hình hiển thị từng dòng công thức, xuất PDF biên bản hai bên ký (T2, T3, T4).
4. Cổng đối tác: tab Quyền lợi cho người có suất — thẻ suất, vòng duy trì, Phòng dữ liệu kỳ (bảng thu chi, chứng từ, công thức, nút Phản hồi mở đúng số ngày hợp đồng), tiến độ thu hồi vốn F9 với dòng chữ cố định "Mục tiêu hỗ trợ, không phải bảo lãnh hoàn vốn".
5. Khoá kỳ dùng cơ chế AccountingPeriod sẵn có; người lập ≠ người khoá.

Test T2–T6 xanh. tsc + vitest + VERSION/CHANGELOG. Commit, không push.
```

---

## PROMPT 6 — Thi công P5: Đài chỉ huy, Mô phỏng, Học viện

```
Đọc đặc tả mục 1, 7.1, 9, 11 và MOCKUP-ALLIANCE.html (bám sát phần desktop). Nhánh feature/doi-tac-p5.

Thi công P5:
1. /doi-tac Đài chỉ huy: 5 thẻ KPI (thẻ "Nghĩa vụ dịch vụ còn nợ" nổi bật, hiển thị theo giá trị chương trình + giá vốn + dự phòng hoàn khi hết hạn), phễu, sơ đồ ghế, "Cần xử lý hôm nay", bản đồ nhiệt. Mọi con số bấm vào mở bút toán gốc.
2. /doi-tac/mo-phong: thanh trượt tham số + biểu đồ thác nước đóng góp/gói và điểm hoà vốn tháng (mục 9). Tham số mặc định lấy từ QUYET-DINH.md.
3. /doi-tac/hoc-vien + tab Học viện trong /p: lộ trình 4 bước, lịch 2 Zoom/tuần + 1 chương trình lớn/tuần, điểm danh, MediaRequest giao Dương/Tuấn, kho nội dung đã duyệt.
4. AI (qua AI approval gate sẵn có, mọi hành động cần duyệt): gợi ý đối soát + cờ bất thường, soạn thông báo duy trì, trả lời đối tác dựa trên bút toán thật.

Kiểm tra trên seed: Ban điều hành trả lời được 4 câu hỏi ở mục 1 đặc tả trong một màn hình. tsc + vitest + VERSION/CHANGELOG. Commit, không push. Chụp màn hình desktop 1440px.
```

---

## PROMPT PHỤ — Rà soát trước khi merge mỗi giai đoạn

```
Rà soát nhánh hiện tại so với main như một reviewer khó tính, KHÔNG sửa code trước khi báo cáo:
1. Mọi đường ghi tiền: có transaction, idempotency, append-only, audit before/after chưa?
2. Có đường nào đối tác xem được dữ liệu người khác, hồ sơ y khoa, SĐT đầy đủ không? (thử bằng JWT từng role như đợt red-team 08/2026)
3. Có chỗ nào tính thưởng cấp 2, dùng chữ "cổ đông", hoặc tự động chấm dứt suất không?
4. Test số vàng mục 13 của giai đoạn này có đủ và xanh không?
5. Đối chiếu từng tiêu chí nghiệm thu trong KE-HOACH-THI-CONG.md.
Xuất danh sách lỗi theo mức HIGH/MEDIUM/LOW kèm file:dòng. Sau đó hỏi tôi có muốn sửa không.
```
