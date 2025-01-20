const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const mega = require("megajs");
// Controllers
const bookController = require("./controller/book");
const confranceController = require("./controller/confrance");
const studenMembershipController = require("./controller/studentMembership");
const megaControllers = require("./controller/megaCloud");
// Models
const model = require("./model/book");
const Book = model.book;

// Routes
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
const multerUpload = multer({ storage: multerStorage });

//mega cloud longing

const storage = new mega.Storage({
  email: process.env.MEGA_CLOUD_EMIAL,
  password: process.env.MEGA_CLOUD_PASSWORD,
});

exports.storage = storage;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });

// Routes for Frontend
// Routes for getting data
app.get("/books/:pages", bookread.readBooks);
app.get("/books", book_5_read.read5book);
app.get("/book/:id", bookClick.renderBookPage);
app.get(
  "/conferences-data/:id",
  confranceController.getAllConferenceSubmissions
);
app.get("/conference/:id", singleConferencePage.singleConferencePage);
app.get("/membership", studenMembership.StudentMembershipHtml);

app.post("/student-membership", studenMembershipController.studentMembership);

app.get("/conferences", conferencePage.upcomingConferencesPage);
app.get("/all-conferences", conferencePage.conferencePage);
app.patch(
  "/update",
  multerUpload.array("files", 2),
  bookController.updateBookData
);

//update conferene by id
app.patch(
  "/update-conference/:id",
  multerUpload.fields([
    { name: "paperFile", maxCount: 1 },
    { name: "programScheduleFile", maxCount: 1 },
    { name: "presentationScheduleFile", maxCount: 1 },
    { name: "presentationGuidelinesFile", maxCount: 1 },
    { name: "pptFormatFile", maxCount: 1 },
    { name: "conferenceBanner", maxCount: 1 },
  ]),
  confranceController.updateConferenceSubmission
);
//Delete element by id

app.delete(
  "/delete-conference/:id",
  confranceController.deleteConferenceSubmission
);
//Delete-Allitems
app.get("/delete-all-conferences", confranceController.deleteAll);
// Routes for Postman
app.get("/bookss", bookController.read);
app.post("/book", bookController.create);
app.delete("/:id", bookController.delete);
app.get("/delete-all-books", bookController.deleteAll);

//to get the mega-cloud files

storage.once("ready", () => {
  console.log("mega login");

  //fetchs file
  megaControllers.setMegaStorage(storage);
  app.get("/mega-cloud/:fileName", megaControllers.megaCloudFiles);

  //add conferences
  confranceController.setConferenceStorage(storage);
  app.post(
    "/add-conference",
    multerUpload.fields([
      { name: "paperFile", maxCount: 1 },
      { name: "programScheduleFile", maxCount: 1 },
      { name: "presentationScheduleFile", maxCount: 1 },
      { name: "presentationGuidelinesFile", maxCount: 1 },
      { name: "pptFormatFile", maxCount: 1 },
      { name: "conferenceBanner", maxCount: 1 },
    ]),
    confranceController.addConferenceSubmission
  );

  //add books
  bookController.setStorage(storage);
  app.post(
    "/add",
    multerUpload.array("files", 2),
    bookController.addBookWithFiles
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
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
//
//
