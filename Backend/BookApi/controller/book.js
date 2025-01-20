const model = require("../model/book");
const Book = model.book;

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

exports.updateBookData = async (req, res) => {
  try {
    // Log the form data and uploaded files for debugging purposes
    console.log("Form data:", req.body);
    console.log("Uploaded files:", req.files);

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map((file) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          return new Promise((resolve, reject) => {
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
        })
      );

      // Add the files to the book data
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
      new: true,
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
    const doc = await Book.findOneAndDelete({ _id: id });
    res.json(doc);
  } catch (err) {
    console.log(err);
    res.send(err);
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

    // Map uploaded files to the desired format
    const uploadedFiles = await Promise.all(
      files.map((file) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        return new Promise((resolve, reject) => {
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
      })
    );

    console.log("Uploaded Files Info:", uploadedFiles);

    // Combine form data with file information
    const bookData = {
      ...req.body,
      files: uploadedFiles,
    };

    // Save the book data in the database
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
