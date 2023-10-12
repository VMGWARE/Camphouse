/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operations related to creating, fetching, updating, and deleting data as an admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FullRegistrationRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - username
 *         - handle
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         username:
 *           type: string
 *           description: User's chosen username
 *         handle:
 *           type: string
 *           description: User's unique handle
 *         bio:
 *           type: string
 *           description: User's bio
 *         verified:
 *           type: boolean
 *           description: Whether or not the user is verified
 *         admin:
 *           type: boolean
 *           description: Whether or not the user is an admin
 *       example:
 *         email: jane.doe@example.com
 *         password: anothersecurepassword
 *         username: janedoe123
 *         handle: jane_doe_handle
 *         bio: I'm Jane Doe
 *         verified: false
 *         admin: false
 */

// Require the necessary packages
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// Require the necessary models
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Message = require("../models/Message");
const Report = require("../models/Report");
const Notification = require("../models/Notification");

// Helpers
const { validateEmail } = require("../utils/general");

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");

// User: CRUD

// Create (POST) - Add a new user
/**
 * @swagger
 * /api/v1/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Register a new user
 *     description: Register a new user as an admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FullRegistrationRequest'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   format: int32
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: User successfully registered.
 *                 data:
 *                   type: null
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   format: int32
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to register user due to validation errors.
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: Email field is required.
 *                         password:
 *                           type: string
 *                           example: Password field is required.
 *                         username:
 *                           type: string
 *                           example: Username field is required.
 *                         handle:
 *                           type: string
 *                           example: Handle field is required.
 *       409:
 *         description: User with provided email or handle already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   format: int32
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: User with the provided email or handle already exists.
 *                 data:
 *                   type: null
 */
router.post("/users", authenticateJWT, isAdmin, async (req, res) => {
  try {
    var errors = {};
    const { email, password, username, handle, bio, verified, admin } =
      req.body;

    // If bio, verified, or admin are provided but empty, set them to null
    if (bio === "" || bio === undefined) {
      req.body.bio = "";
    }
    if (verified === "" || verified === undefined) {
      req.body.verified = false;
    }
    if (admin === "" || admin === undefined) {
      req.body.admin = false;
    }

    // Validate the request body
    if (!email) {
      errors.email = "Email field is required.";
    } else if (!password) {
      errors.password = "Password field is required.";
    } else if (!username) {
      errors.username = "Username field is required.";
    } else if (!handle) {
      errors.handle = "Handle field is required.";
    }

    // Check if email is valid
    if (email && !validateEmail(email)) {
      errors.email = "Email is invalid.";
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to register user due to validation errors.",
        data: {
          errors: errors,
        },
      });
    }

    // Check if the user with the provided email or handle already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { handle: req.body.handle }],
    });

    if (existingUser) {
      let message = "User with the provided email or handle already exists.";

      if (existingUser.email === email) {
        message = "User with the provided email already exists.";
      } else if (existingUser.handle === req.body.handle) {
        message = "User with the provided handle already exists.";
      }

      return res.status(409).json({
        status: "error",
        code: 409,
        message,
        data: null,
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      handle,
      email,
      password: hashedPassword,
      username,
      // Add other fields if necessary
    });

    await user.save();

    res.status(201).json({
      status: "success",
      code: 201,
      message: "User successfully registered.",
      data: null,
    });
  } catch (error) {
    // Return an error
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong.",
      data: null,
    });
  }
});

// Read (GET) - Fetch a specific user by ID
/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Retrieve a user by ID as an admin
 *     tags:
 *       - Admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f1f2d5a1f2d5a1f2d5a1f2d
 *                     handle:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       example: john@doe.com
 *                     username:
 *                       type: string
 *                       example: John Doe
 *                     profilePicture:
 *                       type: string
 *                       example: https://camphouse.vmgware.dev/images/profiles/ProfilePicture.png
 *                     bio:
 *                       type: string
 *                       example: I'm John Doe
 *                     verified:
 *                       type: boolean
 *                       example: false
 *                     admin:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       example: 2020-07-27T00:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-07-27T00:00:00.000Z
 *       400:
 *         description: Invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *                 data:
 *                   type: null
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 data:
 *                   type: null
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 *                 data:
 *                   type: null
 */
router.get("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // If the ID is invalid, return an error
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
        code: 400,
        data: null,
      });
    }

    // Fetch the user by ID
    const user = await User.findById(req.params.id).select("-password -__v");

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        data: null,
      });
    }

    // Return the user
    res.json({
      status: "success",
      message: "User fetched successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    // Return an error
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      code: 500,
      data: null,
    });
  }
});

