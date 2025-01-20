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
      trim: true,
    },
    organizers: {
      type: [String],
      required: true,
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
      required: true,
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
      type: String, // E.g., "Thermal Engineering"
      required: true,
      trim: true,
    },
    paperFile: {
      originalName: String,
      megaName: String,
      filePath: String,
      fileSize: Number,
    },
    programScheduleFile: {
      originalName: String,
      megaName: String,
      filePath: String,
      fileSize: Number,
    },
    presentationScheduleFile: {
      originalName: String,
      megaName: String,
      filePath: String,
      fileSize: Number,
    },
    presentationGuidelinesFile: {
      originalName: String,
      megaName: String,
      filePath: String,
      fileSize: Number,
    },
    pptFormatFile: {
      originalName: String,
      megaName: String,
      filePath: String,
      fileSize: Number,
    },
    conferenceBanner: {
      originalName: String,
      megaName: String,
      filePath: String,
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
