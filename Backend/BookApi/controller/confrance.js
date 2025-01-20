const ConferenceSubmissionModel = require("../model/conferance");
const ConferenceSubmission = ConferenceSubmissionModel.ConferenceSubmission;

// Mega Cloud Storage
let storage;
exports.setConferenceStorage = (megaStorage) => {
  storage = megaStorage; // Assign the storage object dynamically
};

exports.addConferenceSubmission = async (req, res) => {
  try {
    // Check if files are uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Upload files to Mega Cloud
    const uploadFileToMega = async (file) => {
      return new Promise((resolve, reject) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        const uploadStream = storage.upload({ name: uniqueName }, file.buffer);

        uploadStream.once("complete", async (uploadedFile) => {
          try {
            const fileInfo = {
              originalName: file.originalname,
              megaName: uploadedFile.name,
              filePath: await uploadedFile.link(),
              fileSize: uploadedFile.size,
            };
            resolve(fileInfo);
          } catch (err) {
            reject(err);
          }
        });

        uploadStream.once("error", (err) => {
          reject(err);
        });
      });
    };

    // Handle file uploads
    const uploadedFiles = {};
    for (const key of Object.keys(req.files)) {
      const file = req.files[key][0];
      uploadedFiles[key] = await uploadFileToMega(file);
    }

    // Combine form data with uploaded file information
    const conferenceData = {
      ...req.body,
      paperFile: uploadedFiles["paperFile"],
      programScheduleFile: uploadedFiles["programScheduleFile"],
      presentationScheduleFile: uploadedFiles["presentationScheduleFile"],
      presentationGuidelinesFile: uploadedFiles["presentationGuidelinesFile"],
      pptFormatFile: uploadedFiles["pptFormatFile"],
      conferenceBanner: uploadedFiles["conferenceBanner"],
    };

    // Create a new conference submission document
    const newSubmission = new ConferenceSubmission(conferenceData);
    console.log(newSubmission);

    // Save the conference submission to the database
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

    console.log(req.body);

    // Fetch the existing submission by ID
    const existingSubmission = await ConferenceSubmission.findById(id);
    if (!existingSubmission) {
      return res
        .status(404)
        .json({ message: "Conference submission not found" });
    }

    // Handle uploaded files if any
    const updatedData = { ...req.body };

    // Update files on MEGA if they are provided in the request
    if (req.files) {
      // Function to upload files to MEGA and return the file info
      const uploadFileToMega = async (file) => {
        return new Promise((resolve, reject) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          const uploadStream = storage.upload(
            { name: uniqueName },
            file.buffer
          );

          uploadStream.once("complete", async (uploadedFile) => {
            try {
              const fileInfo = {
                originalName: file.originalname,
                megaName: uploadedFile.name,
                filePath: await uploadedFile.link(),
                fileSize: uploadedFile.size,
              };
              resolve(fileInfo);
            } catch (err) {
              reject(err);
            }
          });

          uploadStream.once("error", (err) => {
            reject(err);
          });
        });
      };

      // Handle the upload for each file
      if (req.files["paperFile"]) {
        updatedData.paperFile = await uploadFileToMega(
          req.files["paperFile"][0]
        );
      }
      if (req.files["programScheduleFile"]) {
        updatedData.programScheduleFile = await uploadFileToMega(
          req.files["programScheduleFile"][0]
        );
      }
      if (req.files["presentationScheduleFile"]) {
        updatedData.presentationScheduleFile = await uploadFileToMega(
          req.files["presentationScheduleFile"][0]
        );
      }
      if (req.files["presentationGuidelinesFile"]) {
        updatedData.presentationGuidelinesFile = await uploadFileToMega(
          req.files["presentationGuidelinesFile"][0]
        );
      }
      if (req.files["pptFormatFile"]) {
        updatedData.pptFormatFile = await uploadFileToMega(
          req.files["pptFormatFile"][0]
        );
      }
      if (req.files["conferenceBanner"]) {
        updatedData.conferenceBanner = await uploadFileToMega(
          req.files["conferenceBanner"][0]
        );
      }
    }

    // Update the existing submission with the new data
    Object.assign(existingSubmission, updatedData);

    // Save the updated submission in the database
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

async function deleteFromMega(filePath) {
  try {
    const fileHandle = await megaStorage.file(filePath);
    await new Promise((resolve, reject) => {
      fileHandle.delete((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    console.error("Error deleting file from MEGA:", error);
    throw new Error("File deletion from MEGA failed");
  }
}
