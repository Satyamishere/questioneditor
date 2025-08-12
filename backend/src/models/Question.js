import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  title: String,
  categories: [String],
  items: [
    {
      id: String,
      text: String,
      correctCategory: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Question", QuestionSchema);