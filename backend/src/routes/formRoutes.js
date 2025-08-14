
const express = require("express");
const { createForm, getFormById, submitResponse } = require("../controller/formController.js");


const router = express.Router();


router.post("/", createForm);
router.get("/:id", getFormById);
router.post("/:id/response", submitResponse);

module.exports = router;
