# KẾ HOẠCH THI CÔNG — Module "Đối tác chiến lược" (Hồng Phúc Alliance)

> **Trạng thái:** BẢN TRÌNH DUYỆT — chưa sửa code, chưa tạo migration.
> **Ngày lập:** 19/11/2026 · **Người lập:** kỹ sư chính (phiên Claude Code) · **Người duyệt:** BS. Lê Đình Lam
> **Căn cứ đã đọc:** `web/CLAUDE.md`, `web/AGENTS.md`, `web/BAN-GIAO.md`, `docs/INDEX.md`, `docs/AI-ADMIN-GATEWAY.md`, `FINANCE-DEFINITIONS.md` (repo `ledinhlam23032000/ZenithTasks`, nhánh `master`, commit `f19b5be` ngày 23/09/2026); `DE-XUAT-APP-DOI-TAC-CHIEN-LUOC.md` (đủ 14 mục + 2 phụ lục); `QUYET-DINH.md`; 4 file `nguon/*.md`; 7 infographic; `MOCKUP-ALLIANCE.html`; mã nguồn `prisma/schema.prisma`, `src/lib/collaborator-*.ts`, `src/lib/commission*.ts`, `src/lib/permissions.ts`, `src/lib/v2-mechanism-*.ts`, `src/lib/v2-rule-engine.ts`, `src/app/(app)/du-an`, `src/app/(app)/ho-so/actions.ts`, `src/app/khach/[token]`, `src/proxy.ts`.
>
> ⚠️ **Lưu ý vị trí mã nguồn:** repo này (`Trungtamdalieu`) chỉ chứa tài liệu. Mã ZenithTasks nằm ở repo `ZenithTasks`; bản tôi đọc là `master@f19b5be` (23/09/2026). **Trước P0 phải xác nhận đây là bản mới nhất đang chạy tại phòng khám** (đối chiếu `VERSION.md` + `git ls-remote`). Mọi đường dẫn `web/...` dưới đây là đường dẫn trong repo ZenithTasks.

> 🔁 **ĐIỀU CHỈNH 19/11/2026 theo chỉ đạo của chủ:** app tên là **Trungtamdalieu**, mã nguồn và tài liệu lưu tại repo `ledinhlam23032000/Trungtamdalieu`. **ZenithTasks chỉ là tài liệu tham khảo** (mô hình dữ liệu, cách khoá tiền, RBAC, sổ cái append-only đã chứng minh hiệu quả) — không thi công vào repo đó. Hệ quả cho kế hoạch: mục A đọc là "mẫu thiết kế mượn từ ZenithTasks", không phải "file sẽ sửa"; các xung đột B.2, B.4, B.5, B.6, B.11 (vốn sinh ra do dùng chung bảng `Customer`/`Payment`/`Collaborator` với ZenithTasks) trở thành **quy tắc thiết kế** cho app mới thay vì việc phải vá. Bản chạy thử đầu tiên nằm ở `prototype/alliance/index.html` (chạy trong trình duyệt, 19/19 test số vàng đạt). Kế hoạch sẽ được viết lại mục A và C cho kiến trúc app riêng sau khi chủ duyệt bản chạy thử.
>
> **Yêu cầu bổ sung của chủ (đã có trong bản chạy thử):** biểu đồ tăng trưởng hiệu suất nhân sự / nhóm / thu nhập theo % doanh số tổng của ban điều hành và bộ phận; phân quyền theo phạm vi: Ban điều hành xem hết và thao tác, Kế toán xem hết số tiền, **Cổ đông bệnh viện xem hết nhưng không sửa**, Trưởng nhóm xem nhóm mình, Nhân viên xem của mình, Bác sĩ không thấy hoa hồng, Khách/Đối tác chỉ xem phần của mình. Vai trò "Cổ đông bệnh viện" dành cho người góp vốn thật của bệnh viện; đối tác 2%/5% không bao giờ được gán vai trò này (D2 vẫn giữ).

---

## A. BẢN ĐỒ TÁI SỬ DỤNG

Ký hiệu: **DÙNG LẠI** = dùng nguyên, không sửa · **MỞ RỘNG** = thêm cột/hàm/nhánh, không đổi hành vi cũ · **MỚI** = tạo mới.

### A.1 Dữ liệu (Prisma — `web/prisma/schema.prisma`)

| Nhu cầu | Thành phần Zenith | Quyết định | Ghi chú |
|---|---|---|---|
| Người mua gói | `Customer` (SĐT AES-GCM, `phoneLast5`, `phoneHash`) | **DÙNG LẠI** | `Partner.customerId` 1-1. Tra khách bằng 5 số cuối như Tiếp nhận. |
| Mỏ neo ghi nhận giới thiệu | `Collaborator` | **DÙNG LẠI** (có điều kiện, xem B.1, B.10) | `Partner.collaboratorId` 1-1. Không ghi bank/SĐT đối tác vào `Collaborator` (đang là chữ thường). |
| Lần sử dụng quyền lợi dịch vụ | `CaseRecord`, `CaseService` | **MỞ RỘNG ở P1** | Thêm `CaseService.walletEntryId` (nullable, unique) và `CaseService.addOnContractId`. Dòng dịch vụ trong gói có `unitPrice = finalPrice = 0`, `listPrice = giá trị chương trình` (xem B.4). |
| Thu tiền dịch vụ ngoài gói | `Payment` (+ `withCaseLock`) | **DÙNG LẠI** | Căn cứ F3 = thực thu của dòng ngoài gói. |
| Thu tiền **gói 15tr** | — | **MỚI** `PackagePayment` | KHÔNG dùng `Payment` (B.4). Mỗi khoản sinh 1 `CashTransaction` (INCOME, hạng mục mới `PARTNER_PACKAGE`). |
| Sổ thu chi / P&L | `CashTransaction`, `web/src/lib/finance.ts` | **MỞ RỘNG** | Thêm hạng mục `PARTNER_PACKAGE` (thu), `PARTNER_COMMISSION` (chi), `PARTNER_PROFIT_SHARE` (chi), `PARTNER_REFUND` (chi). |
| Chi trả qua chứng từ | `PaymentRequest` (PENDING→APPROVED→PAID, 1 PR ↔ ≤1 CashTransaction) | **DÙNG LẠI** | Mỗi `PayoutBatch` duyệt xong sinh 1 `PaymentRequest` loại `COLLABORATOR` cho mỗi đối tác. |
| Khoá kỳ tháng | `AccountingPeriod`, `isMonthClosed()` (`web/src/lib/accounting.ts`) | **DÙNG LẠI** cho kỳ hoa hồng | Kỳ lợi nhuận (quý, Q6) là thực thể riêng `ProfitPeriod` (P4). |
| Luật có phiên bản | `ZMechanismDefinition` / `ZMechanismVersion` | **DÙNG LẠI bảng, MỚI bộ luật** | `ruleSpec` dạng mới `alliance.v1` + bộ chạy test riêng (B.9). |
| Dự án | `ZProject` kiểu `PARTNERSHIP` | **DÙNG LẠI** | Tạo `DT-15TR` **trống**, không dùng mẫu `INVESTMENT_PROJECT` (có vị trí "Cổ đông / Nhà đầu tư"). Chỉ dùng làm vỏ chứa mechanism + cấu hình; KHÔNG dùng `ZWorkspaceCustomer/Sale/Ledger` (đó là đường dữ liệu V2 tách biệt, sẽ thành nguồn sự thật thứ hai). |
| Kho sản phẩm quyền lợi | `Material`, `StockMovement` | **DÙNG LẠI ở P1** | Redemption sản phẩm tạo `StockMovement OUT` (chờ trả lời câu hỏi kho Tasy, E.19). |
| Audit | `AuditLog` (trigger append-only), `web/src/lib/audit.ts` (`auditRequired`) | **DÙNG LẠI** | Ghi `before/after` cho mọi thay đổi tỷ lệ, người được ghi nhận, trạng thái suất. |
| Khuôn trigger append-only | migration `20260813201000_audit_log_append_only` | **DÙNG LẠI khuôn** | Áp cho `WalletEntry`, `PackagePayment`; trigger hạn chế cho `CommissionEntry`. |
| Mã hoá CCCD/MST/STK | `web/src/lib/secret-crypto.ts`, `web/src/lib/phone.ts` | **DÙNG LẠI** | Cột `*Enc` + `*Last4`. |
| Sinh mã | `web/src/lib/seq.ts` (`nextSeq` + thử lại P2002) | **DÙNG LẠI** | `HP-XXXX` (mã đối tác), `GOI-000001` (hợp đồng gói). |
| Rate limit | `RateLimitBucket`, `web/src/lib/rate-limit.ts` | **DÙNG LẠI** | Đăng nhập cổng `/p`, OTP/PIN. |
| Thông báo | `PushSubscription`, `web/src/lib/push.ts`, kênh Zalo OA (`web/src/lib/channels/`) | **DÙNG LẠI** | Webhook Zalo OA chưa kiểm chứng traffic thật (BAN-GIAO mục 13, cạm bẫy 19). |
| Nhắc việc / ngoại lệ | `web/src/lib/workqueue.ts` (lớp Pulse) | **MỞ RỘNG** | Nhắc hạn ví 90/30/7, thiếu nhiệm vụ, vụ chấm dứt sắp hạn đi qua workqueue — **không làm cơ chế nhắc thứ hai** (luật dự án). |
| AI | AI Admin Gateway (`web/src/app/(app)/tro-ly/agent.ts`) | **MỞ RỘNG ở P5** | Chỉ thêm tool đọc + soạn thông báo có approval. |

