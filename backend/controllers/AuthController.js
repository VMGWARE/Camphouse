/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         email: john.doe@example.com
 *         password: yoursecurepassword
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The response status
 *           example: success
 *         code:
 *           type: integer
 *           format: int32
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Informational message
 *           example: Successfully logged in
 *         data:
 *           $ref: '#/components/schemas/UserWithToken'
 *
 *     UserWithToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token string for the user
 *           example: jwt_token_string_here
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *           example: 5f6e3b7d3c9d62001724576e
 *         email:
 *           type: string
 *           description: User's email address
 *           example: john.doe@example.com
 *         username:
 *           type: string
 *           description: User's chosen username
 *           example: johndoe123
 *         profilePicture:
 *           type: string
 *           description: Path to user's profile picture
 *           example: /path/to/image.jpg
 *         bio:
 *           type: string
 *           description: User's bio or description
 *           example: I love coding!
 *         admin:
 *           type: boolean
 *           description: Indicates if the user has administrative rights
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user profile was created
 *           example: 2023-08-30T14:15:22Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user profile was last updated
 *           example: 2023-08-31T12:11:52Z
 *         handle:
 *           type: string
 *           description: User's unique handle
 *           example: john_doe_handle
 *         verified:
 *           type: boolean
 *           description: Indicates if the user's email is verified
 *           example: true
 *         followers:
 *           type: integer
 *           description: Number of followers
 *           example: 5
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *           example: 5f6e3b7d3c9d62001724576e
 *         email:
 *           type: string
 *           description: User's email address
 *           example: john.doe@example.com
 *         username:
 *           type: string
 *           description: User's chosen username
 *           example: johndoe123
 *         profilePicture:
 *           type: string
 *           description: Path to user's profile picture
 *           example: /path/to/image.jpg
 *         bio:
 *           type: string
 *           description: User's bio or description
 *           example: I love coding!
 *         admin:
 *           type: boolean
 *           description: Indicates if the user has administrative rights
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user profile was created
 *           example: 2023-08-30T14:15:22Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user profile was last updated
 *           example: 2023-08-31T12:11:52Z
 *         handle:
 *           type: string
 *           description: User's unique handle
 *           example: john_doe_handle
 *         verified:
 *           type: boolean
 *           description: Indicates if the user's email is verified
 *           example: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The response status
 *           example: error
 *         code:
 *           type: integer
 *           format: int32
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error message
 *           example: The request body is missing a required field.
 *         data:
 *           type: null
 *
 *     RegistrationRequest:
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
 *       example:
 *         email: jane.doe@example.com
 *         password: anothersecurepassword
 *         username: janedoe123
 *         handle: jane_doe_handle
 *
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         code:
 *           type: integer
 *           format: int32
 *           example: 200
 *         message:
 *           type: string
 *           example: Token refreshed successfully
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: refreshed_jwt_token_string_here
 *
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         code:
 *           type: integer
 *           format: int32
 *           example: 200
 *         message:
 *           type: string
 *           example: Successfully logged out
 *         data:
 *           type: null
 * tags:
 *   name: Auth
 *   description: Operations for user authentication, including login, logout, and token verification.
 */

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    BearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *      description: JWT authorization header using the Bearer scheme.
 */
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const Follow = require("../models/Follow");
const jwt = require("jsonwebtoken");
const { validateEmail } = require("../utils/general");
const router = express.Router();
const crypto = require("crypto");
const Minio = require("minio");

// Load environment variables
require("dotenv").config();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     description: Login an existing user
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
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
 *                   example: Failed to login due to validation errors.
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
 *       401:
 *         description: Incorrect email or password
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
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Your email or password is incorrect!
 *                 data:
 *                   type: null
 */
