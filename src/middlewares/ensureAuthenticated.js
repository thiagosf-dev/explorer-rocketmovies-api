"use strict";

const { verify } = require("jsonwebtoken");
const { jwt } = require("../configs/auth.js");
const AppError = require("../utils/AppError.js");

module.exports = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    const { message, statusCode } = new AppError("Token não infomardo.", 401);
    return response.status(statusCode).json({ message, statusCode });
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, jwt.secret);

    request.user = {
      id: user_id,
    };

    return next();
  } catch {
    const { message, statusCode } = new AppError("Token inválido.", 401);
    return response.status(statusCode).json({ message, statusCode });
  }
};
