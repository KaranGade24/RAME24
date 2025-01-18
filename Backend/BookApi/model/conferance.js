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
      required: true,
      trim: true,
    },
    conferenceEndDate: {
      type: String,
      required: true,
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
      type: [String], // Array of keywords
      required: true,
    },
    track: {
      type: String, // E.g., "Thermal Engineering"
      required: true,
      trim: true,
    },
    conferenceBanner: {
      type: String,
      required: true,
    },
    paperFile: {
      type: String, // Path to the uploaded paper PDF
      required: true,
    },
    programScheduleFile: {
      type: String, // Path to the uploaded program schedule PDF
      required: true,
    },
    presentationScheduleFile: {
      type: String, // Path to the uploaded presentation schedule PDF
      required: true,
    },
    presentationGuidelinesFile: {
      type: String, // Path to the uploaded presentation guidelines PDF
      required: true,
    },
    pptFormatFile: {
      type: String, // Path to the uploaded PPT format file
      required: true,
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
