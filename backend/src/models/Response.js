import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  answers: [
    {
      questionId: String,
      response: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Response", ResponseSchema);
