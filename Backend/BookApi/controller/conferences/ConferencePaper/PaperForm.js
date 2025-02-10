const nodemailer = require("nodemailer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
//conference model
const Conferencemodel = require("../../../model/conference");
const conferences = Conferencemodel.ConferenceSubmission;
const XLSX = require("xlsx");
const fs = require("fs");
//form model
const formModel = require("../../../model/paperUploadUser");
const { default: mongoose } = require("mongoose");
const { AuthSchema } = require("../../../model/auth");

const PaperSubmission = formModel.PaperSubmission;

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.paperSubmitForm = async (req, res) => {
  console.log(req.user, "user from auth");
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
    loginUserRef = req.user;
    const title = req.params.shortcutTitle.replaceAll("-", " ");
    console.log(loginUserRef);
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
      paperFile: uploadedFile, // Cloudinary File Data
      ReferenceConferenceId,
      loginUserRef,
    };

    console.log("Uploading to MongoDB:", uploadedData);
    const newPaper = new PaperSubmission(uploadedData);
    await newPaper.save();
    const doc = await AuthSchema.findByIdAndUpdate(
      loginUserRef,
      {
        $push: {
          userUploadedPaperIds: newPaper._id,
        },
      },
      { new: true, runValidators: false }
    );
    if (doc) {
      console.log({ doc }, "submittedPapersREF");
    }
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

//update the form for revolution for user OR to set the reviewer Comment

exports.updateSubmission = async (req, res) => {
  try {
    console.log(
      "logging papers that uploaded to update",
      req?.body,
      "file: ",
      req.file
    );
    let paperId1 = req.body.paperId;
    const paperId = new mongoose.Types.ObjectId(paperId1);
    // ✅ Find the conference by its shortcut title
    console.log({ paperId });

    // ✅ Validate if the file is provided, if not check for other updates
    let updatedFile;
    if (req.file) {
      // ✅ If a new file is uploaded, upload it to Cloudinary
      updatedFile = await uploadFileToCloudinary(req.file);
    }
    let updatedData = {};

    if (updatedFile) {
      updatedData.paperFile = updatedFile; // If file was uploaded, add the new file
    } else {
      return res.status(404).send({ error: "paper not updated" });
    }
    // ✅ Check if the paper exists in the database
    console.log(paperId);
    const existingPaper = await PaperSubmission.findById(paperId);
    // console.log({ updatedFile }, "logging file updatedd);
    // console.log({ existingPaper });

    if (existingPaper.length) {
      return res.status(404).send({ error: "Paper submission not found" });
    }
    // ✅ Update the paper data
    let updatedPaper;
    {
      updatedPaper = await PaperSubmission.findByIdAndUpdate(
        paperId,
        updatedData,
        { new: true, runValidators: false }
      );
    }

    // ✅ Respond with a success message and the updated paper data
    res.status(200).send({
      message: "Paper updated successfully!",
      paper: updatedPaper,
    });
  } catch (error) {
    // ✅ Catch errors and send a failure response with the error details
    console.error("❌ Error in updateSubmission:", error); // Log error for debugging
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
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
        selectedValue.toLowerCase() === "accept"
          ? { action: "✅ Accepted", color: "#28a745" } // Green for Accepted
          : selectedValue.toLowerCase() === "reject"
          ? { action: "❌ Rejected", color: "#dc3545" } // Red for Rejected
          : { action: "🔷 Resolved", color: "#007BFF" }; // Blue for Resolved

      console.log({ updatedValue });
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
      return res.send("error to save select status");
    }

    // Ensure all emails are sent before responding
    await Promise.all(
      toEmails.map(async (email) => {
        const mailMsg =
          selectedValue.toLowerCase() === "accept"
            ? getAcceptanceEmail(paper[0].authors[0].name, paper[0].paperTitle)
            : selectedValue.toLowerCase() === "reject"
            ? getRejectionEmail(paper[0].authors[0].name, paper[0].paperTitle)
            : getResolveEmail(
                paper[0].authors[0].name,
                paper[0].paperTitle,
                req.body?.emailBody
              ); // Resolve condition added

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
      message: `Emails Sent Successfully to: ${toEmails.join(
        ", "
      )} and status is ${selectedValue}`,
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

const getResolveEmail = (authorName, paperTitle, body) => {
  return {
    subject: `Update: Your Paper Submission "${paperTitle}" Status`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #007BFF;">📘 Paper Submission Update</h2>
        <p>Dear <strong>${authorName}</strong>,</p>
        <p>We are pleased to inform you that your paper titled <strong>"${paperTitle}"</strong> has been reviewed and resolved positively.</p>
        <p>Your submission meets our criteria, and we appreciate your valuable contribution.</p>
        <p>${body}</p>
        <p>Please check your email for further instructions regarding the next steps in the process.</p>
        <p>Best regards,<br><strong>Conference Committee</strong></p>
      </div>
    `,
  };
};

//get all uploaded papers

exports.papers = async (req, res) => {
  const papers = await PaperSubmission.find();
  console.log(papers, "lognig all papers to send the admin panel");
  res.send(papers);
};

exports.userPapers = async (req, res) => {
  try {
    const paperIds = req.user.userUploadedPaperIds;

    const papers = await Promise.all(
      paperIds.map(async (id) => {
        return await PaperSubmission.findById(id);
      })
    );
    console.log(papers, paperIds, "Logning all user papers and related ids");
    if (papers.length) {
      res.status(200).send(papers);
    } else {
      res.status(404).send({ message: "No papers found" });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "Error to send papers" });
  }
};
//
//
//
//
exports.downloadExcel = async (req, res) => {
  // paperId = 0 indicates that all papers are to be downloaded
  const paperId = 0;
  console.log(
    { paperId },
    "logging paperId: download all papers as Excel file"
  );
  createExcelFile(paperId, res);
};

exports.oneDownloadExcel = async (req, res) => {
  // Extract paperId from route parameters
  const paperId = req?.params.paperId;
  console.log({ paperId }, "logging paperId: download one paper as Excel file");
  createExcelFile(paperId, res);
};

async function createExcelFile(paperId = 0, res) {
  try {
    // Function: Insert line breaks after every 10 words
    function insertLineBreaks(text, wordsPerLine = 10) {
      if (!text) return "";
      const words = text.split(" ");
      return words
        .map((word, index) =>
          (index + 1) % wordsPerLine === 0 ? word + "\n" : word
        )
        .join(" ");
    }

    // Fetch paper data from MongoDB
    let papers = [];
    console.log({ paperId });
    if (paperId && paperId !== "0") {
      console.log({ paperId }, "if one paper comes to download");
      const paper = await PaperSubmission.findById(paperId).lean();
      // If a single paper is found, wrap it in an array
      papers = paper ? [paper] : [];
    } else {
      console.log({ paperId }, "else all papers come to download");
      papers = await PaperSubmission.find().lean();
    }

    if (!papers || papers.length === 0) {
      return res.status(404).send("No papers found.");
    }

    // Prepare paper data with dynamic author and reviewer columns
    const data = papers.map((paper) => {
      let row = {
        Title: paper.paperTitle,
        Abstract: insertLineBreaks(paper.paperAbstract, 10), // Insert line breaks after 10 words in abstract
        Keywords: insertLineBreaks(paper.keywords.join(", "), 10), // Insert line breaks after 10 words in keywords
        Conference_Track: paper.conferenceTrack,
        Submission_Date: paper.createdAt.toISOString(),
      };

      // Dynamically add each author (name, email, affiliation)
      if (paper.authors && paper.authors.length > 0) {
        paper.authors.forEach((author, index) => {
          const authorName = Array.isArray(author.name)
            ? author.name.join(", ")
            : author.name;
          const authorEmail = Array.isArray(author.email)
            ? author.email.join(", ")
            : author.email;
          const authorAffiliation = Array.isArray(author.affiliation)
            ? author.affiliation.join(", ")
            : author.affiliation;
          row[`Author_${index + 1}_Name`] = authorName;
          row[`Author_${index + 1}_Email`] = authorEmail;
          row[`Author_${index + 1}_Affiliation`] = authorAffiliation;
        });
      }

      // Dynamically add each reviewer (name and comments)
      if (paper.Reviewers && paper.Reviewers.length > 0) {
        paper.Reviewers.forEach((reviewer, index) => {
          row[`Reviewer_${index + 1}_Name`] = reviewer.reviewerName || "";
          const comments = Array.isArray(reviewer.reviewerComments)
            ? reviewer.reviewerComments.join("; ")
            : reviewer.reviewerComments;
          row[`Reviewer_${index + 1}_Comments`] = insertLineBreaks(
            comments,
            10
          );
        });
      }
      return row;
    });

    // Create a new Excel workbook and worksheet from JSON data
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Adjust column widths automatically based on content length
    const headerKeys = Object.keys(data[0] || {});
    const colWidths = headerKeys.map((header) => {
      let maxLength = header.length;
      data.forEach((row) => {
        const cellValue = row[header] ? row[header].toString() : "";
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      return { wch: maxLength + 5 }; // Extra padding of 5 characters
    });
    worksheet["!cols"] = colWidths;

    // Set wrap text for all cells and bold the header row (row 1)
    for (let cell in worksheet) {
      if (cell[0] === "!") continue;
      if (!worksheet[cell].s) worksheet[cell].s = {};
      // Enable text wrapping
      worksheet[cell].s.alignment = { wrapText: true };

      // Bold header cells (cells in the first row)
      const match = cell.match(/\d+/);
      const rowNumber = match ? parseInt(match[0]) : 0;
      if (rowNumber === 1) {
        worksheet[cell].s.font = { bold: true };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Papers");

    // Write the workbook to a file named "Papers.xlsx"
    const filePath = "Papers.xlsx";
    XLSX.writeFile(workbook, filePath);

    // Send the file to the client and delete it after download
    res.download(filePath, "Papers.xlsx", (err) => {
      if (err) console.log(err);
      fs.unlinkSync(filePath); // Delete the file after sending
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Error generating Excel file.");
  }
}
