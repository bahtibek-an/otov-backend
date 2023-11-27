const express = require("express");
const jobController = require("../controllers/job-controller");
const {authMiddleware} = require("../middleware/AuthMiddleware");

const jobRouter = new express.Router();

jobRouter.get("/", jobController.getAll);
jobRouter.post("/", authMiddleware, jobController.create);

module.exports = jobRouter;