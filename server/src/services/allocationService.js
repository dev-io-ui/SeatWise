import Exam from "../models/Exam.js";
import ExamHall from "../models/ExamHall.js";
import SeatingAllocation from "../models/SeatingAllocation.js";
import Student from "../models/Student.js";

const toAlphaLabel = (value) => {
  let current = value;
  let label = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

// const interleaveStudentsByDepartment = (students) => {
//   const groups = students.reduce((accumulator, student) => {
//     const key = student.department || "General";
//     if (!accumulator[key]) {
//       accumulator[key] = [];
//     }

//     accumulator[key].push(student);
//     return accumulator;
//   }, {});

//   const departments = Object.keys(groups).sort((left, right) => groups[right].length - groups[left].length);
//   const ordered = [];
//   let hasStudents = true;

//   while (hasStudents) {
//     hasStudents = false;

//     for (const department of departments) {
//       const nextStudent = groups[department].shift();
//       if (nextStudent) {
//         ordered.push(nextStudent);
//         hasStudents = true;
//       }
//     }
//   }

//   return ordered;
// };



const allocateStudentsToSeats = (students, halls) => {
  const groups = new Map();

  for (const student of students) {
    const department = student.department || "General";

    if (!groups.has(department)) {
      groups.set(department, []);
    }

    groups.get(department).push(student);
  }

  // Keep each department's students in a predictable order.
  for (const group of groups.values()) {
    group.reverse();
  }

  const allocations = [];
  const hallSummaries = [];
  let remaining = students.length;

  for (const hall of halls) {
    if (remaining === 0) break;

    const columns = hall.columns || Math.min(6, hall.capacity) || 1;
    const seatCount = hall.capacity;
    const seats = new Array(seatCount).fill(null);
    let occupied = 0;

    for (let i = 0; i < seatCount && remaining > 0; i++) {
      const row = Math.floor(i / columns);
      const column = i % columns;

      const leftIndex = column > 0 ? i - 1 : -1;
      const upperIndex = row > 0 ? i - columns : -1;

      const leftDepartment =
        leftIndex >= 0 ? seats[leftIndex]?.department : null;

      const upperDepartment =
        upperIndex >= 0 ? seats[upperIndex]?.department : null;

      // Only departments that don't match the left or upper seat
      // can be assigned to the current seat.
      const candidates = [...groups.entries()]
        .filter(([department, group]) =>
          group.length > 0 &&
          department !== leftDepartment &&
          department !== upperDepartment
        )
        .sort((a, b) => b[1].length - a[1].length);

      if (candidates.length === 0) {
        // Leave this seat vacant instead of violating the rule.
        continue;
      }

      const [department, group] = candidates[0];
      const student = group.pop();

      seats[i] = { department, student };
      remaining -= 1;
      occupied += 1;

      allocations.push({
        examId: null, // Set the actual exam ID in generateSeatingPlan.
        studentId: student._id,
        hallId: hall._id,
        seatNumber: i + 1,
        seatLabel: `${toAlphaLabel(row + 1)}${column + 1}`,
        row: row + 1,
        column: column + 1,
        department,
      });
    }

    hallSummaries.push({
      hallId: hall._id,
      hallName: hall.hallName,
      capacity: hall.capacity,
      occupied,
      vacant: hall.capacity - occupied,
    });
  }

  return {
    allocations,
    hallSummaries,
    unallocated: students.length - allocations.length,
  };
};

const buildSeatMeta = (hall, seatNumber) => {
  const columns = hall.columns || Math.min(6, hall.capacity) || 1;
  const row = Math.floor((seatNumber - 1) / columns) + 1;
  const column = ((seatNumber - 1) % columns) + 1;

  return {
    row,
    column,
    seatLabel: `${toAlphaLabel(row)}${column}`,
  };
};

// export const generateSeatingPlan = async ({ examId, hallIds = [] }) => {
//   const exam = await Exam.findById(examId);

//   if (!exam) {
//     throw new Error("Exam not found.");
//   }

//   const hallQuery =
//     hallIds.length > 0
//       ? { _id: { $in: hallIds }, active: true }
//       : {
//           active: true,
//         };

//   const halls = await ExamHall.find(hallQuery).sort({ capacity: -1, hallName: 1 });

//   if (!halls.length) {
//     throw new Error("Add at least one active exam hall before generating seating.");
//   }

//   const studentQuery = exam.departments.length
//     ? {
//         department: { $in: exam.departments },
//       }
//     : {};

//   const students = await Student.find(studentQuery).sort({ department: 1, rollNumber: 1 });

//   if (!students.length) {
//     throw new Error("No students match the selected exam departments.");
//   }

//   const totalCapacity = halls.reduce((total, hall) => total + hall.capacity, 0);

//   if (students.length > totalCapacity) {
//     throw new Error(
//       `Hall capacity is insufficient. Capacity available: ${totalCapacity}, students to seat: ${students.length}.`
//     );
//   }

//   const orderedStudents = interleaveStudentsByDepartment(students);
//   await SeatingAllocation.deleteMany({ examId: exam._id });

//   let cursor = 0;
//   const allocationDocs = [];
//   const hallSummaries = [];

//   for (const hall of halls) {
//     if (cursor >= orderedStudents.length) {
//       break;
//     }

//     const seatsToFill = Math.min(hall.capacity, orderedStudents.length - cursor);
//     hallSummaries.push({
//       hallId: hall._id,
//       hallName: hall.hallName,
//       capacity: hall.capacity,
//       occupied: seatsToFill,
//     });

//     for (let seatNumber = 1; seatNumber <= seatsToFill; seatNumber += 1) {
//       const student = orderedStudents[cursor];
//       const seatMeta = buildSeatMeta(hall, seatNumber);

//       allocationDocs.push({
//         examId: exam._id,
//         studentId: student._id,
//         hallId: hall._id,
//         seatNumber,
//         seatLabel: seatMeta.seatLabel,
//         row: seatMeta.row,
//         column: seatMeta.column,
//         department: student.department,
//       });

//       cursor += 1;
//     }
//   }

//   await SeatingAllocation.insertMany(allocationDocs);
//   exam.status = "Allocated";
//   await exam.save();

//   const allocations = await SeatingAllocation.find({ examId: exam._id })
//     .populate("studentId", "name rollNumber department semester")
//     .populate("hallId", "hallName building floor capacity rows columns")
//     .sort({ hallId: 1, seatNumber: 1 });

//   return {
//     exam,
//     allocations,
//     hallSummaries,
//     totalStudents: students.length,
//   };
// };



export const generateSeatingPlan = async ({ examId, hallIds = [] }) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new Error("Exam not found.");
  }

  const hallQuery =
    hallIds.length > 0
      ? { _id: { $in: hallIds }, active: true }
      : { active: true };

  const halls = await ExamHall.find(hallQuery).sort({
    capacity: -1,
    hallName: 1,
  });

  if (!halls.length) {
    throw new Error("Add at least one active exam hall before generating seating.");
  }

  const studentQuery = exam.departments.length
    ? { department: { $in: exam.departments } }
    : {};

  const students = await Student.find(studentQuery).sort({
    department: 1,
    rollNumber: 1,
  });

  if (!students.length) {
    throw new Error("No students match the selected exam departments.");
  }

  const totalCapacity = halls.reduce(
    (total, hall) => total + hall.capacity,
    0
  );

  if (students.length > totalCapacity) {
    throw new Error(
      `Hall capacity is insufficient. Capacity available: ${totalCapacity}, students to seat: ${students.length}.`
    );
  }

  // Generate seats while avoiding same-department neighbors.
  const result = allocateStudentsToSeats(students, halls);

  // Do not replace an existing seating plan if allocation fails.
  if (result.unallocated > 0) {
    throw new Error(
      `Unable to allocate ${result.unallocated} students without ` +
      "placing the same department in adjacent horizontal or vertical seats. " +
      "Try adding students from other departments or additional halls."
    );
  }

  // Clear the old plan only after validating the new allocation.
  await SeatingAllocation.deleteMany({ examId: exam._id });

  const allocationDocs = result.allocations.map((allocation) => ({
    ...allocation,
    examId: exam._id,
  }));

  if (allocationDocs.length > 0) {
    await SeatingAllocation.insertMany(allocationDocs);
  }

  exam.status = "Allocated";
  await exam.save();

  const allocations = await SeatingAllocation.find({
    examId: exam._id,
  })
    .populate("studentId", "name rollNumber department semester")
    .populate("hallId", "hallName building floor capacity rows columns")
    .sort({ hallId: 1, seatNumber: 1 });

  return {
    exam,
    allocations,
    hallSummaries: result.hallSummaries,
    totalStudents: students.length,
  };
};


export const clearSeatingPlan = async (examId) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new Error("Exam not found.");
  }

  await SeatingAllocation.deleteMany({ examId });
  exam.status = "Draft";
  await exam.save();
};

