const { mongoose, Schema } = require("mongoose");

const ConferenceSubmissionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortcutTitle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    organizers: {
      type: [String],
      // required: true,
      trim: true,
    },
    conferenceStartDate: {
      type: String,
      trim: true,
    },
    conferenceEndDate: {
      type: String,
      trim: true,
    },
    authors: {
      type: [String], // Array of authors
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email validation
    },
    phone: {
      type: String,
      // required: true,
      trim: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String], // Array of keywords
      required: true,
    },
    indexed: {
      type: [String], // Array of indexes
      required: true,
    },
    track: {
      type: [String], // E.g., "Thermal Engineering"
      required: true,
      trim: true,
    },
    paperFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    programScheduleFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    brochureFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    presentationScheduleFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    presentationGuidelinesFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    pptFormatFile: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    conferenceBanner: {
      originalName: String,
      cloudinaryUrl: String,
      fileType: String,
      fileSize: Number,
    },
    venueDetails: {
      type: String, // Description of the venue or online platform
      required: true,
    },
    registrationDetails: {
      type: String, // Description of registration instructions
      required: true,
    },
    publicationInfo: {
      type: String, // Description of where papers will be published
      required: true,
    },
    paperSubmissionInfo: {
      type: String, // Description of paper Submission Info for editos who upload the paper
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now, // Automatically set the submission date
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

exports.ConferenceSubmission = mongoose.model(
  "ConferenceSubmission",
  ConferenceSubmissionSchema
);

//conference paper form Schema

const AuthorSchema = new mongoose.Schema({
  name: { type: [String], required: true },
  affiliation: { type: [String], required: true },
  email: { type: [String], required: true, match: /.+\@.+\..+/ }, // Basic email validation
});

const PaperSchema = new mongoose.Schema(
  {
    paperTitle: { type: String, required: true },
    paperAbstract: { type: String, required: true },
    keywords: { type: String, required: true },
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
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

exports.PaperSubmission = mongoose.model("PaperSubmission", PaperSchema);
