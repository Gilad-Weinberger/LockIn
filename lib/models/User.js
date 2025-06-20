"use server";

import mongoose from "mongoose";

const GoogleCalendarSchema = new mongoose.Schema(
  {
    connected: { type: Boolean, default: false },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    expiryDate: { type: Number, default: null },
    calendarId: { type: String, default: null },
    calendarName: { type: String, default: null },
    autoSync: { type: Boolean, default: false },
    connectedAt: { type: Date, default: null },
    disconnectedAt: { type: Date, default: null },
  },
  { _id: false }
);

const SchedulingRulesSchema = new mongoose.Schema(
  {
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    workingDays: {
      type: [String],
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    bufferTime: { type: Number, default: 15 },
    maxTasksPerDay: { type: Number, default: 8 },
    breakDuration: { type: Number, default: 60 },
    preferredTaskLength: { type: Number, default: 60 },
  },
  { _id: false }
);

const PrioritizingRulesSchema = new mongoose.Schema(
  {
    urgencyWeight: { type: Number, default: 0.4 },
    importanceWeight: { type: Number, default: 0.6 },
    considerDeadlines: { type: Boolean, default: true },
    deadlineThreshold: { type: Number, default: 3 },
    considerEffort: { type: Boolean, default: true },
    highEffortPenalty: { type: Number, default: 0.2 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Firebase Auth UID
    email: { type: String, required: true, unique: true },
    displayName: { type: String, default: "" },
    photoURL: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    categories: { type: [String], default: [] },
    customerId: { type: String, default: null },
    variantId: { type: String, default: null },
    hasAccess: { type: Boolean, default: false },
    pricingShown: { type: Boolean, default: false },
    googleCalendar: { type: GoogleCalendarSchema, default: () => ({}) },
    schedulingRules: { type: SchedulingRulesSchema, default: () => ({}) },
    prioritizingRules: { type: PrioritizingRulesSchema, default: () => ({}) },
    aiPrioritizationTokensUsed: { type: Number, default: 0 },
    aiSchedulingTokensUsed: { type: Number, default: 0 },
    lastTokenReset: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    _id: false, // Disable automatic _id generation since we're using Firebase UID
    timestamps: false, // We handle timestamps manually
  }
);

// Update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
