const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const certificateRouter = require("./src/routes/certificate.route.js");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes declaration
app.use("/api/v1/create-certificate", certificateRouter);

// http://localhost:8000/api/v1/users/register

module.exports = app;
