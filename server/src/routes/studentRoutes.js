import express from "express";
import multer from "multer";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
  uploadStudents,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.route("/").get(getStudents).post(createStudent);
router.post("/upload", upload.single("file"), uploadStudents);
router.route("/:id").put(updateStudent).delete(deleteStudent);

export default router;

