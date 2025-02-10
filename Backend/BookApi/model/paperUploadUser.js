const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
  name: { type: [String], required: true },
  affiliation: { type: [String], required: true },
  email: { type: [String], required: true, match: /.+\@.+\..+/ }, // Basic email validation
});

const PaperSchema = new mongoose.Schema(
  {
    paperTitle: { type: String, required: true },
    paperAbstract: { type: String, required: true },
    keywords: { type: [String], required: true },
    conferenceTrack: {
      type: String,
      required: true,
    },
    authors: {
      type: [AuthorSchema],
      required: true,
      validate: (v) => v.length > 0,
    }, // At least one author required
    paperFile: {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileSize: { type: String, required: true },
    },
    ReferenceConferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConferenceSubmission",
      required: true,
    }, // Extracted from URL
    selectedValue: {
      type: Object,
      default: { action: "❔ NA", color: "#808080" },
    },

    loginUserRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthSchema",
      required: true,
    },
    Reviewers: [
      {
        RviewerValidation: String,
        reviewerName: String,
        reviewerEmail: String,
        reviewerComments: { type: [Array], defafult: "No comment yet.." },
        paperId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PaperSubmission",
        },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

exports.PaperSubmission = mongoose.model("PaperSubmission", PaperSchema);
