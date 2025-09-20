import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    team: { type: String, required: true },
    githubLink: { type: String },
    linkedinLink: { type: String },
    profileImage: { type: String },
    createdBy: { type: String, required: true } // email of creator
});

export default mongoose.model("TeamMember", teamMemberSchema);
