const { mongoose, Schema } = require("mongoose");

const membershipSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
  },
  phone: {
    type: String, // Store as a string to handle leading zeros and large numbers
    required: true,
    match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
  },
  institution: {
    type: String,
    required: true,
  },
  membershipType: {
    type: String,
    enum: ["basic", "premium"],
    required: true,
  },
  comments: {
    type: String,
    default: "",
  },
});

exports.studentMembership = mongoose.model(
  "studentMembership",
  membershipSchema
);
