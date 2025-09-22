import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    event_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    venue: { type: String, required: true },
    mode: { type: String, enum: ["Offline", "Online", "Hybrid"], required: true },
    status: { type: String, enum: ["Upcoming", "Ongoing", "Past"], required: true },
    category: { type: String, required: true },
    registration_link: { type: String },
    banner_image_url: { type: String },  // ✅ Perfect for S3 image URL
    createdBy: { type: String, required: true } // email of creator
});
export default mongoose.model("Event", eventSchema);
