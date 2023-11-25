const User = require("../../models/user-model");
const bcrypt = require("bcrypt");
const {generateJwt, generateRefreshTokenJwt} = require("../../helpers/generate-jwt");
const userService = require("../../services/user-service");
const ApiError = require("../../error/ApiError");
const {UserDto} = require("../../dtos/user-dto");
const {
    INCORRECT_EMAIL_OR_PASSWORD,
    USER_ALREADY_EXISTS,
    OPT_CODE_INCORRECT,
    USER_DOESNT_EXISTS,
    WRONG_PASSWORD,
    NOT_AUTHORIZED,
    INCORRECT_PHONE_NUMBER,
    SOMETHING_WENT_WRONG, CODE_SENT
} = require("../../consts/constants");
class UserController {

    async register(req, res, next) {
        try {
            const { phone_number, password } = req.body;
            if(!(phone_number || password)) {
                return next(ApiError.badRequest(INCORRECT_EMAIL_OR_PASSWORD));
            }
            const candidate = await userService.findUser(phone_number);
            if(candidate) {
                return next(ApiError.conflict(USER_ALREADY_EXISTS));
            }
            let optCode = userService.getOptFromCache(phone_number)?.opt_code;
            if(!optCode) {
                optCode = userService.generateOptCode();
            }
            await userService.sendMessageToUser(phone_number, optCode);
            userService.saveOptInCache(phone_number, { phone_number, password, opt_code: optCode });
            return res.status(200).json({ message: CODE_SENT });
        } catch (e) {
            return next(ApiError.internal(SOMETHING_WENT_WRONG));
        }
    }

    async verifyRegister(req, res, next) {
        try {
            const { phone_number, opt_code } = req.body;
            if(!phone_number) {
                return next(ApiError.badRequest(INCORRECT_PHONE_NUMBER));
            }
            const cacheUser = userService.getOptFromCache(phone_number);
            if(cacheUser.opt_code !== opt_code) {
                return next(ApiError.badRequest(OPT_CODE_INCORRECT));
            }
            const hashPassword = await userService.generatePassword(cacheUser.password);
            const user = await userService.createUser(phone_number, hashPassword);
            const token = userService.generateTokens(user);
            userService.setRefreshTokenInCookie(res, token.refreshToken);
            const userDto = new UserDto(user.id, user.phone_number, user.updatedAt, user.createdAt);
            return res.status(201).json({ accessToken: token.accessToken, user: userDto });
        } catch (e) {
            return next(ApiError.internal(SOMETHING_WENT_WRONG));
        }
    }

    async login(req, res, next) {
        try {
            const { phone_number, password } = req.body;
            if(!(phone_number || password)) {
                return next(ApiError.badRequest(INCORRECT_EMAIL_OR_PASSWORD));
            }
            const user = await userService.findUser(phone_number);
            if(!user) {
                return next(ApiError.badRequest(USER_DOESNT_EXISTS));
            }
            const isPasswordsEqual = await bcrypt.compare(password, user.password);
            if(!isPasswordsEqual) {
                return next(ApiError.badRequest(WRONG_PASSWORD));
            }
            const token = userService.generateTokens(user);
            userService.setRefreshTokenInCookie(res, token.refreshToken);
            const userDto = new UserDto(user.id, user.phone_number, user.updatedAt, user.createdAt, token.accessToken);
            return res.status(200).json({ accessToken: token.accessToken, user: userDto });
        } catch (e) {
            return next(ApiError.internal(SOMETHING_WENT_WRONG));
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
            return next(ApiError.unauthorized(NOT_AUTHORIZED));
        }
    }

}

module.exports = new UserController();