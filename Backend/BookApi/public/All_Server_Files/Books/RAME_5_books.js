const model = require("../../../model/book");
const Book = model.book;

exports.read5book = async (req, res) => {
  try {
    // Fetch 5 books from the database
    const bookData = await Book.find().limit(5).sort({ date: -1 });
    var msg = "",
      viewMore = "",
      viewAllBooksPath = "";

    if (!bookData[0]) {
      msg = "Books are not available";
      viewMore = "";
      viewAllBooksPath = "/books";
    } else {
      msg = "Recent Books";
      viewMore =
        '<a href = "/books/1"  <div class= "view-more"><button>View More</button></div></a>';
      viewAllBooksPath = "/books/1";
    }
    // console.log(viewMore);

    // console.log(msg,bookData);

    const RAME_book_style = "RAME_book_style.css";

    // Generate HTML for books dynamically

    // bookData.map((book) => {
    //   console.log("../uploads" + book.files[0]?.filePath.split("/uploads")[1]);
    // });
    // var count = 0;
    const booksHtml = bookData
      .map(
        (book) => `
        <article class="book">
        <a style="
    color: black;
    text-decoration: none;
"  href="/book/${book._id}">
          <img
            src="${
              "/mega-cloud/" + book.files[0]?.megaName ||
              "../images/DefaultBookCover.png"
            }"
            alt="${book.name} Cover"
           width:"100%"
          />
          <div>
            <h3>${book.name}</h3>
            <p><strong>Genre:</strong> ${book.genre}</p>
            <p><strong>Published:</strong> ${book.year}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Description:</strong> ${book.description}</p>
          </div>
        </article> </a>`
      )
      .join("");

    // Complete HTML response
    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="RAME Books - International Publisher of Technical Books in Science and Technology."
        />
        <title>RAME Association - Books</title>
       <link rel="stylesheet" href="/All_Server_Files/Books/RAME_5_book_style.css">

      </head>
      <body>
        <header class="header">
          <div class="container">
            <h1>RAME Books</h1>
            <nav>
              <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#recent-books">Recent Books</a></li>
                <li><a href="#authors">For Authors</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>


        <div class="banner">
          <img
            src="https://www.rame.org.in/books/ramebooks_banner.jpg"
            alt="RAME Books Banner"
          />
        </div>

        <main>
          <section id="about" class="section">
            <div class="container">
              <h2>About RAME Books</h2>
              <p>
                <strong> RAME Books </strong>is an international book publisher
                publishes all technical books, conference abstract books, and
                proceedings with an ISBN number. It is a subscription-based online
                peer-reviewed platform that publishes technical books and book
                chapters in the discipline of science and technology, which
                emphasises new research and development for applications.
              </p>
              <p>
                Book chapters for publication are selected through peer review to
                ensure originality, relevance, and readability. All submitted
                chapters will be previously unpublished research results,
                experimental or theoretical. Books or book chapters will follow the
                style of the journal and are subject to both review and editing. The
                mode of language is English.
              </p>
            </div>
          </section>

          <section id="features" class="section">
            <div class="container">
              <h2>Features</h2>
              <ul>
                <li>
                  <strong>Plagiarism Check:</strong> All submitted chapters are
                  checked for plagiarism by the well-known iThenticate/Plagiarism
                  Checker X plagiarism software.
                </li>
                <br />
                <li>
                  <strong>DOI Assignment:</strong> Accepted works receive unique DOI
                  numbers indexed by Crossref.
                </li>
                <br />
                <li>
                  <strong>Online Purchase:</strong> Published books can be purchased
                  from the website online and a printed book with a soft or hard
                  cover will be delivered to the address given.
                </li>
                <br />
                <li>
                  <strong>Full Archive Access:</strong> Every volume of the book
                  published by RAME Books is available online for purchase up to the
                  latest published issue.
                </li>
              </ul>
            </div>
          </section>

          <section id="recent-books" class="section">
            <div class="container">
              <h2>${msg}</h2>
              ${booksHtml}
            </div>

      
${viewMore}

          </section>


          <section class="publishing-with">
            <h2>Publishing With</h2>
            <div class="all-publishing-cards">
              <div class="publishing-card">
                <img
                  src="https://www.rame.org.in/images/logo/crossref.jpg"
                  alt="CrossRef Logo"
                />
              </div>
              <div class="publishing-card">
                <img
                  src="https://www.rame.org.in/images/logo/Open-Access-logo1.png"
                  alt="Open Access Logo"
                />
              </div>
              <div class="publishing-card">
                <img
                  src="https://www.rame.org.in/images/scholar_logo_md_2011.gif"
                  alt="Google Scholar Logo"
                />
              </div>
              <div class="publishing-card">
                <img
                  src="https://www.rame.org.in/images/logo/88x31.png"
                  alt="Indexed Platform Logo"
                />
              </div>
            </div>
          </section>

          <section id="authors" class="section">
            <div class="container">
              <h2>For Authors</h2>
              <div class="author-cards">
                <div class="author-card">
                  <h3>Aim and Scope</h3>
                <a href=""  <p>Discover the vision and mission behind our publications.</p></a>
                </div>
                <div class="author-card">
                  <h3>Editorial Board</h3>
                 <a href="" <p>Meet the experts behind our peer-review process.</p></a>
                </div>
                <div class="author-card">
                  <h3>Author's Guidelines</h3>
                 <a href = "" ><p>Follow the steps to prepare your manuscript for submission.</p></a>
                </div>
                <div class="author-card">
                  <h3>Publication Ethics</h3>
                 <a href=""> <p>Learn about our ethical standards for publication.</p></a>
                </div>
                <div class="author-card">
                  <h3>Publication Policies</h3>
                 <a href=""> <p>Understand the policies we follow for all publications.</p></a>
                </div>
                <div class="author-card">
                  <h3>Processing Charges</h3>
                 <a href=""> <p>Details about charges associated with publishing.</p></a>
                </div>
                <div class="author-card">
                  <h3>Call for Paper</h3>
                 <a href=""> <p>Submit your research for our upcoming publications.</p></a>
                </div>
                <div class="author-card">
                  <h3>FAQS</h3>
                 <a href=""> <p>Find answers to frequently asked questions.</p></a>
                </div>
                <div class="author-card">
                  <h3>View all Books</h3>
                  <a href="${viewAllBooksPath}"> <p>Browse the full catalog of our published books.</p></a>

                </div>
              </div>
            </div>
          </section>

          <section id="contact" class="section">
            <div class="container">
              <h2>Contact Us</h2>
              <p>
                For inquiries and support, please reach out via our official email
                or contact form on our website.
              </p>
            </div>
          </section>
        </main>

        <footer class="footer">
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
