/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Operations related to creating, fetching, updating, and deleting reports.
 *
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - reportedBy
 *         - reported
 *         - reportedContentId
 *         - reportedContentType
 *         - snapshot
 *         - description
 *       properties:
 *         reportedBy:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who reported the content.
 *         reported:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who created the content being reported.
 *         reportedContentId:
 *           type: string
 *           format: uuid
 *           description: The ID of the reported content.
 *         reportedContentType:
 *           type: string
 *           description: The type of content that was reported.
 *           enum:
 *             - Post
 *             - Comment
 *             - Message
 *             - User
 *         snapshot:
 *           type: object
 *           description: A snapshot of the content at the time of the report.
 *         description:
 *           type: string
 *           description: The reason for the report, can be in markdown format.
 *         moderatorNote:
 *           type: string
 *           description: The note that the moderator left on the report.
 *         status:
 *           type: string
 *           description: The status of the report.
 *           enum:
 *             - Pending
 *             - Approved
 *             - Denied
 *           default: Pending
 *       example:
 *         reportedBy: "123e4567-e89b-12d3-a456-426614174001"
 *         reported: "123e4567-e89b-12d3-a456-426614174002"
 *         reportedContentId: "123e4567-e89b-12d3-a456-426614174003"
 *         reportedContentType: "Post"
 *         snapshot: { "content": "This is a snapshot of the content" }
 *         description: "Inappropriate content"
 *         moderatorNote: "Reviewed - action taken"
 *         status: "Approved"
 *     ReportUpdate:
 *       type: object
 *       required:
 *         - moderatorNote
 *         - status
 *       properties:
 *         moderatorNote:
 *           type: string
 *           description: The note that the moderator left on the report.
 *         status:
 *           type: string
 *           description: The status of the report.
 *           enum:
 *             - Pending
 *             - Approved
 *             - Denied
 *           default: Pending
 *       example:
 *         moderatorNote: "Reviewed - action taken"
 *         status: "Approved"
 *     ReportResponse:
 *       type: object
 *       properties:
 *         reportedBy:
 *           $ref: '#/components/schemas/ReportUser'
 *         reported:
 *           $ref: '#/components/schemas/ReportUser'
 *         reportedContentId:
 *           type: string
 *           format: uuid
 *           description: The ID of the reported content.
 *         reportedContentType:
 *           type: string
 *           description: The type of content that was reported.
 *           enum:
 *             - Post
 *             - Comment
 *             - Message
 *             - User
 *         snapshot:
 *           type: object
 *           description: A snapshot of the content at the time of the report.
 *         description:
 *           type: string
 *           description: The reason for the report, can be in markdown format.
 *         moderatorNote:
 *           type: string
 *           description: The note that the moderator left on the report.
 *         status:
 *           type: string
 *           description: The status of the report.
 *           enum:
 *             - Pending
 *             - Approved
 *             - Denied
 *           default: Pending
 *     ReportUser:
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
 */

const express = require("express");

// Things that can be reported
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Message = require("../models/Message");

// The report model
const Report = require("../models/Report");

const router = express.Router();

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Services
const NotificationService = require("../services/NotificationService");

/**
 * @swagger
 * /api/v1/reports:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get all reports
 *     description: Allows admins to retrieve all the reports.
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
 *         description: Number of reports per page for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: Search query to filter reports by description or moderator note.
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter reports by status.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Denied]
 *     responses:
 *       200:
 *         description: Successfully retrieved all reports.
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
 *                   example: Successfully retrieved all reports
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReportResponse'
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     maxPages:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
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
 *                   example: Server error
 *                 data:
 *                   type: null
 */
