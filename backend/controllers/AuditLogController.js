/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Audit log management and retrieval
 */

// Require the necessary packages
const express = require("express");
const router = express.Router();

// Require the necessary models
const AuditLog = require("../models/AuditLog");

// Middleware
const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/audit-logs:
 *   get:
 *     summary: Get Audit Logs
 *     description: |
 *       This endpoint is used to get audit logs.
 *       The endpoint will return a list of audit logs.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: The number of audit logs per page.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: The search query to search for.
 *         required: false
 *         schema:
 *           type: string
 *       - name: searchBy
 *         in: query
 *         description: The field to search by.
 *         required: false
 *         enum: [action, ipAddress, user]
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         description: The field to sort by.
 *         required: false
 *         enum: [createdAt, ipAddress, user, action]
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs successfully retrieved.
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
 *                   example: Audit logs found
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ipAddress:
 *                             type: string
 *                             example:
 *                           user:
 *                             type: string
 *                             example:
 *                           action:
 *                             type: string
 *                             example:
 *                           createdAt:
 *                             type: string
 *                             example:
 *                           updatedAt:
 *                             type: string
 *                             example:
 *                     page:
 *                       type: integer
 *                     maxPages:
 *                       type: integer
 *                     totalAuditLogs:
 *                       type: integer
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
 *                   example: Internal server error.
 */
router.get("/", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Page number
    const page = parseInt(req.query.page) || 1;

    // Number of audit logs per page
    const limit = parseInt(req.query.limit) || 10;

    // Search query, search by ip address, user, or action
    const search = req.query.search || "";

    // Search by
    const searchBy = req.query.searchBy || "action";

    // Sort by
    const sort = req.query.sort || "-createdAt";

    // Build criteria
    const criteria = {};
    criteria[searchBy] = { $regex: search, $options: "i" };

    // Get audit logs
    const auditLogs = await AuditLog.find(criteria)
      .sort(sort)
      .limit(limit)
      .skip(limit * page - limit)
      .populate("user", "handle profilePicture _id")
      .select("-__v");

    // Get total audit logs
    const totalAuditLogs = await AuditLog.countDocuments(criteria);

    // Return the audit logs
    res.json({
      status: "success",
      code: 200,
      message: "Audit logs found",
      data: {
        auditLogs: auditLogs,
        page: page,
        maxPages: Math.ceil(totalAuditLogs / limit),
        totalAuditLogs: totalAuditLogs,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Return router
module.exports = router;