### A.2 Thư viện (`web/src/lib/`)

| File | Quyết định | Lý do |
|---|---|---|
| `permissions.ts` | **MỞ RỘNG** | Thêm module `doi-tac` (ADMIN, MANAGER), `doi-tac-cong` (PARTNER), năng lực `alliance.*`; thêm **ranh giới cứng** cho PARTNER trong `userCan()` giống COLLABORATOR. |
| `role-home.ts` | **MỞ RỘNG** | PARTNER → `/p`. |
| `rbac.ts` (`Record<Role,…>`) | **MỞ RỘNG** | Bắt buộc thêm khoá `PARTNER` (tsc sẽ báo). Nhãn: "Đối tác". |
| `auth.ts` (`requireCap`, `requireUser`) | **DÙNG LẠI** | |
| `collaborator-access.ts` | **KHÔNG DÙNG cho đối tác** | Cửa sổ 6 tháng không áp cho quyền xem của đối tác (B.1). Giữ nguyên cho CTV cũ. |
| `collaborator-sync.ts` | **KHÔNG GỌI** cho mỏ neo của đối tác | Hàm này tự gán `collaboratorId` hàng loạt theo tên — nguy hiểm với ghi nhận hợp đồng gói. |
| `commission.ts`, `commission-data.ts` | **KHÔNG SỬA ở P0–P2** | Hoa hồng nhân sự. Chỉ đảm bảo dữ liệu Alliance không lọt vào (B.4). Câu hỏi E.8 quyết định có sửa không. |
| `financial-summary.ts` (`summarizeCase`) | **DÙNG LẠI** | Dòng dịch vụ trong gói giá 0 nên không đổi doanh thu/công nợ hồ sơ. |
| `v2-mechanism-test.ts`, `v2-payroll-calculation.ts` | **KHÔNG DÙNG** cho Alliance | Chỉ hỗ trợ `rateBps × basis`. |
| `v2-rule-engine.ts` | **KHÔNG DÙNG** cho tiền Alliance | Tính bằng số thực (`rate/100`, `Math.round`). |
| `money.ts`, `format.ts`, `dates.ts` (`vnDateOnly`) | **DÙNG LẠI** | |
| `payment-request.ts`, `payment-request-pdf.ts` | **DÙNG LẠI** | |
| `export.ts`, `xlsx.ts` | **DÙNG LẠI** | Danh sách hợp đồng công nhận suất, bảng thu chi kỳ. |
| **MỚI** `alliance/money.ts` | Toán thuần F1–F9, số nguyên `bigint`/số nguyên an toàn, có test số vàng | |
| **MỚI** `alliance/ruleset.ts` | Kiểu `alliance.v1` + parser + bộ chạy testCases | |
| **MỚI** `alliance/wallet.ts`, `alliance/commission.ts`, `alliance/catalog.ts`, `alliance/working-days.ts`, `alliance/access.ts` | Logic nghiệp vụ, mọi ghi tiền trong `$transaction` + `SELECT … FOR UPDATE` trên `PackageContract` | |

### A.3 Route

| Route | Quyết định |
|---|---|
| `web/src/app/(app)/du-an/[projectId]/co-che` | **DÙNG LẠI** để xem mechanism của `DT-15TR`; trang `/doi-tac/co-che` là lối vào riêng gọi bộ test `alliance.v1`. |
| `web/src/app/(app)/ho-so/[id]` | **MỞ RỘNG ở P1**: hiển thị huy hiệu "Dòng quyền lợi gói GOI-xxxx", chặn sửa giá dòng có `walletEntryId`. |
| `web/src/app/(app)/ho-so/actions.ts` (`addPayment`, `deletePayment`, `updatePayment`) | **MỞ RỘNG ở P2**: sau khi ghi/xoá/sửa Payment có dòng ngoài gói → sinh/đảo `CommissionEntry` trong cùng transaction. |
| `web/src/app/khach/[token]` | **THAM KHẢO** khuôn trang công khai (select tường minh, `withMediaToken`, rate-limit `bump`). Cổng đối tác KHÔNG dùng token công khai. |
| `web/src/proxy.ts` | **KHÔNG thêm `/p` vào `PUBLIC_PATHS`**; chỉ thêm `/p/dang-nhap`. |
| **MỚI** `web/src/app/(app)/doi-tac/**` | Đài chỉ huy + 10 trang con (mục 7.1 đặc tả). |
| **MỚI** `web/src/app/p/**` | Cổng PWA đối tác, layout riêng (sub-brand Alliance), không dùng sidebar nhân viên. |
| **MỚI** `web/scripts/alliance/*` | seed danh mục, bootstrap dự án, kiểm toàn vẹn (gắn vào `db:check-integrity`). |

---

## B. XUNG ĐỘT GIỮA ĐẶC TẢ VÀ CODE HIỆN TẠI

