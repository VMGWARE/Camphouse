/**
 * @swagger
 * tags:
 *   name: Misc
 *   description: Miscellaneous routes for the application
 */

const express = require("express");
const { getVersion } = require("../utils/general");
const router = express.Router();

/**
 * @swagger
 * /api/v1/misc/health:
 *   get:
 *     summary: Returns the health of the server
 *     tags: [Misc]
 *     responses:
 *       200:
 *         description: The server is healthy
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
 *                   example: The server is healthy.
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: integer
 *                       example: 1000
 *                     timestamp:
 *                       type: integer
 *                       example: 1000000000000
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 */
router.get("/health", async (req, res) => {
  const data = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    version: getVersion(),
  };

  return res.status(200).json({
    status: "success",
    code: 200,
    message: "The server is healthy.",
    data: data,
  });
});

module.exports = router;
