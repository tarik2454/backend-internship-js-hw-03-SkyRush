const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const { authRouter } = require("./routes/api/auth-router");

dotenv.config();

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
// проверяет есть ли в запросе с фронтеда заголовок Content-Type, если есть то есть и body который передается на бекенд для дальнейшей обработки
app.use(express.json());
app.use(express.static("public"));

app.use("/api/users", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// err, req, res, next - параметры функции, аргументы которой передаются с contacts-controller
app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  res.status(status).json({ message });
});

module.exports = app;
