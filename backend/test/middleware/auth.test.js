const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
chai.use(chaiHttp);
const { expect } = chai;
const assert = chai.assert;

const { authenticateJWT, isAdmin } = require("../../middleware/auth");
const User = require("../../models/User");

describe("Authentication Middleware", function () {
  describe("authenticateJWT", function () {
    afterEach(() => {
      sinon.restore();
    });

    it("should return error if token is missing", async function () {
      const req = {
        headers: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await authenticateJWT(req, res, () => {});

      assert(res.status.calledWith(401));
      assert(
        res.json.calledWithMatch({
          status: "error",
          code: 401,
          message: "Authentication token is missing.",
        })
      );
    });

    // Invalid token
    it("should return 401 for invalid token", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidToken",
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const next = sinon.spy();

      await authenticateJWT(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "Authentication token is invalid.",
        })
      ).to.be.true;
      expect(next.called).to.be.false;
    });

    // Valid token but user does not exist
    it("should return 404 when token is valid but user does not exist", async () => {
      const token = jwt.sign(
        { sub: "nonexistentUserId" },
        process.env.JWT_SECRET
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const next = sinon.spy();

      sinon.stub(User, "findById").resolves(null);

      await authenticateJWT(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "The user associated with this token no longer exists.",
        })
      ).to.be.true;
      expect(next.called).to.be.false;
    });

    // Token expired error
    it("should return 401 when token has expired", async () => {
      const expiredToken = jwt.sign(
        { sub: "someUserId", exp: Math.floor(Date.now() / 1000) - 10 },
        process.env.JWT_SECRET
      );
      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };
      const next = sinon.spy();

      await authenticateJWT(req, res, next);

      expect(res.status.calledWith(401)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "Authentication token has expired.",
        })
      ).to.be.true;
      expect(next.called).to.be.false;
    });
  });

  // ... Other tests for isAdmin
  describe("isAdmin", function () {
    it("should return error if user is not an admin", async function () {
      const req = {
        user: {
          admin: false,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      await isAdmin(req, res, () => {});

      assert(res.status.calledWith(403));
      assert(
        res.json.calledWithMatch({
          status: "error",
          code: 403,
          message: "You do not have permission to access this resource.",
        })
      );
    });

    it("should call next if user is an admin", async function () {
      const req = {
        user: {
          admin: true,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      const next = sinon.spy();

      await isAdmin(req, res, next);

      assert(next.called);
    });
    // ... Additional tests for when user is an admin, etc.
  });
});