| # | Xung đột (bằng chứng) | Rủi ro nếu bỏ qua | Đề xuất xử lý |
|---|---|---|---|
| **B.1** | **Cửa sổ 6 tháng** `COLLABORATOR_VISIBILITY_MONTHS = 6` (`collaborator-access.ts`): CTV chỉ thấy khách có `collaboratorAssignedAt ≥ now − 6 tháng`. Hợp đồng gói kéo dài 12 tháng (D9), thù lao ngoài gói (HĐ gói Đ3) không có giới hạn thời gian, KPI suất 2%/5% kéo dài vô thời hạn. | Tháng thứ 7 đối tác "mất" khách và khoản hoa hồng trên cổng → tranh chấp. | Nguồn sự thật ghi nhận của Alliance là **`PackageContract.attributedPartnerId` (vĩnh viễn)** và **`CommissionEntry.partnerId`**. Cổng `/p` truy vấn theo hai bảng này, KHÔNG qua `collaboratorCustomerWhere`. Giữ nguyên quy tắc 6 tháng cho CTV cũ. Thời hạn ghi nhận thù lao ngoài gói: hỏi chủ (E.6). |
| **B.2** | **Một khách chỉ có một `collaboratorId`** (`Customer`, `CaseRecord`). Q3 yêu cầu: hợp đồng gói ghi nhận cho đối tác mới, dịch vụ cũ giữ CTV cũ. | Ghi đè `Customer.collaboratorId` làm CTV cũ mất khách; `collaborator-sync` có thể gán ngược. | **Không bao giờ ghi đè** `Customer.collaboratorId` từ luồng bán gói. Ghi nhận gói nằm trên `PackageContract`; ghi nhận dịch vụ ngoài gói nằm trên từng dòng (`CaseService.addOnContractId` → đối tác của hợp đồng đó). Trường hợp dịch vụ mới ngoài gói của khách cũ: hỏi chủ (E.7). |
| **B.3** | **Role `SHAREHOLDER`** = xem toàn bộ, có quyền Trợ lý AI và **toàn quyền** Kế hoạch (`permissions.ts`); UI nội bộ đang hiển thị nhãn "Cổ đông"; mẫu dự án `INVESTMENT_PROJECT` có vị trí `CO_DONG — Cổ đông / Nhà đầu tư` (`v2-project-templates.ts`). | Gán nhầm đối tác 2%/5% vào SHAREHOLDER = lộ toàn bộ dữ liệu khách/tài chính; chữ "cổ đông" lọt vào cổng đối tác. | Thêm role **`PARTNER`** với **ranh giới cứng trong `userCan()`** (giống COLLABORATOR): chỉ `mod:doi-tac-cong`, không nhận grant mở rộng, không `phone.full`, không ghi ngoài action của chính cổng. Test: PARTNER được grant `mod:ke-toan` vẫn bị từ chối. Mặc định **SHAREHOLDER không có `mod:doi-tac`** (dữ liệu cá nhân + chi trả) — chờ chủ xác nhận (E.12). Không dùng mẫu `INVESTMENT_PROJECT`. Lint chặn chuỗi "cổ đông" (không phân biệt hoa thường) trong `src/app/(app)/doi-tac`, `src/app/p`, `src/lib/alliance`, mẫu thông báo/PDF của module. |
| **B.4** | **Hoa hồng nhân sự tự tính trên mọi `Payment`** (`commission-data.ts`: tư vấn theo bậc, bác sĩ 8%, điều dưỡng 4%/100k mỗi dòng có `nurseId`). | (a) Ghi 15tr gói vào `Payment` → tư vấn viên + bác sĩ của hồ sơ tự nhận % trên tiền gói, chồng lên 3tr của đối tác. (b) Tạo dòng dịch vụ quyền lợi giá 30tr → **công nợ ảo 30tr** trên Sổ công nợ, doanh thu hồ sơ phồng. | Tiền gói vào **`PackagePayment`** (bảng riêng) + `CashTransaction PARTNER_PACKAGE`; không tạo `Payment`. Dòng dịch vụ quyền lợi: `unitPrice = discount = finalPrice = 0`, `listPrice = giá trị chương trình`, gắn `walletEntryId` → không công nợ, không doanh thu, không hoa hồng % (điều dưỡng 100k/ca vẫn chạy vì đếm theo dòng). Việc nhân viên bán gói / bác sĩ làm dịch vụ trong gói có được hưởng gì: chủ chốt (E.8) — nếu có thì làm PR riêng (không đổi công thức tiền cùng PR giao diện). |
| **B.5** | **Hai hệ hoa hồng cho cùng mỏ neo `Collaborator`**: `CaseRecord.commissionAmount` (nhập tay) → `CommissionPayout` (unique `collaboratorId + month`) đang tồn tại; Alliance thêm `CommissionEntry`. | Trả hai lần cho cùng khách (một lần nhập tay, một lần tự động). | Với `Collaborator` là mỏ neo của Partner: chặn nhập `commissionAmount > 0` trên hồ sơ (action + UI); kiểm toàn vẹn: không có hồ sơ `commissionAmount > 0` mà `collaborator.partner != null`. Chi trả Alliance đi riêng qua `PayoutBatch → PaymentRequest`, không qua `CommissionPayout`. |
| **B.6** | **`Payment` xoá/sửa được** (`deletePayment` xoá cứng, quyền `payment.manage`); **không có khái niệm hoàn tiền** trong toàn bộ code (grep `refund` = 0 kết quả); `Payment` cascade theo `CaseRecord`/`Customer` (xoá khách L5). | `CommissionEntry` tham chiếu Payment đã bị xoá → hoa hồng không còn căn cứ; xoá khách xoá mất bằng chứng. | (1) `CommissionEntry` lưu **ảnh chụp** `basisAmount` + `sourceRef`, FK tới Payment `onDelete: SetNull`. (2) `deletePayment`/`updatePayment` có dòng ngoài gói → trong cùng transaction sinh `CLAWBACK`/điều chỉnh âm (nếu chưa trả) hoặc `OFFSET` kỳ sau (nếu đã trả, D6). (3) `Partner.customerId` và `PackageContract` dùng `onDelete: Restrict` → không xoá được khách đang là đối tác/chủ gói; `deleteCustomerForAgent` phải báo lỗi rõ. (4) Hoàn tiền gói = dòng `PackagePayment` âm loại `REFUND`, không xoá dòng thu. |
| **B.7** | **Căn cứ F3** đặc tả viết "thực thu − giảm giá − hoàn tiền". Trong Zenith, `Payment` đã là tiền thực thu sau giảm giá (`finalPrice` đã trừ `discount`, voucher). | Trừ giảm giá **hai lần** → trả thiếu (T13 sẽ sai: 12% × 16tr). | Căn cứ = phần thực thu phân bổ cho dòng ngoài gói (cùng cách mẫu số của `allocateDoctorServiceBase`) − hoàn tiền. T13: dịch vụ 20tr, giảm 2tr, khách trả 18tr → 12% × 18tr = **2.160.000đ**. Cờ "gồm/chưa thuế" lưu trên hợp đồng (E.5). |
| **B.8** | **Kỳ kế toán là tháng** (`AccountingPeriod.month "YYYY-MM"`); snapshot `ctvCommission` chỉ cộng `CommissionPayout`. Kỳ lợi nhuận mặc định **quý** (Q6). | Báo cáo kỳ cũ không thấy chi hoa hồng Alliance; khoá tháng không khoá kỳ quý. | Kỳ hoa hồng Alliance = tháng, kiểm `isMonthClosed()` trước mọi ghi. Chi Alliance thành `CashTransaction` hạng mục riêng → đã vào `operatingExpense`; P4 thêm cột additive `AccountingPeriod.allianceCommission` nếu kế toán muốn tách. `ProfitPeriod` có vòng đời khoá riêng (P4). |
| **B.9** | **Engine mechanism không đủ**: `runMechanismRuleTests` chỉ hiểu `{rateBps}` × `basisAmount`; `v2-rule-engine` dùng số thực; `activateWorkspaceMechanismAction` ghi `approvedById = người bấm` mà **không kiểm người tạo ≠ người duyệt**; quyền theo `ZProjectMember` (`requireProjectCapability`). | Tỷ lệ 3tr/12%/mốc 50-60 không mô tả được; một người tự tạo và tự kích hoạt tỷ lệ tiền. | Định nghĩa `ruleSpec` **`alliance.v1`** (số nguyên, bps): `FLAT_PER_CONTRACT`, `PCT_BY_GROUP`, `SEAT_MILESTONE`, `SEAT_RATE`. Bộ test riêng. Kích hoạt qua action Alliance có kiểm **người tạo ≠ người duyệt** + audit before/after; không sửa action V2. Thêm 3 ADMIN (BS Lam, Lê Vân, Nguyễn Quyên) và Bích vào `ZProjectMember` của `DT-15TR` khi bootstrap. |
| **B.10** | **`Collaborator.name @unique`**, `phone`/`bankAccount` lưu chữ thường. | Hai đối tác trùng tên không tạo được; STK đối tác không mã hoá (đặc tả mục 10 yêu cầu mã hoá). | Tên mỏ neo = `"{Họ tên} ({mã HP-XXXX})"`. Thông tin ngân hàng, CCCD, MST lưu mã hoá trên `Partner`, không ghi vào `Collaborator`. |
| **B.11** | **CTV hiện hữu mua gói**: User đã có role `COLLABORATOR` (một user một role). | Mất trang "Khách hàng & hoa hồng" cũ, hoặc tạo hai tài khoản. | Dùng lại `Collaborator` sẵn có làm mỏ neo; đổi role sang `PARTNER`; ranh giới cứng PARTNER cho phép thêm `mod:cong-tac-vien-cua-toi` để xem khách CTV cũ. **Không** cho `mod:khach-hang` (lộ hồ sơ y khoa — anti-feature 4). Chờ chủ xác nhận (E.13). |
| **B.12** | **Cổng công khai** hiện có duy nhất `/khach/[token]` (token tĩnh, trong `PUBLIC_PATHS`). Đăng nhập nhân viên = username/mật khẩu; `totp.ts` là 2FA nhân viên; **không có nhà cung cấp OTP SMS/ZNS**. | Đặc tả bắt buộc "OTP xác nhận" khi dùng quyền lợi và đăng nhập đối tác — chưa có hạ tầng. | `/p` yêu cầu phiên đăng nhập riêng (cookie khác, rate-limit). P1 dùng **chữ ký trên máy tính bảng + PIN 6 số của chủ gói** làm xác nhận; OTP thật bật khi chủ chọn kênh (E.10). |
| **B.13** | Đặc tả ghi "đã có `consent`": thực tế `Customer` cũ **không có** đồng ý xử lý dữ liệu; chỉ có `CaseConsent` (phiếu y khoa) và `ZWorkspaceCustomer.consentStatus` (V2). | Thiếu căn cứ pháp lý xử lý CCCD/STK đối tác (NĐ 13/2023). | `Partner.dataConsentAt` + `dataConsentVersion`, bắt buộc trước khi lưu CCCD/STK. |
| **B.14** | Luật dự án: **"Không thêm cơ chế nhắc việc thứ hai — mọi thứ đi qua Pulse"**. Đặc tả có khối "Cần xử lý hôm nay" và nhắc 90/30/7 riêng. | Hai hàng đợi nhắc song song. | Khối "Cần xử lý hôm nay" là **bộ lọc workqueue/Pulse** theo nguồn `alliance`, không phải bảng nhắc riêng. |
| **B.15** | **F8 trong đặc tả** nhân `× 570/tổng giá trị gói`; **HĐ 5% Điều 5** chỉ ghi "− giá trị sản phẩm/dịch vụ thực nhận", tỷ lệ phân bổ "phải ký rõ trước khi thu cọc". HĐ 5% còn cho **Bên B quyền chấm dứt** khi Bên A không hỗ trợ. | App áp tỷ lệ không có trong văn bản ký. | `SeatPurchase.allocationNumerator/Denominator` lấy từ phụ lục đã ký; không có phụ lục → chặn công nhận suất. `TerminationCase.initiator` gồm `HOSPITAL` / `PARTNER_REQUEST` / `PARTNER_FOR_CAUSE`. |
| **B.16** | **HĐ gói 15tr** ghi "không bao gồm cổ phần **hoặc thưởng tuyển đối tác**" và không có điều khoản hoa hồng 3tr; trong khi mọi người mua đều thành "đối tác" và hưởng 3tr/gói giới thiệu. | Khoản chi 3tr không có căn cứ hợp đồng; mâu thuẫn chứng từ khi thanh tra. | App chỉ sinh `REFERRAL_FLAT` khi đối tác có **văn bản giới thiệu đã ký** (`PartnerDocument` loại `REFERRAL_AGREEMENT`). Cần chủ/luật sư bổ sung phụ lục (E.4). |
| **B.17** | **Infographic 01** (thưởng 5% F1 từ F2, "Cổ đông F1/F2"), **02** ("chia lợi nhuận theo tỷ lệ góp vốn", "Quyền lợi của các cổ đông"). | Mâu thuẫn hợp đồng; dấu hiệu đa cấp. | Theo D1, D2: engine 1 cấp, hằng `ALLOW_SECOND_LEVEL = false` **trong code** (không có nút bật trên UI); `referredByPartnerId` chỉ lưu nguồn. T17 kiểm. |
| **B.18** | **Phiếu chọn**: tiêu đề phần A "trị giá 15.000.000đ/gói", từng gói "TRỊ GIÁ 30.000.000đ"; A07 Nhấn mí trị giá 15tr trong khi B01 Nhấn mí bán ưu đãi **4.999.000**. | Khách/đối tác hiểu sai giá trị; A07 tiêu 15tr ví cho dịch vụ bán lẻ 5tr. | Hiển thị "Giá gói 15.000.000đ — Giá trị quyền lợi 30.000.000đ". A07 seed theo D3 (trừ 15tr) nhưng gắn cờ `needsReview` (E.1, E.3). |
| **B.19** | Đặc tả mục 8 "giữ nguyên token Zenith". Luật dự án: chữ "Zenith" **không** xuất hiện trong UI. | — | Chỉ là tên kỹ thuật; UI dùng "Hồng Phúc Alliance" ở cổng đối tác, thương hiệu bệnh viện ở nội bộ. |