// Update (PUT) - Update a specific user by ID
/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update a user by ID as an admin
 *     tags:
 *       - Admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to update.
 *         required: true
 *         type: string
 *     requestBody:
 *       description: User details to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FullRegistrationRequest'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: Invalid user ID or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to update user due to validation errors.
 *                 data:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: Email field is required.
 *                         password:
 *                           type: string
 *                           example: Password field is required.
 *                         username:
 *                           type: string
 *                           example: Username field is required.
 *                         handle:
 *                           type: string
 *                           example: Handle field is required.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: User not found.
 *                 data:
 *                   type: null
 *       409:
 *         description: User with provided email or handle already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: User with the provided email or handle already exists.
 *                 data:
 *                   type: null
 */
router.put("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    var errors = {};
    const { email, password, username, handle, bio, verified, admin } =
      req.body;

    // If bio, verified, or admin are provided but empty, set them to null
    if (bio === "" || bio === undefined) {
      req.body.bio = "";
    }
    if (verified === "" || verified === undefined) {
      req.body.verified = false;
    }
    if (admin === "" || admin === undefined) {
      req.body.admin = false;
    }

    // Validate the request body
    if (!email) {
      errors.email = "Email field is required.";
    } else if (!password) {
      errors.password = "Password field is required.";
    } else if (!username) {
      errors.username = "Username field is required.";
    } else if (!handle) {
      errors.handle = "Handle field is required.";
    }

    // Check if email is valid
    if (email && !validateEmail(email)) {
      errors.email = "Email is invalid.";
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Failed to update user due to validation errors.",
        data: {
          errors: errors,
        },
      });
    }

    // If the ID is invalid, return an error
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
        code: 400,
        data: null,
      });
    }

    // Fetch the user by ID
    const user = await User.findById(req.params.id);

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        data: null,
      });
    }

    // Check if the user with the provided email or handle already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { handle: req.body.handle }],
    });

    if (existingUser && existingUser._id.toString() !== req.params.id) {
      let message = "User with the provided email or handle already exists.";

      if (existingUser.email === email) {
        message = "User with the provided email already exists.";
      } else if (existingUser.handle === req.body.handle) {
        message = "User with the provided handle already exists.";
      }

      return res.status(409).json({
        status: "error",
        code: 409,
        message,
        data: null,
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user
    user.email = email;
    user.password = hashedPassword;
    user.username = username;
    user.handle = handle;
    user.bio = bio;
    user.verified = verified;
    user.admin = admin;

    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      message: "User updated successfully",
      data: null,
    });
  } catch (error) {
    // Return an error
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong: " + error.message,
      data: null,
    });
  }
});

// Delete (DELETE) - Delete a specific user by ID
/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user by ID as an admin
 *     tags:
 *       - Admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to delete.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: success
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User deleted successfully.
 *                 data:
 *                   type: null
 *       400:
 *         description: Invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *                 data:
 *                   type: null
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 data:
 *                   type: null
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 *                 data:
 *                  type: null
 */
router.delete("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // If the ID is invalid, return an error
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
        code: 400,
        data: null,
      });
    }

    // Fetch the user by ID
    const user = await User.findById(req.params.id);

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        data: null,
      });
    }

    // Delete all posts by the user
    await Post.deleteMany({ user: req.params.id });

    // Delete all comments by the user
    await Comment.deleteMany({ user: req.params.id });

    // Delete all messages by the user
    await Message.deleteMany({ sender: req.params.id });

    // Delete all reports by the user
    await Report.deleteMany({ reportedBy: req.params.id });

    // Delete all notifications for the user
    await Notification.deleteMany({
      $or: [{ sender: req.params.id }, { receiver: req.params.id }],
    });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    // Return a success message
    res.json({
      status: "success",
      message: "User deleted successfully",
      code: 200,
      data: null,
    });
  } catch (error) {
    console.error(error);
    // Return an error
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
      code: 500,
      data: null,
    });
  }
});

// TODO: Post: RD
// TODO: Comment: RD
// TODO: Message: RD

// Read (GET) - Get analytics/stats for the app
/**
 * @swagger
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get analytics/stats for the app
 *     description: Get analytics/stats for the app as an admin
 *     tags:
 *       - Admin
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: success
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Analytics fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: integer
 *                       example: 10
 *                     posts:
 *                       type: integer
 *                       example: 100
 *                     messages:
 *                       type: integer
 *                       example: 1000
 *                     comments:
 *                       type: integer
 *                       example: 10000
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 *                 data:
 *                  type: null
 */
router.get("/analytics", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Number of users
    const users = await User.countDocuments();

    // Number of posts
    const posts = await Post.countDocuments();

    // Number of messages
    const messages = await Message.countDocuments();

    // Number of comments
    const comments = await Comment.countDocuments();

    // Return the analytics
    res.json({
      status: "success",
      message: "Analytics fetched successfully",
      code: 200,
      data: {
        users,
        posts,
        messages,
        comments,
      },
    });
  } catch (error) {
    // Return an error
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
      code: 500,
      data: null,
    });
  }
});

// Return router
module.exports = router;
