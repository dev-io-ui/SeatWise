import Exam from "../models/Exam.js";
import ExamHall from "../models/ExamHall.js";
import SeatingAllocation from "../models/SeatingAllocation.js";
import Student from "../models/Student.js";

export const getDashboardSummary = async (_req, res, next) => {
  try {
    const [studentCount, examCount, hallCount, allocationCount, recentExams, halls] = await Promise.all([
      Student.countDocuments(),
      Exam.countDocuments(),
      ExamHall.countDocuments(),
      SeatingAllocation.countDocuments(),
      Exam.find().sort({ examDate: 1 }).limit(5),
      ExamHall.find().sort({ hallName: 1 }),
    ]);

    const latestAllocatedExam = await Exam.findOne({ status: "Allocated" }).sort({ updatedAt: -1 });
    let hallUtilization = halls.map((hall) => ({
      hallId: hall._id,
      hallName: hall.hallName,
      capacity: hall.capacity,
      occupied: 0,
    }));

    if (latestAllocatedExam) {
      const grouped = await SeatingAllocation.aggregate([
        { $match: { examId: latestAllocatedExam._id } },
        { $group: { _id: "$hallId", occupied: { $sum: 1 } } },
      ]);

      const occupiedByHall = grouped.reduce((accumulator, item) => {
        accumulator[String(item._id)] = item.occupied;
        return accumulator;
      }, {});

      hallUtilization = halls.map((hall) => ({
        hallId: hall._id,
        hallName: hall.hallName,
        capacity: hall.capacity,
        occupied: occupiedByHall[String(hall._id)] || 0,
      }));
    }

    res.json({
      success: true,
      data: {
        counts: {
          students: studentCount,
          exams: examCount,
          halls: hallCount,
          allocations: allocationCount,
        },
        recentExams,
        latestAllocatedExam,
        hallUtilization,
      },
    });
  } catch (error) {
    next(error);
  }
};

