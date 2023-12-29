"use strict";

const { Router } = require("express");
const sessionsRoutes = Router();

const SessionsController = require("../controllers/SessionsController");

const sessionsController = new SessionsController();

function infoMiddleware(request, response, next) {
  console.info(`👉 [${request.method}]: ${request.originalUrl}`);
  next();
}

sessionsRoutes.post("/", sessionsController.create);

module.exports = sessionsRoutes;
