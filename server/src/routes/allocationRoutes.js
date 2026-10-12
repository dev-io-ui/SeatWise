import express from "express";
import {
  clearAllocationsForExam,
  downloadAllocationReport,
  generateAllocations,
  getAllocations,
} from "../controllers/allocationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getAllocations);
router.post("/generate", generateAllocations);
router.post("/clear", clearAllocationsForExam);
router.get("/download", downloadAllocationReport);

export default router;

