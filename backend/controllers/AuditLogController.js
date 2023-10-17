/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Audit log management and retrieval
 */

// Require the necessary packages
const express = require("express");
const router = express.Router();
const Papa = require("papaparse");

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

/**
 * @swagger
 * /api/v1/audit-logs/chart:
 *   get:
 *     summary: Get Audit Logs for Chart
 *     description: |
 *       This endpoint aggregates the number of audit logs per day over the last 30 days.
 *       Suitable for plotting a bar chart or line graph.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Audit Logs
 *     responses:
 *       200:
 *         description: Data successfully retrieved for charting.
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2023-10-15"
 *                       count:
 *                         type: integer
 *                         example: 40
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
router.get("/chart", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate logs
    const logsAggregation = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const chartData = logsAggregation.map((log) => {
      return {
        date: log._id,
        count: log.count,
      };
    });

    res.json({
      status: "success",
      code: 200,
      data: chartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/audit-logs/chart-by-action:
 *   get:
 *     summary: Get Audit Logs aggregated by Action for Chart
 *     description: |
 *       This endpoint aggregates the number of audit logs by action type per day over the last 30 days.
 *       Suitable for plotting a stacked bar chart or similar visualization.
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Audit Logs
 *     responses:
 *       200:
 *         description: Data successfully retrieved for charting by action.
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2023-10-15"
 *                       actions:
 *                         type: object
 *                         additionalProperties:
 *                           type: integer
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
router.get("/chart-by-action", authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate logs by action type
    const logsAggregation = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            action: "$action",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          actions: {
            $push: {
              action: "$_id.action",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const chartData = logsAggregation.map((log) => {
      let actionsCount = {};
      log.actions.forEach((action) => {
        actionsCount[action.action] = action.count;
      });

      return {
        date: log._id,
        actions: actionsCount,
      };
    });

    res.json({
      status: "success",
      code: 200,
      data: chartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/audit-logs/export:
 *   get:
 *     summary: Export Audit Logs
 *     description: This endpoint exports the audit logs to the specified format (CSV or JSON).
 *     produces:
 *       - application/octet-stream
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - name: format
 *         in: query
 *         description: The format to export to.
 *         required: true
 *         enum: ["csv", "json"]
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs successfully exported.
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
router.get("/export", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const format = req.query.format;

    const auditLogs = await AuditLog.find().lean();

    if (format === "csv") {
      const csv = Papa.unparse(auditLogs);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit_logs.csv"
      );
      res.send(csv);
    } else if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit_logs.json"
      );
      res.send(JSON.stringify(auditLogs, null, 4));
    } else {
      res
        .status(400)
        .send("Invalid format specified. Supported formats: csv, json");
    }
  } catch (err) {
    res.status(500).json({ status: "error", code: 500, message: err.message });
  }
});

// Return router
module.exports = router;