---

## C. THIẾT KẾ SCHEMA P0, MIGRATION, SEED

### C.1 Phạm vi P0

Chỉ những bảng cần cho: role PARTNER, danh mục có phiên bản, hợp đồng gói + ví + thu tiền gói, sổ hoa hồng, lịch ngày làm việc. **Chưa** tạo: Selection/Redemption/Beneficiary (P1), PayoutBatch (P2), Seat/Maintenance/Termination (P3), Profit*/Settlement (P4), Training/Media (P5).

Ví (`EntitlementWallet`) **gộp vào `PackageContract`** (quan hệ 1-1, không có dữ liệu riêng); số dư = Σ `WalletEntry.amount`, không lưu cột số dư.

### C.2 Prisma (bổ sung — không sửa cột cũ)

```prisma
// ===================== ĐỐI TÁC CHIẾN LƯỢC (HỒNG PHÚC ALLIANCE) — P0 =====================
// Tiền: VND số nguyên Decimal(14,0). WalletEntry, PackagePayment: append-only (trigger).
// CommissionEntry: chỉ được đổi state/payoutBatchId theo chiều tiến (trigger), không xoá.

enum Role {
  // ... giữ nguyên các giá trị cũ ...
  PARTNER // Đối tác chương trình — chỉ thấy dữ liệu của chính mình (ranh giới cứng trong userCan)
}

enum PartnerTier {
  MEMBER   // Đối tác
  SEAT_2   // Đối tác Quyền lợi 2%
  SEAT_5   // Đối tác Cao cấp 5%
}

enum PartnerStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum CatalogVersionStatus {
  DRAFT
  ACTIVE
  RETIRED
}

enum CatalogItemKind {
  BUNDLE   // Gói chính A01–A07 (chọn 1)
  SERVICE  // Dịch vụ làm thêm (phần B, 8 nhóm)
  PRODUCT  // Sản phẩm (Tasy…) — v1 chưa có dữ liệu
}

enum CatalogPriceUnit {
  PER_SERVICE
  PER_THREAD // /sợi
  PER_UNIT   // /đv
}

enum PackageContractStatus {
  DRAFT
  SIGNED
  ACTIVE
  CONSUMED
  EXPIRED
  TERMINATED
  CANCELLED
}

enum PackagePaymentKind {
  PAYMENT  // thu (+)
  REFUND   // hoàn (−)
  REVERSAL // đảo bút toán nhập sai (dấu ngược dòng gốc)
}

enum WalletEntryKind {
  GRANT             // +30.000.000 khi thu đủ
  REDEEM            // − giá trị chương trình mục đã dùng
  REVERSAL          // đảo một bút toán (dấu ngược)
  EXPIRE            // − số dư khi hết hạn
  REFUND_CONVERSION // − số dư khi quy đổi hoàn tiền (F1)
}

enum CommissionType {
  REFERRAL_FLAT   // 3.000.000đ / hợp đồng gói hợp lệ
  ADDON_PCT       // 10–15% thù lao ngoài gói
  MILESTONE_BONUS // thưởng mốc (P3)
  OFFSET          // cấn trừ (âm), ví dụ bù trừ hoàn tiền D6, cấn trừ 250tr/330tr
  CLAWBACK        // thu hồi khi nguồn bị huỷ trước khi trả (âm)
}

enum CommissionState {
  PENDING  // Chờ — khách đã thanh toán đủ, chưa đối soát
  ELIGIBLE // Đủ điều kiện — đã qua ngày đối soát kỳ
  IN_BATCH // Nằm trong lô chi trả
  PAID     // Đã trả
  VOID     // Huỷ (chỉ từ PENDING/ELIGIBLE, kèm bút toán đối ứng)
}

model Partner {
  id                  String        @id @default(cuid())
  code                String        @unique // Mã giới thiệu, ví dụ HP-2K7Q
  customerId          String        @unique
  customer            Customer      @relation(fields: [customerId], references: [id], onDelete: Restrict)
  collaboratorId      String        @unique // Mỏ neo ghi nhận (tên "Họ tên (HP-2K7Q)")
  collaborator        Collaborator  @relation(fields: [collaboratorId], references: [id], onDelete: Restrict)
  userId              String?       @unique // Tài khoản role PARTNER (null = chưa cấp cổng)
  user                User?         @relation("PartnerUser", fields: [userId], references: [id], onDelete: SetNull)
  tier                PartnerTier   @default(MEMBER)
  status              PartnerStatus @default(ACTIVE)
  // CHỈ lưu nguồn để tra cứu. KHÔNG dùng để tính bất kỳ khoản tiền nào (D1, ALLOW_SECOND_LEVEL=false).
  referredByPartnerId String?
  referredByPartner   Partner?      @relation("PartnerReferredBy", fields: [referredByPartnerId], references: [id], onDelete: SetNull)
  referredPartners    Partner[]     @relation("PartnerReferredBy")
  // Dữ liệu cá nhân nhạy cảm — AES-256-GCM qua secret-crypto, chỉ hiện 4 số cuối.
  nationalIdEnc       String?
  nationalIdLast4     String?
  taxCodeEnc          String?
  bankAccountEnc      String?
  bankAccountLast4    String?
  bankName            String?
  bankHolder          String?
  dataConsentAt       DateTime? // Bắt buộc trước khi lưu CCCD/MST/STK
  dataConsentVersion  String?
  joinedAt            DateTime      @default(now())
  createdById         String?
  createdBy           User?         @relation("PartnerCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  ownedContracts      PackageContract[] @relation("ContractOwner")
  attributedContracts PackageContract[] @relation("ContractAttributedPartner")
  commissionEntries   CommissionEntry[]

  @@index([tier, status])
}

model CatalogVersion {
  id            String               @id @default(cuid())
  code          String               @unique // ví dụ "PC-TM-v0"
  name          String
  status        CatalogVersionStatus @default(DRAFT)
  sourceDoc     String? // "docs/doi-tac/nguon/phieu-chon-tham-my.docx"
  sourceSha256  String? // băm file fixture đã nhập — chống nhập trùng/khác bản
  effectiveFrom DateTime?
  createdById   String?
  createdBy     User?                @relation("CatalogVersionCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  approvedById  String?
  approvedBy    User?                @relation("CatalogVersionApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull)
  approvedAt    DateTime?
  createdAt     DateTime             @default(now())

  items     CatalogItem[]
  contracts PackageContract[]
}

model CatalogItem {
  id            String           @id @default(cuid())
  versionId     String
  version       CatalogVersion   @relation(fields: [versionId], references: [id], onDelete: Restrict)
  code          String // A01..A07; B01-01..B08-13
  kind          CatalogItemKind
  groupCode     String? // B01..B08 (nhóm chính)
  displayGroups String[] // nhóm hiển thị, ví dụ ["B04","B06"] cho "Hút mỡ má"
  name          String
  programValue  Decimal?         @db.Decimal(14, 0) // Trị giá chương trình (BUNDLE): 30.000.000 / 15.000.000
  offerPrice    Decimal?         @db.Decimal(14, 0) // Giá ưu đãi (SERVICE phần B)
  priceUnit     CatalogPriceUnit @default(PER_SERVICE)
  priceNote     String? // "+ vật liệu"
  costEstimate  Decimal?         @db.Decimal(14, 0) // Giá vốn dự kiến (D8)
  requiresDoctor Boolean         @default(true)
  pickMin       Int? // A01: 1
  pickMax       Int? // A01: 3 ; A02: 1 ; A04: null (bác sĩ quyết)
  pickNote      String?
  needsReview   Boolean          @default(false) // dữ liệu nghi sai, chờ chủ xác nhận
  serviceId     String? // liên kết danh mục dịch vụ Zenith khi khớp được
  service       Service?         @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  sortOrder     Int              @default(0)

  options CatalogItemOption[]

  @@unique([versionId, code])
  @@index([versionId, kind, groupCode])
}

model CatalogItemOption {
  id        String      @id @default(cuid())
  itemId    String
  item      CatalogItem @relation(fields: [itemId], references: [id], onDelete: Restrict)
  code      String // A01-1..A01-5
  label     String
  sortOrder Int         @default(0)

  @@unique([itemId, code])
}

model PackageContract {
  id                  String                @id @default(cuid())
  code                String                @unique // GOI-000001
  partnerId           String // Chủ gói (người mua = Đối tác)
  partner             Partner               @relation("ContractOwner", fields: [partnerId], references: [id], onDelete: Restrict)
  attributedPartnerId String? // Người giới thiệu trực tiếp (≤ 1). DB CHECK: <> partnerId (Q7)
  attributedPartner   Partner?              @relation("ContractAttributedPartner", fields: [attributedPartnerId], references: [id], onDelete: Restrict)
  catalogVersionId    String
  catalogVersion      CatalogVersion        @relation(fields: [catalogVersionId], references: [id], onDelete: Restrict)
  soldById            String?
  soldBy              User?                 @relation("ContractSoldBy", fields: [soldById], references: [id], onDelete: SetNull)
  price               Decimal               @default(15000000) @db.Decimal(14, 0)
  entitlementValue    Decimal               @default(30000000) @db.Decimal(14, 0)
  status              PackageContractStatus @default(DRAFT)
  countsForKpi        Boolean               @default(true) // Q2: gói thứ 2 tự mua cho mình = false
  // Thù lao ngoài gói theo HĐ gói Điều 3 (ô Có/Không, %, gồm/chưa thuế)
  addonEnabled        Boolean               @default(true)
  addonRateBpsOverride Int? // null = theo bảng nhóm (mechanism ADDON_PCT)
  addonTaxInclusive   Boolean               @default(true)
  referralMechanismVersionId String? // phiên bản luật 3tr áp cho hợp đồng này
  signedAt            DateTime?
  fullyPaidAt         DateTime? // ngày thu đủ 15tr → GRANT ví + hoa hồng PENDING
  activatedAt         DateTime?
  expiresAt           DateTime? // mặc định activatedAt + 12 tháng (D9)
  cancelledAt         DateTime?
  terminatedAt        DateTime?
  endReason           String?
  refundDueAt         DateTime? // + 15 ngày làm việc (WorkingCalendar)
  contractDocUrl      String?
  note                String?
  createdById         String?
  createdBy           User?                 @relation("ContractCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  payments          PackagePayment[]
  walletEntries     WalletEntry[]
  commissionEntries CommissionEntry[]

  @@index([partnerId, status])
  @@index([attributedPartnerId, fullyPaidAt])
  @@index([status, expiresAt])
}

model PackagePayment {
  id                String             @id @default(cuid())
  contractId        String
  contract          PackageContract    @relation(fields: [contractId], references: [id], onDelete: Restrict)
  kind              PackagePaymentKind @default(PAYMENT)
  amount            Decimal            @db.Decimal(14, 0) // có dấu: thu (+), hoàn (−)
  method            PaymentMethod      @default(CASH)
  paidAt            DateTime           @default(now())
  clientNonce       String?            @unique // idempotency
  reversalOfId      String?            @unique
  reversalOf        PackagePayment?    @relation("PackagePaymentReversal", fields: [reversalOfId], references: [id], onDelete: Restrict)
  reversedBy        PackagePayment?    @relation("PackagePaymentReversal")
  cashTransactionId String?            @unique // CashTransaction PARTNER_PACKAGE / PARTNER_REFUND
  receivedById      String?
  receivedBy        User?              @relation("PackagePaymentReceivedBy", fields: [receivedById], references: [id], onDelete: SetNull)
  note              String?
  createdAt         DateTime           @default(now())

  @@index([contractId, paidAt])
}

model WalletEntry {
  id             String          @id @default(cuid())
  contractId     String
  contract       PackageContract @relation(fields: [contractId], references: [id], onDelete: Restrict)
  kind           WalletEntryKind
  amount         Decimal         @db.Decimal(14, 0) // có dấu
  catalogItemId  String? // mục danh mục đã dùng (REDEEM)
  catalogItem    CatalogItem?    @relation(fields: [catalogItemId], references: [id], onDelete: Restrict)
  reversalOfId   String?         @unique
  reversalOf     WalletEntry?    @relation("WalletEntryReversal", fields: [reversalOfId], references: [id], onDelete: Restrict)
  reversedBy     WalletEntry?    @relation("WalletEntryReversal")
  idempotencyKey String          @unique
  reason         String?
  createdById    String?
  createdBy      User?           @relation("WalletEntryCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt      DateTime        @default(now())
  // P1 sẽ thêm: caseServiceId (unique), stockMovementId, customerConfirmation*

  @@index([contractId, createdAt])
}

model CommissionEntry {
  id                 String          @id @default(cuid())
  partnerId          String
  partner            Partner         @relation(fields: [partnerId], references: [id], onDelete: Restrict)
  type               CommissionType
  state              CommissionState @default(PENDING)
  amount             Decimal         @db.Decimal(14, 0) // có dấu; OFFSET/CLAWBACK âm
  basisAmount        Decimal?        @db.Decimal(14, 0) // căn cứ (ảnh chụp)
  rateBps            Int? // 1200 = 12%
  sourceType         String // PACKAGE_CONTRACT | ADDON_PAYMENT | SEAT | MANUAL_ADJUSTMENT
  sourceRef          String // id nguồn (ảnh chụp, không phụ thuộc FK)
  contractId         String?
  contract           PackageContract? @relation(fields: [contractId], references: [id], onDelete: Restrict)
  paymentId          String? // Payment dịch vụ ngoài gói (SetNull nếu Payment bị xoá — đã có CLAWBACK)
  mechanismVersionId String?
  periodMonth        String // "YYYY-MM" kỳ đối soát
  payoutBatchId      String? // P2
  reversalOfId       String?         @unique
  reversalOf         CommissionEntry? @relation("CommissionReversal", fields: [reversalOfId], references: [id], onDelete: Restrict)
  reversedBy         CommissionEntry? @relation("CommissionReversal")
  taxWithheld        Decimal         @default(0) @db.Decimal(14, 0) // D12: tắt, luôn 0 tới khi kế toán bật
  note               String?
  createdById        String?
  createdBy          User?           @relation("CommissionEntryCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt          DateTime        @default(now())
  stateChangedAt     DateTime?

  @@index([partnerId, state, periodMonth])
  @@index([sourceType, sourceRef])
}

model WorkingCalendarDay {
  date         DateTime @id @db.Date
  isWorkingDay Boolean
  label        String? // "Tết Nguyên đán", "Làm bù"…
  createdById  String?
  createdBy    User?    @relation("WorkingCalendarCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())
}
// Ngày không có dòng = theo quy tắc mặc định (T2–T6 làm việc; T7 theo E.11).
```

