# Project Context – URL Shortener Platform

* Hệ thống là một URL Shortener có xác thực người dùng, quản lý URL theo user, thu thập traffic, cung cấp insight và hỗ trợ subscription trả phí.
* Authentication sử dụng Firebase Auth; backend chỉ tin Firebase ID Token đã verify và map user thông qua `firebase_uid` lưu trong DB.
* User là entity hệ thống, mỗi user có `firebase_uid`, `email`, `role` enum {user, admin}, `account_status` enum {active, disabled}, `created_at`, `updated_at`.
* Email chỉ dùng để hiển thị và liên hệ; **không dùng email làm identity chính** hoặc foreign key.
* Không hỗ trợ anonymous user; chỉ user đã login qua Firebase mới được tạo URL.
* User chưa verify email vẫn được tạo URL, nhưng đây là quyết định nghiệp vụ có rủi ro spam (technical debt đã chấp nhận).

---

## User & Subscription Rules

* Mỗi user có thể có subscription; subscription được quản lý qua Stripe.
* Subscription có `plan_type` enum {free, paid} và `status` enum {active, expired, canceled}.
* Free tier bị giới hạn **tối đa 5 URL**.
* Paid tier cho phép tạo **unlimited URL về mặt nghiệp vụ**, nhưng hệ thống có **hidden technical cap** để bảo vệ DB.
* Limit URL tính theo **tổng số URL tồn tại**, không phân biệt active/expired.
* Limit reset theo **tuần**.
* Khi vượt limit, hệ thống **block cứng**, không cho tạo URL mới.
* Khi subscription hết hạn:
  * Toàn bộ URL của user bị chuyển sang trạng thái `disabled`
  * Hệ thống **không ghi nhận traffic mới**
* Upgrade / downgrade subscription có hiệu lực **ngay lập tức**, không chờ cuối chu kỳ.

---

## URL Management

* URL là entity trung tâm, mỗi URL thuộc về **một user**.
* Mỗi URL gồm `short_code`, `destination_url`, `status`, timestamps.
* Một URL chỉ map tới **một destination URL** (không A/B testing, không geo redirect).
* Trạng thái URL gồm:
  * `active`
  * `expired`
  * `deleted` (soft delete)
  * `disabled` (do admin hoặc subscription)
* Soft delete được dùng cho URL; không hard delete để giữ dữ liệu traffic.
* Free user **không được đổi short code**.
* Paid user được custom short code:
  * Short code phải unique toàn hệ thống
  * Nếu trùng → reject ngay
  * Khi đổi short code, mapping redirect được cập nhật theo code mới; không giữ lịch sử redirect cũ.

---

## URL Metadata

* Mỗi URL có một bản ghi metadata (1:1).
* Metadata gồm:
  * title
  * description
  * tags
  * custom UTM parameters
* Metadata **chỉ phục vụ phân tích & hiển thị**, không ảnh hưởng đến logic redirect.
* Không có versioning metadata.
* Không log lịch sử ai sửa metadata, sửa khi nào (đã chấp nhận mất trace).

---

## Traffic Collection & Analytics

* Khi user click short URL, hệ thống thực hiện redirect và **log click bất đồng bộ (async)**.
* Redirect flow không bị block bởi việc ghi log.
* Mỗi click record lưu:
  * timestamp
  * ip address
  * user-agent
  * referrer
  * country
  * device / OS / browser
  * bot flag
* Click data được lưu **vĩnh viễn**, không có retention limit.
* Không có unique click; tất cả click đều là raw count.
* Bot traffic không bị loại bỏ, chỉ được **flag** để phân tích.

---

## Aggregation & Insight

* Ngoài raw click log, hệ thống có bảng aggregation (daily stats) để phục vụ dashboard.
* User dashboard hiển thị:
  * total clicks
  * breakdown theo country
  * breakdown theo device / OS / browser
* Admin có thể xem traffic:
  * theo user
  * theo URL
  * filter theo domain
* Insight được coi là **near-realtime** (best-effort), không đảm bảo realtime tuyệt đối.
* Insight bao gồm:
  * Top URL tăng trưởng
  * User có dấu hiệu spam
  * Traffic bất thường
* Insight không chỉ để đọc; hệ thống hỗ trợ action:
  * flag URL
  * auto pause URL
  * disable URL

---

## Admin Capabilities

* Hệ thống chỉ có **một role admin**.
* Admin có thể:
  * disable user
  * override quota user
  * force downgrade subscription
  * disable hoặc pause URL
* Khi admin disable user:
  * Firebase token vẫn hợp lệ
  * Nhưng backend sẽ reject mọi hành động nghiệp vụ
  * Toàn bộ URL của user bị disable
* Admin có audit log cho các hành động:
  * user disabled
  * quota override
  * URL flagged / disabled
* Admin không được xoá traffic data (do privacy / compliance).

---

## User Activity & Audit

* Hệ thống ghi nhận user action log cho:
  * tạo URL
  * xoá URL
  * vượt limit
* Audit log mang tính hệ thống, không phục vụ realtime analytics mà phục vụ trace & compliance.
* Không hỗ trợ undo hay rollback hành động từ audit log.

---

## System Constraints & Technical Decisions

* Database chính: MySQL.
* Click table là append-only, volume cao.
* Partition click data theo `url_id` (technical debt đã chấp nhận).
* Chưa có chiến lược archive click data; retention = infinite.
* Unlimited subscription luôn có hidden system cap để tránh abuse.
* Không hỗ trợ guest/external account.
* Không hỗ trợ multi-destination URL hoặc rule-based redirect.
* Không hỗ trợ custom domain (nếu có sẽ là phase sau).

---

## Out of Scope (Explicit)

* Không quản lý unique visitor
* Không anti-spam nâng cao (ML-based)
* Không export analytics nâng cao ngoài CSV
* Không RBAC phức tạp
* Không webhook cho traffic events
* Không public API cho bên thứ ba

---

## Intended Usage

* Backend: FastAPI
* Authentication: Firebase Auth
* Billing: Stripe
* Database: MySQL
* Traffic logging: async worker
* Analytics: pre-aggregated MySQL tables

This document defines the **project-level context and business rules** for the URL Shortener platform and is the source of truth for feature scope and behavior.
