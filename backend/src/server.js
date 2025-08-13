import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import questionRoutes from "./routes/questionRoutes.js";
import formRoutes from "./routes/formRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection - use environment variable
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dragdropquiz", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error(err));

app.use("/api/forms", formRoutes);
app.use("/api/questions", questionRoutes);

// Export the Express app for Vercel
export default app;

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}