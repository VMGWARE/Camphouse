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

// Helpers
const { validateEmail, extractEmailDomain } = require("../utils/general");

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
 *                          isBlocked:
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

module.exports = router;
