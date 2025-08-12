import Question from "../models/Question.js";

export const createQuestion = async (req, res) => {
  try {
    const itemsWithIds = req.body.items.map(item => ({
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 9)
    }));
    const question = new Question({
      ...req.body,
      items: itemsWithIds
    });
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
    const results = req.body.items.map((item) => {
      const correctItem = question.items.find((i) => i.id === item.id);
      return {
        id: item.id,
        text: correctItem?.text || "",
        givenCategory: item.category,
        correctCategory: correctItem?.correctCategory || "",
        isCorrect: item.category === correctItem?.correctCategory
      };
    });
    const score = results.filter(r => r.isCorrect).length;
    const total = results.length;
    res.json({
      results,
      score,
      total,
      percentage: Math.round((score / total) * 100)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};