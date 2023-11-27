const express = require("express");
const userController = require("../controllers/user-controller");
const {authMiddleware} = require("../middleware/AuthMiddleware");

const userRouter = new express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/verify-register", userController.verifyRegister);
userRouter.post("/login", userController.login);
userRouter.post("/auth", authMiddleware, userController.check);
userRouter.post("/refresh", authMiddleware, userController.refresh);

module.exports = userRouter;