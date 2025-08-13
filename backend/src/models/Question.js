import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ["categorize", "cloze", "comprehension"], required: true },
  text: { type: String, required: true },
  image: String, // Optional image for the question
  categories: [String], // For categorize
  items: [
    {
      id: String,
      text: String,
      correctCategory: String, // For categorize
      answer: String, // For cloze/comprehension
    },
  ],
  passage: String, // For comprehension
  options: [String], // For comprehension
  correctAnswers: [Number], // For comprehension (indices of correct options)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Question", QuestionSchema);