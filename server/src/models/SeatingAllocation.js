import mongoose from "mongoose";

const seatingAllocationSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamHall",
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    seatLabel: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: Number,
      required: true,
      min: 1,
    },
    column: {
      type: Number,
      required: true,
      min: 1,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

seatingAllocationSchema.index({ examId: 1, studentId: 1 }, { unique: true });
seatingAllocationSchema.index({ examId: 1, hallId: 1, seatNumber: 1 }, { unique: true });

const SeatingAllocation = mongoose.model("SeatingAllocation", seatingAllocationSchema);

export default SeatingAllocation;

