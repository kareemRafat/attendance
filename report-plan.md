# Implementation Plan: Student Attendance Arabic PDF Report

This plan outlines the steps to implement a downloadable Arabic PDF attendance report using **Spatie Browsershot**.

## 1. Install Dependencies
Browsershot requires both a PHP package and a Node.js headless browser (Puppeteer).

- **PHP:** `composer require spatie/browsershot`
- **Node.js:** `npm install puppeteer`

## 2. Infrastructure Configuration (Windows)
Since the environment is Windows, you must explicitly define the paths for Node and Puppeteer in your `.env` file to ensure Browsershot can locate them.

```env
# Example paths - adjust based on your actual installation
NODE_PATH="C:\\Program Files\\nodejs\\node.exe"
PUPPETEER_EXECUTABLE_PATH="C:\\Path\\To\\Chrome\\Or\\Chromium\\chrome.exe"
```

## 3. Arabic Font Setup (Readex Pro)
Standard PDF fonts do not support Arabic.
- The project already includes **Readex Pro** (`public/fonts/ReadexPro-Regular.ttf`).
- Define the `@font-face` in the report's Blade template or global CSS.
- Ensure the font is correctly applied to the `body` element for full RTL support.

## 4. Create the Report Template
Create a new Blade view: `resources/views/reports/attendance-pdf.blade.php`.

### Key Requirements:
- **RTL Support:** Use `<html dir="rtl" lang="ar">`.
- **Font-Family:** Apply the Arabic font to the body.
- **Styling:** Use standard CSS. Browsershot supports modern CSS (Flexbox/Grid).
- **Static Assets:** Use absolute paths for images/logos.

## 5. Backend Logic (Controller)
Create a controller to handle the data gathering and PDF stream.

### Responsibilities:
- Fetch student data and attendance records.
- Use `Browsershot::html($viewContent)` to generate the PDF.
- Configure Browsershot options (margins, paper size, emulated media type).
- Return a `Response` with `application/pdf` headers.

## 6. Define the Route
Add a named route in `routes/web.php`:
- `Route::get('/students/{student}/attendance/report', [AttendanceReportController::class, 'download'])->name('students.attendance.report');`

## 7. Frontend Integration
Add the download button to your React/Inertia page (e.g., Student Profile).

### Important:
- Use a standard `<a>` tag with `href={route('students.attendance.report', student.id)}` instead of an Inertia `<Link>`.
- This ensures the browser treats the response as a file download.

## 8. Verification Steps
- Verify Arabic characters are joined correctly (not separated).
- Verify the layout is correctly flipped (RTL).
- Verify that numbers and dates are formatted as desired (Eastern vs. Western Arabic numerals).
- Run `npm run build` to ensure all assets are ready if they are referenced.
