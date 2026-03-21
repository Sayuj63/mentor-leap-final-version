---
description: "Complete Project Workflow: User Onboarding, Course Selection, & Meeting Management"
---

# 🚀 MentorLeap Complete Project Workflow

This workflow summarizes the entire lifecycle of a user on the MentorLeap platform, including administrative actions and core features.

## 1. User Onboarding & Authentication
**Location:** `src/app/auth`

The initial step for any user to access personalized features.
- [ ] **Registration:** Create an account via `src/app/auth/register`.
- [ ] **Login:** Access the dashboard via `src/app/auth/login` (Firebase Auth).
- [ ] **Profile Setup:** Users can update their information in `src/app/dashboard/profile`.

## 2. Course Selection & Learning Journey
**Location:** `src/app/courses`, `src/app/dashboard/explore`, `src/app/course-player`

How users find and consume educational content.
- [ ] **Browse Courses:** Users find courses in `src/app/dashboard/explore`.
- [ ] **Course Details:** View course info and curriculum in `src/app/courses/[id]`.
- [ ] **Enrollment:** Enroll (via `src/services/courseService.ts`). Payments are handled via Razorpay (`src/app/api/razorpay`).
- [ ] **Learning:** Access enrolled courses in `src/app/dashboard/my-courses` and play lessons in `src/app/course-player`.
- [ ] **Certification:** Earn and view certificates in `src/app/dashboard/certificates` (using `src/services/certificateService.ts`).

## 3. Meeting & Event Management
**Location:** `src/app/events`, `src/app/dashboard/my-events`, `src/app/executive-coaching`

How users book time with mentors or join events.
- [ ] **Browse Events:** Find scheduled events in `src/app/events`.
- [ ] **Book Discovery Call:** Specialized booking for executive coaching in `src/app/executive-coaching/book-discovery-call`.
- [ ] **Registration:** Register for an event using `EventService.registerForEvent` (in `src/services/eventService.ts`).
- [ ] **My Meetings:** View all upcoming and registered events in `src/app/dashboard/my-events`.

## 4. AI-Powered Assistant
**Location:** `src/app/dashboard/ai-assistant`, `src/app/api/chat`

The intelligent tutor available for help.
- [ ] **Chat:** Users can ask questions to the AI assistant (using Groq API) for guidance on courses or coaching.

## 5. Administrative Controls
**Location:** `src/app/admin`

The central management hub for administrators.
- [ ] **Dashboard:** Monitor system-wide stats.
- [ ] **User Management:** View and manage all platform users in `/admin/users`.
- [ ] **Course Creation:** Add/edit/delete courses, modules, and lessons in `/admin/courses`.
- [ ] **Event Management:** Create and schedule new events or meetings.
- [ ] **Transaction Tracking:** Oversee payments and enrollment history.

## 6. Technical Stack Reference
- **Frontend:** Next.js (App Router), TailwindCSS, React.
- **Backend/Database:** Firebase Authentication, Firestore, Firebase Admin SDK.
- **Integrations:** Razorpay (Payments), Groq API (AI Chat), Nodemailer (Emails).
- **Services:** All core logic resides in `src/services/`.
