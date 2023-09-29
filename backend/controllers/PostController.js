/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Operations related to creating, fetching, updating, and deleting posts.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - user_id
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           description: The auto-generated ID of the post.
 *         title:
 *           type: string
 *           description: The title of the post.
 *           minLength: 3
 *           maxLength: 100
 *         content:
 *           type: string
 *           description: The content of the post.
 *           minLength: 6
 *           maxLength: 1000
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated.
 *     GetPost:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - user_id
 *       properties:
 *         id:
 *           type: string
 *           format: ObjectId
 *           description: The auto-generated ID of the post.
 *         title:
 *           type: string
 *           description: The title of the post.
 *           minLength: 3
 *           maxLength: 100
 *         content:
 *           type: string
 *           description: The content of the post.
 *           minLength: 6
 *           maxLength: 1000
 *         user:
 *           $ref: '#/components/schemas/User'
 *         isLiked:
 *           type: boolean
 *           description: Whether the post is liked by the current user.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was last updated.
 */

const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const router = express.Router();

// Middleware
const { authenticateJWT, loadUser } = require("../middleware/auth");

// TODO: Add loadComments, loadPosts, and loadLikes functions so that we don't have to repeat code

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Fetch all posts.
 *     description: Fetch all posts with comments, associated users, and like counts.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of posts per page for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: Search query to filter posts by title and content.
 *         required: false
 *         schema:
 *           type: string
 *       - name: userid
 *         in: query
 *         description: The user's id to filter posts by.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved posts.
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
 *                   example: Successfully retrieved posts
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GetPost'
 *                     page:
 *                       type: integer
 *                     maxPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Bad request
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
 *                   example: Bad request
 *                 data:
 *                   type: null
 */
router.get("/", loadUser, async (req, res) => {
  // Page number
  const page = parseInt(req.query.page) || 1;

  // Number of posts per page
  const limit = parseInt(req.query.limit) || 10;

  // Search query
  const search = req.query.search || "";

  // Search via user handle
  const userid = req.query.userid || "";

  // create an object to hold the search criteria
  let criteria = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ],
  };

  // if a userid is provided, adjust the search criteria to also filter by userid
  if (userid) {
    criteria.user = userid; // assuming user is the field holding the reference to the user who posted it
  }

  // Get the posts
  const posts = await Post.find(criteria)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(
      "user",
      "-__v -password -email -bio -admin -createdAt -updatedAt"
    );

  // Use Promise.all to load the comments, users, and likes for each post concurrently
  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      const enrichedPost = post.toObject(); // Convert the Mongoose document to a plain object

      // Comments
      var comments = await Comment.find({ post: post._id })
        .sort({
          createdAt: -1,
        })
        .populate(
          "user",
          "-__v -password -email -bio -admin -createdAt -updatedAt"
        );

      enrichedPost.comments = comments;

      // Number of likes
      const likes = await Like.find({ post: post._id });
      enrichedPost.likes = likes.length;

      // Is liked by the current user
      if (req.user) {
        const like = await Like.findOne({
          post: post._id,
          user: req.user._id,
        });
        enrichedPost.isLiked = !!like;
      }

      return enrichedPost;
    })
  );

  // Return the enriched posts
  res.json({
    status: "success",
    code: 200,
    message: "Successfully retrieved posts",
    data: {
      posts: enrichedPosts,
      page: page,
      // Calculate the maximum number of pages based on the total number of posts that match the search criteria
      maxPages: Math.ceil((await Post.countDocuments(criteria)) / limit),
      limit: limit,
    },
  });
});

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Fetch a single post.
 *     description: Fetch a single post with its comments, associated users, and like count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the post
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
 *                   example: Successfully retrieved post
 *                 data:
 *                   $ref: '#/components/schemas/GetPost'
 *       404:
 *         description: The requested post could not be found
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
 *                   example: The requested post could not be found
 *                 data:
 *                   type: null
 */
