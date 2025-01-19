const model = require("../../../model/conferance");
const conferanceData = model.ConferenceSubmission;

exports.singleConferencePage = async (req, res) => {
  try {
    const id = req.params.id;
    const conference = await conferanceData.findById(id);
    const imagePath =
      "../uploads" +
      (conference?.conferenceBanner?.split("/uploads")[1] ||
        "../images/default-book-cover.jpg");
    console.log(imagePath);

    const singleConferencePageHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${conference?.shortcutTitle || "Title Not found!"}</title>
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
      <a href="#">Publishing Support</a>
      <a href="/membership">Membership</a>
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
            href=${
              "../uploads" +
              conference?.presentationScheduleFile?.split("/uploads")[1]
            }
          >
            Download Schedule
          </a>
          
        </div>
        <div class="info-card">
          <div class="icon">📅</div>
          <h4>Program Schedule</h4>
          <p>Explore the complete conference program in detail.</p>
          <a
            href=${
              "../uploads" +
              conference?.programScheduleFile?.split("/uploads")[1]
            }
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
            href=${
              "../uploads" +
              conference?.presentationGuidelinesFile?.split("/uploads")[1]
            }
          >
            Download Guidelines
          </a>
        </div>
        <div class="info-card">
          <div class="icon">🖹</div>
          <h4>PPT Format</h4>
          <p>Download the official PPT format for your presentation.</p>
          <a
            href=${
              "../uploads" + conference?.pptFormatFile?.split("/uploads")[1]
            }
          >
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
