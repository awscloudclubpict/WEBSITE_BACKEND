import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema } = mongoose;

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

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
