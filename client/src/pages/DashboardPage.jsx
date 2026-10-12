import {
  Building2,
  CalendarRange,
  ClipboardList,
  Download,
  FileSpreadsheet,
  LayoutGrid,
  PencilLine,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import HallCapacityCard from "../components/charts/HallCapacityCard.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import MetricCard from "../components/layout/MetricCard.jsx";
import PrintableLayout from "../components/reports/PrintableLayout.jsx";
import StudentTable from "../components/students/StudentTable.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import UploadCard from "../components/ui/UploadCard.jsx";
import useAuthStore from "../store/useAuthStore.js";
import useAppStore from "../store/useAppStore.js";
import { downloadBlob } from "../utils/download.js";
import { formatDate, formatDepartments, formatTimeRange } from "../utils/formatters.js";

const studentDefaults = {
  name: "",
  rollNumber: "",
  department: "",
  semester: "",
  email: "",
  phone: "",
};

const examDefaults = {
  examName: "",
  subject: "",
  examDate: "",
  startTime: "",
  endTime: "",
  departments: "",
  venueNotes: "",
};

const hallDefaults = {
  hallName: "",
  building: "",
  floor: "",
  capacity: 30,
  rows: 5,
  columns: 6,
  active: true,
};

const getMessage = (error) => error?.message || "Something went wrong.";

export default function DashboardPage() {
  const auth = useAuthStore();
  const store = useAppStore();

  const [activeSection, setActiveSection] = useState("overview");
  const [notice, setNotice] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editingHall, setEditingHall] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const deferredStudentSearch = useDeferredValue(studentSearch);

  const studentForm = useForm({ defaultValues: studentDefaults });
  const examForm = useForm({ defaultValues: examDefaults });
  const hallForm = useForm({ defaultValues: hallDefaults });

  const sections = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "students", label: "Students", icon: Users },
    { id: "exams", label: "Exams", icon: CalendarRange },
    { id: "halls", label: "Halls", icon: Building2 },
    { id: "allocations", label: "Allocations", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
  ];

  useEffect(() => {
    store.bootstrap().catch((error) => {
      setNotice({ type: "error", text: getMessage(error) });
    });
  }, []);

  useEffect(() => {
    if (!store.selectedExamId && store.exams[0]?._id) {
      store.fetchAllocations(store.exams[0]._id).catch(() => undefined);
    }
  }, [store.exams, store.selectedExamId]);

  useEffect(() => {
    if (editingStudent) {
      studentForm.reset(editingStudent);
      return;
    }

    studentForm.reset(studentDefaults);
  }, [editingStudent]);

  useEffect(() => {
    if (editingExam) {
      examForm.reset({
        examName: editingExam.examName,
        subject: editingExam.subject,
        examDate: editingExam.examDate?.slice(0, 10) || "",
        startTime: editingExam.startTime || "",
        endTime: editingExam.endTime || "",
        departments: editingExam.departments?.join(", ") || "",
        venueNotes: editingExam.venueNotes || "",
      });
      return;
    }

    examForm.reset(examDefaults);
  }, [editingExam]);

  useEffect(() => {
    if (editingHall) {
      hallForm.reset({
        hallName: editingHall.hallName,
        building: editingHall.building || "",
        floor: editingHall.floor || "",
        capacity: editingHall.capacity,
        rows: editingHall.rows,
        columns: editingHall.columns,
        active: editingHall.active,
      });
      return;
    }

    hallForm.reset(hallDefaults);
  }, [editingHall]);

  const visibleStudents = store.students.filter((student) => {
    if (!deferredStudentSearch) {
      return true;
    }

    const term = deferredStudentSearch.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.rollNumber.toLowerCase().includes(term) ||
      student.department.toLowerCase().includes(term)
    );
  });

  const selectedExam = store.exams.find((exam) => exam._id === store.selectedExamId);

  const scrollToSection = (sectionId) => {
    startTransition(() => {
      setActiveSection(sectionId);
    });
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFeedback = () => {
    setNotice(null);
    store.clearError();
  };

  const showSuccess = (text) => {
    setNotice({ type: "success", text });
  };

  const showError = (error) => {
    setNotice({ type: "error", text: getMessage(error) });
  };

  const submitStudent = async (values) => {
    resetFeedback();

    try {
      if (editingStudent) {
        await store.updateStudent(editingStudent._id, values);
        showSuccess("Student record updated.");
      } else {
        await store.createStudent(values);
        showSuccess("Student record added.");
      }

      studentForm.reset(studentDefaults);
      setEditingStudent(null);
    } catch (error) {
      showError(error);
    }
  };

  const submitExam = async (values) => {
    resetFeedback();

    try {
      if (editingExam) {
        await store.updateExam(editingExam._id, values);
        showSuccess("Exam updated successfully.");
      } else {
        await store.createExam(values);
        showSuccess("Exam created successfully.");
      }

      examForm.reset(examDefaults);
      setEditingExam(null);
    } catch (error) {
      showError(error);
    }
  };

  const submitHall = async (values) => {
    resetFeedback();

    try {
      if (editingHall) {
        await store.updateHall(editingHall._id, values);
        showSuccess("Hall updated successfully.");
      } else {
        await store.createHall(values);
        showSuccess("Hall created successfully.");
      }

      hallForm.reset(hallDefaults);
      setEditingHall(null);
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Delete student ${student.name}?`)) {
      return;
    }

    resetFeedback();

    try {
      await store.deleteStudent(student._id);
      showSuccess("Student deleted successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteExam = async (exam) => {
    if (!window.confirm(`Delete exam ${exam.examName}? Existing allocations for this exam will also be removed.`)) {
      return;
    }

    resetFeedback();

    try {
      await store.deleteExam(exam._id);
      showSuccess("Exam deleted successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteHall = async (hall) => {
    if (!window.confirm(`Delete hall ${hall.hallName}?`)) {
      return;
    }

    resetFeedback();

    try {
      await store.deleteHall(hall._id);
      showSuccess("Hall deleted successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleGenerateAllocations = async () => {
    if (!store.selectedExamId) {
      showError(new Error("Select an exam before generating seating."));
      return;
    }

    resetFeedback();

    try {
      const response = await store.generateAllocations(store.selectedExamId);
      showSuccess(response.message || "Seating generated successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleRefreshAllocations = async () => {
    if (!store.selectedExamId) {
      return;
    }

    resetFeedback();

    try {
      await store.fetchAllocations(store.selectedExamId);
      showSuccess("Allocation view refreshed.");
    } catch (error) {
      showError(error);
    }
  };

  const handleClearAllocations = async () => {
    if (!store.selectedExamId) {
      return;
    }

    if (!window.confirm("Clear all allocations for the selected exam?")) {
      return;
    }

    resetFeedback();

    try {
      await store.clearAllocations(store.selectedExamId);
      showSuccess("Allocations cleared successfully.");
    } catch (error) {
      showError(error);
    }
  };

  const handleDownloadReport = async () => {
    if (!store.selectedExamId || !selectedExam) {
      showError(new Error("Select an exam before downloading a report."));
      return;
    }

    try {
      const blob = await store.downloadAllocationReport(store.selectedExamId);
      downloadBlob(blob, `${selectedExam.examName.replace(/\s+/g, "-").toLowerCase()}-report.csv`);
      showSuccess("Report download started.");
    } catch (error) {
      showError(error);
    }
  };

  const upcomingExams = store.dashboard.recentExams || [];

  return (
    <AppShell
      sections={sections}
      activeSection={activeSection}
      onSectionChange={scrollToSection}
      user={auth.user}
      onLogout={auth.logout}
    >
      {notice ? (
        <div
          className={`mb-6 rounded-3xl border px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "border-[#bfe3d0] bg-[#eaf8f1] text-success"
              : "border-[#f6d2cc] bg-[#fff0ed] text-[#C2410C]"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {store.error && !notice ? (
        <div className="mb-6 rounded-3xl border border-[#f6d2cc] bg-[#fff0ed] px-4 py-3 text-sm font-medium text-[#C2410C]">
          {store.error}
        </div>
      ) : null}

      <section id="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Students"
            value={store.dashboard.counts.students}
            caption="Registered and upload-ready student records."
          />
          <MetricCard
            label="Exams"
            value={store.dashboard.counts.exams}
            tone="orange"
            caption="Scheduled exams available for allocation."
          />
          <MetricCard
            label="Halls"
            value={store.dashboard.counts.halls}
            tone="ink"
            caption="Configured halls with seat grid details."
          />
          <MetricCard
            label="Seat Assignments"
            value={store.dashboard.counts.allocations}
            tone="orange"
            caption="Generated seats across all saved allocations."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <Card
            title="Exam Control Center"
            subtitle="Quick access to the next allocation run and hall distribution."
            actions={
              <Button variant="accent" onClick={() => scrollToSection("allocations")}>
                <Sparkles className="h-4 w-4" />
                Open Allocation Workspace
              </Button>
            }
            className="bg-gradient-to-br from-white to-accentSoft/30"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-4xl bg-[#10304b] p-6 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Latest allocated exam</p>
                <h3 className="mt-4 text-2xl font-bold">
                  {store.dashboard.latestAllocatedExam?.examName || "No allocations yet"}
                </h3>
                <p className="mt-2 text-sm text-white/72">
                  {store.dashboard.latestAllocatedExam
                    ? `${formatDate(store.dashboard.latestAllocatedExam.examDate)} | ${store.dashboard.latestAllocatedExam.subject}`
                    : "Generate seating for an exam to populate the dashboard."}
                </p>
              </div>
              <div className="rounded-4xl bg-primarySoft/55 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Allocation rules in use</p>
                <ul className="mt-4 space-y-3 text-sm text-ink">
                  <li>Capacity is never exceeded for any hall.</li>
                  <li>Students are interleaved by department when possible.</li>
                  <li>Seat labels are generated hall-wise for printable grids.</li>
                </ul>
              </div>
            </div>
          </Card>

          <HallCapacityCard hallUtilization={store.dashboard.hallUtilization} />
        </div>

        <Card title="Upcoming Exams" subtitle="Review upcoming schedules and department scope before allocation.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingExams.length ? (
              upcomingExams.map((exam) => (
                <button
                  key={exam._id}
                  type="button"
                  onClick={() => {
                    store.setSelectedExamId(exam._id);
                    store.fetchAllocations(exam._id).catch(() => undefined);
                    scrollToSection("allocations");
                  }}
                  className="rounded-4xl border border-line bg-shell/65 p-5 text-left transition hover:border-primary hover:bg-white"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{formatDate(exam.examDate)}</p>
                  <h3 className="mt-3 text-xl font-bold text-ink">{exam.examName}</h3>
                  <p className="mt-2 text-sm text-muted">{exam.subject}</p>
                  <p className="mt-4 text-sm text-[#A24E00]">{formatDepartments(exam.departments)}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted">No exams created yet.</p>
            )}
          </div>
        </Card>
      </section>

      <section id="students" className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <UploadCard
            title="Bulk Upload Students"
            description="Import student datasets from CSV, XLS, or XLSX in one step."
            hint="Expected columns: name, rollNumber, department, semester, email, phone."
            loading={store.loading.studentUpload}
            onUpload={async (file) => {
              resetFeedback();
              try {
                const response = await store.uploadStudents(file);
                showSuccess(response.message || "Students uploaded successfully.");
              } catch (error) {
                showError(error);
              }
            }}
          />

          <Card
            title={editingStudent ? "Edit Student" : "Add Student"}
            subtitle="Create or update student records manually."
            className="bg-white/92"
          >
            <form className="grid gap-4 md:grid-cols-2" onSubmit={studentForm.handleSubmit(submitStudent)}>
              <FormField
                label="Student Name"
                placeholder="Enter full name"
                error={studentForm.formState.errors.name?.message}
                {...studentForm.register("name", { required: "Student name is required." })}
              />
              <FormField
                label="Roll Number"
                placeholder="2026CSE001"
                error={studentForm.formState.errors.rollNumber?.message}
                {...studentForm.register("rollNumber", { required: "Roll number is required." })}
              />
              <FormField
                label="Department"
                placeholder="CSE"
                error={studentForm.formState.errors.department?.message}
                {...studentForm.register("department", { required: "Department is required." })}
              />
              <FormField label="Semester" placeholder="6" {...studentForm.register("semester")} />
              <FormField label="Email" type="email" placeholder="student@example.com" {...studentForm.register("email")} />
              <FormField label="Phone" placeholder="9876543210" {...studentForm.register("phone")} />

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button type="submit" loading={store.loading.studentForm}>
                  {editingStudent ? "Update Student" : "Save Student"}
                </Button>
                {editingStudent ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingStudent(null);
                      studentForm.reset(studentDefaults);
                    }}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </div>

        <Card title="Search Students" subtitle="Filter students by name, roll number, or department.">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Search student records"
              className="w-full rounded-3xl border border-line bg-white px-11 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        <StudentTable students={visibleStudents} onEdit={setEditingStudent} onDelete={handleDeleteStudent} />
      </section>

      <section id="exams" className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <UploadCard
            title="Bulk Upload Exams"
            description="Bring exam schedules into the dashboard from structured spreadsheet files."
            hint="Expected columns: examName, subject, examDate, startTime, endTime, departments, venueNotes."
            loading={store.loading.examUpload}
            onUpload={async (file) => {
              resetFeedback();
              try {
                const response = await store.uploadExams(file);
                showSuccess(response.message || "Exams uploaded successfully.");
              } catch (error) {
                showError(error);
              }
            }}
          />

          <Card
            title={editingExam ? "Edit Exam" : "Create Exam"}
            subtitle="Define exam details, schedule, and eligible departments."
            className="bg-white/92"
          >
            <form className="grid gap-4 md:grid-cols-2" onSubmit={examForm.handleSubmit(submitExam)}>
              <FormField
                label="Exam Name"
                placeholder="Semester End Examination"
                error={examForm.formState.errors.examName?.message}
                {...examForm.register("examName", { required: "Exam name is required." })}
              />
              <FormField
                label="Subject"
                placeholder="Operating Systems"
                error={examForm.formState.errors.subject?.message}
                {...examForm.register("subject", { required: "Subject is required." })}
              />
              <FormField
                label="Exam Date"
                type="date"
                error={examForm.formState.errors.examDate?.message}
                {...examForm.register("examDate", { required: "Exam date is required." })}
              />
              <FormField label="Start Time" type="time" {...examForm.register("startTime")} />
              <FormField label="End Time" type="time" {...examForm.register("endTime")} />
              <FormField
                label="Departments"
                placeholder="CSE, ECE, IT"
                className="md:col-span-2"
                {...examForm.register("departments")}
              />
              <FormField
                label="Venue Notes"
                as="textarea"
                rows="3"
                placeholder="Optional notes for invigilators or planning"
                className="md:col-span-2"
                {...examForm.register("venueNotes")}
              />

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button type="submit" loading={store.loading.examForm}>
                  {editingExam ? "Update Exam" : "Save Exam"}
                </Button>
                {editingExam ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingExam(null);
                      examForm.reset(examDefaults);
                    }}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </div>

        <Card title="Exam Schedule" subtitle="Manage created exams and move them into the allocation flow.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="pb-3 font-semibold">Exam</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Departments</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.exams.length ? (
                  store.exams.map((exam) => (
                    <tr key={exam._id} className="border-b border-line/70 last:border-b-0">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-ink">{exam.examName}</p>
                        <p className="text-xs text-muted">{exam.subject}</p>
                      </td>
                      <td className="py-4 pr-4 text-muted">{formatDate(exam.examDate)}</td>
                      <td className="py-4 pr-4 text-muted">{formatTimeRange(exam.startTime, exam.endTime)}</td>
                      <td className="py-4 pr-4 text-muted">{formatDepartments(exam.departments)}</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            exam.status === "Allocated"
                              ? "bg-[#eaf8f1] text-success"
                              : "bg-accentSoft text-[#A24E00]"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingExam(exam);
                              scrollToSection("exams");
                            }}
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => {
                              store.setSelectedExamId(exam._id);
                              store.fetchAllocations(exam._id).catch(() => undefined);
                              scrollToSection("allocations");
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            Allocate
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteExam(exam)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-muted">
                      No exams added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section id="halls" className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <UploadCard
            title="Bulk Upload Halls"
            description="Import hall layouts, capacities, and active status in one upload."
            hint="Expected columns: hallName, building, floor, capacity, rows, columns, active."
            loading={store.loading.hallUpload}
            onUpload={async (file) => {
              resetFeedback();
              try {
                const response = await store.uploadHalls(file);
                showSuccess(response.message || "Halls uploaded successfully.");
              } catch (error) {
                showError(error);
              }
            }}
          />

          <Card
            title={editingHall ? "Edit Hall" : "Create Hall"}
            subtitle="Capture capacity and seat grid details for each exam hall."
            className="bg-white/92"
          >
            <form className="grid gap-4 md:grid-cols-2" onSubmit={hallForm.handleSubmit(submitHall)}>
              <FormField
                label="Hall Name"
                placeholder="Main Hall A"
                error={hallForm.formState.errors.hallName?.message}
                {...hallForm.register("hallName", { required: "Hall name is required." })}
              />
              <FormField
                label="Capacity"
                type="number"
                min="1"
                error={hallForm.formState.errors.capacity?.message}
                {...hallForm.register("capacity", {
                  required: "Capacity is required.",
                  valueAsNumber: true,
                })}
              />
              <FormField label="Building" placeholder="Academic Block" {...hallForm.register("building")} />
              <FormField label="Floor" placeholder="2" {...hallForm.register("floor")} />
              <FormField
                label="Rows"
                type="number"
                min="1"
                {...hallForm.register("rows", { valueAsNumber: true })}
              />
              <FormField
                label="Columns"
                type="number"
                min="1"
                {...hallForm.register("columns", { valueAsNumber: true })}
              />

              <label className="md:col-span-2 flex items-center gap-3 rounded-3xl border border-line bg-canvas px-4 py-3 text-sm font-semibold text-ink">
                <input type="checkbox" className="h-4 w-4 accent-[#1E5FAF]" {...hallForm.register("active")} />
                Mark this hall as active for allocations
              </label>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button type="submit" loading={store.loading.hallForm}>
                  {editingHall ? "Update Hall" : "Save Hall"}
                </Button>
                {editingHall ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingHall(null);
                      hallForm.reset(hallDefaults);
                    }}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </div>

        <Card title="Exam Halls" subtitle="Capacity planning and activation status for every available hall.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="pb-3 font-semibold">Hall</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Capacity</th>
                  <th className="pb-3 font-semibold">Grid</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.halls.length ? (
                  store.halls.map((hall) => (
                    <tr key={hall._id} className="border-b border-line/70 last:border-b-0">
                      <td className="py-4 pr-4 font-semibold text-ink">{hall.hallName}</td>
                      <td className="py-4 pr-4 text-muted">
                        {[hall.building, hall.floor && `Floor ${hall.floor}`].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td className="py-4 pr-4 text-muted">{hall.capacity}</td>
                      <td className="py-4 pr-4 text-muted">
                        {hall.rows} x {hall.columns}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            hall.active ? "bg-[#eaf8f1] text-success" : "bg-shell text-muted"
                          }`}
                        >
                          {hall.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingHall(hall);
                              scrollToSection("halls");
                            }}
                          >
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteHall(hall)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-muted">
                      No halls created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section id="allocations" className="mt-10 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <Card
            title="Generate Seating Allocation"
            subtitle="Select an exam and produce hall-wise seat assignments automatically."
            className="bg-gradient-to-br from-white to-primarySoft/35"
          >
            <div className="space-y-4">
              <FormField
                label="Select Exam"
                as="select"
                value={store.selectedExamId}
                onChange={(event) => {
                  store.setSelectedExamId(event.target.value);
                  store.fetchAllocations(event.target.value).catch(() => undefined);
                }}
              >
                <option value="">Choose an exam</option>
                {store.exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.examName} - {formatDate(exam.examDate)}
                  </option>
                ))}
              </FormField>

              <div className="rounded-4xl border border-line bg-white/85 p-5">
                <p className="text-sm font-semibold text-ink">{selectedExam?.subject || "No exam selected"}</p>
                <p className="mt-2 text-sm text-muted">
                  {selectedExam
                    ? `${formatDate(selectedExam.examDate)} | ${formatTimeRange(
                        selectedExam.startTime,
                        selectedExam.endTime
                      )}`
                    : "Choose an exam to inspect its schedule and allocation output."}
                </p>
                <p className="mt-3 text-sm text-[#A24E00]">{formatDepartments(selectedExam?.departments)}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerateAllocations} loading={store.loading.generateAllocations}>
                  <Sparkles className="h-4 w-4" />
                  Generate Seating
                </Button>
                <Button variant="secondary" onClick={handleRefreshAllocations} loading={store.loading.allocations}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="danger" onClick={handleClearAllocations} loading={store.loading.clearAllocations}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Hall Allocation Summary" subtitle="Occupancy across each hall for the selected exam.">
            <div className="space-y-4">
              {store.hallSummaries.length ? (
                store.hallSummaries.map((hall) => {
                  const percent = hall.capacity ? Math.round((hall.occupied / hall.capacity) * 100) : 0;
                  return (
                    <div key={hall.hallId} className="rounded-4xl bg-shell/75 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{hall.hallName}</p>
                          <p className="text-sm text-muted">
                            {hall.occupied} / {hall.capacity} allocated
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">{percent}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-4xl bg-shell/75 p-5 text-sm text-muted">
                  No hall summary is available yet for this exam.
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card title="Seat Assignments" subtitle="Hall-wise list of student seat numbers for the selected exam.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Roll Number</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Hall</th>
                  <th className="pb-3 font-semibold">Seat No.</th>
                  <th className="pb-3 font-semibold">Seat Label</th>
                </tr>
              </thead>
              <tbody>
                {store.allocations.length ? (
                  store.allocations.map((allocation) => (
                    <tr key={allocation._id} className="border-b border-line/70 last:border-b-0">
                      <td className="py-4 pr-4 font-semibold text-ink">{allocation.studentId?.name}</td>
                      <td className="py-4 pr-4 text-muted">{allocation.studentId?.rollNumber}</td>
                      <td className="py-4 pr-4 text-muted">{allocation.department}</td>
                      <td className="py-4 pr-4 text-muted">{allocation.hallId?.hallName}</td>
                      <td className="py-4 pr-4 text-muted">{allocation.seatNumber}</td>
                      <td className="py-4 pr-4 text-primary font-semibold">{allocation.seatLabel}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-muted">
                      No allocations available for the selected exam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section id="reports" className="mt-10 space-y-6">
        <Card
          title="Reports and Printable Layouts"
          subtitle="Download hall-wise seating data or print classroom layouts for invigilators."
          actions={
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleDownloadReport}>
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button variant="accent" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print Layout
              </Button>
            </div>
          }
        >
          <div className="rounded-4xl bg-shell/70 p-5">
            <p className="text-sm font-semibold text-ink">{selectedExam?.examName || "No exam selected"}</p>
            <p className="mt-2 text-sm text-muted">
              {selectedExam
                ? `${formatDate(selectedExam.examDate)} | ${formatTimeRange(
                    selectedExam.startTime,
                    selectedExam.endTime
                  )}`
                : "Select an exam in the allocation section to prepare reports."}
            </p>
          </div>
        </Card>

        <PrintableLayout exam={selectedExam} allocations={store.allocations} />
      </section>
    </AppShell>
  );
}
