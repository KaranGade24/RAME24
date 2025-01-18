const ConferenceSubmissionModel = require("../model/conferance");
const ConferenceSubmission = ConferenceSubmissionModel.ConferenceSubmission;

exports.addConferenceSubmission = async (req, res) => {
  try {
    // Log the form data for debugging purposes
    // console.log("Form data:", req.body);
    // console.log("Form data:", req.files);

    // Check if files are uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Access each file correctly from req.files
    const paperFile = req.files["paperFile"]
      ? req.files["paperFile"][0].path
      : null;
    const programScheduleFile = req.files["programScheduleFile"]
      ? req.files["programScheduleFile"][0].path
      : null;
    const presentationScheduleFile = req.files["presentationScheduleFile"]
      ? req.files["presentationScheduleFile"][0].path
      : null;
    const presentationGuidelinesFile = req.files["presentationGuidelinesFile"]
      ? req.files["presentationGuidelinesFile"][0].path
      : null;
    const pptFormatFile = req.files["pptFormatFile"]
      ? req.files["pptFormatFile"][0].path
      : null;
    const conferenceBanner = req.files["conferenceBanner"]
      ? req.files["conferenceBanner"][0].path
      : null;

    // Ensure all required files are present
    if (
      !paperFile ||
      !programScheduleFile ||
      !presentationScheduleFile ||
      !presentationGuidelinesFile ||
      !pptFormatFile ||
      !conferenceBanner
    ) {
      return res
        .status(400)
        .json({ message: "One or more required files are missing" });
    }

    // Combine form data with the uploaded file paths
    const conferenceData = {
      ...req.body,
      paperFile,
      programScheduleFile,
      presentationScheduleFile,
      presentationGuidelinesFile,
      pptFormatFile,
      conferenceBanner,
    };

    console.log("Conference data:", conferenceData);

    // Create a new conference submission document
    const newSubmission = new ConferenceSubmission(conferenceData);

    // Save the conference submission to the database
    await newSubmission.save();

    res.status(201).json({
      message: "Conference submission added successfully!",
      conference: newSubmission,
    });
  } catch (error) {
    // Log the error and return a failure message
    console.error("Error adding conference submission:", error);
    res.status(500).json({ message: "Failed to add conference submission" });
  }
};

exports.getAllConferenceSubmissions = async (req, res) => {
  try {
    var skip = 0;
    skip = req?.params?.id;
    // console.log({ skip });

    // Fetch all conference submissions from the database
    const conferenceSubmissions = await ConferenceSubmission.find()
      .limit(10)
      .skip(skip);
    const conferenceCount = await ConferenceSubmission.countDocuments();

    if (!conferenceSubmissions || conferenceSubmissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No conference submissions found" });
    }

    res.status(200).json({
      message: "Conference submissions fetched successfully!",
      conferenceSubmissions,
      conferenceCount,
    });
  } catch (error) {
    // Log the error and return a failure message
    console.error("Error fetching conference submissions:", error);
    res.status(500).json({ message: "Failed to fetch conference submissions" });
  }
};

exports.getConferenceSubmissionById = async (req, res) => {
  try {
    // Extract the ID from request parameters
    const id = req.params.id;
    // console.log(id);
    // Fetch the conference submission by ID from the database
    const conferenceSubmission = await ConferenceSubmission.findById(id);

    // Check if the submission exists
    if (!conferenceSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    // Respond with the found submission
    res.status(200).json({
      message: "Conference submission fetched successfully!",
      conferenceSubmission,
    });
  } catch (error) {
    // Log the error and return a failure message
    console.error("Error fetching conference submission by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch conference submission by ID" });
  }
};

// update exsisting data

exports.updateConferenceSubmission = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the existing submission by ID
    const existingSubmission = await ConferenceSubmission.findById(id);
    if (!existingSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    // Handle uploaded files if any
    const updatedData = { ...req.body };

    if (req.files) {
      if (req.files["paperFile"]) {
        updatedData.paperFile = req.files["paperFile"][0].path;
      }
      if (req.files["programScheduleFile"]) {
        updatedData.programScheduleFile =
          req.files["programScheduleFile"][0].path;
      }
      if (req.files["presentationScheduleFile"]) {
        updatedData.presentationScheduleFile =
          req.files["presentationScheduleFile"][0].path;
      }
      if (req.files["presentationGuidelinesFile"]) {
        updatedData.presentationGuidelinesFile =
          req.files["presentationGuidelinesFile"][0].path;
      }
      if (req.files["pptFormatFile"]) {
        updatedData.pptFormatFile = req.files["pptFormatFile"][0].path;
      }
      if (req.files["conferenceBanner"]) {
        updatedData.conferenceBanner = req.files["conferenceBanner"][0].path;
      }
    }

    // Update the submission with new data
    Object.assign(existingSubmission, updatedData);

    // Save changes to the database
    await existingSubmission.save();

    res.status(200).json({
      message: "Conference submission updated successfully!",
      conference: existingSubmission,
    });
  } catch (error) {
    console.error("Error updating conference submission:", error);
    res.status(500).json({ message: "Failed to update conference submission" });
  }
};

//deleting particular element by id

exports.deleteConferenceSubmission = async (req, res) => {
  try {
    const id = req.params.id;

    // Find and delete the conference submission
    const deletedSubmission = await ConferenceSubmission.findByIdAndDelete(id);

    if (!deletedSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    res.status(200).json({
      message: "Conference submission deleted successfully!",
      conference: deletedSubmission,
    });
  } catch (error) {
    console.error("Error deleting conference submission:", error);
    res.status(500).json({ message: "Failed to delete conference submission" });
  }
};
