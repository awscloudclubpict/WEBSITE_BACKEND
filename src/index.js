// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import authRoutes from "./routes/authRoutes.js";
// import teamMemberRoutes from "./routes/teamMemberRoutes.js";
// import { authMiddleware } from "./middleware/authMiddleware.js";

// const app = express();
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(cookieParser());
// app.use(express.json());

// const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.0ort1bw.mongodb.net/awscc_blogs?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log("Connected to MongoDB");
// }).catch((err) => {
//     console.error("MongoDB connection error:", err);
// });


// app.use("/iamatharva", (req, res) => {
//     res.send("API is running...");
// });
// app.use("/auth", authRoutes);
// import eventRoutes from "./routes/eventRoutes.js";

// app.use("/events", eventRoutes);

// app.use("/team-members", teamMemberRoutes);

// app.get("/profile", authMiddleware, (req, res) => {
//     res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });


// src/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import teamMemberRoutes from "./routes/teamMemberRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { addBlog, getAllBlogs, getBlogById, deleteBlog, upload as blogUpload } from "./controllers/blogController.js";
import { sendMail } from "./controllers/emailController.js";
import blogRoutes from "./routes/blogRoutes.js";
const app = express();
//app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cors({
  origin: ["null", "*"]
}));
app.use(cookieParser());
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.0ort1bw.mongodb.net/awscc_blogs?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't throw error in serverless environment
  }
};

app.use("/iamatharva", (req, res) => {
  res.json({ message: "API is running!", status: "success" });
});

// Simple test endpoint without database
app.use("/test", (req, res) => {
  res.json({ message: "Test endpoint working!", timestamp: new Date().toISOString() });
});
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/team-members", teamMemberRoutes);

app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
});

// Blog routess

app.post("/addBlog", authMiddleware, blogUpload.fields([{ name: 'thumbnail_image', maxCount: 1 }, { name: 'author_profile_image', maxCount: 1 }]), addBlog);
app.get("/blogs", getAllBlogs);
app.get("/blogs/:id", getBlogById);
app.delete("/blogs/:id", deleteBlog);

// Email route
app.post("/sendEmail", sendMail);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
