/**
 * @swagger
 * tags:
 *   name: 2FA
 *   description: 2FA management API endpoints
 */

const express = require("express");
const User = require("../models/User");
const router = express.Router();
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Load environment variables
require("dotenv").config();

// Middleware
const { authenticateJWT } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/2fa/setup:
 *   post:
 *     tags:
 *       - 2FA
 *     summary: Setup 2FA
 *     description: Setup 2FA for the logged in user
 *     produces:
 *       - application/json
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated QR code
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
 *                   example: Successfully generated QR code
 *                 data:
 *                   type: object
 *                   properties:
 *                     qr_code:
 *                       type: string
 *                       example: data:image/png;base64,iVBORw0KGg
 *       400:
 *         description: 2FA is already enabled for this user
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
 *                   example: 2FA is already enabled for this user
 *                 data:
 *                   type: null
 *       500:
 *         description: Error setting up 2FA
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
 *                   example: Error setting up 2FA
 *                 data:
 *                   type: null
 */
router.post("/setup", authenticateJWT, async (req, res) => {
  try {
    // Check if the user already has 2FA enabled
    const user = await User.findById(req.user._id).select("+twoFactorAuth");
    if (user.twoFactorAuth.enabled) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "2FA is already enabled for this user",
        data: null,
      });
    }

    // Generate a new secret
    const temp_secret = speakeasy.generateSecret({
      name: "Camphouse",
    });

    // generate a QR Code
    const qrcode = await QRCode.toDataURL(temp_secret.otpauth_url);

    // Update the user's secret
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorAuth: {
        enabled: false,
        temp_secret: temp_secret.base32,
        temp_qr_code: qrcode,
        temp_created: Date.now(),
      },
    });

    // Return the QR code
    res.json({
      status: "success",
      code: 200,
      message: "Successfully generated QR code",
      data: {
        qr_code: qrcode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Error setting up 2FA",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/2fa/enable:
 *   post:
 *     tags:
 *       - 2FA
 *     summary: Enable 2FA
 *     description: Enable 2FA for the logged in user
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
 *               token:
 *                 type: string
 *                 description: 2FA token from the authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
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
 *                   example: 2FA enabled successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: 2FA is already enabled for this user
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
 *                   example: 2FA is already enabled for this user
 *                 data:
 *                   type: null
 *       500:
 *         description: Error enabling 2FA
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
 *                   example: Error enabling 2FA
 *                 data:
 *                   type: null
 */
router.post("/enable", authenticateJWT, async (req, res) => {
  try {
    // Check if the user already has 2FA enabled
    const user = await User.findById(req.user._id).select("+twoFactorAuth");
    if (user.twoFactorAuth.enabled) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "2FA is already enabled for this user",
        data: null,
      });
    }

    // Check if the user provided the correct code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.temp_secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid token",
        data: null,
      });
    }

    // Update the user's 2FA settings
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorAuth: {
        enabled: true,
        secret: user.twoFactorAuth.temp_secret,
        temp_secret: null,
        temp_qr_code: null,
        temp_created: null,
      },
    });

    // Return the updated user
    res.json({
      status: "success",
      code: 200,
      message: "2FA enabled successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Error enabling 2FA",
      data: null,
    });
  }
});

/**
 * @swagger
 * /api/v1/2fa/disable:
 *   delete:
 *     tags:
 *       - 2FA
 *     summary: Disable 2FA
 *     description: Disable 2FA for the logged in user
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
 *               token:
 *                 type: string
 *                 description: 2FA token from the authenticator app
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
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
 *                   example: 2FA disabled successfully
 *                 data:
 *                   type: null
 *       400:
 *         description: 2FA is not enabled for this user
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
 *                   example: 2FA is not enabled for this user
 *                 data:
 *                   type: null
 *       500:
 *         description: Error disabling 2FA
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
 *                   example: Error disabling 2FA
 *                 data:
 *                   type: null
 */
router.delete("/disable", authenticateJWT, async (req, res) => {
  try {
    // Check if the user already has 2FA enabled
    const user = await User.findById(req.user._id).select("+twoFactorAuth");
    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "2FA is not enabled for this user",
        data: null,
      });
    }

    // Check if the user provided the correct code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Invalid token",
        data: null,
      });
    }

    // Update the user's 2FA settings
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorAuth: {
        enabled: false,
        secret: null,
        temp_secret: null,
        temp_qr_code: null,
        temp_created: null,
      },
    });

    // Return the updated user
    res.json({
      status: "success",
      code: 200,
      message: "2FA disabled successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Error disabling 2FA",
      data: null,
    });
  }
});

// TODO: Route lets the signed user know if 2FA is enabled or not

module.exports = router;
