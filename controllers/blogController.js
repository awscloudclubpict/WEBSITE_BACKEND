const Blog = require('../models/blog.model.js');
const blogValidationSchema = require('../validation/blogValidationSchema.js');
const { uploadToS3, deleteFromS3} = require('../utils/s3.js');

const addBlog = async (req, res) => {
  try {
    const { title, author_name, short_description, tags, author_profile_url, share_url } = req.body;

    let imageUrl = "";
    if (req.file) {
      try {
        imageUrl = await uploadToS3(
          req.file.buffer,            // file buffer from memoryStorage
          req.file.originalname,      // original filename
          req.file.mimetype,          // mime type
          "blogs"                     // folder in S3 bucket
        );
      } catch (uploadError) {
        console.error("S3 upload failed:", uploadError);
        return res.status(500).json({ error: "Image upload failed", details: uploadError.message });
      }
    }

    // Validate data
    const validationResult = blogValidationSchema.safeParse({
      title,
      author_name,
      short_description,
      tags: JSON.parse(tags),
      author_profile_url,
      share_url,
      thumbnail_image_url: imageUrl
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    // Generate new blog_id
    const lastBlog = await Blog.findOne().sort({ blog_id: -1 }).exec();
    let newIdNumber = 1;
    if (lastBlog && lastBlog.blog_id) {
      const match = lastBlog.blog_id.match(/\d+$/);
      if (match) newIdNumber = parseInt(match[0], 10) + 1;
    }
    const newBlogId = `blog_${String(newIdNumber).padStart(3, "0")}`;

    const newBlog = new Blog({
      ...validationResult.data,
      blog_id: newBlogId,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully", blog: newBlog });

  } catch (error) {
    console.error("Error adding blog:", error.message);
    res.status(500).json({ error: "Failed to create blog", details: error.message });
  }
};




// const addBlog = async (req, res) => {
//   try {
//     const { title, author_name, short_description, tags, author_profile_url, share_url } = req.body;

//     // Build image URL
//     const imageUrl = req.file
//       ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
//       : "";

//     // Validate data
//     const validationResult = blogValidationSchema.safeParse({
//       title,
//       author_name,
//       short_description,
//        tags: JSON.parse(tags),
//       author_profile_url,
//       share_url,
//       thumbnail_image_url: imageUrl
//     });

//     if (!validationResult.success) {
//       return res.status(400).json({
//         error: "Validation failed",
//         details: validationResult.error.errors,
//       });
//     }

//     // Generate new blog_id
//     const lastBlog = await Blog.findOne().sort({ blog_id: -1 }).exec();
//     let newIdNumber = 1;
//     if (lastBlog && lastBlog.blog_id) {
//       const match = lastBlog.blog_id.match(/\d+$/);
//       if (match) newIdNumber = parseInt(match[0], 10) + 1;
//     }
//     const newBlogId = `blog_${String(newIdNumber).padStart(3, "0")}`;

//     const newBlog = new Blog({
//       ...validationResult.data,
//       blog_id: newBlogId,
//     });

//     await newBlog.save();
//     res.status(201).json({ message: "Blog created successfully", blog: newBlog });

//   } catch (error) {
//     console.error("Error adding blog:", error.message);
//     res.status(500).json({ error: "Failed to create blog", details: error.message });
//   }
// };




// Fetch all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ publish_date: -1 }) // newest first
        res.status(200).json(blogs)
    } catch (error) {
        console.error("Error fetching blogs:", error.message)
        res.status(500).json({ error: "Failed to fetch blogs", details: error.message })
    }
}

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params
        const blog = await Blog.findOne({ blog_id: id })

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" })
        }

        res.status(200).json(blog)
    } catch (error) {
        console.error("Error fetching blog:", error.message)
        res.status(500).json({ error: "Failed to fetch blog", details: error.message })
    }
}

const getBlogByTag = async (req, res) => {
    try {
        const { tag } = req.params

        // Find all blogs where tags array contains the given tag
        const blogs = await Blog.find({ tags: tag })

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ error: "No blogs found with this tag" })
        }

        res.status(200).json(blogs)
    } catch (error) {
        console.error("Error fetching blogs by tag:", error.message)
        res.status(500).json({ 
            error: "Failed to fetch blogs by tag", 
            details: error.message 
        })
    }
}

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the blog
    const blog = await Blog.findOne({ blog_id: id });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete thumbnail image from S3 if exists
    if (blog.thumbnail_image_url) {
      try {
        await deleteFromS3(blog.thumbnail_image_url);
      } catch (s3Error) {
        console.warn("Warning: Failed to delete image from S3:", s3Error.message);
      }
    }

    // Delete the blog document
    await Blog.deleteOne({ blog_id: id });

    res.status(200).json({ message: "Blog deleted successfully", blog });
  } catch (error) {
    console.error("Error deleting blog:", error.message);
    res.status(500).json({ error: "Failed to delete blog", details: error.message });
  }
};


// const deleteBlog = async (req, res) => {
//     try {
//         const { id } = req.params
//         const deletedBlog = await Blog.findOneAndDelete({ blog_id: id })

//         if (!deletedBlog) {
//             return res.status(404).json({ error: "Blog not found" })
//         }

//         res.status(200).json({ message: "Blog deleted successfully", blog: deletedBlog })
//     } catch (error) {
//         console.error("Error deleting blog:", error.message)
//         res.status(500).json({ error: "Failed to delete blog", details: error.message })
//     }
// }

