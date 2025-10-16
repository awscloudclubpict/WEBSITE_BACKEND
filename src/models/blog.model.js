import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    blog_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author_name: { type: String, required: true },
    author_profile_url: { type: String },
    thumbnail_image_url: { type: String },
    short_description: { type: String },
    tags: { type: [String] },  // array of tags/categories for identification
    publish_date: { type: Date, default: Date.now },
    share_url: { type: String }
});

const Blog = mongoose.model("blogs", blogSchema);

export default Blog;
