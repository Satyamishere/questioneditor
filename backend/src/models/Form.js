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
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  headerImage: String, // Optional header image
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Form", FormSchema);
