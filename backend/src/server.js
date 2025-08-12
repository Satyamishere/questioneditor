import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import questionRoutes from "./routes/questionRoutes.js";
import formRoutes from "./routes/formRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/dragdropquiz", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


app.use("/api/forms", formRoutes);
app.use("/api/questions", questionRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));