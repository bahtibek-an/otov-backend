const express = require("express");
const userRouter = require("./user-route");
const jobRouter = require("./job-route");


const router = new express.Router();

router.use("/users", userRouter);
router.use("/jobs", jobRouter);

module.exports = router;