import express from "express";
import morgan from "morgan";
import { success } from "consola";
import createError from "http-errors";
const PORT = process.env.PORT;

import authRoutes from "./routers/authRoutes";

// connecting to redis
import "./helpers/initRedis";

// connecting to database
import "./config/dbConnect";

const app = express();
app.use(morgan("combined"));
app.use(express.json());

app.use("/auth", authRoutes);

// not found
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

// error handler
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ error: { status: err.status || 500, message: err.message } });
});

app.listen(PORT, () =>
  success({ badge: true, message: `Server running on PORT ${PORT}` })
);
