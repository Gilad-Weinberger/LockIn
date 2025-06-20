import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: String, required: true, ref: "User" }, // Firebase Auth UID
  votes: { type: [String], default: [] }, // Array of user IDs who voted
  handled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes for better query performance
FeedbackSchema.index({ handled: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ userId: 1 });

// Update the updatedAt field before saving
FeedbackSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

FeedbackSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
