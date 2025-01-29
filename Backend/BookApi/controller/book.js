// const { cloudinary } = require("..");
const model = require("../model/book");
const Book = model.book;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// const mega = require("../index/");

exports.create = (req, res) => {
  console.log(req.body);
  try {
    console.log(req.body);
    res.send(req.body);
  } catch (err) {
    res.json(err);
  }
};

exports.read5 = async (req, res) => {
  // const id = req.params.id;

  try {
    const books = await Book.find().limit(5).sort({ date: -1 });
    console.log(books);
    res.send(books);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
exports.read = async (req, res) => {
  const id = req.params.id;

  try {
    const books = await Book.find().sort({ date: -1 });
    console.log(books);
    res.json(books);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};



//update code

exports.updateBookData = async (req, res) => {
  try {
    // Log the form data and uploaded files for debugging purposes
    console.log("Form data:", req.body);
    console.log("Uploaded files:", req.files);

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await Promise.all(
        req.files.map((file) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          return new Promise((resolve, reject) => {
            const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw"; // Define resource type based on file type

            // Upload the file to Cloudinary
            cloudinary.uploader.upload_stream(
              {
                resource_type: resourceType,
                public_id: `uploads/${uniqueName}`, // Unique file name with timestamp
              },
              (error, uploadedFile) => {
                if (error) {
                  reject(error); // Reject the promise if there's an error
                } else {
                  const fileInfo = {
                    originalName: file.originalname,
                    cloudinaryUrl: uploadedFile.secure_url,
                    fileSize: file.size,
                    fileType: resourceType,
                  };
                  resolve(fileInfo); // Resolve the promise with file information
                }
              }
            ).end(file.buffer); // Send the file buffer to Cloudinary
          });
        })
      );

      // Add the uploaded files to the book data
      req.body.files = uploadedFiles;
    } else {
      // If no files are uploaded, set files to an empty array
      req.body.files = [];
    }

    const bookData = { ...req.body }; // Combine the updated book data

    const bookId = bookData.bookId;

    if (!bookId) {
      // If bookId is missing from the request, return an error
      return res.status(400).json({ message: "Book ID is required." });
    }

    // Find and update the book in the database using the bookId
    const doc = await Book.findOneAndUpdate({ _id: bookId }, bookData, {
      new: true, // Return the updated document
    });

    if (!doc) {
      // If no book is found with the provided bookId, return a 404 error
      return res.status(404).json({ message: "Book not found." });
    }

    // Send the updated book data as a response
    res.status(200).json(doc);
  } catch (error) {
    // Log the error and send a generic error message to the client
    console.error("Error saving book:", error);
    res.status(500).json({ message: "Failed to upload book data." });
  }
};



exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // ✅ Find the document in the database
    const doc = await Book.findOneAndDelete({ _id: id });

    if (!doc) {
      return res.status(404).json({ message: "Book not found" });
    }

    // ✅ Delete associated files from Cloudinary
    if (doc.files && doc.files.length > 0) {
      await Promise.all(
        doc.files.map(async (file) => {
          try {
            // Extract Cloudinary public_id from the URL
            const publicId = file.cloudinaryUrl.split("/").pop().split(".")[0]; // Removes extension if present

            // ✅ Determine if file is "image" or "raw"
            const resourceType = file.fileType === "image" ? "image" : "raw";

            // ✅ Delete file from Cloudinary
            await cloudinary.uploader.destroy(publicId, {
              resource_type: resourceType,
            });
          } catch (err) {
            console.error("Failed to delete file from Cloudinary:", err);
          }
        })
      );
    }

    res.json({
      message: "Book and associated files deleted successfully",
      deletedBook: doc,
    });
  } catch (err) {
    console.log("Error deleting book:", err);
    res.status(500).json({ message: "Failed to delete book", error: err });
  }
};

// Controller method to delete all books
exports.deleteAll = async (req, res) => {
  try {
    // Delete all books in a single operation
    const result = await Book.deleteMany();

    // Send a success response with the result
    res.status(200).json({
      message: "All books have been deleted.",
      deletedCount: result.deletedCount, // Number of deleted documents
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting books.", error });
  }
};

//
//
//
//
//

let storage; // Declare storage globally for this file

exports.setStorage = (megaStorage) => {
  storage = megaStorage; // Assign the storage object passed from index.js
};

exports.addBookWithFiles = async (req, res) => {
  try {
    console.log("Form data:", req.body);
    console.log("Uploaded files:", req.files);

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // ✅ Upload files to Cloudinary with correct resource type
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const resourceType = file.mimetype.startsWith("image/")
            ? "image"
            : "raw";

          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType }, // Set correct type (image or raw)
            (error, uploadedFile) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  originalName: file.originalname,
                  cloudinaryUrl: uploadedFile.secure_url, // Correct Cloudinary URL
                  fileSize: file.size,
                  fileType: resourceType, // Save type (image/raw)
                });
              }
            }
          );

          uploadStream.end(file.buffer);
        });
      })
    );

    console.log("Uploaded Files Info:", uploadedFiles);

    // ✅ Combine form data with file information
    const bookData = {
      ...req.body,
      files: uploadedFiles,
    };

    // ✅ Save the book data in the database
    const book = new Book(bookData);
    await book.save();

    res.json({
      message: "Book and files uploaded successfully!",
      book: bookData,
    });
  } catch (error) {
    console.error("Error saving book:", error);
    res.status(500).json({ message: "Failed to upload book data.", error });
  }
};
