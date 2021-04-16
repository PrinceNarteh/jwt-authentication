import { error } from "consola";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import client from "../helpers/initRedis";

export const generateAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1y",
      issuer: "localhost:4000",
      audience: userId,
    };

    jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, options, (err, token) => {
      if (err) {
        error({ badge: true, message: err.message });
        return reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const generateRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1h",
      issuer: "localhost:4000",
      audience: userId,
    };

    jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, options, (err, token) => {
      if (err) {
        error({ badge: true, message: err.message });
        return reject(createError.InternalServerError());
      }

      client.SET(userId, token, "Ex", 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          error({ badge: true, message: err.message });
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  });
};

export const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const authHeader = req.headers["authorization"];
  const token = authHeader.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload;
  });
};

export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, payload) => {
      if (err) return reject(createError.Unauthorized());
      const userId = payload.aud;
      client.GET(userId, (err, result) => {
        if (err) {
          error({ badge: true, message: err.message });
          reject(createError.InternalServerError());
          return;
        }
        if (refreshToken === result) return resolve(userId);
        reject(createError.Unauthorized());
      });
    });
  });
};
