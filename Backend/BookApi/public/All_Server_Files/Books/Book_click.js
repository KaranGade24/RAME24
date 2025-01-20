const model = require("../../../../../Backend/BookApi/model/book");
const Book = model.book;

exports.renderBookPage = async (req, res) => {
  try {
    const bookId = req.params.id; // Get the book ID from the request parameters
    const bookData = await Book.findById(bookId); // Find the book by ID in the database

    if (!bookData) {
      return res.status(404).send("Book not found");
    }
    // "/mega-cloud/" + book.files[0]?.megaName ||
    // "../images/DefaultBookCover.png"

    const imagePath =
      "/mega-cloud/" +
      (bookData.files[0]?.megaName || "../upload/default-book-cover.jpg");
    const eBookPath = "/mega-cloud/" + bookData.files[1]?.megaName;
    console.log(eBookPath);

    // Generate HTML dynamically for the selected book
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="${
            bookData.name || "Book Details"
          } - Published by RAME Publishers"
        />
        <title>RAME Association - ${bookData.name || "Book"} </title>
        <style>
          /* General Styles */
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }

          /* Header */
          .header {
            background: #007bff;
            color: #fff;
            padding: 15px 0;
          }
          .header .container {
            max-width: 1100px;
            margin: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
          }
          .header h1 {
            margin: 0;
          }
          .nav-links {
            list-style: none;
            display: flex;
            flex-wrap:wrap;
            padding: 0;
            margin: 0;
          }
          .nav-links li {
            margin-left: 15px;
            padding:4px 0px;
          }
          .nav-links a {
            color: #fff;
          }

          /* Main Container */
          .main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px auto;
            padding: 20px;
            max-width: 900px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          /* Book Details */
          .book-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .book-card img {
            max-width: 300px;
            height: auto;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          }
          .book-info {
            text-align: left;
            margin-top: 20px;
            width: 100%;
          }
          .book-info h2 {
            margin: 10px 0;
            color: #007bff;
            text-align: center;
          }
          .book-info p {
            margin: 10px 0;
          }

          /* Purchase Buttons */
          .purchase-buttons {
            margin-top: 20px;
            text-align: center;
          }
          .purchase-buttons .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s ease;
          }
          .purchase-buttons .btn:hover {
            background: #0056b3;
          }

          /* Footer */
          .footer {
            background: #333;
            color: #fff;
            text-align: center;
            padding: 20px 0;
            margin-top: 30px;
          }
          .footer .container {
            max-width: 1100px;
            margin: auto;
            padding: 0 20px;
          }
          .footer p {
            margin: 0;
          }
            @media (max-width:590px) {
                .book-card img{
                max-width:200px;
}
            }
        </style>
      </head>
      <body>
        <!-- Header -->
        <header class="header">
          <div class="container">
            <h1>RAME Publishers</h1>
            <nav>
              <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/books">Books</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/account">My Account</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-container">
          <div class="book-card">
            <img 
              src="${imagePath}" 
              alt="${bookData.name || "Book Cover"}" 
            />
            <h2>${bookData.name || "Book Name"}</h2>
          </div>

          <div class="book-info">
            <p><strong>ISBN:</strong> ${
              bookData.isbn || "ISBN not available"
            }</p>
            <p><strong>Published Date:</strong> ${
              bookData.year || "Date not available"
            }</p>
            <p><strong>Abstract:</strong> ${
              bookData.Abstraction || "Abstract coming soon."
            }</p>
            <p><strong>Description:</strong> ${
              bookData.description || "Description coming soon."
            }</p>
            <p><strong>Genre:</strong> ${
              bookData.genre || "Genre not available"
            }</p>
            <hr />
           
            <h3>Editor's Information</h3>
            <p><strong>Editor:</strong> ${
              bookData.editor || "Dr. Manoj A. Kumbhalkar"
            }</br>
            Email:<a href="mailto:${bookData.editorEmail}">${
      bookData.editorEmail
    }</a></p>

            <h3>Co-Editors Information</h3>
            <p>${
              bookData.coEditors ||
              "Dr. Radheshyam H. Gajghat, Dr. Kishor S. Rambhad"
            }<br />
            Members, Research Association of Masters of Engineering, India.</p>
<br/><br/><hr/>
            <p><strong>Rights and Permissions:</strong><br />
              All rights to this abstract book are reserved. No permission is given for any part of this book to be reproduced, transmitted in any form or means; electronic or mechanical, stored in a retrieval system, photocopied, recorded, scanned, or otherwise. Any of these actions require the proper written permission of the editor.
            </p>

            <h3>Pricing</h3>
            <p><strong>eBook (PDF):</strong> ₹${
              bookData.ebookPrice || 350
            }<br />
            <strong>Print Book:</strong> ₹${
              bookData.printPrice || 850
            } (Free Shipping)</p>
          </div>

          <!-- Purchase Buttons -->
          <div class="purchase-buttons">
            <a href="/purchase/${
              bookData._id
            }" target = "_blank"  class="btn">Purchase Book</a>


            <a href="${eBookPath}"  target = "_blank" class="btn">Download-ebook</a>
          </div
        </main>

        <!-- Footer -->
        <footer class="footer">
          <div class="container">
            <p>&copy; 2024 RAME Publishers. All Rights Reserved.</p>
          </div>
        </footer>
      </body>
    </html>`;

    res.send(html); // Send the generated HTML to the client
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
