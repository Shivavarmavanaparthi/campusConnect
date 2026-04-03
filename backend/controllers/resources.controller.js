import Resource from "../models/resource.model.js";
import cloudinary from "../lib/cloudinary.js";

export const uploadResource = async (req, res) => {
    try {
        const { title, description, category, fileUrl, driveLink } = req.body;

        if (req.file) {
            const uploadOptions = {
                resource_type: "raw",
                folder: "campusconnect/library",
                public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`,
            };

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, res) => {
                        if (error) reject(error);
                        else resolve(res);
                    }
                );
                stream.end(req.file.buffer);
            });

            const newResource = await Resource.create({
                title,
                description,
                category,
                fileUrl: result.secure_url,
                publicId: result.public_id,
                author: req.user._id,
            });

            return res
                .status(201)
                .json({ message: "Resource added to library", resource: newResource });
        }

        // Link-based uploads (for now): accept a shareable Drive URL as `fileUrl` (or `driveLink`)
        const resolvedUrl = (fileUrl || driveLink || "").trim();
        if (!resolvedUrl) {
            return res.status(400).json({
                message:
                    "No file provided. Send either multipart `file` or a shareable drive link via `fileUrl`.",
            });
        }

        const newResource = await Resource.create({
            title,
            description,
            category,
            fileUrl: resolvedUrl,
            publicId: null,
            author: req.user._id,
        });

        res.status(201).json({
            message: "Resource link added to library",
            resource: newResource,
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

export const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().populate("author", "name").sort({ createdAt: -1 });
        res.json({ resources });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Not found" });
        if (resource.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

        // For link-only resources `publicId` will be null.
        if (resource.publicId) {
            await cloudinary.uploader.destroy(resource.publicId, {
                resource_type: "raw",
            });
        }
        await resource.deleteOne();
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};


export const getMyResources = async (req, res) => {
    try {
        // req.user._id comes from your protectRoute middleware
        const resources = await Resource.find({
            author: req.user._id
        }).sort({ createdAt: -1 });

        res.json({ success: true, resources });
    } catch (error) {
        console.log("Error in getMyResources:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};