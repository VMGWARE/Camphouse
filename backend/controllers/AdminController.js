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
// const NotificationService = require("../services/NotificationService");

// User: CRUD

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
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               username:
 *                 type: string
 *                 description: User's chosen username
 *               handle:
 *                 type: string
 *                 description: User's unique handle
 *               bio:
 *                 type: string
 *                 description: User's bio
 *               verified:
 *                 type: boolean
 *                 description: Whether or not the user is verified
 *               admin:
 *                 type: boolean
 *                 description: Whether or not the user is an admin
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
    const ValidateRequest = [
      // Things to validate/we can accept
      {
        username: {
          type: "string",
          unique: true,
          minLength: 1,
          maxLength: 32,
        },
        handle: {
          type: "string",
          unique: true,
        },
        email: {
          type: "string",
          validate: "email",
          unique: true,
        },
        bio: {
          type: "string",
          maxLength: 255,
        },
        verified: {
          type: "boolean",
        },
        admin: {
          type: "boolean",
        },
      },
      // Response messages for each validation
      {
        username: {
          type: "Username must be a string.",
          minLength: "Username must be at least 1 character long.",
          maxLength: "Username must be less than 32 characters long.",
        },
        handle: {
          type: "Handle must be a string.",
          unique: "Handle must be unique.",
        },
        email: {
          type: "Email must be a string.",
          unique: "Email must be unique.",
          validate: "Email is invalid.",
        },
        bio: {
          type: "Bio must be a string.",
          maxLength: "Bio must be less than 255 characters long.",
        },
        verified: {
          type: "Verified must be a boolean.",
        },
        admin: {
          type: "Admin must be a boolean.",
        },
      },
    ];

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
    var user = await User.findById(req.params.id);

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        data: null,
      });
    }

    // For each key in the request body, if it has not been updated, remove it from the request body
    for (const [key, value] of Object.entries(req.body)) {
      if (user[key] === value) {
        delete req.body[key];
      }
    }

    // Validate the request body
    const errors = {};
    for (const [key, value] of Object.entries(req.body)) {
      // If the key is not in the list of allowed keys, skip it
      if (!ValidateRequest[0][key]) {
        continue;
      }

      // If the value is empty, skip it
      if (value === "" || value === undefined) {
        continue;
      }

      // If the value is not the correct type, add an error
      if (typeof value !== ValidateRequest[0][key].type) {
        errors[key] = ValidateRequest[1][key].type;
      }

      // If the value is not unique, add an error
      if (ValidateRequest[0][key].unique) {
        const existingUser = await User.findOne({ [key]: value });
        if (existingUser) {
          errors[key] = ValidateRequest[1][key].unique;
        }
      }

      // If the value is not the correct length, add an error
      if (ValidateRequest[0][key].minLength) {
        if (value.length < ValidateRequest[0][key].minLength) {
          errors[key] = ValidateRequest[1][key].minLength;
        }
      }

      // If the value is not the correct length, add an error
      if (ValidateRequest[0][key].maxLength) {
        if (value.length > ValidateRequest[0][key].maxLength) {
          errors[key] = ValidateRequest[1][key].maxLength;
        }
      }

      // If the value is not a valid email, add an error
      if (ValidateRequest[0][key].validate) {
        if (ValidateRequest[0][key].validate === "email") {
          if (!validateEmail(value)) {
            errors[key] = ValidateRequest[1][key].validate;
          }
        }
      }
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

    // If email or handle is being updated, check if the user with the provided email or handle already exists
    if (req.body.email || req.body.handle) {
      const existingUser = await User.findOne({
        $or: [{ email: req.body.email }, { handle: req.body.handle }],
      });

      if (existingUser) {
        let message = "User with the provided email or handle already exists.";

        if (existingUser.email === req.body.email) {
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
    }

    // Update the user
    // Loop through the request body and update the user object, only updating the fields that were provided and validated
    for (const [key, value] of Object.entries(req.body)) {
      if (ValidateRequest[0][key]) {
        user[key] = value;
      }
    }

    // Save the updated user
    await User.findByIdAndUpdate(req.params.id, user);

    // Fetch the updated user
    user = await User.findById(req.params.id).select("-password -__v");

    // Return the updated user
    res.json({
      status: "success",
      message: "User updated successfully",
      code: 200,
      data: user,
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