**Back-relation phải thêm (chỉ thêm field quan hệ, không đổi cột):** `Customer.partner Partner?`, `Collaborator.partner Partner?`, `Service.catalogItems CatalogItem[]`, `CatalogItem.walletEntries WalletEntry[]`, và trên `User` các quan hệ đặt tên `PartnerUser`, `PartnerCreatedBy`, `CatalogVersionCreatedBy`, `CatalogVersionApprovedBy`, `ContractSoldBy`, `ContractCreatedBy`, `PackagePaymentReceivedBy`, `WalletEntryCreatedBy`, `CommissionEntryCreatedBy`, `WorkingCalendarCreatedBy`.

**Ràng buộc SQL viết tay trong migration (Prisma không biểu diễn được):**

```sql
-- Q7: không tự giới thiệu chính mình
ALTER TABLE "PackageContract" ADD CONSTRAINT "PackageContract_no_self_referral"
  CHECK ("attributedPartnerId" IS NULL OR "attributedPartnerId" <> "partnerId");
-- Gói: giá/ giá trị dương
ALTER TABLE "PackageContract" ADD CONSTRAINT "PackageContract_money_positive"
  CHECK ("price" > 0 AND "entitlementValue" > 0);
-- T11: một hợp đồng chỉ sinh MỘT khoản 3tr dương
CREATE UNIQUE INDEX "CommissionEntry_one_referral_per_contract"
  ON "CommissionEntry" ("contractId") WHERE "type" = 'REFERRAL_FLAT' AND "amount" > 0;
-- Một Payment ngoài gói chỉ sinh một khoản thù lao dương
CREATE UNIQUE INDEX "CommissionEntry_one_addon_per_payment"
  ON "CommissionEntry" ("paymentId") WHERE "type" = 'ADDON_PCT' AND "amount" > 0;
-- Dấu tiền theo loại
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_sign" CHECK (
  ("kind" = 'GRANT' AND "amount" > 0) OR
  ("kind" IN ('REDEEM','EXPIRE','REFUND_CONVERSION') AND "amount" < 0) OR
  ("kind" = 'REVERSAL' AND "amount" <> 0 AND "reversalOfId" IS NOT NULL));
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_sign" CHECK (
  ("kind" = 'PAYMENT' AND "amount" > 0) OR ("kind" = 'REFUND' AND "amount" < 0) OR
  ("kind" = 'REVERSAL' AND "amount" <> 0 AND "reversalOfId" IS NOT NULL));
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_sign" CHECK (
  ("type" IN ('OFFSET','CLAWBACK') AND "amount" < 0) OR
  ("type" IN ('REFERRAL_FLAT','ADDON_PCT','MILESTONE_BONUS') AND ("amount" > 0 OR "reversalOfId" IS NOT NULL)));
```

Số dư ví không âm và "không vượt ví khi chưa có đồng ý" (T16) kiểm ở tầng nghiệp vụ trong transaction có `SELECT … FROM "PackageContract" WHERE id = $1 FOR UPDATE` (Postgres không CHECK được tổng nhiều dòng).

### C.3 Danh sách migration (chỉ bổ sung, viết tay theo BAN-GIAO 8.8)