router.get("/:postId", loadUser, async (req, res) => {
  var post;

  // Get the post
  try {
    post = await Post.findById(req.params.postId).populate(
      "user",
      "-__v -password -email -bio -admin -createdAt -updatedAt"
    );
  } catch (err) {
    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The requested post could not be found.",
        data: null,
      });
    }
  }

  // Convert the Mongoose document to a plain object
  const enrichedPost = post.toObject();

  // Comments
  var comments = await Comment.find({ post: post._id })
    .sort({
      createdAt: -1,
    })
    .populate(
      "user",
      "-__v -password -email -bio -admin -createdAt -updatedAt"
    );

  enrichedPost.comments = comments;

  // Number of likes
  const likes = await Like.find({ post: post._id });
  enrichedPost.likes = likes.length;

  // Is liked by the current user
  if (req.user) {
    const like = await Like.findOne({
      post: post._id,
      user: req.user._id,
    });
    enrichedPost.isLiked = !!like;
  }

  // Remove unnecessary fields
  enrichedPost.__v = undefined;

  // Return the enriched post
  res.json({
    status: "success",
    code: 200,
    message: "Successfully retrieved post",
    data: enrichedPost,
  });
});

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post.
 *     description: Create a new post.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 description: The title of the post.
 *                 type: string
 *                 example: My first post
 *               content:
 *                 description: The content of the post.
 *                 type: string
 *                 example: This is my first post! I'm so excited!
 *     responses:
 *       200:
 *         description: Successfully created the post
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
 *                   example: Successfully created post
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: The request body is missing a required field
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
 *                   example: The request body is missing a required field
 *                 data:
 *                   type: null
 *       500:
 *         description: Something went wrong
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
router.post("/", authenticateJWT, async (req, res) => {
  try {
    var errors = {};

    // Make sure the title is valid
    if (!req.body.title || req.body.title.length < 2) {
      errors.title = "Title must be at least 2 characters long.";
    } else if (req.body.title.length > 100) {
      errors.title = "Title must be less than 100 characters long.";
    }

    // Make sure the content is valid
    if (!req.body.content || req.body.content.length < 1) {
      errors.content = "Content must be at least 1 character long.";
    } else if (req.body.content.length > 1000) {
      errors.content = "Content must be less than 1000 characters long.";
    }

    // If there are any errors, return them in the response
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "The request body is missing a required field.",
        data: {
          errors: errors,
        },
      });
    }

    // Create the post
    const { title, content } = req.body;

    const post = new Post({
      user: req.user._id,
      title: title,
      content: content,
    });

    await post.save();

    // Return the post
    res.json({
      status: "success",
      code: 200,
      message: "Successfully created post",
      data: post,
    });
  } catch (err) {
    console.log(err);
    // Something went wrong
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post.
 *     description: Update a post.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 description: The title of the post.
 *                 type: string
 *                 example: My first post
 *               content:
 *                 description: The content of the post.
 *                 type: string
 *                 example: This is my first post! I'm so excited!
 *     responses:
 *       200:
 *         description: Successfully updated the post
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
 *                   example: Successfully updated post
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: The request body is missing a required field
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
 *                   example: The request body is missing a required field
 *                 data:
 *                   type: null
 *       403:
 *         description: You do not have permission to update this post
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
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You do not have permission to update this post
 *                 data:
 *                   type: null
 *       404:
 *         description: The requested post could not be found
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
 *                   example: The requested post could not be found
 *                 data:
 *                   type: null
 *       500:
 *         description: Something went wrong
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
router.put("/:postId", authenticateJWT, async (req, res) => {
  try {
    // Check if the post exists
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The requested post could not be found.",
        data: null,
      });
    }

    // Check if the user owns the post
    if (post.user.toString() != req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "You do not have permission to update this post.",
        data: null,
      });
    }

    // Make sure the request body is valid
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "The request body is missing a required field.",
        data: null,
      });
    }

    // Update the post
    const { title, content } = req.body;

    post.title = title;
    post.content = content;

    await post.save();

    // Return the post
    res.json({
      status: "success",
      code: 200,
      message: "Successfully updated post",
      data: post,
    });
  } catch (err) {
    console.log(err);
    // Something went wrong
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong.",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete a post.
 *     description: Delete a post.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the post
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
 *                   example: Successfully deleted post
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       403:
 *         description: You do not have permission to delete this post
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
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You do not have permission to delete this post
 *                 data:
 *                   type: null
 *       404:
 *         description: The requested post could not be found
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
 *                   example: The requested post could not be found
 *                 data:
 *                   type: null
 *       500:
 *         description: Something went wrong
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
router.delete("/:postId", authenticateJWT, async (req, res) => {
  try {
    // Check if the post exists
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "The requested post could not be found.",
        data: null,
      });
    }

    // Check if the user owns the post
    if (post.user.toString() != req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "You do not have permission to delete this post.",
        data: null,
      });
    }

    // Delete the post
    await Post.deleteOne({ _id: req.params.postId });

    // Return the post
    res.json({
      status: "success",
      code: 200,
      message: "Successfully deleted post",
      data: post,
    });
  } catch (err) {
    console.log(err);
    // Something went wrong
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Something went wrong.",
      data: null,
    });
  }
});

module.exports = router;
