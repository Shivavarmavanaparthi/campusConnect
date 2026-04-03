import mongoose from "mongoose";

// models/resource.model.js
const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    publicId: { type: String },           
    fileType: { type: String },          
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String },
}, { timestamps: true });

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;
