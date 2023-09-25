const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // The user who reported the content
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The user who created the content
    reported: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The content that was reported
    reportedContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    // The type of content that was reported
    reportedContentType: {
      type: String,
      enum: ["Post", "Comment", "Message", "User"], // User is for when a user is reported like in the case of a fake account or inappropriate profile picture
      required: true, 
    },
    // A snapshot of the content at the time of the report
    snapshot: {
      type: JSON,
      required: true,
    },
    // The reason for the report, can be in markdown
    description: {
      type: String,
      required: true,
    },
    // The note that the moderator left on the report
    moderatorNote: {
      type: String,
    },
    // The status of the report
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
