const model = require("../../../model/conference");
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

    const metaTags = conferences
      .map((conference) => {
        return `
    <!-- Meta Tags for Conference: ${conference?.title} -->
    <meta name="title" content="${conference?.title} - RAME Conferences" />
    <meta name="description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta name="keywords" content="${
      conference?.keywords
        ? conference.keywords.join(", ")
        : "conference, RAME, research, engineering"
    }" />
    <meta name="author" content="${
      conference?.organizers || "RAME Association"
    }" />
    <meta name="publisher" content="RAME Publishers" />
    <meta name="robots" content="index, follow" />
    <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" /> <!-- For rich snippets and previews -->
  
    <!-- Google Scholar Metadata -->
    <meta name="citation_title" content="${conference?.title}" />
    <meta name="citation_author" content="${
      conference?.organizers || "RAME Association"
    }" />
    <meta name="citation_publication_date" content="${
      conference?.conferenceStartDate.split("T")[0]
    }" />
    <meta name="citation_conference_title" content="${conference?.title}" />
    <meta name="citation_doi" content="${conference?.doi || "N/A"}" />
    <meta name="citation_publisher" content="RAME Publishers" />
  
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="conference" />
    <meta property="og:title" content="${conference?.title}" />
    <meta property="og:description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta property="og:image" content="${
      conference?.conferenceBanner?.cloudinaryUrl
    }" />
    <meta property="og:url" content="/conference/${conference?._id}" />
  
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${conference?.title}" />
    <meta name="twitter:description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta name="twitter:image" content="${
      conference?.conferenceBanner?.cloudinaryUrl
    }" />
    <link rel="canonical" href="/conference/${conference?._id}" />
  
    <!-- Additional SEO Meta Tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <meta name="robots" content="index, follow, noarchive, noodp" />
    <meta name="language" content="English" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />
    <meta name="geo.position" content="28.6139;77.2090" />
    <meta name="ICBM" content="28.6139, 77.2090" />
    <meta name="theme-color" content="#000000" /> <!-- Optimizing for mobile browsers -->
  
    <!-- Additional Open Graph Tags for SEO -->
    <meta property="og:site_name" content="RAME Conferences" />
    <meta property="og:locale" content="en_US" />
  
    <!-- Schema.org for Google -->
    <script type="application/ld+json">
    {
      "@context": "http://schema.org",
      "@type": "Event",
      "name": "${conference?.title}",
      "startDate": "${conference?.conferenceStartDate.split("T")[0]}",
      "endDate": "${conference?.conferenceEndDate.split("T")[0]}",
      "location": {
        "@type": "Place",
        "name": "Conference Venue",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "${
            conference?.venueDetails || "Venue not provided"
          }",
          "addressLocality": "Online",
          "addressRegion": "India",
          "postalCode": "110001",
          "addressCountry": "IN"
        }
      },
      "description": "${
        conference?.abstract || "Details about the conference."
      }",
      "image": "${conference?.conferenceBanner?.cloudinaryUrl}",
      "organizer": {
        "@type": "Organization",
        "name": "RAME Association"
      }
    }
    </script>
  `;
      })
      .join("");

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
    ${metaTags}
    <title>RAME Association - Conferances</title>
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

    const upcomingMetaTags = upcomingConferences
      ?.map((conference) => {
        return `
    <!-- Meta Tags for Conference: ${conference?.title} -->
    <meta name="title" content="${conference?.title} - RAME Conferences" />
    <meta name="description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta name="keywords" content="${
      conference?.keywords
        ? conference.keywords.join(", ")
        : "conference, RAME, research, engineering"
    }" />
    <meta name="author" content="${
      conference?.organizers || "RAME Association"
    }" />
    <meta name="publisher" content="RAME Publishers" />
    <meta name="robots" content="index, follow" />
    <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" /> <!-- For rich snippets and previews -->
  
    <!-- Google Scholar Metadata -->
    <meta name="citation_title" content="${conference?.title}" />
    <meta name="citation_author" content="${
      conference?.organizers || "RAME Association"
    }" />
    <meta name="citation_publication_date" content="${
      conference?.conferenceStartDate.split("T")[0]
    }" />
    <meta name="citation_conference_title" content="${conference?.title}" />
    <meta name="citation_doi" content="${conference?.doi || "N/A"}" />
    <meta name="citation_publisher" content="RAME Publishers" />
  
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="conference" />
    <meta property="og:title" content="${conference?.title}" />
    <meta property="og:description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta property="og:image" content="${
      conference?.conferenceBanner?.cloudinaryUrl
    }" />
    <meta property="og:url" content="/conference/${conference?._id}" />
  
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${conference?.title}" />
    <meta name="twitter:description" content="${
      conference?.abstract ||
      "Discover all details about the conference on RAME Association."
    }" />
    <meta name="twitter:image" content="${
      conference?.conferenceBanner?.cloudinaryUrl
    }" />
    <link rel="canonical" href="/conference/${conference?._id}" />
  
    <!-- Additional SEO Meta Tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <meta name="robots" content="index, follow, noarchive, noodp" />
    <meta name="language" content="English" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />
    <meta name="geo.position" content="28.6139;77.2090" />
    <meta name="ICBM" content="28.6139, 77.2090" />
    <meta name="theme-color" content="#000000" /> <!-- Optimizing for mobile browsers -->
  
    <!-- Additional Open Graph Tags for SEO -->
    <meta property="og:site_name" content="RAME Conferences" />
    <meta property="og:locale" content="en_US" />
  
    <!-- Schema.org for Google -->
    <script type="application/ld+json">
    {
      "@context": "http://schema.org",
      "@type": "Event",
      "name": "${conference?.title}",
      "startDate": "${conference?.conferenceStartDate.split("T")[0]}",
      "endDate": "${conference?.conferenceEndDate.split("T")[0]}",
      "location": {
        "@type": "Place",
        "name": "Conference Venue",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "${
            conference?.venueDetails || "Venue not provided"
          }",
          "addressLocality": "Online",
          "addressRegion": "India",
          "postalCode": "110001",
          "addressCountry": "IN"
        }
      },
      "description": "${
        conference?.abstract || "Details about the conference."
      }",
      "image": "${conference?.conferenceBanner?.cloudinaryUrl}",
      "organizer": {
        "@type": "Organization",
        "name": "RAME Association"
      }
    }
    </script>
  `;
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

    const metaTags = pastFiveConferences
      .map((conference) => {
        return `
        <!-- Meta Tags for Conference: ${conference?.title} -->
        <meta name="title" content="${conference?.title} - RAME Conferences" />
        <meta name="description" content="${
          conference?.abstract ||
          "Discover all details about the conference on RAME Association."
        }" />
        <meta name="keywords" content="${
          conference?.keywords
            ? conference.keywords.join(", ")
            : "conference, RAME, research, engineering"
        }" />
        <meta name="author" content="${
          conference?.organizers || "RAME Association"
        }" />
        <meta name="publisher" content="RAME Publishers" />
        <meta name="robots" content="index, follow" />
        <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" /> <!-- For rich snippets and previews -->
      
        <!-- Google Scholar Metadata -->
        <meta name="citation_title" content="${conference?.title}" />
        <meta name="citation_author" content="${
          conference?.organizers || "RAME Association"
        }" />
        <meta name="citation_publication_date" content="${
          conference?.conferenceStartDate.split("T")[0]
        }" />
        <meta name="citation_conference_title" content="${conference?.title}" />
        <meta name="citation_doi" content="${conference?.doi || "N/A"}" />
        <meta name="citation_publisher" content="RAME Publishers" />
      
        <!-- Open Graph Meta Tags -->
        <meta property="og:type" content="conference" />
        <meta property="og:title" content="${conference?.title}" />
        <meta property="og:description" content="${
          conference?.abstract ||
          "Discover all details about the conference on RAME Association."
        }" />
        <meta property="og:image" content="${
          conference?.conferenceBanner?.cloudinaryUrl
        }" />
        <meta property="og:url" content="/conference/${conference?._id}" />
      
        <!-- Twitter Card Meta Tags -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${conference?.title}" />
        <meta name="twitter:description" content="${
          conference?.abstract ||
          "Discover all details about the conference on RAME Association."
        }" />
        <meta name="twitter:image" content="${
          conference?.conferenceBanner?.cloudinaryUrl
        }" />
        <link rel="canonical" href="/conference/${conference?._id}" />
      
        <!-- Additional SEO Meta Tags -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charset="UTF-8" />
        <meta name="robots" content="index, follow, noarchive, noodp" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />
        <meta name="theme-color" content="#000000" /> <!-- Optimizing for mobile browsers -->
      
        <!-- Additional Open Graph Tags for SEO -->
        <meta property="og:site_name" content="RAME Conferences" />
        <meta property="og:locale" content="en_US" />
      
        <!-- Schema.org for Google -->
        <script type="application/ld+json">
        {
          "@context": "http://schema.org",
          "@type": "Event",
          "name": "${conference?.title}",
          "startDate": "${conference?.conferenceStartDate.split("T")[0]}",
          "endDate": "${conference?.conferenceEndDate.split("T")[0]}",
          "location": {
            "@type": "Place",
            "name": "Conference Venue",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "${
                conference?.venueDetails || "Venue not provided"
              }",
              "addressLocality": "Online",
              "addressRegion": "India",
              "postalCode": "110001",
              "addressCountry": "IN"
            }
          },
          "description": "${
            conference?.abstract || "Details about the conference."
          }",
          "image": "${conference?.conferenceBanner?.cloudinaryUrl}",
          "organizer": {
            "@type": "Organization",
            "name": "RAME Association"
          }
        }
        </script>
      `;
      })
      .join("");

    const upcomingPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${upcomingMetaTags}
 ${metaTags}
  <title>RAME Association - Upcoming Conferances</title>
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
