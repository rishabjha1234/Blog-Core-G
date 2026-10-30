const Blog = require("../models/Blog");

// CREATE BLOG
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const blog = await Blog.create({
      title,
      content,
      author: req.userId,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create blog",
    });
  }
};

// GET ALL BLOGS
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch blogs",
    });
  }
};

// GET SINGLE BLOG
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({ blog });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid blog ID",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch blog",
    });
  }
};

// UPDATE BLOG
const updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        message: "Title must be a non-empty string",
      });
    }

    if (
      content !== undefined &&
      (typeof content !== "string" || !content.trim())
    ) {
      return res.status(400).json({
        message: "Content must be a non-empty string",
      });
    }

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        message: "Provide a title or content to update",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can update only your own blogs",
      });
    }

    if (title !== undefined) blog.title = title.trim();
    if (content !== undefined) blog.content = content.trim();

    await blog.save();

    return res.status(200).json({
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid blog ID",
      });
    }

    return res.status(500).json({
      message: "Failed to update blog",
    });
  }
};

// DELETE BLOG
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can delete only your own blogs",
      });
    }

    await blog.deleteOne();

    return res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid blog ID",
      });
    }

    return res.status(500).json({
      message: "Failed to delete blog",
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};