module.exports = { addBlog, getAllBlogs, getBlogById, getBlogByTag, deleteBlog }






// const Blog = require('../models/blog.model.js')
// const blogValidationSchema = require('../validation/blogValidationSchema.js'); 


// // const addBlog = async (req, res) => {
    
// //         // const { blog_id, title, author_name, author_profile_url, thumbnail_image_url, short_description, tags, publish_date, share_url } = req.body
// //     const validationResult = blogValidationSchema.safeParse(req.body);

// //     if (!validationResult.success) {
// //         return res.status(400).json({
// //             error: "Validation failed",
// //             details: validationResult.error.errors,
// //         });
// //     }


// //     try {
// //         // const newBlog = new Blog({
// //         //     blog_id,
// //         //     title,
// //         //     author_name,
// //         //     author_profile_url,
// //         //     thumbnail_image_url,
// //         //     short_description,
// //         //     tags,
// //         //     publish_date,
// //         //     share_url
// //         // })

// //         // await newBlog.save()
// //         // res.status(201).json({ message: "Blog created successfully", blog: newBlog })
        
// //         const newBlog = new Blog(validationResult.data);
// //         await newBlog.save();
// //         res.status(201).json({ message: "Blog created successfully", blog: newBlog });
    
// //     } catch (error) {
// //         console.error("Error adding blog:", error.message)
// //         res.status(500).json({ error: "Failed to create blog", details: error.message })
// //     }
// // }



// // const addBlog = async (req, res) => {
// //     const validationResult = blogValidationSchema.safeParse(req.body);

// //     if (!validationResult.success) {
// //         return res.status(400).json({
// //             error: "Validation failed",
// //             details: validationResult.error.errors,
// //         });
// //     }

// //     try {
// //         const existingBlog = await Blog.findOne({ blog_id: validationResult.data.blog_id });
// //         if (existingBlog) {
// //             return res.status(400).json({ error: "Blog with this blog_id already exists" });
// //         }

// //         const newBlog = new Blog(validationResult.data);
// //         await newBlog.save();
// //         res.status(201).json({ message: "Blog created successfully", blog: newBlog });

// //     } catch (error) {
// //         console.error("Error adding blog:", error.message)
// //         res.status(500).json({ error: "Failed to create blog", details: error.message })
// //     }
// // }

// const addBlog = async (req, res) => {
//   const validationResult = blogValidationSchema.safeParse(req.body);

//   if (!validationResult.success) {
//     return res.status(400).json({
//       error: "Validation failed",
//       details: validationResult.error.errors,
//     });
//   }

//   try {
//     // Find the latest blog_id
//     const lastBlog = await Blog.findOne().sort({ blog_id: -1 }).exec();

//     let newIdNumber = 1;
//     if (lastBlog && lastBlog.blog_id) {
//       // Extract numeric part from blog_id
//       const match = lastBlog.blog_id.match(/\d+$/);
//       if (match) {
//         newIdNumber = parseInt(match[0], 10) + 1;
//       }
//     }

//     const newBlogId = `blog_${String(newIdNumber).padStart(3, "0")}`;

//     // Create new blog with generated blog_id
//     const newBlog = new Blog({
//       ...validationResult.data,
//       blog_id: newBlogId,
//     });

//     await newBlog.save();
//     res.status(201).json({ message: "Blog created successfully", blog: newBlog });

//   } catch (error) {
//     console.error("Error adding blog:", error.message);
//     res.status(500).json({ error: "Failed to create blog", details: error.message });
//   }
// };



// // Fetch all blogs
// const getAllBlogs = async (req, res) => {
//     try {
//         const blogs = await Blog.find().sort({ publish_date: -1 }) // newest first
//         res.status(200).json(blogs)
//     } catch (error) {
//         console.error("Error fetching blogs:", error.message)
//         res.status(500).json({ error: "Failed to fetch blogs", details: error.message })
//     }
// }

// const getBlogById = async (req, res) => {
//     try {
//         const { id } = req.params
//         const blog = await Blog.findOne({ blog_id: id })

//         if (!blog) {
//             return res.status(404).json({ error: "Blog not found" })
//         }

//         res.status(200).json(blog)
//     } catch (error) {
//         console.error("Error fetching blog:", error.message)
//         res.status(500).json({ error: "Failed to fetch blog", details: error.message })
//     }
// }

// const getBlogByTag = async (req, res) => {
//     try {
//         const { tag } = req.params

//         // Find all blogs where tags array contains the given tag
//         const blogs = await Blog.find({ tags: tag })

//         if (!blogs || blogs.length === 0) {
//             return res.status(404).json({ error: "No blogs found with this tag" })
//         }

//         res.status(200).json(blogs)
//     } catch (error) {
//         console.error("Error fetching blogs by tag:", error.message)
//         res.status(500).json({ 
//             error: "Failed to fetch blogs by tag", 
//             details: error.message 
//         })
//     }
// }



// const deleteBlog = async (req, res) => {
//     try {
//         const { id } = req.params
//         const deletedBlog = await Blog.findOneAndDelete({ blog_id: id })

//         if (!deletedBlog) {
//             return res.status(404).json({ error: "Blog not found" })
//         }

//         res.status(200).json({ message: "Blog deleted successfully", blog: deletedBlog })
//     } catch (error) {
//         console.error("Error deleting blog:", error.message)
//         res.status(500).json({ error: "Failed to delete blog", details: error.message })
//     }
// }

// module.exports = { addBlog, getAllBlogs, getBlogById, getBlogByTag, deleteBlog }



