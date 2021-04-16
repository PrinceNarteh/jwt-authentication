import User from "../models/User";
import { error } from "consola";
import createError from "http-errors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt";
import { loginSchema, registerSchema } from "../helpers/validation_schema";
import client from "../helpers/initRedis";

export const register = async (req, res, next) => {
  try {
    const result = await registerSchema.validateAsync(req.body);
    const { email } = result;

    let user = await User.findOne({ email });
    if (user) {
      throw createError.Conflict(`${email} already exists.`);
    }

    user = await User.create(result);
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const { email, password } = result;

    let user = await User.findOne({ email });
    if (user && !(await user.comparePasswords(password))) {
      next(createError.Unauthorized("Invalid credentials."));
    }

    user = await User.create({ email, username, password });
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi) {
      return next(createError.BadRequest("Invalid credentials."));
    }
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    // generate new tokens
    const newAccessToken = await generateAccessToken(userId);
    const newRefreshToken = await generateRefreshToken(userId);
    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    client.DEL(userId, (err, val) => {
      if (err) {
        error({ badge: true, message: err.message });
        throw createError.InternalServerError();
      }
      res.sendStatus(204);
    });
  } catch (error) {
    next(error);
  }
};