router.post("/login", async (req, res) => {
  var errors = {};
  const { email, password } = req.body;

  // Validate the request body
  if (!email) {
    errors.email = "Email field is required.";
  } else if (!password) {
    errors.password = "Password field is required.";
  }

  // Also check if the email is valid
  if (email && !validateEmail(email)) {
    errors.email = "Email is invalid.";
  }

  // Check if there are any errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Failed to login due to validation errors.",
      data: {
        errors: errors,
      },
    });
  }

  // Check if the email and password are provided
  const user = await User.findOne({
    email: email,
  });

  // Check if the user exists
  if (!user) {
    return res
      .json({
        status: "error",
        code: 401,
        message: "Your email or password is incorrect!",
        data: null,
      })
      .status(401);
  }

  // Check if the password is correct
  if (!bcrypt.compare(password, user.password)) {
    return res
      .json({
        status: "error",
        code: 401,
        message: "Your email or password is incorrect!",
        data: null,
      })
      .status(401);
  }

  // Create a JWT token
  const token = jwt.sign(
    {
      sub: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      handle: user.handle,
      verified: user.verified,
      token: await UserToken.generate(user),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  // Return the JWT token
  res.json({
    status: "success",
    code: 200,
    message: "Successfully logged in",
    data: {
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        handle: user.handle,
        verified: user.verified,
      },
    },
  });
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Register a new user
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationRequest'
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
router.post("/register", async (req, res) => {
  var errors = {};
  const { email, password, username, handle } = req.body;

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
});

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user profile
 *     description: Get the logged in user's profile information
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: An error occurred while fetching user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    // Assuming authenticateJWT adds the user's ID to req.user._id
    const user = await User.findById(req.user._id).select("-password"); // Excluding password from the returned data

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found.",
        data: null,
      });
    }

    // Reassign the user object to a new object so we can add more fields
    var enrichedUser = user.toObject();

    // Add the number of followers
    const followers = await Follow.find({ following: user._id });
    enrichedUser.followers = followers.length;

    res.json({
      status: "success",
      code: 200,
      message: "User profile fetched successfully.",
      data: enrichedUser,
    });
  } catch (err) {
    // Generic error handler, you might want to return more specific messages
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while fetching user profile.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update user profile
 *     description: Update user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handle:
 *                 type: string
 *                 description: Updated unique handle
 *               username:
 *                 type: string
 *                 description: Updated username
 *               email:
 *                 type: string
 *                 description: Updated email address
 *               bio:
 *                 type: string
 *                 description: Updated bio
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed
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
 *                   example: Failed to update profile due to validation errors
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
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
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: You are not authorized to perform this action
 *                 data:
 *                   type: null
 *       409:
 *         description: Email or handle already in use
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
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: The provided handle is already in use
 *                 data:
 *                   type: null
 */
router.put("/update-profile", authenticateJWT, async (req, res) => {
  const updates = {};
  var errors = {};

  // If any of the fields are provided, but empty, return an error
  if (req.body.email && req.body.email.length === 0) {
    errors.email = "Email field cannot be empty";
  }
  if (req.body.handle && req.body.handle.length === 0) {
    errors.handle = "Handle field cannot be empty";
  }
  if (req.body.username && req.body.username.length === 0) {
    errors.username = "Username field cannot be empty";
  }

  // Handle the ones that are not empty
  if (req.body.handle && req.body.handle.length > 0) {
    // Check if handle is valid
    if (req.body.handle.length < 3) {
      errors.handle = "Handle must be at least 3 characters long";
    }
    if (req.body.handle.length > 32) {
      errors.handle = "Handle must be at most 32 characters long";
    } else {
      // Check if handle is already taken
      const existingUser = await User.findOne({ handle: req.body.handle });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        errors.handle = "The provided handle is already in use";
      } else {
        updates.handle = req.body.handle;
      }
    }
  }
  if (req.body.username && req.body.username.length > 0) {
    // Add validation for other fields similarly, for example:
    if (req.body.username) {
      // Add your validation logic here
      if (req.body.username.length < 3) {
        errors.username = "Username must be at least 3 characters long";
      }
      if (req.body.username.length > 32) {
        errors.username = "Username must be at most 32 characters long";
      } else {
        updates.username = req.body.username;
      }
    }
  }
  if (req.body.bio && req.body.bio.length > 0) {
    if (req.body.bio.length > 255) {
      errors.bio = "Bio must be at most 255 characters long";
    } else {
      // Validate the bio does not contain any HTML tags
      const regex = /(<([^>]+)>)/gi;

      if (regex.test(req.body.bio)) {
        errors.bio = "Bio is invalid";
      } else {
        updates.bio = req.body.bio;
      }
    }
  }
  if (req.body.email && req.body.email.length > 0) {
    // Check if email is valid
    if (!validateEmail(req.body.email)) {
      errors.email = "Email is invalid";
    } else {
      // Check if email is already taken
      // Check if handle is already taken
      const existingUser = await User.findOne({ email: req.body.email });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        errors.email = "The provided email is already in use";
      } else {
        updates.email = req.body.email;
      }
    }
  }

  // If there are any errors, return them in the response
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid input",
      data: {
        errors: errors,
      },
    });
  }

  try {
    var updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    // Remove the password from the returned data
    updatedUser = updatedUser.toObject();
    delete updatedUser.password;

    // Return the updated user
    res.json({
      status: "success",
      code: 200,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Error updating profile",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/upload-profile-picture:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Upload user profile picture
 *     description: |
 *       Uploads a new profile picture to the MinIO bucket and updates the user’s profile with the new picture URL.
 *       Also, deletes the old profile picture from the MinIO bucket if it exists.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: file
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: Profile picture updated successfully.
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
 *                   example: Profile picture updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request, e.g. no file provided or file must be an image or smaller than 5MB.
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
 *                   example: File is required
 *                 data:
 *                   type: null
 *
 *       401:
 *         description: Unauthorized, e.g. invalid or missing token.
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
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *                 data:
 *                   type: null
 *
 *       422:
 *         description: Unprocessable Entity, e.g. invalid file format.
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
 *                   example: 422
 *                 message:
 *                   type: string
 *                   example: Invalid file format
 *                 data:
 *                   type: null
 *
 *       500:
 *         description: Server error while uploading profile picture.
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
 *                   example: An error occurred while uploading the profile picture
 *                 data:
 *                   type: null
 */
router.put("/upload-profile-picture", authenticateJWT, async (req, res) => {
  try {
    // Check if Minio credentials are provided
    if (
      !process.env.MINIO_ENDPOINT ||
      !process.env.MINIO_ACCESS_KEY ||
      !process.env.MINIO_SECRET_KEY ||
      !process.env.MINIO_BUCKET
    ) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "This server is not configured to upload profile pictures",
        data: null,
      });
    }

    // Create a new Minio client
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      useSSL: false, // Change to true if your Minio server uses SSL
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });

    // Check if a file is provided
    const file = req.files.profilePicture;

    // If no file is provided, return an error
    if (!file) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "File is required",
        data: null,
      });
    }

    // Make sure the file is an image
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "File must be an image",
        data: null,
      });
    }

    // Max file size is 5MB
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "File must be smaller than 5MB",
        data: null,
      });
    }

    // Define the bucket and object name
    const bucketName = process.env.MINIO_BUCKET;
    const objectName = `profile-pictures/${req.user._id}-${Date.now()}.${
      file.mimetype.split("/")[1]
    }`;

    // Upload the file to Minio
    await minioClient.putObject(
      bucketName,
      objectName,
      file.data,
      function (err, etag) {
        if (err) throw err;
      }
    );

    // Find the user
    const user = await User.findById(req.user._id);

    // Delete the old profile picture from Minio if it exists
    if (user.profilePicture) {
      const urlParts = user.profilePicture.split("/");
      const oldObjectName = `profile-pictures/` + urlParts[urlParts.length - 1];
      await minioClient.removeObject(bucketName, oldObjectName, function (err) {
        if (err) throw err;
      });
    }

    // Update the user's profile with the new picture URL
    const newProfilePictureURL = `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${objectName}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: newProfilePictureURL },
      { new: true }
    );

    // Return the updated user
    res.json({
      status: "success",
      code: 200,
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "An error occurred while uploading the profile picture",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh JWT token
 *     description: Refresh the JWT token for the logged in user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh-token", authenticateJWT, async (req, res) => {
  const user = req.user; // Assuming the authenticateJWT middleware adds the decoded user to req object

  // Create a new JWT token
  const newToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      handle: user.handle,
      verified: user.verified,
      // We can reuse it as it doesn't expire
      token: req.user.token,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  res.json({
    status: "success",
    code: 200,
    message: "Token refreshed successfully",
    data: {
      token: newToken,
    },
  });
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout
 *     description: Logout the logged in user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authenticateJWT, async (req, res) => {
  try {
    // Get the user object from the request
    const user = req.user;

    // Hash the user's token
    const usertoken = crypto
      .createHash("sha256")
      .update(req.user.token)
      .digest("hex");

    // Delete the user's token from the database
    await UserToken.deleteOne({
      user: user._id,
      token: usertoken,
    });

    // Delete the JWT token
    res.json({
      status: "success",
      code: 200,
      message: "Successfully logged out",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Error logging out",
      data: null,
    });
  }
});

// TODO: Add a route to verify the user's email address
// TODO: Update the user's password, must provide the current password and the new password (confirm the new password)

module.exports = router;
