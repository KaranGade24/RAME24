const model = require("../../../model/conferance");
const conferanceData = model.ConferenceSubmission;

exports.conferencePage = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the current page from query params
  const limit = 10; // Number of items per page
  const skip = (page - 1) * limit; // Calculate the number of items to skip

  try {
    const totalConferences = await conferanceData.countDocuments(); // Total number of conferences

    const conferences = await conferanceData
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Get paginated data

    const totalPages = Math.ceil(totalConferences / limit); // Calculate total pages

    const conferenceDivHtml = conferences
      .map((conference) => {
        return ` 
        <div class="card">
          <a href="/conference/${conference._id}">
            <div>
              <h3>${conference.title}</h3>
              <div class="cardInfo">
                <p><strong>Start date:</strong> ${
                  conference?.conferenceStartDate?.split("T")[0] +
                  ". Time: " +
                  conference?.conferenceStartDate?.split("T")[1]
                }</p>
                <p><strong>End date:</strong> ${
                  conference?.conferenceEndDate?.split("T")[0] +
                  ". Time: " +
                  conference?.conferenceEndDate?.split("T")[1]
                }</p>
                <p><strong>Publication:</strong> ${
                  conference.publicationInfo
                }</p>
                <p><strong>Indexed:</strong> ${conference.indexed}</p>
              </div>
            </div>
          </a>
        </div>`;
      })
      .join("");

    const conferencesShortcutHtml = conferences
      .map((conference) => {
        return `
        <ul>
  <li>
    <a href="/conference/${conference._id}">
      <h3>${conference.title}</h3>
    </a>
  </li>
</ul>

        `;
      })
      .join("");

    const conferencePageHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Research Association of Masters of Engineering (RAME)</title>
    <link rel="stylesheet" href="/All_Server_Files/conference/style.css" />
  </head>
  <body>
    <header>
      <h1>RAME Conferences</h1>
    </header>

    <nav>
      <a href="/">Home</a>
      <a href="/conferences">Upcoming Conferences</a>
      <a href="#">Publishing Support</a>
      <a href="/membership">Membership</a>
    </nav>

    <section id="conferences-align">
    <div id="conferences">
    <div class = "conferenceHeading">
      <h2>Conferences</h2>
      <h2 class="quick-search">Quick Search: </h2>
    </div
      <div>
      ${conferenceDivHtml}
      </div>
      <div class= "conferencesShortcut">
      ${conferencesShortcutHtml}
      </div>
      </div>
      </section>

    <div class="pagination">
      <button id="prevBtn" ${page <= 1 ? "disabled" : ""} onclick="changePage(${
      page - 1
    })">Previous</button>
      <button id="nextBtn" ${
        page >= totalPages ? "disabled" : ""
      } onclick="changePage(${page + 1})">Next</button>
    </div>

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

    <footer>
      <p>&copy; 2021 Research Association of Masters of Engineering</p>
    </footer>
    <script src="/All_Server_Files/conference/script.js"></script>
    <script>
      function changePage(newPage) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', newPage);
        window.location.href = url.toString();
      }
    </script>
  </body>
</html>`;

    res.send(conferencePageHtml);
  } catch (error) {
    res.status(500).send("An error occurred while generating the page.");
    console.error(error);
  }
};

// const model = require("../../../model/conferance");
// const conferanceData = model.ConferenceSubmission;

exports.upcomingConferencesPage = async (req, res) => {
  try {
    const now = new Date();
    const conferences = await conferanceData.find();
    // Filter for upcoming conferences
    const upcomingConferences = conferences
      .map((conference) => {
        const nowDate = new Date();
        const conferencedate = new Date(
          conference.conferenceStartDate.split("T")[0]
        );

        if (nowDate < conferencedate) {
          return `
      <a href = "/conference/${conference._id}">  <div class="card">
          <h3>${conference.title}</h3>
          <div class="cardInfo">
            <p><strong>Start date:</strong> ${
              conference?.conferenceStartDate?.split("T")[0]
            }</p>
            <p><strong>End date:</strong> ${
              conference?.conferenceEndDate?.split("T")[0]
            }</p>
            <p><strong>Publication:</strong> ${conference.publicationInfo}</p>
            <p><strong>Indexed:</strong> ${conference.indexed}</p>
          </div>
        </div></a>`;
        } else {
          return;
        }
      })
      .join("");

    // Filter for past 5 conferences
    const pastFiveConferences = await conferanceData
      .find()
      .sort({ createdAt: -1 });

    var fiveCounter = 0;
    const past5Conferences = pastFiveConferences
      .map((conference) => {
        const nowDate = new Date();
        const conferencedate = new Date(
          conference.conferenceStartDate.split("T")[0]
        );

        if (nowDate > conferencedate && fiveCounter < 5) {
          fiveCounter++;
          return `
          <a href = "/conference/${conference._id}"><div class="card">
          <h3>${conference.title}</h3>
          <div class="cardInfo">
            <p><strong>Start date:</strong> ${
              conference?.conferenceStartDate?.split("T")[0]
            }</p>
            <p><strong>End date:</strong> ${
              conference?.conferenceEndDate?.split("T")[0]
            }</p>
            <p><strong>Publication:</strong> ${conference.publicationInfo}</p>
            <p><strong>Indexed:</strong> ${conference.indexed}</p>
          </div>
        </div></a>`;
        } else {
          return;
        }
      })
      .join("");

    const upcomingPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAME Conferences</title>
  <link rel="stylesheet" href="/All_Server_Files/conference/upcomingConferenceStyle.css">
  
</head>
<body>
  <header>
    <h1>RAME Conferences</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/all-conferences">All Conferences</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>
  <main>
    <section class="featured">
      <h2>Featured Conference</h2>
      <p>Join us for the International Research, where innovation meets collaboration.</p>
    </section>
    <h2>Upcoming Conferences</h2>
    ${
      upcomingConferences.length > 0
        ? upcomingConferences
        : "<p>No upcoming conferences at the moment.</p>"
    }
    <h2>Past Conferences</h2>
    ${
      past5Conferences.length > 0
        ? past5Conferences
        : "<p>No past conferences available.</p>"
    }
<a href = "/all-conferences""<button class = "see-all-conferences-btn">See All Conferences</button></a>
  </main>
  <footer>
    <p>&copy; 2025 Research Association of Masters of Engineering</p>
    <p>
      Follow us:
      <a href="https://twitter.com" target="_blank">Twitter</a> |
      <a href="https://facebook.com" target="_blank">Facebook</a> |
      <a href="https://linkedin.com" target="_blank">LinkedIn</a>
    </p>
  </footer>
</body>
</html>`;
    res.send(upcomingPageHtml);
  } catch (error) {
    res.status(500).send("Error loading upcoming conferences.");
    console.error(error);
  }
};
