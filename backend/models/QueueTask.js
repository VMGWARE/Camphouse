const mongoose = require("mongoose");

/**
 * Queue Task Schema
 * This schema will represent a task that needs to be performed, such as sending an email,
 * cleaning logs, or any other asynchronous job.
 */
const QueueTaskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["email", "log-cleanup", "data-processing", "general"],
      // Define other task types as needed
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    priority: {
      type: Number,
      default: 0,
      // Lower numbers denote higher priority
    },
    payload: {
      // Store task-specific data, like email content or log file identifiers
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      // How many times the task has been attempted
    },
    maxAttempts: {
      type: Number,
      default: 5,
      // Maximum number of attempts before marking it as failed
    },
    lastAttempt: {
      type: Date,
      // When the last attempt to perform the task was made
    },
    errorMessage: {
      type: String,
      default: "",
      // Store the error message if the task fails
    },
  },
  { timestamps: true }
);

// Indexes to improve query performance based on how you'll query tasks most often
QueueTaskSchema.index({ status: 1, priority: -1, createdAt: 1 });

module.exports = mongoose.model("QueueTask", QueueTaskSchema);
