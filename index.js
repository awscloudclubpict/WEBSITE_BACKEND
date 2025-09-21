const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const { addBlog, getAllBlogs, getBlogById, getBlogByTag, deleteBlog } = require('./controllers/blogController.js');
const { sendMail } = require('./controllers/emailController.js');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // files will go inside "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 1695300000000.jpg
  }
});
const upload = multer({ storage });

mongoose.connect("mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.0ort1bw.mongodb.net/awscc_blogs?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

app.post("/addBlog", upload.single("thumbnail_image"), addBlog);
app.get("/blogs", getAllBlogs);
app.get("/blogs/:id", getBlogById);
app.get('/blogs/tag/:tag', getBlogByTag);
app.delete("/blogs/:id", deleteBlog);
app.post("/sendEmail", sendMail);

app.listen(3001, () => {
  console.log("Server is Running on http://localhost:3001");
});
