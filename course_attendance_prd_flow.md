# PRD Flow - نظام إدارة حضور طلاب كورسات البرمجة

## 1. Overview Flow
```
Start
  │
  ▼
User Login (Admin / Employee)
  │
  ├──> Determine Branch (Employee: branch_id auto, Admin: choose branch)
  │
  ▼
Select Page
  │
  ├──> Branch & Groups Management
  │       │
  │       ├──> CRUD Branch
  │       ├──> CRUD Groups
  │       ├──> Set Course Type (Frontend / Backend / Fullstack)
  │       ├──> Set Days Pattern (Sat+Tue, Sun+Wed, Mon+Thu)
  │       └──> End Group manually
  │
  ├──> Student Management
  │       │
  │       ├──> Add/Edit Student
  │       ├──> Enrollment in Group
  │       ├──> Transfer Student (next lecture only)
  │       └──> Show Student Attendance & Transfer Logs
  │
  ├──> Attendance Page (Ultra-fast)
  │       │
  │       ├──> Fetch active groups for today (based on pattern & branch)
  │       ├──> Fetch active students in group (Enrollment)
  │       ├──> Initialize Attendance State (default absent)
  │       ├──> Employee marks Present / Excused (local React state)
  │       ├──> Live Counters: Present / Excused / Absent
  │       └──> Save Attendance (Bulk Insert, create Lecture Session if first lecture)
  │
  └──> Employee Management (Admin only)
          │
          ├──> Add/Edit Employee
          └──> Assign Branch & Role
  │
  ▼
Student Report Page
  │
  ├──> Search Student
  ├──> Show Attendance (Present / Excused / Absent)
  ├──> Show Transfer History
  └──> Show Compliance %
  │
  ▼
End
```

## 2. Tables & Relationships
```
Branches
  │
  └─< Groups
        │
        └─< LectureSessions
               │
               └─< Attendance

Students
  │
  └─< Enrollment >─ Groups

Employees
  │
  └─ Branches

TransferLogs
  │
  └─ Students + From_Group + To_Group
```

## 3. Key Workflow Notes
1. Lecture Session is auto-created only on first save per day per group.
2. Attendance default = absent; employee marks Present / Excused.
3. Enrollment ensures student history is preserved on transfer.
4. Branch Isolation enforced via Global Scope & Middleware.
5. Group completion is manual; system suggests when lectures reach 45.
6. Race conditions prevented via DB Unique Constraint + Transactions.
7. Reports pull data from Attendance + Enrollment + TransferLogs.

## 4. Page to Action Mapping
```
Pages:
1. Branch & Groups Management -> CRUD, Days Pattern, End Group
2. Student Management -> CRUD, Enrollment, Transfer, Report
3. Attendance Page -> Fetch today’s active groups, mark attendance, save
4. Employee Management -> CRUD, Assign Branch/Role
5. Student Report -> Search, show attendance, transfers, compliance
```

## 5. Event Flow Example
```
Employee Login -> Branch auto-selected -> Attendance Page
-> Fetch today’s group -> Fetch students -> Initialize attendance state
-> Mark Present/Excused -> Live counters update -> Save Attendance -> LectureSession created if not exists
-> Bulk Insert attendance
-> Update reports
```

## 6. Notes
- All operations validated server-side to prevent manipulation.
- Optimized React + TanStack Query for ultra-fast attendance recording.
- All history preserved for transfers and past attendance.
- Admin can override branch restrictions.

