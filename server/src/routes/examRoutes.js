import express from "express";
import multer from "multer";
import { createExam, deleteExam, getExams, updateExam, uploadExams } from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.route("/").get(getExams).post(createExam);
router.post("/upload", upload.single("file"), uploadExams);
router.route("/:id").put(updateExam).delete(deleteExam);

export default router;

