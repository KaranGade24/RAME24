const model = require("../../../model/book");
const Book = model.book;

exports.readBooks = async (req, res) => {
  try {
    // Set the number of books to display per page
    const booksPerPage = 10;
    const page = +req.params.pages || 1; // Default to the first page if no page query is provided

    // Fetch books for the current page from the database
    const bookData = await Book.find()
      .skip((page - 1) * booksPerPage)
      .limit(booksPerPage)
      .sort({ date: -1 });

    // Get total number of books for pagination
    const totalBooks = await Book.countDocuments();

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    // If there are no books or the page number is invalid, show the "Books Not Found" page
    if (bookData.length === 0 || page > totalPages || page < 1) {
      return res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="No books found - RAME Books" />
    <title>RAME Association - Book not found</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f4f4;
      }

      .container {
        text-align: center;
        max-width: 600px;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #ff6347;
        font-size: 36px;
        margin-bottom: 20px;
      }

      p {
        font-size: 18px;
        color: #555;
        margin-bottom: 30px;
      }

      .btn {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        text-decoration: none;
        display: inline-block;
      }

      .btn:hover {
        background-color: #0056b3;
      }

      @media (max-width: 600px) {
        h1 {
          font-size: 28px;
        }
        p {
          font-size: 16px;
        }
        .btn {
          padding: 8px 16px;
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Oops! No Books Found</h1>
      <p>It looks like the page you are looking for does not exist or has no books. Please check the page number and try again.</p>
      <a href="/books/" class="btn">Go Back to Books List</a>
    </div>
  </body>
</html>`);
    }

    // Generate HTML for books dynamically
    const booksHtml = bookData

      .map(
        (book) =>
          `
    <article class="book">
      <a style="
    color: black;
    text-decoration: none;
"  href="/book/${book._id}">
        <img
          src="${book.files[0]?.cloudinaryUrl}"
          alt="${book.name} Cover"
          width="100%"
        />
        <div>
          <h3>${book.name}</h3>
          <p><strong>Genre:</strong> ${book.genre}</p>
          <p><strong>Published:</strong> ${book.year}</p>
          <p><strong>ISBN:</strong> ${book.isbn}</p>
          <p><strong>Description:</strong> ${book.description}</p>
        </div>
      </a>
    </article>`
      )
      .join("");

    // Create the pagination links
    let paginationHtml = "";
    if (page > 1) {
      paginationHtml += `<a href="/books/${
        page - 1
      }" class="pagination-link">Previous</a>`;
    }

    if (page < totalPages) {
      paginationHtml += `<a href="/books/${
        page + 1
      }" class="pagination-link">Next</a>`;
    }

    const metaTags = bookData.map((book) => {
      return `<!-- Meta Tags for Book ${book.name} -->
        <meta name="title" content="${book.name} - RAME Publishers" />
        <meta name="description" content="${book.description}" />
        <meta name="keywords" content="${book.keywords.join(", ")}, ${
        book.name
      }" />
        <meta name="author" content="${book.editor}" />
        <meta name="publisher" content="RAME Publishers" />
        <meta name="genre" content="${book.genre}" />
        <meta name="robots" content="index, follow" />
    
        <meta property="og:type" content="book" />
        <meta property="og:title" content="${book.name}" />
        <meta property="og:description" content="${book.description}" />
        <meta property="og:image" content="${book.files[0].cloudinaryUrl}" />
        <meta property="og:url" content="/book/${book._id}" />
    
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${book.name}" />
        <meta name="twitter:description" content="${book.description}" />
        <meta name="twitter:image" content="${book.files[0].cloudinaryUrl}" />
        <link rel="canonical" href="/book/${book._id}" />
      `;
    }).join("");

    // Complete HTML response with pagination and responsive styles
    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        ${metaTags}
        <title>RAME Assciation - Books</title>
        <link rel="stylesheet" href="/All_Server_Files/Books/RAME_5_book_style.css">
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
          }
         
          .pagination-link {
            text-decoration: none;
            padding: 8px 16px;
            margin: 5px;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
          }

          .pagination-link:hover {
            background-color: #0056b3;
          }

          header {
            background-color: #333;
            color: white;
            padding: 15px 0;
          }

          header h1 {
            margin: 0;
            text-align: center;
          }

          nav ul {
            list-style-type: none;
            padding: 0;
            display: flex;
            justify-content: center;
          }

          nav ul li {
            margin: 0 10px;
          }

          nav ul li a {
            color: white;
            text-decoration: none;
          }

          .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 0;
          }

          .book {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .book img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }

          .book h3 {
            font-size: 24px;
            margin-top: 10px;
          }

          .pagination {
            text-align: center;
            margin-top: 20px;
          }
            .page-no{
            // color:red;
            font-size:1.1rem;
            font-weight:bloder;
            }

          footer {
            background-color: #333;
            color: white;
            padding: 20px 0;
            text-align: center;
          }

          footer .footer-container {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
          }

          footer .footer-section {
            width: 200px;
            margin-bottom: 20px;
          }

          footer .footer-section h3 {
            margin-bottom: 10px;
          }

          footer .footer-section ul {
            list-style-type: none;
            padding: 0;
          }

          footer .social-icons {
            display: flex;
            justify-content: space-around;
          }

          footer .social-icons a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
            font-size: 20px;
          }

          @media (max-width: 768px) {
            .pagination-link {
              padding: 6px 12px;
              font-size: 14px;
            }

            .book {
              flex-direction: column;
              padding: 10px;
            }

            .book img {
              max-width: 100%;
              margin-bottom: 10px;
            }

            .footer-container {
              flex-direction: column;
              align-items: center;
            }

            header h1 {
              font-size: 24px;
            }

            nav ul {
            align-items: center;
              flex-direction: column;
            }

            nav ul li {
              margin: 10px 0;
            }
          }

          @media (max-width: 480px) {
            .book h3 {
              font-size: 20px;
            }

            footer .footer-section {
              width: 70%;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>RAME Books</h1>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="/5-books">Recent Books</a></li>
                <li><a href="#authors">For Authors</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <main>
          <section id="all-books" class="section">
            <div class="container">
              <h2>All Books</h2>
              ${booksHtml}
            </div>
            <div class="pagination">
              ${paginationHtml}
            </div>
            <div class = "page-no pagination"><p>Page No: ${page}</p></div>
          </section>
        </main>

        <footer>
          <div class="footer-container">
            <div class="footer-section">
              <h3>About RAME Publishers</h3>
              <ul>
                <li><a href="#about-us">About Us</a></li>
                <li><a href="#author-guidelines">Author Guidelines</a></li>
                <li><a href="#publishing">Publishing Conference Paper</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Help & Contact</h3>
              <ul>
                <li><a href="#help-overview">Help Overview</a></li>
                <li><a href="#faqs">FAQs</a></li>
                <li><a href="#privacy-policy">Privacy Policy</a></li>
                <li><a href="#terms">General Terms & Conditions</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Address</h3>
              <p>
                RAME Publishers<br />
                33, Mandarkrupa Soc., Narsala Road,<br />
                Nagpur-440034, Maharashtra, India<br />
                <strong>Email:</strong>
                <a href="mailto:publisher@rame.org.in">publisher@rame.org.in</a>
              </p>
            </div>
            <div class="footer-section">
              <h3>Follow Us</h3>
              <div class="social-icons">
                <a href="#facebook">F</a>
                <a href="#twitter">T</a>
                <a href="#linkedin">L</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 RAME Publishers. All Rights Reserved.</p>
          </div>
        </footer>
      </body>
    </html>`;

    res.send(html);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Internal Server Error");
  }
};
