import Exam from "../models/Exam.js";
import SeatingAllocation from "../models/SeatingAllocation.js";
import { parseExamsFile } from "../utils/uploadParser.js";

const normalizeExamPayload = (payload) => ({
  examName: payload.examName?.trim(),
  subject: payload.subject?.trim(),
  examDate: payload.examDate,
  startTime: payload.startTime?.trim() || "",
  endTime: payload.endTime?.trim() || "",
  departments: Array.isArray(payload.departments)
    ? payload.departments.map((item) => item.trim()).filter(Boolean)
    : String(payload.departments || "")
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean),
  venueNotes: payload.venueNotes?.trim() || "",
});

export const getExams = async (_req, res, next) => {
  try {
    const exams = await Exam.find().sort({ examDate: 1, createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const payload = normalizeExamPayload(req.body);

    if (!payload.examName || !payload.subject || !payload.examDate) {
      res.status(400);
      throw new Error("Exam name, subject, and exam date are required.");
    }

    const exam = await Exam.create(payload);
    res.status(201).json({ success: true, data: exam, message: "Exam created successfully." });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, normalizeExamPayload(req.body), {
      new: true,
      runValidators: true,
    });

    if (!updatedExam) {
      res.status(404);
      throw new Error("Exam not found.");
    }

    res.json({ success: true, data: updatedExam, message: "Exam updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);

    if (!deletedExam) {
      res.status(404);
      throw new Error("Exam not found.");
    }

    await SeatingAllocation.deleteMany({ examId: deletedExam._id });
    res.json({ success: true, message: "Exam deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const uploadExams = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Upload a CSV or Excel file.");
    }

    const exams = await parseExamsFile(req.file.buffer, req.file.originalname);

    if (!exams.length) {
      res.status(400);
      throw new Error("No valid exam rows were found in the file.");
    }

    await Exam.bulkWrite(
      exams.map((exam) => ({
        updateOne: {
          filter: {
            examName: exam.examName,
            subject: exam.subject,
            examDate: exam.examDate,
          },
          update: { $set: exam },
          upsert: true,
        },
      }))
    );

    res.json({
      success: true,
      message: `${exams.length} exam records uploaded successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
