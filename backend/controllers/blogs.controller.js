import Blog from "../models/blog.model.js";

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({})
        .populate("author","name")
            .sort({ createdAt: -1 });

        res.json({ blogs });

    } catch (error) {
        console.log("Error in getAllBlogs controller", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        .populate("author","name")

        if (!blog) {
            return res.status(404).json({ message: "Cannot find the blog" });
        }

        res.json({ blog });

    } catch (error) {
        console.log("Error in getSingleBlog", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, content, category } = req.body;

const blog = await Blog.create({
    title,
    content,
    category,      
    author: req.user._id 
});

        res.status(201).json({ blog });

    } catch (error) {
        console.log("Error creating blog", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

  
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await blog.deleteOne();

        res.status(200).json({ message: "Blog deleted successfully!" });

    } catch (error) {
        console.log("Error in deleteBlog", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

      
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;

        const updatedBlog = await blog.save();

        res.status(200).json({ updatedBlog });

    } catch (error) {
        console.log("Error updating the Blog", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


export  const getMyBlogs=async(req,res)=>{
    try{
 const blogs=await Blog.find({author:req.user._id})
   .sort({createdAt:-1});
   res.json({blogs});
    }catch(error){
        console.log("Error in getMyBlogs controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});

    }
}