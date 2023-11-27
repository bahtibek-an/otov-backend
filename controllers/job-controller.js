const jobService = require("../services/job-service");
const ApiError = require("../error/ApiError");
const {SOMETHING_WENT_WRONG} = require("../consts/constants");
class JobController {

    async getAll(req, res, next) {
        try {
            const jobs = await jobService.getAll();
            return res.json(jobs);
        } catch (e) {
            next(ApiError.internal(SOMETHING_WENT_WRONG));
        }
    }

    async create(req, res, next) {
        try {
            const { latitude, longitude } = req.body;
            console.log()
            const job = await jobService.create(latitude, longitude);
            return res.status(201).json(job);
        } catch (e) {
            next(ApiError.internal(SOMETHING_WENT_WRONG));
        }
    }


}

module.exports = new JobController();