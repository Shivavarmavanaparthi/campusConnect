import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  fileType: { type: String },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: { type: String },
}, { timestamps: true });

// Add these indexes
resourceSchema.index({ author: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ createdAt: -1 });

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;