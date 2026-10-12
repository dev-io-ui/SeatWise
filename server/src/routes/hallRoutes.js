import express from "express";
import multer from "multer";
import { createHall, deleteHall, getHalls, updateHall, uploadHalls } from "../controllers/hallController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.route("/").get(getHalls).post(createHall);
router.post("/upload", upload.single("file"), uploadHalls);
router.route("/:id").put(updateHall).delete(deleteHall);

export default router;

