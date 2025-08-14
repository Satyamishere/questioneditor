
const express = require("express");
const {
  createQuestion,
  getQuestionById,
  checkAnswers,
  getLatestQuestion
} = require("../controller/questionController.js");


const router = express.Router();


router.post("/", createQuestion);
router.get("/latest", getLatestQuestion);
router.get("/:id", getQuestionById);
router.post("/:id/check", checkAnswers);

module.exports = router;