# Project Tasks & Milestones

## Milestone 1: Core Database & Models
- [ ] Create Enums for:
    - `UserRole` (Admin, Employee)
    - `CourseType` (Frontend, Backend, Fullstack)
    - `DaysPattern` (Sat+Tue, Sun+Wed, Mon+Thu)
    - `AttendanceStatus` (Present, Excused, Absent)
- [ ] Create Migrations & Models for:
    - `branches` (name, location, etc.)
    - `groups` (branch_id, name, course_type, pattern, start_date, max_lectures, is_active)
    - `students` (name, details)
    - `enrollments` (student_id, group_id, enrolled_at)
    - `lecture_sessions` (group_id, date, lecture_number)
    - `attendances` (lecture_session_id, student_id, status: present/excused/absent)
    - `transfer_logs` (student_id, from_group_id, to_group_id, transferred_at, effective_date)
- [ ] Setup Eloquent Relationships in all Models.
- [ ] Add `branch_id` and `role` to `users` (Employees) table.
- [ ] Create Factories and Seeders for initial data and testing.

## Milestone 2: Authentication & Branch Isolation
- [ ] Define Roles & Permissions (Admin, Employee).
- [ ] Implement Global Scopes for Branch Isolation (models filtered by `user->branch_id`).
- [ ] Create Middleware to ensure Employees only access their branch's data.
- [ ] Admin "Super-view" to bypass branch isolation.

## Milestone 3: Branch & Group Management
- [ ] CRUD for Branches (Admin only).
- [ ] CRUD for Groups (Admin/Employee).
    - Implement pattern logic (Sat+Tue, Sun+Wed, Mon+Thu).
    - Implement Course Type enum (Frontend, Backend, Fullstack).
- [ ] Manual "End Group" functionality with validation.

## Milestone 4: Student Management & Enrollment
- [ ] CRUD for Students.
- [ ] Enrollment UI: Register students into groups.
- [ ] Student Transfer Logic:
    - Log transfer in `transfer_logs`.
    - Ensure it takes effect from the next lecture.
- [ ] View student transfer history.

## Milestone 5: Ultra-Fast Attendance System
- [ ] Attendance Page UI (React 19 + shadcn/ui):
    - Filter groups active today based on pattern.
    - List students with status toggles (Present, Excused, Absent).
- [ ] Frontend State Management (React State + TanStack Query).
- [ ] Backend: Bulk Attendance Insert.
    - Automatic `lecture_sessions` creation on first save.
    - DB Transactions & Race Condition protection (Unique constraints).
- [ ] Live Counters: Present / Excused / Absent count in UI.

## Milestone 6: Reports & Search
- [ ] Student Attendance Report:
    - Compliance percentage calculation.
    - Attendance history list.
    - Transfer history list.
- [ ] Search functionality for students across groups/branches.
- [ ] Admin Dashboard: Overview of all branches and group progress.

## Milestone 7: UI/UX & Quality Assurance
- [ ] Keyboard Shortcuts for rapid attendance marking.
- [ ] Responsive design for mobile/tablet use in centers.
- [ ] Code Quality: Run `vendor/bin/pint` and `tsc`.
- [ ] Final Feature Testing (Pest).
