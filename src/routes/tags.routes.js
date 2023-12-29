"use strict";

const { Router } = require("express");
const tagsRoutes = Router();
const TagsController = require("../controllers/TagsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated.js");

const tagsController = new TagsController();

tagsRoutes.use(ensureAuthenticated);
tagsRoutes.get("/", tagsController.index);

module.exports = tagsRoutes;
