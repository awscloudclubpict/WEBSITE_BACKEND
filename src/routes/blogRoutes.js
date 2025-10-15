// import express from "express";
// import BlogController, { upload } from "../controllers/blogController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Create a new blog (with optional image upload)
// router.post("/create", authMiddleware, upload.single("thumbnail_image_url"), (req, res) =>
//   BlogController.createBlog(req, res)
// );

// // Get all blogs
// router.get("/", authMiddleware, (req, res) =>
//   BlogController.getAllBlogs(req, res)
// );

// // Get a single blog by blog_id
// router.get("/:id", authMiddleware, (req, res) =>
//   BlogController.getBlogById(req, res)
// );

// // Get blogs by tag
// router.get("/tag/:tag", authMiddleware, (req, res) =>
//   BlogController.getBlogsByTag(req, res)
// );

// // Delete a blog
// router.delete("/:id", authMiddleware, (req, res) =>
//   BlogController.deleteBlog(req, res)
// );


// export default router;



// // import express from "express";
// // // import {
// // //   createBlog,
// // //   getAllBlogs,
// // //   getBlogById,
// // //   deleteBlog
// // // } from "../controllers/blogController.js";
// // import BlogController from "../controllers/blogController.js";

// // const router = express.Router();

// // router.post("/addBlog",BlogController.createBlog);

// // router.get("/", getAllBlogs);

// // router.get("/:id", getBlogById);

// // router.delete("/:id", deleteBlog);

// // export default router;






// Open routes no authentication:

import express from "express";
import BlogController, { upload } from "../controllers/blogController.js";

const router = express.Router();

// Create a new blog (no auth for testing)
router.post("/create", upload.single("thumbnail_image_url"), (req, res) =>
  BlogController.createBlog(req, res)
);

// Get all blogs (no auth)
router.get("/", (req, res) =>
  BlogController.getAllBlogs(req, res)
);

// Get a single blog by blog_id
router.get("/:id", (req, res) =>
  BlogController.getBlogById(req, res)
);

// Get blogs by tag
router.get("/tag/:tag", (req, res) =>
  BlogController.getBlogsByTag(req, res)
);

// Delete a blog
router.delete("/:id", (req, res) =>
  BlogController.deleteBlog(req, res)
);

export default router;
