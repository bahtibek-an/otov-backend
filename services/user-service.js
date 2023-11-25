const User = require("../models/user-model");
const {generateJwt, generateRefreshTokenJwt} = require("../helpers/generate-jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const cache = new Map();
class UserService {

    async generatePassword(password) {
        const hashPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);
        return hashPassword;
    }

    generateTokens(user) {
        const accessToken = generateJwt({ id: user.id, phone: user.phone_number });
        const refreshToken = generateRefreshTokenJwt({ id: user.id, phone: user.phone_number });
        return { accessToken, refreshToken };
    }

    setRefreshTokenInCookie(response, value) {
        response.cookie("refreshToken", value, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    }

    async createUser(phone_number, hashPassword) {
        const user = await User.create({ phone_number, password: hashPassword });
        return user;
    }

    async findById(id) {
        const user = await User.findByPk(id);
        return user;
    }
    async findUser(phone) {
        const user = await User.findOne({
            where: {
                phone_number: phone,
            }
        });
        return user;
    }

    async getTokenFromSmsService() {
        try {
            const response = await fetch("https://notify.eskiz.uz/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: process.env.SMS_USER,
                    password: process.env.SMS_PASSWORD,
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.log(e);
        }
    }

    async sendMessageToUser(phone, code) {
        try {
            const token = await this.getTokenFromSmsService();
            const response = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.data.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mobile_phone: phone,
                    message: `Verification code: ${code}. \nPlease don't share with others!. \nIf you don't sent this message just ignore`,
                    from: "4546",
                }),
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.log(e);
        }
    }

    saveOptInCache(key, value) {
        cache.set(key, value);
        setTimeout(() => {
            cache.delete(key);
        }, 1000 * 60 * 10);
    }

    getOptFromCache(key) {
        const map = cache.get(key);
        return map;
    }

    generateOptCode() {
        let result = "";
        for(let i = 0; i < 6; i++) {
            result += Math.floor(Math.random() * 9);
        }
        return result;
    }

}

module.exports = new UserService();