router.get("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    if (status && !["Pending", "Approved", "Denied"].includes(status)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid status",
        data: null,
      });
    }

    // Creating the query conditionally based on the input parameters.
    let queryConditions = [];
    if (search) {
      queryConditions.push({ description: { $regex: search, $options: "i" } });
      queryConditions.push({
        moderatorNote: { $regex: search, $options: "i" },
      });
    }

    if (status) {
      queryConditions.push({ status: { $regex: status, $options: "i" } });
    }

    let reports;

    if (queryConditions.length) {
      reports = await Report.find({
        $or: queryConditions,
      })
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("reportedBy", "-password -__v");
    } else {
      reports = await Report.find()
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("reportedBy", "-password -__v");
    }

    if (!reports.length) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Reports not found",
        data: null,
      });
    }

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const reported = await User.findById(report.reported).select(
        "-password -__v"
      );
      report.reported = reported;
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Successfully retrieved all reports",
      data: {
        reports: reports,
        page: page,
        maxPages: Math.ceil((await Report.countDocuments()) / limit),
        limit: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/reports/{reportId}:
 *   put:
 *     tags:
 *       - Reports
 *     summary: Update a report
 *     description: Allows admins to update a specific report identified by its ID.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         description: The ID of the report to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: The updated report details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportUpdate'
 *     responses:
 *       200:
 *         description: Successfully updated the report.
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
 *                   example: Successfully updated the report
 *                 data:
 *                   $ref: '#/components/schemas/Report'
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
 *                   example: Server error
 *                 data:
 *                   type: null
 */
router.put("/:reportId", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Get the report
    const report = await Report.findById(req.params.reportId);

    // If the report does not exist, return an error
    if (!report) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Report not found",
        data: null,
      });
    }

    // Update the report
    report.moderatorNote = req.body.moderatorNote;
    report.status = req.body.status;

    // Save the report
    await report.save();

    // Return the report
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Successfully updated the report",
      data: report,
    });
  } catch (error) {
    // If the report ID is invalid, return an error
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Create a new report
 *     description: Allows users to report a content (Post, Comment, Message) or a user profile. The reporting user needs to be authenticated.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Details of the report.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of content being reported (e.g., post, comment, message, or user).
 *                 example: Post
 *               contentId:
 *                 type: string
 *                 description: The ID of the content being reported.
 *                 example: 60d73b9f8a5e3d0c3e4c77b8
 *               reason:
 *                 type: string
 *                 description: The reason for reporting the content.
 *                 example: Spam
 *     responses:
 *       201:
 *         description: Successfully created a new report.
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Successfully created a new report
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Bad request – possibly due to missing or invalid parameters.
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
 *                   example: Server error
 *                 data:
 *                   type: null
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    var errors = {};
    const Types = ["Post", "Comment", "Message", "User"];
    const { type, contentId, reason } = req.body;

    // Validate the request body
    if (!type) {
      errors.type = "Type is required";
    }
    if (!contentId) {
      errors.contentId = "Content ID is required";
    }
    if (!reason) {
      errors.reason = "Reason is required";
    }

    // If type is not one of the allowed types, return an error
    if (!Types.includes(type)) {
      errors.type = "Invalid type";
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Validation errors",
        data: {
          errors: errors,
        },
      });
    }

    // Make sure the content exists
    var content;

    // Get the content
    if (type == "Post") {
      content = await Post.findById(contentId);
    } else if (type == "Comment") {
      content = await Comment.findById(contentId);
    } else if (type == "Message") {
      content = await Message.findById(contentId);
    } else if (type == "User") {
      content = await User.findById(contentId);
    } else {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid type",
        data: null,
      });
    }

    // If the content does not exist, return an error
    if (!content) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Content not found",
        data: null,
      });
    }

    // Check if the user has already reported the content
    const existingReport = await Report.findOne({
      reportedBy: req.user._id,
      reported: content.user,
      reportedContentId: contentId,
      reportedContentType: type,
    });

    // If the user has already reported the content, return an error
    if (existingReport) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You have already reported this content",
        data: null,
      });
    }

    // Create the report
    const report = new Report({
      reportedBy: req.user._id,
      reported: content.user,
      reportedContentId: content._id,
      reportedContentType: type,
      snapshot: content,
      description: reason,
    });

    // Save the report
    await report.save();

    // Return the report
    res.status(201).json({
      status: "success",
      code: 201,
      message: "Successfully created the report",
      data: report,
    });

    // Create a notification for the user who created the content
    await NotificationService.create(
      "REPORT", // type
      req.user._id, // sender
      req.user._id, // receiver
      report._id, // referenceId
      "Report", // onModel
      `Your report of ${type.toLowerCase()} has been received and is being reviewed by our moderators.` // message
    );
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/reports/user/{userId}:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get all reports created by a specific user.
 *     description: Get all reports created by a specific user. Accessible only by the user themselves or an admin.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of the user to retrieve the reports for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the reports.
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
 *                   example: Successfully retrieved reports
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       403:
 *         description: Forbidden - not allowed to access these reports.
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
 *                   example: Forbidden
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
 */
router.get("/user/:userId", authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the requester is the user themselves or an admin
    if (userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Forbidden",
        data: null,
      });
    }

    // Get the reports created by the user
    const reports = await Report.find({ reportedBy: userId });

    // Check if reports exist
    if (!reports.length) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Reports not found",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Successfully retrieved reports",
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/reports/{reportId}:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Fetch a single report by ID.
 *     description: Fetch a single report by its ID. Accessible only by the user who created the report or an admin.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         description: The ID of the report to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the report.
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
 *                   example: Successfully retrieved report
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       403:
 *         description: Forbidden - not allowed to access this report.
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
 *                   example: Forbidden
 *                 data:
 *                   type: null
 *       404:
 *         description: Report not found.
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
 *                   example: Report not found
 *                 data:
 *                   type: null
 */
router.get("/:reportId", authenticateJWT, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId)
      .populate("reportedBy", "-password -__v")
      .populate("reported", "-password -__v");

    // If the report does not exist, return an error
    if (!report) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Report not found",
        data: null,
      });
    }

    // Check if the requester is the creator of the report or an admin
    if (report.reportedBy.toString() !== req.user._id && !req.user.admin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Forbidden",
        data: null,
      });
    }

    // Return the report
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Successfully retrieved report",
      data: report,
    });
  } catch (error) {
    // If the report ID is invalid, return an error
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

module.exports = router;
