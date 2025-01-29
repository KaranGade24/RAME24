const model = require("../../../../../Backend/BookApi/model/book");
const Book = model.book;
// const api = "https://rame24.onrender.com";
const api = "https://8080-idx-rame24-1737798853897.cluster-fu5knmr55rd44vy7k7pxk74ams.cloudworkstations.dev";
exports.renderBookPage = async (req, res) => {
  try {
    const bookId = req.params.id; // Get the book ID from the request parameters
    const bookData = await Book.findById(bookId); // Find the book by ID in the database

    if (!bookData) {
      return res.status(404).send("Book not found");
    }
    // "/mega-cloud/" + book.files[0]?.megaName ||
    // "../images/DefaultBookCover.png"

    const imagePath = bookData.files[0]?.cloudinaryUrl;
    const eBookPath =bookData.files[1]?.cloudinaryUrl;
    console.log(bookData.files);
    const metaTags = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${bookData?.description || 'Explore this amazing book from RAME Publishers.'}" />
    <meta name="keywords" content="books, ${bookData.genre || ''}, ${
          bookData.name || ''
        }, publishing, ${bookData.editor || ''}, ebook, printed books, ${
          bookData.isbn || ''
        }, ${bookData.year || ''}" />
    <meta name="author" content="${bookData.editor || 'Unknown'}" />
    <meta name="publisher" content="RAME Publishers" />
    <meta name="book:isbn" content="${bookData.isbn || ''}" />
    <meta name="book:release_date" content="${bookData.year || ''}" />
    <meta name="book:price:ebook" content="₹${bookData.ebookPrice || '0'}" />
    <meta name="book:price:print" content="₹${bookData.printPrice || '0'}" />
    <meta name="book:format" content="eBook and Print" />
    <meta name="genre" content="${bookData.genre || ''}" />
    <meta name="language" content="en" />
    <meta name="robots" content="index, follow" />
    
    <!-- Open Graph (Facebook, LinkedIn) -->
    <meta property="og:type" content="book" />
    <meta property="og:title" content="${bookData.name || 'Book by RAME Publishers'}" />
    <meta property="og:description" content="${bookData.description || 'Explore this amazing book from RAME Publishers.'}" />
    <meta property="og:image" content="${imagePath || '/default-book-cover.jpg'}" />
    <meta property="og:url" content="${api + "/book/" + bookData._id}" />
    <meta property="og:site_name" content="RAME Publishers" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${bookData.name || 'Book by RAME Publishers'}" />
    <meta name="twitter:description" content="${bookData.description || 'Explore this amazing book from RAME Publishers.'}" />
    <meta name="twitter:image" content="${imagePath}" />
    <meta name="twitter:site" content="@RAME_Publishers" />
    <meta name="twitter:creator" content="@${bookData.editor || 'Unknown'}" />
    
    <!-- Google Scholar Metadata (Highwire Press Tags) -->
    <meta name="citation_title" content="${bookData.name || ''}" />
    <meta name="citation_author" content="${bookData.editor || ''}" />
    <meta name="citation_publication_date" content="${bookData.year || ''}" />
    <meta name="citation_publisher" content="RAME Publishers" />
    <meta name="citation_isbn" content="${bookData.isbn || ''}" />
    <meta name="citation_language" content="en" />
    <meta name="citation_pdf_url" content="${eBookPath || ''}" />
    <meta name="citation_abstract" content="${bookData.description || ''}" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="googlebot" content="index, follow" />
    <meta name="bingbot" content="index, follow" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#ffffff" />
    
    <!-- Canonical Link -->
    <link rel="canonical" href="${api + "/book/" + bookData._id}" />
    
    `;
    
    
    // Generate HTML dynamically for the selected book
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${metaTags}
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
            <p><strong>eBook (PDF):</strong> ₹${bookData.ebookPrice}<br />
            <strong>Print Book:</strong> ₹${
              bookData.printPrice
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
