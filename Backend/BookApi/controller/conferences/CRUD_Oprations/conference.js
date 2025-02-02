const ConferenceSubmissionModel = require("../../../model/conference");
const ConferenceSubmission = ConferenceSubmissionModel.ConferenceSubmission;

// Mega Cloud Storage
const cloudinary = require("cloudinary").v2;

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.addConferenceSubmission = async (req, res) => {
  try {
    // Check if files are uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // ✅ Function to upload file to Cloudinary
    const uploadFileToCloudinary = async (file) => {
      return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith("image/")
          ? "image"
          : "raw"; // Set correct type

        cloudinary.uploader
          .upload_stream(
            {
              resource_type: resourceType,
              public_id: `conference/${Date.now()}-${file.originalname}`, // Unique name
            },
            (error, uploadedFile) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  originalName: file.originalname,
                  cloudinaryUrl: uploadedFile.secure_url,
                  fileSize: file.size,
                  fileType: resourceType,
                });
              }
            }
          )
          .end(file.buffer);
      });
    };

    // ✅ Handle multiple file uploads
    const uploadedFiles = {};
    for (const key of Object.keys(req.files)) {
      const file = req.files[key][0];
      uploadedFiles[key] = await uploadFileToCloudinary(file);
    }

    // ✅ Combine form data with uploaded file information
    const conferenceData = {
      ...req.body,
      paperFile: uploadedFiles["paperFile"],
      programScheduleFile: uploadedFiles["programScheduleFile"],
      presentationScheduleFile: uploadedFiles["presentationScheduleFile"],
      presentationGuidelinesFile: uploadedFiles["presentationGuidelinesFile"],
      pptFormatFile: uploadedFiles["pptFormatFile"],
      brochureFile: uploadedFiles["brochureFile"],
      conferenceBanner: uploadedFiles["conferenceBanner"],
    };

    // ✅ Save the submission to the database
    const newSubmission = new ConferenceSubmission(conferenceData);
    console.log(newSubmission);
    await newSubmission.save();

    res.status(201).json({
      message: "Conference submission added successfully!",
      conference: newSubmission,
    });
  } catch (error) {
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
      .skip(skip)
      .sort({ createdAt: -1 });
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

    console.log(req.body);

    // ✅ Fetch the existing submission by ID
    const existingSubmission = await ConferenceSubmission.findById(id);
    if (!existingSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    // ✅ Prepare updated data
    const updatedData = { ...req.body };

    // ✅ Function to upload files to Cloudinary
    const uploadFileToCloudinary = async (file) => {
      return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith("image/")
          ? "image"
          : "raw"; // Set correct type

        cloudinary.uploader
          .upload_stream(
            {
              resource_type: resourceType,
              public_id: `conference/${Date.now()}-${file.originalname}`, // Unique name
            },
            (error, uploadedFile) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  originalName: file.originalname,
                  cloudinaryUrl: uploadedFile.secure_url,
                  fileSize: file.size,
                  fileType: resourceType,
                });
              }
            }
          )
          .end(file.buffer);
      });
    };

    // ✅ Upload new files if provided & replace old URLs
    if (req.files) {
      if (req.files["paperFile"]) {
        updatedData.paperFile = await uploadFileToCloudinary(
          req.files["paperFile"][0]
        );
      }
      if (req.files["programScheduleFile"]) {
        updatedData.programScheduleFile = await uploadFileToCloudinary(
          req.files["programScheduleFile"][0]
        );
      }
      if (req.files["presentationScheduleFile"]) {
        updatedData.presentationScheduleFile = await uploadFileToCloudinary(
          req.files["presentationScheduleFile"][0]
        );
      }
      if (req.files["presentationGuidelinesFile"]) {
        updatedData.presentationGuidelinesFile = await uploadFileToCloudinary(
          req.files["presentationGuidelinesFile"][0]
        );
      }
      if (req.files["brochureFile"]) {
        updatedData.brochureFile = await uploadFileToCloudinary(
          req.files["brochureFile"][0]
        );
      }
      if (req.files["pptFormatFile"]) {
        updatedData.pptFormatFile = await uploadFileToCloudinary(
          req.files["pptFormatFile"][0]
        );
      }
      if (req.files["conferenceBanner"]) {
        updatedData.conferenceBanner = await uploadFileToCloudinary(
          req.files["conferenceBanner"][0]
        );
      }
    }

    // ✅ Update the existing submission with new data
    Object.assign(existingSubmission, updatedData);

    // ✅ Save the updated submission in the database
    await existingSubmission.save();

    res.status(200).json({
      message: "Conference submission updated successfully!",
      conference: existingSubmission,
    });
    console.log(existingSubmission);
  } catch (error) {
    console.error("Error updating conference submission:", error);
    res.status(500).json({ message: "Failed to update conference submission" });
  }
};
//deleting particular element by id

exports.deleteConferenceSubmission = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Find the existing submission
    const deletedSubmission = await ConferenceSubmission.findById(id);
    if (!deletedSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    // ✅ Function to extract Cloudinary public ID from URL
    const getCloudinaryPublicId = (url) => {
      const parts = url.split("/");
      return parts.slice(-2).join("/").split(".")[0]; // Extract last 2 parts (folder/filename)
    };

    // ✅ Delete all associated files from Cloudinary
    const fileFields = [
      "paperFile",
      "programScheduleFile",
      "presentationScheduleFile",
      "presentationGuidelinesFile",
      "brochureFile",
      "pptFormatFile",
      "conferenceBanner",
    ];

    for (const field of fileFields) {
      if (deletedSubmission[field] && deletedSubmission[field].cloudinaryUrl) {
        const publicId = getCloudinaryPublicId(
          deletedSubmission[field].cloudinaryUrl
        );
        await cloudinary.uploader.destroy(publicId, {
          resource_type: deletedSubmission[field].fileType,
        });
      }
    }

    // ✅ Delete the conference submission from the database
    await ConferenceSubmission.findByIdAndDelete(id);

    res.status(200).json({
      message:
        "Conference submission and associated files deleted successfully!",
      conference: deletedSubmission,
    });
  } catch (error) {
    console.error("Error deleting conference submission:", error);
    res.status(500).json({ message: "Failed to delete conference submission" });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    // Delete all conference submissions in a single operation
    const result = await ConferenceSubmission.deleteMany();

    // Send a success response with the result
    res.status(200).json({
      message: "All conference submissions have been deleted.",
      deletedCount: result.deletedCount, // Number of deleted documents
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({
      message: "An error occurred while deleting submissions.",
      error,
    });
  }
};