| Thứ tự | Thư mục | Nội dung | Ghi chú |
|---|---|---|---|
| 1 | `20261120000000_alliance_role_partner` | `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PARTNER';` | Tách riêng: Postgres không cho dùng giá trị enum mới trong cùng transaction. Cập nhật `schema-enum-drift.itest.ts` nếu nó liệt kê cứng. |
| 2 | `20261120010000_alliance_core` | 9 enum mới + 9 bảng + FK + index + CHECK/partial unique ở C.2 | Không `ALTER` bảng cũ nào ngoài FK trỏ tới. |
| 3 | `20261120020000_alliance_ledger_guards` | Trigger `WalletEntry_append_only`, `PackagePayment_append_only` (chặn UPDATE/DELETE); trigger `CommissionEntry_guard`: chặn DELETE, chặn UPDATE mọi cột trừ `state`, `stateChangedAt`, `payoutBatchId`; `state` chỉ được đi PENDING→ELIGIBLE→IN_BATCH→PAID, hoặc PENDING/ELIGIBLE→VOID, hoặc IN_BATCH→ELIGIBLE (rút khỏi lô chưa duyệt). | Khuôn theo `20260813201000_audit_log_append_only`. |
| P1 | `…_alliance_redemption` | `Selection`, `SelectionLine`, `Beneficiary`; cột bổ sung `WalletEntry.caseServiceId/stockMovementId/confirmation*`; `CaseService.walletEntryId` (unique, nullable), `CaseService.addOnContractId` | |
| P2 | `…_alliance_payout` | `PayoutBatch` (+ FK `CommissionEntry.payoutBatchId`), `PartnerDocument`, `PartnerSession`/PIN | |
| P3 | `…_alliance_seats` | `ProfitSeat` (unique `rate+seatNo` khi đang hiệu lực), `SeatPurchase`, `SeatWaitlist`, `MaintenanceMonth`, `PartnerActivity`, `ActivityPlanMonth` (Bên A có giao kế hoạch hay không), `TerminationCase`, `LegalNotice` | |
| P4 | `…_alliance_profit` | `ProfitScope`, `ProfitPeriod`, `ProfitCostLine`, `ProfitShareEntry`, `ProfitDispute`, `Settlement`, `SettlementLine`; cột additive `AccountingPeriod.allianceCommission` (nếu kế toán đồng ý) | |
| P5 | `…_alliance_academy` | `TrainingEvent`, `TrainingAttendance`, `MediaRequest` | |

Triển khai thật: backup trước, `prisma migrate deploy` qua entrypoint; **không** `db push`, **không** `migrate reset`.

### C.4 Chiến lược seed danh mục v0 (từ `nguon/phieu-chon-tham-my.md`)

1. **Fixture tĩnh có kiểm duyệt, không parse markdown lúc chạy.** Chuyển tay một lần sang `web/prisma/alliance/catalog-v0.json` (mã, tên, nhóm, giá, đơn vị, ghi chú, lựa chọn con). Lý do: bảng markdown từ `.docx` có lỗi định dạng ("Dịch vụ làm them", ô giá xuống dòng "4.999.000 + vật liệu"); parse lúc chạy dễ sai im lặng.
2. **Test khoá fixture** (`alliance/catalog-v0.test.ts`):
   - 7 BUNDLE: A01–A06 `programValue = 30.000.000`, A07 = 15.000.000; lựa chọn con A01 = 5 (pickMax 3), A02 = 2 (pickMax 1), A04 = 12 (pickMax null, ghi chú "bác sĩ quyết sau khám"), A03/A05/A06/A07 = 0.
   - Phần B theo nhóm: B01 Mắt 14 · B02 Mũi 16 · B03 Cằm & miệng 9 · B04 Má, thái dương & căng da 13 · B05 Ngực 18 · B06 Hút mỡ & cấy mỡ 12 · B07 Vùng kín 12 · B08 Chỉ–Filler–Botox 13 = **107 dòng hiển thị, 106 mục** ("Hút mỡ má" một mục, `displayGroups ["B04","B06"]`).
   - **Đối chiếu chéo với infographic 03**: min/max giá từng nhóm phải bằng đúng khoảng giá in (Mắt 3.599.000–24.999.000; Mũi 4.999.000–55.999.000; Cằm 5.000.000–18.500.000; Má 3.999.000–31.999.000; Ngực 4.999.000–89.999.000; Hút mỡ 5.999.000–54.999.000; Vùng kín 6.499.000–23.999.000; Chỉ 399.000–4.499.000/sợi; Filler 2.999.000–11.999.000/đv; Botox 9.999.000–12.999.000; Thu lỗ mũi bằng chỉ 4.999.000). Đã kiểm tay: khớp.
   - `priceUnit`: 7 mục `/sợi`, 3 mục `/đv` trong B08; `priceNote "+ vật liệu"` cho "Thay sụn mũi", "Sửa độn cằm lỗi".
   - `needsReview = true`: "Hút mỡ mặt trước (6 vùng)", "Hút mỡ mặt sau (6 vùng)" (29.999.999), A07 (B.18).
   - Mọi số tiền là số nguyên, > 0.
3. **Script idempotent** `web/scripts/alliance/seed-catalog.ts` (npm `alliance:seed-catalog`): tạo `CatalogVersion PC-TM-v0` trạng thái **DRAFT**, upsert theo `(versionId, code)`, ghi `sourceSha256` của fixture; chạy lại không nhân đôi; nếu bản đã ACTIVE và fixture khác băm → từ chối (phải tạo `v1`). Kích hoạt phiên bản = ADMIN bấm, người kích hoạt ≠ người nhập, có audit.
4. **Liên kết `Service`**: so khớp tên chuẩn hoá với danh mục dịch vụ Zenith; khớp chắc chắn mới gán `serviceId`, còn lại để trống và liệt kê trong báo cáo seed cho quản lý gán tay.
5. **Bootstrap dự án** `web/scripts/alliance/bootstrap-project.ts`: tạo `ZProject DT-15TR` (PARTNERSHIP, DRAFT, không dùng template), thêm thành viên, tạo 2 mechanism **DRAFT**: `REFERRAL_FLAT` (`{type:"FLAT_PER_CONTRACT", amount: 3000000}`, testCase khoản 3tr của T12) và `ADDON_PCT` (`{type:"PCT_BY_GROUP", defaultBps:1200, groups:{B01..B08:1200}}` theo D11, testCases T13). Kích hoạt do ADMIN thứ hai.
6. **Không** đưa seed vào `prisma/seed.ts`/`db:seed` (lệnh đó đi kèm `db:reset`).

---

## D. NHIỆM VỤ P0 → P5 (mỗi nhiệm vụ = 1 phiên)

Quy ước: mã `AL-Px-nn`; rủi ro theo giao thức dự án (R1 ghi thường · R2 dữ liệu khách · R3 tiền/quyền/y khoa). **Không làm hai nhiệm vụ R3 trong một phiên.** Mọi nhiệm vụ kết thúc bằng chuỗi `prisma generate && tsc --noEmit && pnpm test && pnpm build`, cập nhật `VERSION.md`/`CHANGELOG.md`/`checks/`, nhánh `agent/al-px-nn`. Cột "Thay thế" = thứ được xoá/ngưng dùng nhờ nhiệm vụ (luật "mỗi nhiệm vụ xoá được thứ gì đó").

### P0 — Nền móng (3 phiên; đặc tả ước 1–2, tách vì luật R3)

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P0-01** | R3 (quyền) | Migration 1 (role PARTNER); `permissions.ts` thêm `mod:doi-tac` (ADMIN, MANAGER), `mod:doi-tac-cong` (PARTNER), năng lực `alliance.sell`, `alliance.redeem`, `alliance.reconcile`, `alliance.approve`; ranh giới cứng PARTNER trong `userCan()`; `rbac.ts` nhãn "Đối tác"; `role-home.ts` → `/p` (trang giữ chỗ); lint rule cấm "cổ đông" trong 3 thư mục module; cập nhật `qa:write-denial` cho PARTNER. | PARTNER có grant `mod:ke-toan`/`phone.full` vẫn bị từ chối; SHAREHOLDER/COLLABORATOR không đổi hành vi (test cũ xanh); không có `mod:doi-tac` cho SHAREHOLDER; lint báo lỗi khi cố ý chèn "Cổ đông" vào file mẫu. | — (test quyền) | Bảng Excel phân quyền đối tác (nếu có) |
| **AL-P0-02** | R3 (tiền, chỉ schema + toán thuần) | Migration 2 + 3; `lib/alliance/money.ts` (F1, F2, F3, kiểm vượt ví, guard cấp 2); `lib/alliance/working-days.ts`; mở rộng `scripts/check-financial-integrity.ts`: Σ WalletEntry ≥ 0 và khớp; không hợp đồng nào có 2 khoản 3tr dương; không hồ sơ có `commissionAmount>0` trên mỏ neo đối tác. | Migration chạy sạch trên DB QA cô lập (không reset); trigger chặn UPDATE/DELETE `WalletEntry` (itest); CHECK tự giới thiệu chặn ở DB; `db:check-integrity` xanh trên seed. | **T1**, **T11** (itest DB unique + nghiệp vụ), **T13** (hàm thuần), **T15**, **T16** (hàm kiểm thuần), **T17** | — |
| **AL-P0-03** | R1 | Fixture `catalog-v0.json` + test khoá; `seed-catalog.ts`; `bootstrap-project.ts`; `lib/alliance/ruleset.ts` (`alliance.v1` + bộ chạy testCases); action kích hoạt mechanism Alliance có kiểm người tạo ≠ người duyệt; trang `/doi-tac/danh-muc` (chỉ xem) và `/doi-tac/co-che` (xem + chạy test + kích hoạt). | Seed tạo đúng 7 gói chính + 106 mục B với giá, chạy 2 lần không trùng; min/max nhóm khớp infographic 03; mechanism không kích hoạt được khi test FAIL hoặc cùng người tạo. | testCase REFERRAL_FLAT (khoản 3tr của **T12**), **T13** (testCase ADDON_PCT) | Phiếu chọn giấy làm "nguồn giá" |

