# Nexus Academy - Database Schema Documentation

This document describes the database tables, their types, and relationships based on the SQL definitions for the Nexus Academy platform.

## 1. Tables and Columns

### `users`
Stores information about students, instructors, and administrators.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | int | PK, Identity | Unique identifier for the user. |
| `first_name` | nvarchar(50) | | User's first name. |
| `last_name` | nvarchar(50) | | User's last name. |
| `email` | nvarchar(255) | Unique | User's email address. |
| `hashed_password` | char(60) | | BCrypt hashed password. |
| `avatar_url` | varchar(255) | | URL to the user's profile picture. |
| `role` | varchar(15) | | User role: 'user', 'instructor', or 'admin'. |
| `title` | nvarchar(70) | | Professional title (mostly for instructors). |
| `bio` | nvarchar(255) | | Short biography. |
| `created_at` | datetime | | Timestamp of account creation. |
| `is_verified` | bit | | Email verification status. |
| `otp` | varchar(64) | | One-Time Password for verification/reset. |
| `otp_expires` | bigint | | Expiration timestamp for OTP. |
| `google_id` | nvarchar(255) | | Google OAuth ID. |

### `categories`
Categories for organizing courses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `category_id` | int | PK, Identity | Unique identifier for the category. |
| `name` | nvarchar(100) | Unique | Name of the category. |
| `created_at` | datetime | | Timestamp of creation. |

### `courses`
Educational courses offered on the platform.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `course_id` | int | PK, Identity | Unique identifier for the course. |
| `instructor_id` | int | FK (users) | Reference to the course instructor. |
| `category_id` | int | FK (categories) | Reference to the course category. |
| `title` | nvarchar(255) | | Title of the course. |
| `description` | nvarchar(1000) | | Detailed description. |
| `price` | decimal(7, 2) | | Current selling price. |
| `original_price` | decimal(7, 2) | | Price before any discounts. |
| `thumbnail_url` | varchar(255) | | URL to course preview image. |
| `is_available` | bit | | Whether the course is published. |
| `level` | nvarchar(50) | | Difficulty level (e.g., Beginner, Intermediate). |
| `created_at` | datetime | | Timestamp of creation. |

### `sections`
Groups of lessons within a course.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `course_id` | int | PK, FK (courses) | Reference to the parent course. |
| `section_order` | int | PK | Order index within the course. |
| `title` | nvarchar(255) | | Title of the section. |
| `created_at` | datetime | | Timestamp of creation. |

### `lessons`
Individual educational units (videos).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `course_id` | int | PK, FK (sections) | Part of the composite key for the course. |
| `section_order` | int | PK, FK (sections) | Part of the composite key for the section. |
| `lesson_order` | int | PK | Order index within the section. |
| `title` | nvarchar(255) | | Title of the lesson. |
| `video_url` | varchar(255) | | URL/Path to the lesson video. |
| `duration` | int | | Duration of the video in seconds. |
| `description` | nvarchar(1000) | | Brief description of the lesson. |
| `created_at` | datetime | | Timestamp of creation. |

### `enrollments`
Records of students enrolled in courses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `course_id` | int | PK, FK (courses) | The enrolled course. |
| `user_id` | int | PK, FK (users) | The enrolled student. |
| `enrollment_cost` | decimal(7, 2) | | Price paid at enrollment. |
| `payment_method` | nvarchar(50) | | Payment method used (e.g., 'card'). |
| `payment_status` | nvarchar(50) | | Status of payment (e.g., 'paid'). |
| `transaction_id` | varchar(255) | | External payment gateway transaction ID. |
| `enrolled_at` | datetime | | Timestamp of enrollment. |

### `reviews`
Student feedback on courses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | int | PK, FK (users) | The reviewer. |
| `course_id` | int | PK, FK (courses) | The course being reviewed. |
| `comment` | nvarchar(1000) | | Review text content. |
| `rating` | decimal(3, 2) | | Star rating (e.g., 1.00 - 5.00). |
| `reviewed_at` | datetime | | Timestamp of the review. |

### `certificates`
Issued completion certificates.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | int | PK, FK (users) | Recipient of the certificate. |
| `course_id` | int | PK, FK (courses) | Course completed. |
| `issue_date` | datetime | | Date the certificate was issued. |

### `user_lessons`
Tracks progress of students through individual lessons.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | int | PK, FK (users) | The student tracking progress. |
| `lesson_order` | int | PK, FK (lessons) | Reference to lesson order. |
| `section_order` | int | PK, FK (lessons) | Reference to section order. |
| `course_id` | int | PK, FK (lessons) | Reference to course. |
| `completed_at` | datetime | | Timestamp when lesson was completed. |

---

## 2. Relationships Summary

- **User -> Course (Instructor):** One-to-Many. An instructor can create multiple courses. (`users.user_id` -> `courses.instructor_id`)
- **Category -> Course:** One-to-Many. A category can contain multiple courses. (`categories.category_id` -> `courses.category_id`)
- **Course -> Section:** One-to-Many. A course is divided into multiple sections. (`courses.course_id` -> `sections.course_id`)
- **Section -> Lesson:** One-to-Many. A section contains multiple lessons. (`sections.(course_id, section_order)` -> `lessons.(course_id, section_order)`)
- **User <-> Course (Student):** Many-to-Many via **Enrollments**.
- **User <-> Course (Reviews):** Many-to-Many via **Reviews**.
- **User <-> Course (Certificates):** Many-to-Many via **Certificates**.
- **User <-> Lesson (Progress):** Many-to-Many via **User_Lessons**.