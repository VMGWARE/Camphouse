const mongoose = require("mongoose");

const RequestLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: Object,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RequestLog = mongoose.model("RequestLog", RequestLogSchema);

module.exports = RequestLog;
