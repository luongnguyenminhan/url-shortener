# URL Shortener Database Context

## Overview

This database supports a URL Shortener platform with user authentication via Firebase Auth, URL management, traffic tracking, admin moderation, insights, and subscription-based quota control.

The system is designed with:

- MySQL as the primary relational database
- High-volume click logging via append-only tables
- Clear separation between user data, URL data, traffic data, and admin analytics
- Soft-delete and status-based lifecycle control

This document provides full schema context for backend development and AI coding agents.

---

## Database Schema

### Core Tables

---

## 1. Users (`users`)

**Primary user profile and account state**

- `id`: BIGINT (Primary Key)
- `firebase_uid`: VARCHAR(128) (Unique, Required)
- `email`: VARCHAR(255)
- `role`: ENUM('user', 'admin') (Default: 'user')
- `account_status`: ENUM('active', 'disabled') (Default: 'active')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Notes:**

- Authentication is handled by Firebase Auth
- This table stores authorization, quota, and subscription linkage

**Relationships:**

- One-to-Many → urls
- One-to-Many → subscriptions
- One-to-Many → admin_action_logs
- One-to-Many → user_action_logs

---

## 2. Subscriptions (`subscriptions`)

**Stripe-backed subscription records**

- `id`: BIGINT (Primary Key)
- `user_id`: BIGINT (Foreign Key → users.id)
- `stripe_customer_id`: VARCHAR(255)
- `stripe_subscription_id`: VARCHAR(255)
- `plan_type`: ENUM('free', 'paid')
- `status`: ENUM('active', 'expired', 'canceled')
- `started_at`: TIMESTAMP
- `ended_at`: TIMESTAMP (Nullable)
- `created_at`: TIMESTAMP

**Relationships:**

- Many-to-One → users

---

## URL Management

---

## 3. URLs (`urls`)

**Shortened URL records**

- `id`: BIGINT (Primary Key)
- `user_id`: BIGINT (Foreign Key → users.id)
- `short_code`: VARCHAR(64) (Unique, Indexed)
- `destination_url`: TEXT (Required)
- `status`: ENUM('active', 'expired', 'deleted', 'disabled')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP (Soft delete)

**Constraints:**

- Free users: max 5 total URLs
- Paid users: unlimited (with system-level hidden cap)

**Relationships:**

- Many-to-One → users
- One-to-Many → url_metadata
- One-to-Many → click_events
- One-to-Many → daily_url_stats
- One-to-Many → flagged_urls

---

## 4. URL Metadata (`url_metadata`)

**Editable metadata for analytics and insight**

- `id`: BIGINT (Primary Key)
- `url_id`: BIGINT (Foreign Key → urls.id)
- `title`: VARCHAR(255)
- `description`: TEXT
- `tags`: JSON
- `utm_params`: JSON
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Notes:**

- Metadata does not affect redirect behavior
- No versioning or audit tracking

**Relationships:**

- One-to-One → urls

---

## Traffic & Analytics

---

## 5. Click Events (`click_events`)

**Raw click log (append-only, high volume)**

- `id`: BIGINT (Primary Key)
- `url_id`: BIGINT (Foreign Key → urls.id)
- `clicked_at`: TIMESTAMP (Indexed)
- `ip_address`: VARCHAR(64)
- `user_agent`: TEXT
- `referrer`: TEXT
- `country_code`: CHAR(2)
- `device_type`: VARCHAR(64)
- `os`: VARCHAR(64)
- `browser`: VARCHAR(64)
- `is_bot`: BOOLEAN (Default: false)

**Partitioning Strategy:**

- Partitioned by `url_id`
- Expected volume: ~10k records/day (initial)

**Relationships:**

- Many-to-One → urls

---

## 6. Daily URL Stats (`daily_url_stats`)

**Pre-aggregated traffic metrics (for user & admin dashboards)**

- `id`: BIGINT (Primary Key)
- `url_id`: BIGINT (Foreign Key → urls.id)
- `date`: DATE (Indexed)
- `total_clicks`: INT
- `bot_clicks`: INT
- `country_breakdown`: JSON
- `device_breakdown`: JSON
- `created_at`: TIMESTAMP

**Notes:**

- Used for near-realtime analytics
- Source of truth for insights & dashboards

**Relationships:**

- Many-to-One → urls

---

## Admin & Moderation

---

## 7. Flagged URLs (`flagged_urls`)

**Admin or system-flagged URLs for abuse or anomalies**

- `id`: BIGINT (Primary Key)
- `url_id`: BIGINT (Foreign Key → urls.id)
- `reason`: VARCHAR(255)
- `flag_type`: ENUM('spam', 'abuse', 'traffic_anomaly')
- `is_auto_flagged`: BOOLEAN
- `created_at`: TIMESTAMP

**Relationships:**

- Many-to-One → urls

---

## 8. Admin Action Logs (`admin_action_logs`)

**Audit log of admin actions**

- `id`: BIGINT (Primary Key)
- `admin_id`: BIGINT (Foreign Key → users.id)
- `action`: VARCHAR(255)
- `target_type`: ENUM('user', 'url', 'subscription')
- `target_id`: BIGINT
- `metadata`: JSON
- `created_at`: TIMESTAMP

**Relationships:**

- Many-to-One → users (admin)

---

## User Activity Tracking

---

## 9. User Action Logs (`user_action_logs`)

**User-level behavior tracking**

- `id`: BIGINT (Primary Key)
- `user_id`: BIGINT (Foreign Key → users.id)
- `action`: ENUM('create_url', 'delete_url', 'exceed_limit')
- `metadata`: JSON
- `created_at`: TIMESTAMP

**Relationships:**

- Many-to-One → users

---

## Key Relationships Overview

### User-Centric

```

User
├── urls (1:N)
├── subscriptions (1:N)
├── user_action_logs (1:N)
└── admin_action_logs (1:N)

```

### URL-Centric

```

URL
├── metadata (1:1)
├── click_events (1:N)
├── daily_url_stats (1:N)
└── flagged_urls (1:N)

```

---

## Design Principles

1. **Soft Deletes**: URLs are never hard-deleted
2. **Append-Only Click Logs**: No updates on click_events
3. **Aggregation Layer**: daily_url_stats used for dashboards & insights
4. **Async Click Logging**: Redirect flow is non-blocking
5. **Admin Control via Status**: Disable instead of delete
6. **Subscription-Aware Quotas**: Enforced at service layer

---

## Known Technical Debt

- No click archive strategy (retention = infinite)
- Unlimited subscription relies on hidden system caps
- Bot detection is heuristic-based and best-effort
- Realtime insight depends on aggregation freshness

---

## Intended Usage

- Backend: FastAPI + SQLAlchemy
- Database: MySQL 8+
- Authentication: Firebase Auth
- Billing: Stripe
- Analytics: Pre-aggregated MySQL + async workers

This database context defines the authoritative schema for the URL Shortener platform.
