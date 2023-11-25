const express = require("express");
const userRouter = require("./userRoute/user-route");



const router = new express.Router();

router.use("/users", userRouter);

module.exports = router;