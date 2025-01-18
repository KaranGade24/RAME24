const model = require("../model/book");
const Book = model.book;

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
      const uploadedFiles = req.files.map((file) => ({
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
      }));

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
  const books = await Book.find();

  books.map(async (book) => {
    const id = book._id;
    const doc = await Book.findByIdAndDelete(id);
    console.log(doc);
    res.send(doc);
  });
};

//
//
//
//
//

exports.addBookWithFiles = async (req, res) => {
  try {
    console.log("Form data:", req.body);
    console.log("Uploaded files:", req.files);

    // Map uploaded files to the desired format
    const uploadedFiles = req.files.map((file) => ({
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
    }));

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
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error saving book:", error);
    res.status(500).json({ message: "Failed to upload book data." });
  }
};
