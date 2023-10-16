// Require the necessary packages
/**
 * @swagger
 * tags:
 *   name: Blocked Email Domains
 *   description: Blocked email domains management
 */

const express = require("express");
const router = express.Router();

// Require the necessary models
const BlockedEmailDomain = require("../models/BlockedEmailDomain");

// Load environment variables
require("dotenv").config();

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/blocked-email-domains:
 *   get:
 *     summary: Get Blocked Email Domains
 *     description: |
 *       This endpoint is used to retrieve a list of blocked email domains.
 *       The list can be filtered using the `search` query parameter.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Blocked Email Domains
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of blocked email domains per page.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: The search query to filter the list of blocked email domains.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blocked email domains found.
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
 *                   example: Blocked email domains found.
 *                 data:
 *                   type: object
 *                   properties:
 *                     blockedEmailDomains:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 5f9c3f7d9e5d5b0d4e4b9a4d
 *                           domain:
 *                             type: string
 *                             example: gmail.com
 *                           isBlocked:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             example: 2020-10-30T18:39:33.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2020-10-30T18:39:33.000Z
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     maxPages:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Error while getting the blocked email domains.
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
 *                   example: Server error.
 */
router.get("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Page number
    const page = parseInt(req.query.page) || 1;

    // Number of posts per page
    const limit = parseInt(req.query.limit) || 10;

    // Search query
    const search = req.query.search || "";

    const criteria = { domain: { $regex: search, $options: "i" } };

    // Get the blocked email domains
    const blockedEmailDomains = await BlockedEmailDomain.find(criteria)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get the total number of blocked email domains
    const count = await BlockedEmailDomain.countDocuments(criteria);

    // Return the blocked email domains
    res.json({
      status: "success",
      code: 200,
      message: "Blocked email domains found",
      data: {
        blockedEmailDomains: blockedEmailDomains,
        page: page,
        maxPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
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
 * /api/v1/blocked-email-domains:
 *   post:
 *     summary: Add a New Blocked Email Domain
 *     description: |
 *       This endpoint is used to add a new blocked email domain.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Blocked Email Domains
 *     requestBody:
 *       description: The domain to be blocked.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               domain:
 *                 type: string
 *                 example: yahoo.com
 *     responses:
 *       200:
 *         description: Blocked email domain successfully added.
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
 *                   example: Blocked email domain created.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f9c3f7d9e5d5b0d4e4b9a4d
 *                     domain:
 *                       type: string
 *                       example: yahoo.com
 *                     isBlocked:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *       400:
 *         description: Invalid domain or domain already blocked.
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
 *                   example: Invalid domain or Domain already blocked.
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
 *                   example: Server error.
 */
router.post("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Get the domain from the request body
    const domain = req.body.domain;

    // Check if the domain is already blocked
    const blockedEmailDomain = await BlockedEmailDomain.findOne({
      domain: domain,
    }).exec();

    if (blockedEmailDomain) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Domain already blocked",
        data: null,
      });
    }

    // Create a new blocked email domain
    const newBlockedEmailDomain = new BlockedEmailDomain({
      domain: domain,
      isBlocked: true,
    });

    // Save the blocked email domain
    await newBlockedEmailDomain.save();

    // Return the blocked email domain
    res.json({
      status: "success",
      code: 200,
      message: "Blocked email domain created",
      data: newBlockedEmailDomain,
    });
  } catch (error) {
    console.error(error);
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
 * /api/v1/blocked-email-domains/{id}:
 *   get:
 *     summary: Get a Specific Blocked Email Domain
 *     description: |
 *       This endpoint retrieves details of a specific blocked email domain by its ID.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Blocked Email Domains
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the blocked email domain to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blocked email domain found.
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
 *                   example: Blocked email domain found.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f9c3f7d9e5d5b0d4e4b9a4d
 *                     domain:
 *                       type: string
 *                       example: gmail.com
 *                     isBlocked:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *       404:
 *         description: Blocked email domain not found.
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
 *                   example: Blocked email domain not found.
 *       500:
 *         description: Error while getting the blocked email domain.
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
 *                   example: Server error.
 */
router.get("/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Get the blocked email domain
    const blockedEmailDomain = await BlockedEmailDomain.findById(
      req.params.id
    ).exec();

    // Check if the blocked email domain exists
    if (!blockedEmailDomain) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Blocked email domain not found",
        data: null,
      });
    }

    // Return the blocked email domain
    res.json({
      status: "success",
      code: 200,
      message: "Blocked email domain found",
      data: blockedEmailDomain,
    });
  } catch (error) {
    console.error(error);
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
 * /api/v1/blocked-email-domains/{id}:
 *   put:
 *     summary: Update a Specific Blocked Email Domain
 *     description: |
 *       This endpoint is used to update a specific blocked email domain by its ID.
 *       Only the `isBlocked` field can be updated.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Blocked Email Domains
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the blocked email domain to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: The `isBlocked` field to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Blocked email domain successfully updated.
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
 *                   example: Blocked email domain updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f9c3f7d9e5d5b0d4e4b9a4d
 *                     domain:
 *                       type: string
 *                       example: gmail.com
 *                     isBlocked:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *       400:
 *         description: Invalid `isBlocked` field value or blocked email domain not found.
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
 *                   example: Invalid `isBlocked` field value or Blocked email domain not found.
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
 *                   example: Server error.
 */
router.put("/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Get the blocked email domain
    const blockedEmailDomain = await BlockedEmailDomain.findById(
      req.params.id
    ).exec();

    // Check if the blocked email domain exists
    if (!blockedEmailDomain) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Blocked email domain not found",
        data: null,
      });
    }

    // Get the isBlocked field from the request body
    const isBlocked = req.body.isBlocked;

    // Check if the isBlocked field is valid
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid `isBlocked` field value",
        data: null,
      });
    }

    // Update the isBlocked field
    blockedEmailDomain.isBlocked = isBlocked;

    // Save the blocked email domain
    await blockedEmailDomain.save();

    // Return the blocked email domain
    res.json({
      status: "success",
      code: 200,
      message: "Blocked email domain updated",
      data: blockedEmailDomain,
    });
  } catch (error) {
    console.error(error);
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
 * /api/v1/blocked-email-domains/{id}:
 *   delete:
 *     summary: Delete a Specific Blocked Email Domain
 *     description: |
 *       This endpoint is used to delete a specific blocked email domain by its ID.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Blocked Email Domains
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the blocked email domain to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blocked email domain successfully deleted.
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
 *                   example: Blocked email domain deleted.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5f9c3f7d9e5d5b0d4e4b9a4d
 *                     domain:
 *                       type: string
 *                       example: gmail.com
 *                     isBlocked:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2020-10-30T18:39:33.000Z
 *       404:
 *         description: Blocked email domain not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: 404
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Blocked email domain not found.
 *       500:
 *         description: Error while deleting the blocked email domain.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: error
 *                   example: 500
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Server error.
 */
router.delete("/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Get the blocked email domain
    const blockedEmailDomain = await BlockedEmailDomain.findById(
      req.params.id
    ).exec();

    // Check if the blocked email domain exists
    if (!blockedEmailDomain) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Blocked email domain not found",
        data: null,
      });
    }

    // Delete the blocked email domain
    await blockedEmailDomain.remove();

    // Return the blocked email domain
    res.json({
      status: "success",
      code: 200,
      message: "Blocked email domain deleted",
      data: blockedEmailDomain,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Server error",
      data: null,
    });
  }
});

module.exports = router;
