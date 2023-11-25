const http = require("http");
const app = require("./index");
const sequelize = require("./db");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

;(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        http.createServer(app)
            .listen(PORT, () => {
                console.log(`Server has been started on http://localhost:${PORT}`);
            });
    } catch (e) {
        console.error('Something went wrong: ', e);
    }
})();



