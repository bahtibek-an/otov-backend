const Job = require("../models/jobs-model");

class JobService {
    async getAll() {
        const jobs  = await Job.findAll();
        return jobs;
    }

    async create(latitude, longitude) {
        const job = await Job.create({ latitude, longitude });
        return job;
    }
}

module.exports = new JobService();