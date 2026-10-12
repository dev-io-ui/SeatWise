import Exam from "../models/Exam.js";
import SeatingAllocation from "../models/SeatingAllocation.js";
import { clearSeatingPlan, generateSeatingPlan } from "../services/allocationService.js";
import { buildAllocationCsv } from "../utils/reportBuilder.js";

const buildHallSummary = (allocations) =>
  Object.values(
    allocations.reduce((accumulator, allocation) => {
      const hallId = String(allocation.hallId?._id || allocation.hallId);

      if (!accumulator[hallId]) {
        accumulator[hallId] = {
          hallId,
          hallName: allocation.hallId?.hallName || "Hall",
          capacity: allocation.hallId?.capacity || 0,
          occupied: 0,
        };
      }

      accumulator[hallId].occupied += 1;
      return accumulator;
    }, {})
  );

export const getAllocations = async (req, res, next) => {
  try {
    const { examId } = req.query;

    if (!examId) {
      res.status(400);
      throw new Error("examId is required.");
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      res.status(404);
      throw new Error("Exam not found.");
    }

    const allocations = await SeatingAllocation.find({ examId })
      .populate("studentId", "name rollNumber department semester")
      .populate("hallId", "hallName building floor capacity rows columns")
      .sort({ hallId: 1, seatNumber: 1 });

    res.json({
      success: true,
      data: {
        exam,
        allocations,
        hallSummaries: buildHallSummary(allocations),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateAllocations = async (req, res, next) => {
  try {
    const { examId, hallIds = [] } = req.body;

    if (!examId) {
      res.status(400);
      throw new Error("examId is required.");
    }

    const result = await generateSeatingPlan({ examId, hallIds });
    res.json({
      success: true,
      data: result,
      message: `Seating generated for ${result.totalStudents} students.`,
    });
  } catch (error) {
    next(error);
  }
};

export const clearAllocationsForExam = async (req, res, next) => {
  try {
    const { examId } = req.body;

    if (!examId) {
      res.status(400);
      throw new Error("examId is required.");
    }

    await clearSeatingPlan(examId);
    res.json({ success: true, message: "Seating allocations cleared successfully." });
  } catch (error) {
    next(error);
  }
};

export const downloadAllocationReport = async (req, res, next) => {
  try {
    const { examId } = req.query;

    if (!examId) {
      res.status(400);
      throw new Error("examId is required.");
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      res.status(404);
      throw new Error("Exam not found.");
    }

    const allocations = await SeatingAllocation.find({ examId })
      .populate("studentId", "name rollNumber")
      .populate("hallId", "hallName")
      .sort({ hallId: 1, seatNumber: 1 });

    const csv = buildAllocationCsv({ exam, allocations });
    const filename = `${exam.examName.replace(/\s+/g, "-").toLowerCase()}-seating-report.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

