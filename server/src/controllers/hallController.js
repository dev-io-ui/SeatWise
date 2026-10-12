import ExamHall from "../models/ExamHall.js";
import SeatingAllocation from "../models/SeatingAllocation.js";
import { parseHallsFile } from "../utils/uploadParser.js";

const normalizeHallPayload = (payload) => ({
  hallName: payload.hallName?.trim(),
  building: payload.building?.trim() || "",
  floor: payload.floor?.trim() || "",
  capacity: Number(payload.capacity),
  rows: Number(payload.rows) || 5,
  columns: Number(payload.columns) || 6,
  active: payload.active === false || payload.active === "false" ? false : true,
});

export const getHalls = async (_req, res, next) => {
  try {
    const halls = await ExamHall.find().sort({ hallName: 1 });
    res.json({ success: true, data: halls });
  } catch (error) {
    next(error);
  }
};

export const createHall = async (req, res, next) => {
  try {
    const payload = normalizeHallPayload(req.body);

    if (!payload.hallName || !Number.isFinite(payload.capacity) || payload.capacity < 1) {
      res.status(400);
      throw new Error("Hall name and valid capacity are required.");
    }

    const hall = await ExamHall.create(payload);
    res.status(201).json({ success: true, data: hall, message: "Exam hall created successfully." });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Hall name already exists."));
    }

    next(error);
  }
};

export const updateHall = async (req, res, next) => {
  try {
    const hall = await ExamHall.findByIdAndUpdate(req.params.id, normalizeHallPayload(req.body), {
      new: true,
      runValidators: true,
    });

    if (!hall) {
      res.status(404);
      throw new Error("Exam hall not found.");
    }

    res.json({ success: true, data: hall, message: "Exam hall updated successfully." });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Hall name already exists."));
    }

    next(error);
  }
};

export const deleteHall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const linkedAllocations = await SeatingAllocation.countDocuments({ hallId: id });

    if (linkedAllocations > 0) {
      res.status(400);
      throw new Error("Clear related seating allocations before deleting this hall.");
    }

    const hall = await ExamHall.findByIdAndDelete(id);

    if (!hall) {
      res.status(404);
      throw new Error("Exam hall not found.");
    }

    res.json({ success: true, message: "Exam hall deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const uploadHalls = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Upload a CSV or Excel file.");
    }

    const halls = await parseHallsFile(req.file.buffer, req.file.originalname);

    if (!halls.length) {
      res.status(400);
      throw new Error("No valid hall rows were found in the file.");
    }

    await ExamHall.bulkWrite(
      halls.map((hall) => ({
        updateOne: {
          filter: { hallName: hall.hallName },
          update: { $set: hall },
          upsert: true,
        },
      }))
    );

    res.json({
      success: true,
      message: `${halls.length} exam halls processed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
