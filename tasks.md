# Project Tasks & Milestones

## Milestone 1: Core Database & Models
- [x] Create Enums for:
    - `UserRole` (Admin, Employee)
    - `CourseType` (Frontend, Backend, Fullstack)
    - `DaysPattern` (Sat+Tue, Sun+Wed, Mon+Thu)
    - `AttendanceStatus` (Present, Excused, Absent)
- [x] Create Migrations & Models for:
    - `branches` (name, location, etc.)
    - `groups` (branch_id, name, course_type, pattern, start_date, max_lectures, is_active)
    - `students` (name, details)
    - `enrollments` (student_id, group_id, enrolled_at)
    - `lecture_sessions` (group_id, date, lecture_number)
    - `attendances` (lecture_session_id, student_id, status: present/excused/absent)
    - `transfer_logs` (student_id, from_group_id, to_group_id, transferred_at, effective_date)
- [x] Setup Eloquent Relationships in all Models.
- [x] Add `branch_id` and `role` to `users` (Employees) table.
- [x] Create Factories and Seeders for initial data and testing.

## Milestone 2: Authentication & Branch Isolation
- [x] Define Roles & Permissions (Admin, Employee).
- [x] Implement Global Scopes for Branch Isolation (models filtered by `user->branch_id`).
    - [x] Prevent recursion by using `Auth::hasUser()` in `BranchScope`.
- [x] Create Middleware to ensure Employees only access their branch's data.
- [x] Admin "Super-view" to bypass branch isolation.

## Milestone 3: Branch & Group Management
- [x] CRUD for Branches (Admin only).
- [x] CRUD for Groups (Admin/Employee).
    - [x] Implement pattern logic (Sat+Tue, Sun+Wed, Mon+Thu).
    - [x] Implement Course Type enum (Frontend, Backend, Fullstack).
- [x] Manual "End Group" functionality with validation.

## Milestone 4: Student Management & Enrollment
- [x] CRUD for Students.
- [x] Enrollment UI: Register students into groups.
- [x] Student Transfer Logic:
    - [x] Log transfer in `transfer_logs`.
    - [x] Ensure it takes effect from the next lecture.
- [x] View student transfer history.

## Milestone 5: Ultra-Fast Attendance System
- [x] Attendance Page UI (React 19 + shadcn/ui):
    - [x] Filter groups active today based on pattern.
    - [x] List students with status toggles (Present, Excused, Absent).
- [x] Frontend State Management (React State + TanStack Query).
- [x] Backend: Bulk Attendance Insert.
    - [x] Automatic `lecture_sessions` creation on first save.
    - [x] DB Transactions & Race Condition protection (Unique constraints).
- [x] Live Counters: Present / Excused / Absent count in UI.

## Milestone 6: Reports & Search
- [x] Student Attendance Report:
    - [x] Compliance percentage calculation.
    - [x] Attendance history list.
    - [x] Transfer history list.
- [x] Search functionality for students across groups/branches.
- [x] Admin Dashboard: Overview of all branches and group progress.

## Milestone 7: UI/UX & Quality Assurance
- [x] Keyboard Shortcuts for rapid attendance marking.
- [x] Responsive design for mobile/tablet use in centers.
- [x] Code Quality: Run `vendor/bin/pint` and `tsc`.
<!-- - [ ] Final Feature Testing (Pest). -->