### P1 — Gói 15 triệu vận hành được

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P1-01** | R3 (tiền) | Tạo Partner (+ mỏ neo Collaborator, đồng ý dữ liệu), bán gói ≤ 90 giây: tìm khách 5 số cuối → nhập mã/QR người giới thiệu (hiện tên + ảnh xác nhận) → chọn phiên bản danh mục → sinh hợp đồng (DOCX/PDF điền sẵn) → thu một phần/đủ (`PackagePayment` + `CashTransaction`, idempotent `clientNonce`) → thu đủ = `GRANT +30tr` + `expiresAt`. | Thu 10tr: ví chưa mở; thu thêm 5tr: ví 30tr, đúng 1 GRANT dù bấm 2 lần; khoá tháng chặn ghi; không tạo `Payment`, hoa hồng nhân sự tháng không đổi. | **T12-a** (10/15tr: chưa kích hoạt) | Sổ tay theo dõi gói đã bán |
| **AL-P1-02** | R2 (y khoa nhẹ) | Phiếu chọn số hoá (tablet tại quầy): ràng buộc pickMin/pickMax từ danh mục, phần B hiện giá ưu đãi; bác sĩ xác nhận/điều chỉnh chỉ định trên hồ sơ (không thấy bất kỳ con số hoa hồng nào). | A01 chọn 4 vùng bị chặn; A02 chọn 2 bị chặn; A04 không giới hạn, hiện ghi chú bác sĩ; màn hình bác sĩ không có trường/tooltip hoa hồng (test render). | **T15** (A07 → còn 15tr) | Phiếu chọn giấy |
| **AL-P1-03** | R3 (tiền + y khoa) | Ghi nhận sử dụng: quét mã khách → thẻ ví → chọn mục đã chỉ định → xem "trừ X → còn Y" → chữ ký/PIN chủ gói (B.12) → tạo `CaseService` giá 0 + `REDEEM` trong 1 transaction có khoá hợp đồng; vượt ví → màn hình đồng ý → dòng ngoài gói có giá. Sản phẩm → `StockMovement OUT`. Đảo bút toán có lý do. | Số dư luôn = Σ bút toán (integrity); không có công nợ ảo trên `/cong-no`; thiếu xác nhận → từ chối; vượt ví không đồng ý → chặn. | **T16**, **T15** (end-to-end) | Thẻ giấy ghi số dư |
| **AL-P1-04** | R3 (tiền) | Hết hạn/chấm dứt: `EXPIRE`/`REFUND_CONVERSION` + `PackagePayment REFUND` theo F1, hạn 15 ngày làm việc; người thụ hưởng ≤ 3 (D10); nhắc 90/30/7 qua workqueue; màn hình lịch ngày làm việc (ADMIN). | Hết hạn còn 12tr → đề xuất hoàn 6tr, hạn đúng 15 ngày LV (qua Tết); người thụ hưởng thứ 4 bị chặn; không tạo cơ chế nhắc riêng. | **T1** (end-to-end) | Theo dõi hạn gói bằng tay |

### P2 — Hoa hồng & cổng đối tác

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P2-01** | R3 | Thu đủ gói → `REFERRAL_FLAT` PENDING (nếu có người giới thiệu, có văn bản giới thiệu B.16, không tự giới thiệu); đối soát tháng chuyển ELIGIBLE với hợp đồng còn hợp lệ tại ngày đối soát; hoàn tiền sau khi trả → `OFFSET −3tr` kỳ sau (D6). | Gán 2 đối tác cho 1 hợp đồng bị chặn ở DB và action; gói Q2 (`countsForKpi=false`) vẫn trả 3tr cho người giới thiệu nhưng không đếm KPI. | **T11**, **T12** (đủ 3 nhánh) | Bảng Excel hoa hồng giới thiệu |
| **AL-P2-02** | R3 | Thù lao ngoài gói: hook trong `addPayment`/`updatePayment`/`deletePayment` (`ho-so/actions.ts`) sinh/điều chỉnh `ADDON_PCT` cho dòng `addOnContractId`; căn cứ theo B.7; xoá/sửa Payment → CLAWBACK/OFFSET cùng transaction; chặn `commissionAmount` tay trên mỏ neo đối tác (B.5). | Xoá Payment đã sinh thù lao → có bút toán âm, tổng = 0; hồ sơ không có dòng ngoài gói → không sinh gì; hoa hồng nhân sự không đổi. | **T13** (end-to-end) | Nhập tay `commissionAmount` cho đối tác |
| **AL-P2-03** | R3 | `PayoutBatch`: kế toán lập (chọn ELIGIBLE, trừ OFFSET) → ADMIN khác duyệt → sinh `PaymentRequest` (COLLABORATOR) mỗi đối tác → PAID khi chứng từ PAID; khấu trừ thuế cấu hình nhưng **tắt** (D12); số âm còn dư chuyển kỳ sau. | Người lập = người duyệt bị chặn; Σ dòng lô = số tiền lô (integrity); không có chuyển khoản tự động; khoá tháng chặn. | **T12-c** (bù trừ kỳ sau) | Danh sách chi hoa hồng Excel |
| **AL-P2-04** | R2 | Cổng `/p`: đăng nhập riêng + rate-limit; trang chủ (thẻ ví, thu nhập, hành trình lên hạng 0→50→60, chia sẻ mã/QR); tab Ví (sao kê), Thu nhập (dòng thời gian, drill-down từng bút toán, trạng thái Chờ/Khả dụng/Đã trả), Tôi; sao kê PDF tháng; giao diện theo `MOCKUP-ALLIANCE.html` + token Alliance. | Đối tác chỉ thấy tên viết tắt + SĐT che của người mình giới thiệu; không có cây tuyến dưới/bảng xếp hạng/thu nhập tiềm năng (anti-features 1–3 có test); không chữ "cổ đông"; tải đầu < 2s trên 4G mô phỏng; vùng chạm ≥ 44px. | **T12** (hiển thị đúng trạng thái) | Trả lời đối tác qua Zalo cá nhân |

### P3 — Suất 2%/5% & duy trì (bắt buộc xong trước khi ký suất đầu tiên)

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P3-01** | R3 | `ProfitSeat`, `SeatPurchase`, danh sách chờ; wizard công nhận A (50 HĐ hợp lệ, xuất danh sách để ký) / B (1,5 tỷ · 750tr · cấn trừ 250tr · cọc 50tr + 450tr/1 tháng) / 5% (900tr · cấn trừ 330tr · cọc 50tr + 520tr; tổng giá trị theo D4); cấn trừ ghi `OFFSET` đã dùng; sơ đồ ghế; người lập ≠ người duyệt. | Suất 2% thứ 11 → danh sách chờ; phương án B không sinh hợp đồng khách ảo; thiếu phụ lục tỷ lệ phân bổ → chặn (B.15). | **T10**, **T14** | Biên bản công nhận giấy |
| **AL-P3-02** | R2 | `MaintenanceMonth`, `PartnerActivity` + bằng chứng (biên bản/ảnh/điểm danh), `ActivityPlanMonth` (Bên A có giao kế hoạch không), tạm nghỉ/bất khả kháng; bản đồ nhiệt; vòng duy trì trên cổng. | Thiếu HĐ nhưng có nhiệm vụ → chỉ nhắc; tháng Bên A không giao kế hoạch → không tính. | **T7**, **T8** | Bảng chấm điểm duy trì |
| **AL-P3-03** | R3 | `TerminationCase` + `LegalNotice` (dấu thời gian, kênh, bằng chứng đã nhận); đếm 10 ngày làm việc; người khởi xướng HOSPITAL/PARTNER; quyết định chỉ ADMIN bấm, người lập ≠ người quyết. | Không tồn tại đường code nào tự chuyển TERMINATED (test quét: chỉ action có `requireCap("alliance.approve")` + xác nhận mới đổi); giải trình ngày LV thứ 11 → cho phép quyết định. | **T9** (phần quy trình) | Hồ sơ vụ việc giấy |

### P4 — Kỳ lợi nhuận & quyết toán

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P4-01** | R3 | `ProfitScope` (có phiên bản, theo phụ lục), `ProfitPeriod` (quý) DRAFT→PUBLISHED→DISPUTE_WINDOW→LOCKED→PAID, `ProfitCostLine` chỉ thuộc danh mục khấu trừ đã ký + chứng từ; tham số D5a/b/c hiển thị công khai; không chuyển lỗ (D7). | Thêm khoản chi ngoài danh mục → chặn; kỳ LOCKED không ghi thêm; audit before/after từng dòng chi. | **T5** | Bảng thu chi kỳ Excel |
| **AL-P4-02** | R3 | `ProfitShareEntry` pro-rata theo ngày hiệu lực; chi qua `PayoutBatch`/`PaymentRequest`; suất chấm dứt giữa kỳ tính đến ngày hiệu lực. | Tổng chia không vượt (10×2% + 5×5%) lợi nhuận dương; làm tròn xuống đồng, phần dư không phân bổ ghi rõ. | **T6**, **T9** (phần pro-rata) | — |
| **AL-P4-03** | R3 | `Settlement` F7 (2% phương án B), F8 (5%), PDF biên bản từng dòng công thức, ký hai bên; hạn hoàn 15 ngày LV; phần tranh chấp tách riêng. | Không tự động mất cọc; công thức hiển thị đủ từng dòng. | **T2**, **T3**, **T4** | Tính quyết toán tay |
| **AL-P4-04** | R2 | Cổng: tab Quyền lợi (thẻ suất, vòng duy trì 12 tháng), Phòng dữ liệu kỳ (bảng thu chi, chứng từ, công thức, nút Phản hồi trong hạn), tiến độ thu hồi F9 với câu cố định "Mục tiêu hỗ trợ, không phải bảo lãnh hoàn vốn", thông báo pháp lý có xác nhận đã đọc. | Đối tác 2% xem bảng thu chi và gửi phản hồi trong hạn; quá hạn nút khoá; đối tác thường không thấy tab. | **T5** (hiển thị) | Gửi bảng thu chi qua Zalo |

