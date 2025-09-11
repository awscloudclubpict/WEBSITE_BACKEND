import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const certificateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    organizer: {
      type: String,
      default: "AWS Cloud Club",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    pdfPath: {
      type: String, 
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true, 
    },
  },
  {
    timestamps: true,
  }
);


certificateSchema.plugin(mongooseAggregatePaginate);

export const Certificate = mongoose.model("Certificate", certificateSchema);
