// http://localhost:8080
const auth = require("./controller/auth");
const cookieparser = require("cookie-parser");
// Dependencies
const bodyParser = require("body-parser");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const ejs = require("ejs");
const session = require("express-session");
// Controllers
const bookController = require("./controller/Books/CRUD_Oparation/book");
const confranceController = require("./controller/conferences/CRUD_Oprations/conference");
const studenMembershipController = require("./controller/MemberShip/studentMembership");

// Models
const model = require("./model/book");
const Book = model.book;

// Routes functions
const book_5_read = require("./public/All_Server_Files/Books/RAME_5_books");
const bookread = require("./public/All_Server_Files/Books/RAME_books");
const bookClick = require("./public/All_Server_Files/Books/Book_click");
const conferencePage = require("./public/All_Server_Files/conference/index");
const singleConferencePage = require("./public/All_Server_Files/conference/singleConferenc");
const callForPaper = require("./controller/conferences/ConferencePaper/CallForPaperPage");
const PaperForm = require("./controller/conferences/ConferencePaper/PaperForm");
const studenMembership = require("./public/All_Server_Files/studentMembership/studentMembership");

// Initialize the app
const app = express();
const PORT = 8080;
const uri = process.env.MONGODB_URI;

// Use relative path (relative to current script location) for uploads
const uploadDir = path.join(__dirname, "/public/uploads");

// Check if the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
// app.use(auth.checkLogin);

app.use(auth.checkLogin, express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false, // ✅ Do not save session if it wasn’t modified
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieparser());
app.set("view engine", "ejs");
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["AMP-Access-Control-Allow-Source-Origin"],
  })
);

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

// Cloudinary configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
  console.log("Cloudinary is connected");
} catch (err) {
  console.log(err);
}
exports.cloudinary = cloudinary;

// Routes for Frontend - Getting data
app.get("/books/:pages", bookread.readBooks);
app.get("/books", book_5_read.read5book);
app.get("/book/:id", bookClick.renderBookPage);
app.get(
  "/conferences-data/:id",
  confranceController.getAllConferenceSubmissions
);
app.get(
  "/conference/:shortcutTitle",
  singleConferencePage.singleConferencePage
);
app.get("/membership", studenMembership.StudentMembershipHtml);
app.get("/conferences", conferencePage.upcomingConferencesPage);
app.get("/all-conferences", conferencePage.conferencePage);
app.get("/conference/:shortcutTitle/service", callForPaper.CallForPaperPage);
app.get(
  "/conference/:shortcutTitle/service/form",
  auth.authMiddleware,
  PaperForm.paperSubmitForm
);
app.get("/conference/submit-paper/:conferenceId", PaperForm.getUploadedPapers);
// Route for student membership post
app.post("/student-membership", studenMembershipController.studentMembership);

// Patch routes
app.patch(
  "/update",
  multerUpload.array("files", 2),
  bookController.updateBookData
);

// Update conference by id
app.patch(
  "/update-conference/:id",
  multerUpload.fields([
    { name: "paperFile", maxCount: 1 },
    { name: "programScheduleFile", maxCount: 1 },
    { name: "presentationScheduleFile", maxCount: 1 },
    { name: "presentationGuidelinesFile", maxCount: 1 },
    { name: "pptFormatFile", maxCount: 1 },
    { name: "conferenceBanner", maxCount: 1 },
    { name: "brochureFile", maxCount: 1 },
  ]),
  confranceController.updateConferenceSubmission
);

// Delete routes
app.delete(
  "/delete-conference/:id",
  confranceController.deleteConferenceSubmission
);
app.get("/delete-all-conferences", confranceController.deleteAll);

// Routes for Postman testing
app.get("/bookss", bookController.read);
app.post("/book", bookController.create);
app.delete("/:id", bookController.delete);
app.get("/delete-all-books", bookController.deleteAll);

// Routes for adding data

// Add conferences
app.post(
  "/add-conference",
  multerUpload.fields([
    { name: "paperFile", maxCount: 1 },
    { name: "programScheduleFile", maxCount: 1 },
    { name: "presentationScheduleFile", maxCount: 1 },
    { name: "presentationGuidelinesFile", maxCount: 1 },
    { name: "pptFormatFile", maxCount: 1 },
    { name: "conferenceBanner", maxCount: 1 },
    { name: "brochureFile", maxCount: 1 },
  ]),
  confranceController.addConferenceSubmission
);

app.use((req, res, next) => {
  // console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  console.log("Request Files:", req.files);
  next();
});

//Add papers of perticular Conference
app.post(
  "/conference/:shortcutTitle/service/form",
  multerUpload.single("paperFile"),
  auth.authMiddleware,
  PaperForm.uploadForm
);

app.patch(
  "/update-paper/:paperId",
  multerUpload.single("paperFile"),
  PaperForm.updateSubmission
);

//Post email
app.post("/send-ststus-email", PaperForm.sendEmail);

// Add books
app.post(
  "/add",
  multerUpload.array("files", 2),
  bookController.addBookWithFiles
);
//controller books
const bookPages = require("./controller/Books/AllPages/pagess");
//book pages all book get
app.get("/recent-books", bookPages.recentBooksPage);

//
//
//
//

app.get("/signup-page", auth.signupPage);
app.get("/login-page", auth.loginPage);
app.post("/signup", auth.signup);
app.post("/login", auth.login);
app.get("/profile", auth.authMiddleware);
//

const reviewer = require("./controller/Reviewer");
app.post("/reviewer", reviewer.ReviewrFeedbackStore);
// app.get("/reviewer")

app.post("/send", reviewer.sentMail);

app.get(
  "/:paperId/:RviewerValidation/:reviewerEmail",
  reviewer.authReviewerMiddleware,
  (req, res) => {
    res.render("Reviewer/ReviwerForm.ejs");
  }
);

//get all uploaded papers for admin panel

app.get("/user/pepers", auth.authMiddleware, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../BookApi/views/userPanel.html"));
});

// app.get("/dashboard", auth.authMiddleware, (req, res) => {
//   console.log("Accessing req.user in next function:", req.user);
//   res.json({ message: "Welcome to dashboard!", user: req.user });
// });

app.get("/all-papers", PaperForm.papers);
app.get("/all-user-papers", auth.authMiddleware, PaperForm.userPapers);
//for download excel file of all papers
app.get("/download-excel", PaperForm.downloadExcel);
app.get("/onedownload-excel/:paperId", PaperForm.oneDownloadExcel);

app.get("/public/check-login", auth.publicCheckLogin);
app.get("/logout", auth.logout);
// Fallback route for handling unknown routes
app.use((req, res) => {
  res.sendFile(
    path.resolve(__dirname, "./public/All_Server_Files/errorPage.html")
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
