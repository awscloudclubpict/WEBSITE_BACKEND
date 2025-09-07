// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     email: { type: String, required: true, unique: true }
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    collegeName: String,
    branch: String,
    yearOfStudy: Number,
    companyName: String,
    role: { type: String, enum: ["student", "professional"], required: true }
});

export default mongoose.model("UserSchema", userSchema);
