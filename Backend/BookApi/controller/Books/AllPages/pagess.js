// Suggested code may be subject to a license. Learn more: ~LicenseLog:1718314610.
const model = require("../../../model/book");
const Book = model.book;

exports.recentBooksPage = (req, res) => {
  res.render("Book/recentBookPages/recentBookPage");
};
