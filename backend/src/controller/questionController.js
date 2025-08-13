import Question from "../models/Question.js";

export const createQuestion = async (req, res) => {
  try {
    let questionData = { ...req.body };

    // For categorize, ensure item ids
    if (questionData.type === "categorize" && questionData.items) {
      questionData.items = questionData.items.map(item => ({
        ...item,
        id: item.id || Math.random().toString(36).substring(2, 9)
      }));
    }

    // For cloze, ensure options and blanks are arrays
    if (questionData.type === "cloze") {
      questionData.options = questionData.options || [];
      questionData.blanks = questionData.blanks || [];
    }

    // For comprehension, ensure options and correctAnswers are arrays
    if (questionData.type === "comprehension") {
      questionData.options = questionData.options || [];
      questionData.correctAnswers = questionData.correctAnswers || [];
    }

    const question = new Question(questionData);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestQuestion = async (req, res) => {
  try {
    const latest = await Question.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.json({ 
        title: "Sample Quiz", 
        categories: ["Category 1", "Category 2"], 
        items: [
          { id: "1", text: "Item 1", correctCategory: "Category 1" },
          { id: "2", text: "Item 2", correctCategory: "Category 2" }
        ] 
      });
    }
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkAnswers = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let results = [];
    let score = 0;
    let total = 0;

    if (question.type === "categorize") {
      results = req.body.items.map((item) => {
        const correctItem = question.items.find((i) => i.id === item.id);
        const isCorrect = item.category === correctItem?.correctCategory;
        if (isCorrect) score++;
        return {
          id: item.id,
          text: correctItem?.text || "",
          givenCategory: item.category,
          correctCategory: correctItem?.correctCategory || "",
          isCorrect
        };
      });
      total = results.length;
    } else if (question.type === "cloze") {
      // req.body.answers: array of user answers for each blank
      results = question.blanks.map((blank, idx) => {
        const userAnswer = req.body.answers?.[idx] || "";
        const isCorrect = userAnswer.trim() === blank.trim();
        if (isCorrect) score++;
        return {
          blankIndex: idx,
          correct: blank,
          userAnswer,
          isCorrect
        };
      });
      total = results.length;
    } else if (question.type === "comprehension") {
      // req.body.answers: array of { subQuestionId, answer }
      results = question.questions.map((subQ, idx) => {
        const userAnsObj = req.body.answers?.find(a => a.subQuestionId === subQ._id?.toString());
        let isCorrect = false;
        if (subQ.type === "mcq" || subQ.type === "short") {
          isCorrect = userAnsObj?.answer?.trim() === subQ.answer?.trim();
        } else if (subQ.type === "mca") {
          // Multiple correct answers: compare arrays
          isCorrect = Array.isArray(userAnsObj?.answer) &&
            Array.isArray(subQ.answer) &&
            userAnsObj.answer.length === subQ.answer.length &&
            userAnsObj.answer.every(a => subQ.answer.includes(a));
        }
        if (isCorrect) score++;
        return {
          subQuestionId: subQ._id,
          question: subQ.text,
          userAnswer: userAnsObj?.answer,
          correctAnswer: subQ.answer,
          isCorrect
        };
      });
      total = results.length;
    }

    res.json({
      results,
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};