const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildAllocationCsv = ({ exam, allocations }) => {
  const headers = [
    "Exam Name",
    "Subject",
    "Exam Date",
    "Student Name",
    "Roll Number",
    "Department",
    "Hall Name",
    "Seat Number",
    "Seat Label",
  ];

  const rows = allocations.map((allocation) => [
    exam.examName,
    exam.subject,
    new Date(exam.examDate).toISOString().split("T")[0],
    allocation.studentId?.name || "",
    allocation.studentId?.rollNumber || "",
    allocation.department,
    allocation.hallId?.hallName || "",
    allocation.seatNumber,
    allocation.seatLabel,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
};

