const User = require("../../models/user-model");
const bcrypt = require("bcrypt");
const {generateJwt, generateRefreshTokenJwt} = require("../../helpers/generate-jwt");
const userService = require("../../services/user-service");
const ApiError = require("../../error/ApiError");
const {UserDto} = require("../../dtos/user-dto");
class UserController {

    async register(req, res, next) {
        try {
            const { phone_number, password } = req.body;
            if(!(phone_number || password)) {
                return next(ApiError.badRequest("Incorrect email or password"));
            }
            const candidate = await userService.findUser(phone_number);
            if(candidate) {
                return next(ApiError.badRequest("User with this phone number already exists"));
            }
            let optCode = userService.getOptFromCache(phone_number)?.opt_code;
            if(!optCode) {
                optCode = userService.generateOptCode();
            }
            await userService.sendMessageToUser(phone_number, optCode);
            userService.saveOptInCache(phone_number, { phone_number, password, opt_code: optCode });
            return res.status(200).json({ message: "Code successfully sent" });
        } catch (e) {
            return next(ApiError.internal("Something went wrong"));
        }
    }

    async verifyRegister(req, res, next) {
        try {
            const { phone_number, opt_code } = req.body;
            if(!phone_number) {
                return next(ApiError.badRequest("Incorrect phone number"));
            }
            const cacheUser = userService.getOptFromCache(phone_number);
            if(cacheUser.opt_code !== opt_code) {
                return next(ApiError.badRequest("Opt code incorrect"));
            }
            const hashPassword = await userService.generatePassword(cacheUser.password);
            const user = await userService.createUser(phone_number, hashPassword);
            const token = userService.generateTokens(user);
            userService.setRefreshTokenInCookie(res, token.refreshToken);
            const userDto = new UserDto(user.id, user.phone_number, user.updatedAt, user.createdAt);
            return res.status(201).json({ accessToken: token.accessToken, user: userDto });
        } catch (e) {
            return next(ApiError.internal("Something went wrong"));
        }
    }

    async login(req, res, next) {
        try {
            const { phone_number, password } = req.body;
            if(!(phone_number || password)) {
                return next(ApiError.badRequest("Incorrect email or password"));
            }
            const user = await userService.findUser(phone_number);
            if(!user) {
                return next(ApiError.badRequest("User with this phone number doesn't exists!"));
            }
            const isPasswordsEqual = await bcrypt.compare(password, user.password);
            if(!isPasswordsEqual) {
                return next(ApiError.badRequest("Wrong password!"));
            }
            const token = userService.generateTokens(user);
            userService.setRefreshTokenInCookie(res, token.refreshToken);
            const userDto = new UserDto(user.id, user.phone_number, user.updatedAt, user.createdAt, token.accessToken);
            return res.status(201).json({ accessToken: token.accessToken, user: userDto });
        } catch (e) {
            return next(ApiError.internal("Something went wrong"));
        }

    }

    async check() {

    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies["refreshToken"];
            userService.verifyRefreshToken(refreshToken);
            const userId = req.user.id;
            const user =  await userService.findById(userId);
            const token = userService.generateTokens(user);
            userService.setRefreshTokenInCookie(res, token.refreshToken);
            const userDto = new UserDto(user.id, user.phone_number, user.updatedAt, user.createdAt, token.accessToken);
            return res.status(201).json({ accessToken: token.accessToken, user: userDto });
        } catch (e) {
            return next(ApiError.unauthorized("Not authorized"));
        }
    }

}

module.exports = new UserController();