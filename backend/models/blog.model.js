import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    category:{
      type:String,
      required:true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
},
views: {
   type: Number, 
   default: 0
   },
   viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;