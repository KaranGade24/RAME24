const model = require("../../../model/conference");
const conferanceData = model.ConferenceSubmission;

exports.singleConferencePage = async (req, res) => {
  try {
    const id = req.params.shortcutTitle.replace(/-/g, " ");
    console.log(id,"id is");
    const conferences = await conferanceData.find();
    const conference = conferences.find((conference) => conference.shortcutTitle === id);

    console.log(conference);

    const imagePath = conference?.conferenceBanner?.cloudinaryUrl;
    console.log(imagePath);

    const metaTags = `
    <!-- Meta Tags for Conference: ${conference?.title} -->
    <meta name="title" content="${conference?.title} - RAME Conferences" />
    <meta name="description" content="${conference?.abstract || 'Discover all details about the conference on RAME Association.'}" />
    <meta name="keywords" content="${conference?.keywords ? conference.keywords.join(', ') : 'conference, RAME, research, engineering'}" />
    <meta name="author" content="${conference?.organizers || 'RAME Association'}" />
    <meta name="publisher" content="RAME Publishers" />
    <meta name="robots" content="index, follow" />
    <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" /> <!-- For rich snippets and previews -->
  
    <!-- Google Scholar Metadata -->
    <meta name="citation_title" content="${conference?.title}" />
    <meta name="citation_author" content="${conference?.organizers || 'RAME Association'}" />
    <meta name="citation_publication_date" content="${conference?.conferenceStartDate.split('T')[0]}" />
    <meta name="citation_conference_title" content="${conference?.title}" />
    <meta name="citation_doi" content="${conference?.doi || 'N/A'}" />
    <meta name="citation_publisher" content="RAME Publishers" />
  
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="conference" />
    <meta property="og:title" content="${conference?.title}" />
    <meta property="og:description" content="${conference?.abstract || 'Discover all details about the conference on RAME Association.'}" />
    <meta property="og:image" content="${conference?.conferenceBanner?.cloudinaryUrl}" />
    <meta property="og:url" content="/conference/${conference?.shortcutTitle.replace(/\s+/g, "-")}" />
  
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${conference?.title}" />
    <meta name="twitter:description" content="${conference?.abstract || 'Discover all details about the conference on RAME Association.'}" />
    <meta name="twitter:image" content="${conference?.conferenceBanner?.cloudinaryUrl}" />
    <link rel="canonical" href="/conference/${conference?.shortcutTitle.replace(/\s+/g, "-")}" />
  
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
      "startDate": "${conference?.conferenceStartDate.split('T')[0]}",
      "endDate": "${conference?.conferenceEndDate.split('T')[0]}",
      "location": {
        "@type": "Place",
        "name": "Conference Venue",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "${conference?.venueDetails || 'Venue not provided'}",
          "addressLocality": "Online",
          "addressRegion": "India",
          "postalCode": "110001",
          "addressCountry": "IN"
        }
      },
      "description": "${conference?.abstract || 'Details about the conference.'}",
      "image": "${conference?.conferenceBanner?.cloudinaryUrl}",
      "organizer": {
        "@type": "Organization",
        "name": "RAME Association"
      }
    }
    </script>
  `;
  
  


    const singleConferencePageHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
${metaTags}
    <title>RAME Association - ${
      conference?.shortcutTitle || "RAME Conferance"
    }</title>
    <link rel="icon" type="image/png" href="https://th.bing.com/th?id=OIP.4ODzmrtz6jvopPie4ZrBwQHaGh&w=80&h=80&c=1&vt=10&bgcl=f53f20&r=0&o=6&pid=5.1">
<link rel="stylesheet" href="/All_Server_Files/conference/singleConference.css">
  </head>
  <body>
    <header>
      <h1>
       ${conference?.title}
      </h1>
    </header>

    <nav>
      <a href="/">Home</a>
      <a href="/conferences">Upcoming Conferences</a>
      <a href="/all-conferences">All Conferences</a>
      <a href="/conference/${conference.shortcutTitle.replace(/\s+/g, "-")}/service">Call for Paper</a>
      <a href="#">All Conferences</a>
    </nav>

    <main>
      <section id="ConferenceSummary">
        <div class="conference-banner-img">
          <img
            src="${imagePath}"
            alt="Conference Banner"
          />
        </div>
        <div class="organizer-heading">
          <h2>Organized by</h2>
          <h3>RESEARCH ASSOCIATION OF MASTERS OF ENGINEERING (RAME)</h3>
        </div>
      </section>
<section class = "conference-abstract">
<h3>${conference.shortcutTitle}</h3>
<div calss = "abstract">${conference.abstract} </div>
</section>
      <section class="conference-details">
        <h3>Conference Details</h3>
        <div class="details-grid">
          <div class="details-box">
            <h4>Title</h4>
            <p style="font-size: 1.2rem;font-weight: 600;">
              ${conference?.title || "Title Not found!"}
            </p>
          </div>
          <div class="details-box">
            <h4>Publication info</h4>
            <p>${conference?.publicationInfo}</p>
          </div>
          <div class="details-box">
            <h4>Dates</h4>
            <p>
              Start Date: ${
                conference?.conferenceStartDate.split("T")[0]
              } <br />
              End Date: ${conference?.conferenceEndDate.split("T")[0]}
            </p>
          </div>
          <div class="details-box">
            <h4>Organizers</h4>
            <p>
             ${conference?.organizers}
            </p>
          </div>
          <div class="details-box">
            <h4>Email</h4>
            <p>${conference?.email}</p>
          </div>
          <div class="details-box">
            <h4>Contact</h4>
            <p>Phone: ${conference?.phone}</p>
          </div>
        <!--  <div class="details-box">
            <h4>Keywords: </h4>
            <p>${conference?.keywords}</p>
          </div>-->
            
        <div class="details-box">
            <h4>Venue Details </h4>
            <p>${conference?.venueDetails}</p>
          </div>
        </div>
      </section>

      <section class="info-section">
        <div class="info-card">
          <div class="icon">📄</div>
          <h4>Presentation Schedule</h4>
          <p>Stay updated with the latest presentation schedule.</p>
          <a
            href=${conference?.presentationScheduleFile?.cloudinaryUrl}
         target="_blank" >
            Download Schedule
          </a>
          
        </div>
        <div class="info-card">
          <div class="icon">📅</div>
          <h4>Program Schedule</h4>
          <p>Explore the complete conference program in detail.</p>
          <a
            href=${conference?.programScheduleFile?.cloudinaryUrl}
            target="_blank"
          >
            Download Program
          </a>
        
        </div>
        <div class="info-card">
          <div class="icon">📚</div>
          <h4>Presentation Guidelines</h4>
          <p>Follow the guidelines to ensure effective presentations.</p>
          <a
            href=${conference?.presentationGuidelinesFile?.cloudinaryUrl}
         target="_blank" >
            Download Guidelines
          </a>
        </div>
        <div class="info-card">
          <div class="icon">🖹</div>
          <h4>PPT Format</h4>
          <p>Download the official PPT format for your presentation.</p>
          <a
            href=${conference?.pptFormatFile?.cloudinaryUrl}
         target="_blank" >
            Download Format
          </a>
          <div class="details">Format: PowerPoint</div>
        </div>




      <!--  <div class="info-card">
          <div class="icon">📘</div>
          <h4>Paper Submission</h4>
          <p>Submit your paper following the conference guidelines.</p>
          <a
            href="/workspaces/RamePublisher6630/Backend/BookApi/public/uploads/1737014368305.JPG"
            target="_blank"
          >
            Download Paper
          </a>
          <div class="details">Deadline: Jan 20, 2025</div>
        </div>

        <div class="info-card">
          <div class="icon">📍</div>
          <h4>Venue Details</h4>
          <p>Find detailed information about the conference venue.</p>
          <a href="#">Explore Venue</a>
          <div class="details">Location: Online Platform</div>
        </div>
        <div class="info-card">
          <div class="icon">🔖</div>
          <h4>Registration Info</h4>
          <p>Register now to confirm your participation.</p>
          <a href="#">Register Here</a>
          <div class="details">Fees: $200</div>
        </div>
        <div class="info-card">
          <div class="icon">💡</div>
          <h4>Publication Details</h4>
          <p>Discover where the proceedings will be published.</p>
          <a href="#">View Details</a>
          <div class="details">Material Today: Elsevier</div>
        </div>-->



      </section>
    </main>

    <footer>
      <p>&copy; 2024 RAME Conferences. All rights reserved.</p>
    </footer>
  </body>
</html>

`;

    res.send(singleConferencePageHtml);
  } catch (error) {
    res.status(500).send("Error loading upcoming conferences.");
    console.error(error);
  }
};
