const ApiError = require("../error/ApiError");
const jwt = require("jsonwebtoken");
require("dotenv").config();
function authMiddleware(req, res, next) {
    if(req.method === "OPTIONS") {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return next(ApiError.unauthorized("Not authorized"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.data;
        return next();
    } catch (e) {
        next(ApiError.unauthorized("Not authorized"));
    }
}

module.exports = { authMiddleware };