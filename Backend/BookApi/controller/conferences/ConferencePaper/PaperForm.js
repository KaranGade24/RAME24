const nodemailer = require("nodemailer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
//conference model
const Conferencemodel = require("../../../model/conference");
const conferences = Conferencemodel.ConferenceSubmission;

//form model
const formModel = require("../../../model/conference");
const { default: mongoose } = require("mongoose");
const PaperSubmission = formModel.PaperSubmission;

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.paperSubmitForm = async (req, res) => {
  const { shortcutTitle } = req.params;
  const title = shortcutTitle.replaceAll("-", " ");
  const conference = await conferences.findOne({ shortcutTitle: title });

  if (conference) {
    res.render("conferences/ConferencesPaperSubmit/PapeForm", { conference });
  } else {
    res.sendFile(
      path.resolve(__dirname, "../../../public/All_Server_Files/errorPage.html")
    );
  }
};

// ✅ Paper Submission Route (Upload Paper to Cloudinary & Save to MongoDB)
exports.uploadForm = async (req, res) => {
  try {
    const title = req.params.shortcutTitle.replaceAll("-", " ");

    const conference = await conferences.findOne({ shortcutTitle: title });

    // ✅ If conference is not found, return an error
    if (!conference) {
      return res.status(404).json({ error: "Conference not found" });
    }

    const ReferenceConferenceId = conference._id;
    console.log(ReferenceConferenceId);

    if (!req.file) {
      return res.status(400).json({ error: "Paper file is required" });
    }

    // ✅ Upload file to Cloudinary
    const uploadedFile = await uploadFileToCloudinary(req.file);

    // ✅ Save submission details in MongoDB
    const uploadedData = {
      ...req.body,
      paperFile: uploadedFile,
      ReferenceConferenceId, // Cloudinary File Data
    };

    console.log("Uploading to MongoDB:", uploadedData);
    const newPaper = new PaperSubmission(uploadedData);
    await newPaper.save();

    res
      .status(201)
      .json({ message: "Paper submitted successfully!", paper: newPaper });
  } catch (error) {
    console.error("❌ Error in uploadForm:", error); // ✅ Logs full error in terminal
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

//get the uploaded papers data

exports.getUploadedPapers = async (req, res) => {
  try {
    const refId = req.params.conferenceId;
    console.log(refId);

    // Query to find papers matching the conferenceId
    const uploadedPaper = await PaperSubmission.find({
      ReferenceConferenceId: refId,
    });
    //find conference shortTitle
    const conference = await conferences.findOne({ _id: refId });
    console.log(conference.shortcutTitle);
    const title = conference.shortcutTitle;

    // console.log(uploadedPaper);
    if (uploadedPaper.length) {
      console.log("Uploaded Papers:", uploadedPaper);
      return res.json({ uploadedPaper, title });
    } else {
      return res
        .status(404)
        .sendFile(
          path.join(
            __dirname,
            "../../../public/All_Server_Files/errorPage.html"
          )
        );
    }
  } catch (err) {
    console.error("Error fetching uploaded papers:", err);
    return res
      .status(500)
      .sendFile(
        path.join(__dirname, "../../../public/All_Server_Files/errorPage.html")
      );
  }
};

//add form in database
const uploadFileToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw", // For PDF, DOCX, etc.
          public_id: `papers/${Date.now()}-${file.originalname}`, // Unique file name
        },
        (error, uploadedFile) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              fileUrl: uploadedFile.secure_url, // Cloudinary URL
              fileName: uploadedFile.original_filename, // Cloudinary FileName
              fileSize: file.size,
            });
          }
        }
      )
      .end(file.buffer);
  });
};

//send mail
exports.sendEmail = async (req, res) => {
  const { selectedValue, selectedId } = req.body;

  try {
    const paper = await PaperSubmission.find({ _id: selectedId });
    if (!paper || paper.length === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const toEmails = paper[0].authors[0].email;

    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like Outlook, Yahoo
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or App Password
      },
    });

    try {
      const updatedValue =
        selectedValue === "accept"
          ? { action: "✅ Accepted", color: "#28a745" }
          : { action: "❌ Rejected", color: "#dc3545" };

      const updatedPaper = await PaperSubmission.findByIdAndUpdate(
        selectedId,
        { $set: { selectedValue: updatedValue } }, // Update only selectedValue
        { new: true, runValidators: false } // ✅ Prevent validation errors
      );
      if (!updatedPaper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      console.log("status update success");
    } catch {
      console.log("error to save select status");
    return  res.send("error to save select status");
    }

    // Ensure all emails are sent before responding
    await Promise.all(
      toEmails.map(async (email) => {
        const mailMsg =
          selectedValue === "accept"
            ? getAcceptanceEmail(paper[0].authors[0].name, paper[0].paperTitle)
            : getRejectionEmail(paper[0].authors[0].name, paper[0].paperTitle);

        const mailOptions = {
          from: process.env.EMAIL,
          to: email, // Receiver Email
          subject: mailMsg.subject,
          html: mailMsg.html,
        };

        await transporter.sendMail(mailOptions);
      })
    );

    res.status(200).json({
      message: "Emails Sent Successfully to: " + toEmails.join(", "),
    });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

//containt for email

const getAcceptanceEmail = (authorName, paperTitle) => {
  return {
    subject: `Congratulations! Your Paper "${paperTitle}" Has Been Accepted 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: green;">🎉 Paper Acceptance Notification 🎉</h2>
        <p>Dear <strong>${authorName}</strong>,</p>
        <p>We are pleased to inform you that your paper titled <strong>"${paperTitle}"</strong> has been accepted for publication in our conference.</p>
        <p>Congratulations on your excellent work! 🎓</p>
        <p>Please check your email for further details regarding the next steps.</p>
        <p>Best regards,<br><strong>Conference Committee</strong></p>
      </div>
    `,
  };
};

const getRejectionEmail = (authorName, paperTitle) => {
  return {
    subject: `Regret: Your Paper Submission "${paperTitle}" Status`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: red;">📢 Paper Submission Update</h2>
        <p>Dear <strong>${authorName}</strong>,</p>
        <p>We appreciate your submission of the paper titled <strong>"${paperTitle}"</strong> to our conference.</p>
        <p>After a thorough review, we regret to inform you that your paper has not been accepted for publication at this time.</p>
        <p>We encourage you to submit your work to other conferences or consider revising and submitting in the future.</p>
        <p>Best regards,<br><strong>Conference Committee</strong></p>
      </div>
    `,
  };
};
