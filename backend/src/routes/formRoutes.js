import express from "express";
import { createForm, getFormById, submitResponse } from "../controller/formController.js";

const router = express.Router();

router.post("/", createForm);
router.get("/:id", getFormById);
router.post("/:id/response", submitResponse);

export default router;
