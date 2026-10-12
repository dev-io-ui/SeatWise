import { PencilLine, Trash2 } from "lucide-react";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function StudentTable({ students, onEdit, onDelete }) {
  return (
    <Card title="Student Records" subtitle="Monitor uploaded and manually created student profiles.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Roll Number</th>
              <th className="pb-3 font-semibold">Department</th>
              <th className="pb-3 font-semibold">Semester</th>
              <th className="pb-3 font-semibold">Contact</th>
              <th className="pb-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? (
              students.map((student) => (
                <tr key={student._id} className="border-b border-line/70 last:border-b-0">
                  <td className="py-4 pr-4 font-semibold text-ink">{student.name}</td>
                  <td className="py-4 pr-4 text-muted">{student.rollNumber}</td>
                  <td className="py-4 pr-4 text-muted">{student.department}</td>
                  <td className="py-4 pr-4 text-muted">{student.semester || "-"}</td>
                  <td className="py-4 pr-4 text-muted">{student.email || student.phone || "-"}</td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(student)}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(student)}>
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
                  No students available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

