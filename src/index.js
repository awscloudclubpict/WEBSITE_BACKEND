import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import teamMemberRoutes from "./routes/teamMemberRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { addBlog, getAllBlogs, getBlogById, deleteBlog } from "./controllers/controllers/blogController.js";
import { sendMail } from "./controllers/controllers/emailController.js";

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://redeem_user:Redeem123@cluster0.psm60jr.mongodb.net/redeemr?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.use("/auth", authRoutes);
import eventRoutes from "./routes/eventRoutes.js";

app.use("/events", eventRoutes);

app.use("/team-members", teamMemberRoutes);

app.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.user.email}, Role: ${req.user.role}` });
});

// Blog routes
app.post("/addBlog", addBlog);
app.get("/blogs", getAllBlogs);
app.get("/blogs/:id", getBlogById);
app.delete("/blogs/:id", deleteBlog);

// Email route
app.post("/sendEmail", sendMail);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
