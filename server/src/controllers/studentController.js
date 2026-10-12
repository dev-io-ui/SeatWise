import Student from "../models/Student.js";
import { parseStudentsFile } from "../utils/uploadParser.js";

export const getStudents = async (req, res, next) => {
  try {
    const { search = "", department = "" } = req.query;
    const query = {};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, department, semester = "", email = "", phone = "" } = req.body;

    if (!name || !rollNumber || !department) {
      res.status(400);
      throw new Error("Name, roll number, and department are required.");
    }

    const student = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department: department.trim(),
      semester: semester.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });

    res.status(201).json({ success: true, data: student, message: "Student created successfully." });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Roll number already exists."));
    }

    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...req.body,
        rollNumber: req.body.rollNumber?.trim().toUpperCase(),
        email: req.body.email?.trim().toLowerCase(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      res.status(404);
      throw new Error("Student not found.");
    }

    res.json({ success: true, data: updatedStudent, message: "Student updated successfully." });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Roll number already exists."));
    }

    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found.");
    }

    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const uploadStudents = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Upload a CSV or Excel file.");
    }

    const students = await parseStudentsFile(req.file.buffer, req.file.originalname);

    if (!students.length) {
      res.status(400);
      throw new Error("No valid student rows were found in the file.");
    }

    await Student.bulkWrite(
      students.map((student) => ({
        updateOne: {
          filter: { rollNumber: student.rollNumber },
          update: { $set: student },
          upsert: true,
        },
      }))
    );

    res.json({
      success: true,
      message: `${students.length} student records processed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
