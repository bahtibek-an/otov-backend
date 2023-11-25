const express = require("express");
const app = express();
const router = require("./routes/index");
const sequelize = require("./db");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const errorHandler = require('./middleware/ErrorHanglingMiddleware');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/user-model");

app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use("/api/v1/", router);

app.use(errorHandler);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//
// User.destroy({
//     where: {},
//     truncate: true
// })

module.exports = app;