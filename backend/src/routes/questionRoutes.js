import express from "express";
import {
  createQuestion,
  getQuestionById,
  checkAnswers,
  getLatestQuestion
} from "../controller/questionController.js";

const router = express.Router();

router.post("/", createQuestion);
router.get("/latest", getLatestQuestion);
router.get("/:id", getQuestionById);
router.post("/:id/check", checkAnswers);

export default router;