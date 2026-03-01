<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير حضور الطالب</title>
    <style>
        @font-face {
            font-family: 'Readex Pro';
            @if(isset($print) && $print)
                src: url('{{ asset('fonts/ReadexPro-Regular.ttf') }}') format('truetype');
            @else
                src: url('{{ public_path('fonts/ReadexPro-Regular.ttf') }}') format('truetype');
            @endif
            font-weight: 400;
            font-style: normal;
        }

        body {
            font-family: 'Readex Pro', sans-serif;
            direction: rtl;
            background-color: #fff;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .student-info {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }

        .info-item {
            margin-bottom: 5px;
        }

        .info-label {
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        .status-present { color: green; }
        .status-absent { color: red; }
        .status-excused { color: orange; }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }

        .summary {
            margin-top: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            overflow: hidden;
        }

        .summary-item {
            float: right;
            width: 25%;
            text-align: center;
        }

        .summary-label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #666;
        }

        .summary-value {
            font-size: 1.5em;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير حضور الطالب</h1>
        <h2>Createivo</h2>
    </div>

    <div class="student-info">
        <div>
            <div class="info-item">
                <span class="info-label">اسم الطالب:</span>
                <span>{{ $student->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">المسار:</span>
                <span>{{ $student->formatted_track ?? 'غير محدد' }}</span>
            </div>
        </div>
        <div style="text-align: left;">
            <div class="info-item">
                <span class="info-label">الفرع:</span>
                <span>{{ $student->branch->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">تاريخ التقرير:</span>
                <span>{{ now()->format('Y-m-d') }}</span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>التاريخ</th>
                <th>المجموعة</th>
                <th>المحاضرة</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attendances as $index => $attendance)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $attendance->lectureSession->date->format('Y-m-d') }}</td>
                    <td>{{ $attendance->lectureSession->group->name }}</td>
                    <td>{{ $attendance->lectureSession->lecture_number }}</td>
                    <td class="status-{{ $attendance->status->value }}">
                        {{ match($attendance->status->value) {
                            'present' => 'حاضر',
                            'absent' => 'غائب',
                            'excused' => 'بعذر',
                            default => $attendance->status->value
                        } }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">إجمالي المحاضرات</span>
            <span class="summary-value">{{ $stats['total'] }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">حضور</span>
            <span class="summary-value status-present">{{ $stats['present'] }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">غياب</span>
            <span class="summary-value status-absent">{{ $stats['absent'] }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">بعذر</span>
            <span class="summary-value status-excused">{{ $stats['excused'] }}</span>
        </div>
    </div>

    <div class="footer">
        <p>تم استخراج هذا التقرير آلياً من نظام Createivo</p>
    </div>

    @if(isset($print) && $print)
    <script>
        window.onload = function() {
            window.print();
        }
        window.onafterprint = function() {
            // Only redirect if this is NOT an iframe
            if (window.self === window.top) {
                window.location.href = "{{ $return_url }}";
            }
        };
    </script>
    @endif
</body>
</html>
