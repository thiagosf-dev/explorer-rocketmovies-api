"use strict";

const { compare } = require("bcrypt");
const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const authConfigs = require("../configs/auth.js");
const { sign } = require("jsonwebtoken");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    const user = await knex("users").where({ email }).first();

    if (!user) {
      const { message, statusCode } = new AppError(
        "Email e/ou senha incorreto(s).",
        401
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      const { message, statusCode } = new AppError(
        "Email e/ou senha incorreto(s).",
        401
      );
      return response.status(statusCode).json({ message, statusCode });
    }

    const { expiresIn, secret } = authConfigs.jwt;
    const token = sign({}, String(secret), {
      subject: String(user.id),
      expiresIn,
    });

    return response.status(201).json({ user, token });
  }
}

module.exports = SessionsController;
