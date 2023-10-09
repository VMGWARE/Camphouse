/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operations related to creating, fetching, updating, and deleting data as an admin
 */

// Require the necessary packages
const express = require("express");
const router = express.Router();

// Require the necessary models
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Message = require("../models/Message");
const Report = require("../models/Report");

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");

// TODO: User: CRUD
// TODO: Post: RD
// TODO: Comment: RD
// TODO: Message: RD

// Return router
module.exports = router;
