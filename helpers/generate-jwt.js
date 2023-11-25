const jwt = require("jsonwebtoken");
require("dotenv");
function generateJwt(data, type) {
    return jwt.sign({
        data: data
    }, process.env.JWT_SECRET_KEY, { expiresIn: 60 * 60 * 24 });
}

function generateRefreshTokenJwt(data, type) {
    return jwt.sign({
        data: data
    }, process.env.JWT_SECRET_KEY, { expiresIn: 60 * 60 * 24 * 7 });
}


module.exports = { generateJwt, generateRefreshTokenJwt };