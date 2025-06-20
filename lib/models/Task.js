import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  taskDate: { type: String, required: true }, // ISO date string
  category: { type: String, default: "" },
  type: { type: String, required: true, enum: ["deadline", "event"] },
  isDone: { type: Boolean, default: false },
  priority: { type: String, default: null }, // 'urgent-important', 'not-urgent-important', etc.
  inGroupRank: { type: Number, default: null },
  startDate: { type: String, default: null }, // ISO date string
  endDate: { type: String, default: null }, // ISO date string
  aiScheduleLocked: { type: Boolean, default: false },
  googleCalendarSynced: { type: Boolean, default: false },
  googleCalendarEventId: { type: String, default: null },
  syncedToGoogleCalendar: { type: Boolean, default: false },
  lastSyncedAt: { type: Date, default: null },
  userId: { type: String, required: true, ref: "User" }, // Firebase Auth UID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes for better query performance
TaskSchema.index({ userId: 1 });
TaskSchema.index({ userId: 1, isDone: 1 });
TaskSchema.index({ userId: 1, category: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, taskDate: 1 });

// Update the updatedAt field before saving
TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

TaskSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
