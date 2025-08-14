const Form = require("../models/Form.js");
const Response = require("../models/Response.js");

const createForm = async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const submitResponse = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });
    const answers = req.body.answers;
    let correct = 0;
    let total = 0;

    // Go through each question
    form.questions.forEach((q) => {
      const userAnswer = answers.find(a => a.questionId == q._id.toString());
      if (!userAnswer) return;
      if (q.type === "categorize") {
        // For each item, check if placed in correct category
        q.items.forEach(item => {
          total++;
          let found = false;
          // Find which category user put this item in
          for (const [cat, ids] of Object.entries(userAnswer.response)) {
            if (ids.includes(item.id)) {
              found = true;
              if (cat === item.correctCategory) correct++;
              break;
            }
          }
          if (!found) {
            // Not placed anywhere, incorrect
          }
        });
      }
      // Scoring for comprehension (checkbox options)
      if (q.type === "comprehension") {
        total++;
        // userAnswer.response is array of selected indices
        // q.correctAnswers is array of correct indices
        const user = Array.isArray(userAnswer.response) ? userAnswer.response.map(Number).sort((a, b) => a - b) : [];
        const correctAns = Array.isArray(q.correctAnswers) ? q.correctAnswers.map(Number).sort((a, b) => a - b) : [];
        if (
          user.length === correctAns.length &&
          user.every((v, i) => v === correctAns[i])
        ) {
          correct++;
        }
      }
    });
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const response = new Response({
      formId: req.params.id,
      answers,
    });
    await response.save();
    res.status(201).json({ score: correct, total, percentage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createForm,
  getFormById,
  submitResponse
};
