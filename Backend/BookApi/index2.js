const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mega = require("megajs");
const mime = require("mime-types");
// Controllers
const bookController = require("./controller/book");
const confranceController = require("./controller/confrance");
const studenMembershipController = require("./controller/studentMembership");

// Models
const model = require("./model/book");
const Book = model.book;

// Routes function
const book_5_read = require("./public/All_Server_Files/Books/RAME_5_books");
const bookread = require("./public/All_Server_Files/Books/RAME_books");
const bookClick = require("./public/All_Server_Files/Books/Book_click");
const conferencePage = require("./public/All_Server_Files/conference/index");
const singleConferencePage = require("./public/All_Server_Files/conference/singleConferenc");
const studenMembership = require("./public/All_Server_Files/studentMembership/studentMembership");

// Initialize the app
const app = express();
const PORT = 8080;
const uri = "mongodb+srv://root:root@cluster0.m87cn.mongodb.net/BookApi";

// Use relative path (relative to current script location)
const uploadDir = path.join(__dirname, "/public/uploads");

// Check if the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
async function mongoDbConnection() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
}
mongoDbConnection();

// Multer configuration
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Routes for Frontend
// // Routes for getting data
// app.get("/books/:pages", bookread.readBooks);
// app.get("/books", book_5_read.read5book);
// app.get("/book/:id", bookClick.renderBookPage);
// app.get(
//   "/conferences-data/:id",
//   confranceController.getAllConferenceSubmissions
// );
// app.get("/conference/:id", singleConferencePage.singleConferencePage);
// app.get("/membership", studenMembership.StudentMembershipHtml);
//
//
//
//
//
//
//
//
//
//
//

const storage = new mega.Storage({
  email: "autofilter00@gmail.com",
  password: "12qwAS!@",
});

storage.once("ready", () => {
  console.log("longing in mega cloud");

  app.post("/add", upload.array("files", 2), async (req, res) => {
    try {
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }

      // Map and upload files asynchronously
      const uploadedfiles = await Promise.all(
        files.map(async (file) => {
          const uniqueName = `${Date.now()}-${file.originalname}`; // Generate unique filename
          const uploadStream = storage.upload(
            { name: uniqueName },
            file.buffer
          );

          return new Promise((resolve, reject) => {
            uploadStream.once("complete", async (uploadedFile) => {
              try {
                const fileInfo = {
                  originalName: uploadedFile.name,
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
        })
      );

      // Combine form data with file information
      const bookData = {
        ...req.body,
        files: uploadedfiles,
      };

      // Save the book data in the database
      const book = new Book(bookData);
      await book.save();

      res.json({
        message: "Book and files uploaded successfully!",
        book: bookData,
        files: uploadedfiles,
      });
    } catch (error) {
      console.error("Error saving book:", error);
      res.status(500).json({ message: "Failed to upload book data." });
    }
  });
});
//
//
//
//
//
//
//
//
//
// app.post("/student-membership", studenMembershipController.studentMembership);

// app.post(
//   "/add-conference",
//   upload.fields([
//     { name: "paperFile", maxCount: 1 },
//     { name: "programScheduleFile", maxCount: 1 },
//     { name: "presentationScheduleFile", maxCount: 1 },
//     { name: "presentationGuidelinesFile", maxCount: 1 },
//     { name: "pptFormatFile", maxCount: 1 },
//     { name: "conferenceBanner", maxCount: 1 },
//   ]),
//   confranceController.addConferenceSubmission
// );

// app.get("/conferences", conferencePage.upcomingConferencesPage);
// app.get("/all-conferences", conferencePage.conferencePage);
// app.patch("/update", upload.array("files", 2), bookController.updateBookData);

// //update conferene by id
// app.patch(
//   "/update-conference/:id",
//   upload.fields([
//     { name: "paperFile", maxCount: 1 },
//     { name: "programScheduleFile", maxCount: 1 },
//     { name: "presentationScheduleFile", maxCount: 1 },
//     { name: "presentationGuidelinesFile", maxCount: 1 },
//     { name: "pptFormatFile", maxCount: 1 },
//     { name: "conferenceBanner", maxCount: 1 },
//   ]),
//   confranceController.updateConferenceSubmission
// );
// //Delete element by id

// app.delete(
//   "/delete-conference/:id",
//   confranceController.deleteConferenceSubmission
// );

// // Routes for Postman
// app.get("/bookss", bookController.read);
// app.post("/book", bookController.create);
// app.delete("/:id", bookController.delete);
// app.get("/delete-all", bookController.deleteAll);
//
//
//
//
//
//
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
