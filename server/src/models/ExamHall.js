import mongoose from "mongoose";

const examHallSchema = new mongoose.Schema(
  {
    hallName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    building: {
      type: String,
      default: "",
      trim: true,
    },
    floor: {
      type: String,
      default: "",
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    rows: {
      type: Number,
      default: 5,
      min: 1,
    },
    columns: {
      type: Number,
      default: 6,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExamHall = mongoose.model("ExamHall", examHallSchema);

export default ExamHall;