### P5 — Đài chỉ huy, mô phỏng, học viện, AI

| Mã | Rủi ro | Phạm vi | Tiêu chí nghiệm thu | Test vàng | Thay thế |
|---|---|---|---|---|---|
| **AL-P5-01** | R1 (chỉ đọc) | `/doi-tac` Đài chỉ huy: 5 thẻ (gói bán, thực thu, **nghĩa vụ dịch vụ còn nợ** theo giá trị chương trình + giá vốn + dự phòng hoàn D9, hoa hồng phải trả, lợi nhuận ước), phễu, sơ đồ ghế, "cần xử lý" (lọc Pulse), bản đồ nhiệt; mọi số bấm vào ra bút toán. | Ban điều hành trả lời 4 câu hỏi mục 1 trên một màn hình; số trên thẻ = số từ sổ cái (test đối chiếu). | — | Báo cáo tổng hợp tay |
| **AL-P5-02** | R0/R1 | `/doi-tac/mo-phong`: thanh trượt + biểu đồ thác nước (mục 9), không ghi dữ liệu. **Đề xuất kéo lên ngay sau P0** vì trả lời "chương trình có bền không" trước khi bán thêm. | Ví dụ mục 9 ra đúng 4.300.000đ/gói; điểm hoà vốn lương cố định ≈ 10–11 gói. | — | — |
| **AL-P5-03** | R2 | Học viện: `TrainingEvent` (Zoom 2/tuần, chương trình lớn 1/tuần), điểm danh → tự sinh `PartnerActivity` (chờ xác nhận), lộ trình 4 bước, `MediaRequest` giao Dương/Tuấn, kho nội dung đã duyệt. | Điểm danh sinh hoạt động đúng tháng; đối tác không đăng được nội dung chưa duyệt. | **T7/T8** (nguồn bằng chứng) | Danh sách điểm danh giấy |
| **AL-P5-04** | R2 | AI qua Gateway: tool đọc (đối soát bất thường, "vì sao khoản này đang chờ" dựa trên bút toán), soạn thông báo duy trì/chấm dứt (preview + approval ADMIN), kiểm nội dung đăng. | Không tool nào ghi tiền/đổi trạng thái suất; mọi thông báo qua `AssistantApproval`. | **T17** (AI không vượt guard cấp 2) | — |

### Bảng đối chiếu test số vàng (mục 13) → nhiệm vụ

| Test | Nhiệm vụ (hàm thuần → end-to-end) |
|---|---|
| T1 | AL-P0-02 → AL-P1-04 |
| T2, T3, T4 | AL-P4-03 (hàm thuần có thể viết sớm ở AL-P0-02 nếu chủ muốn khoá công thức) |
| T5 | AL-P4-01, AL-P4-04 |
| T6 | AL-P4-02 |
| T7, T8 | AL-P3-02 |
| T9 | AL-P3-03 (quy trình) + AL-P4-02 (pro-rata) |
| T10, T14 | AL-P3-01 |
| T11 | AL-P0-02 (DB) → AL-P2-01 |
| T12 | AL-P1-01 (a) → AL-P2-01 (b) → AL-P2-03 (c) |
| T13 | AL-P0-02 (thuần) → AL-P0-03 (mechanism) → AL-P2-02 |
| T15 | AL-P0-02 → AL-P1-02, AL-P1-03 |
| T16 | AL-P0-02 → AL-P1-03 |
| T17 | AL-P0-02, AL-P5-04 |

Tổng: **20 phiên** (P0: 3 · P1: 4 · P2: 4 · P3: 3 · P4: 4 · P5: 4). Đường tối thiểu để vận hành hợp pháp với đối tác thường: P0 → P1 → P2 = 11 phiên.

---

## E. CÂU HỎI CẦN CHỦ TRẢ LỜI (chưa có trong QUYET-DINH.md)

Ưu tiên: **[P0]** cần trước khi thi công P0 · **[P1]**, **[P2]**… cần trước giai đoạn đó.

1. **[P0] A07 "Nhấn mí" trị giá 15tr** trong khi phần B bán Nhấn mí ưu đãi **4.999.000đ**. Khách dùng 15tr ví cho dịch vụ bán lẻ 5tr — giữ nguyên, hạ giá trị quy đổi A07, hay bỏ A07?
2. **[P0] "Hút mỡ mặt trước/sau (6 vùng)" = 29.999.999đ** — sửa thành 29.999.000đ? (Seed tạm giữ nguyên, gắn cờ cần duyệt.)
3. **[P0] Phiếu chọn ghi phần A "trị giá 15.000.000đ/gói" nhưng từng gói ghi 30.000.000đ.** Đồng ý app hiển thị "Giá gói 15tr — Giá trị quyền lợi 30tr" và in lại phiếu theo câu chữ này?
4. **[P2] Căn cứ chi 3.000.000đ/hợp đồng:** HĐ gói 15tr ghi "không bao gồm… thưởng tuyển đối tác" và không có điều khoản hoa hồng giới thiệu. Bổ sung "Thoả thuận giới thiệu khách hàng" riêng (app chỉ chi khi đã ký)? Cần luật sư xem.
5. **[P2] Tỷ lệ ngoài gói:** HĐ gói Điều 3 có ô riêng từng hợp đồng (Có/Không, ...%, gồm/chưa thuế); D11 là bảng 12% theo nhóm. Khi khác nhau, **hợp đồng từng người thắng** hay bảng nhóm thắng?
6. **[P2] Phạm vi & thời hạn "dịch vụ ngoài gói":** chỉ danh mục phần B hay mọi dịch vụ của bệnh viện (infographic nêu nám, da, sức khỏe, tiểu phẫu)? Khách do đối tác giới thiệu được ghi nhận thù lao trong bao lâu (12 tháng như gói / vô thời hạn)?
7. **[P2] Mở rộng Q3:** khách cũ (đã có CTV X) mua gói qua đối tác Y, **sau đó làm thêm dịch vụ mới ngoài gói** — thù lao F3 cho Y, cho X, hay không ai?
8. **[P1] Hoa hồng nhân sự với gói:** (a) Nhân viên bán gói có hưởng % tư vấn trên 15tr không? (b) Bác sĩ thực hiện dịch vụ **trong gói** hưởng 8% trên gì — 0, giá trị chương trình, hay giá vốn? (c) Điều dưỡng giữ 100k/ca? Hiện app sẽ không tự trả gì cho (a)(b).
9. **[P1] Kế toán ghi nhận 15tr:** doanh thu ngay khi thu, hay **khoản nhận trước** ghi dần khi khách dùng quyền lợi? (Ảnh hưởng P&L, "doanh số tổng" D5 và lợi nhuận chia suất.) Cần Bích xác nhận.
10. **[P1] Kênh xác nhận khi dùng quyền lợi / đăng nhập cổng:** OTP qua Zalo ZNS hoặc SMS brandname (có chi phí, cần đăng ký) hay **chữ ký trên máy tính bảng + PIN 6 số** (mặc định tôi đề xuất cho P1)?
11. **[P1] Ngày làm việc:** thứ Bảy có tính là ngày làm việc khi đếm "10/15 ngày làm việc" không? Ai nhập lịch nghỉ lễ hằng năm?
12. **[P0] Vai trò SHAREHOLDER** (đang xem toàn bộ hệ thống) có được xem module Đối tác không? Mặc định đề xuất: **không** (có CCCD/STK và chi trả đối tác).
13. **[P0] CTV hiện có mua gói:** đổi tài khoản sang role Đối tác và vẫn xem được danh sách khách CTV cũ (không xem hồ sơ y khoa)?
14. **[P2] Tài khoản cổng đối tác:** đăng nhập bằng SĐT + mật khẩu hay SĐT + mã một lần; ai cấp tài khoản; đối tác không dùng smartphone thì nhân viên xem hộ và in sao kê?
15. **[P1] Giá vốn theo từng mục danh mục:** D8 mới có giá vốn bình quân 2tr/gói. Ai cung cấp giá vốn từng mục (A01–A07, phần B)? Tạm thời có đồng ý phân bổ 2tr theo tỷ lệ giá trị không?
16. **[P3] Tỷ lệ phân bổ khi quyết toán suất 5%:** HĐ 5% Điều 5 không ghi "× 570/tổng giá trị" (chỉ nói phải ký rõ trong phụ lục). Xác nhận đưa tỷ lệ 570/1.800 (theo D4) vào phụ lục trước khi thu cọc?
17. **[P0] Định dạng mã đối tác** `HP-` + 4 ký tự (bỏ ký tự dễ nhầm 0/O, 1/I) — đồng ý?
18. **[P1] Còn mở từ đặc tả §14 (không có trong QUYET-DINH):** (a) Khi nào có phiếu chọn nhóm chăm sóc sức khỏe/spa/sản phẩm Tasy? (b) Sản phẩm Tasy trừ kho bệnh viện hay giao từ nhà sản xuất? (c) Có mở chương trình cho cơ sở Hà Nội / bệnh viện tiếp theo không (ảnh hưởng `ProfitScope`)?
19. **[P0] Nơi đặt tài liệu dự án:** bộ tài liệu đối tác và kế hoạch này đang lưu ở repo `Trungtamdalieu` theo yêu cầu. Mã nguồn ở repo `ZenithTasks`. Khi thi công P0, có sao chép `docs/doi-tac/` sang `ZenithTasks` để nằm cạnh code (khuyến nghị) không?

---

*Hết kế hoạch. Chờ chủ duyệt trước khi mở nhánh `agent/al-p0-01`.*
