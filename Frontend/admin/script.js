// // Dummy data for papers
// const api =
//   "https://8080-idx-rame24-1738211022490.cluster-3g4scxt2njdd6uovkqyfcabgo6.cloudworkstations.dev";

const api = "https://rame24.onrender.com";

document.getElementById("downloadBtn").addEventListener("click", function () {
  window.location.href = `${api}/download-excel`;
});

(async () => {
  const response = await fetch(`${api}/all-papers`);
  const papers = await response.json();
  console.log("Data fetched from API:", papers);

  // Pagination variables
  let currentPage = 1;
  const itemsPerPage = 5; // Adjust as needed

  // Get DOM elements
  const cardContainer = document.getElementById("cardContainer");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const statusSelect = document.querySelector("#status-select");
  const tagSelect = document.getElementById("tagSelect");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const paperModal = document.getElementById("paperModal");
  const modalClose = document.getElementById("modalClose");
  const modalBody = document.getElementById("modalBody");

  // Render papers based on current filters and pagination
  function renderPapers(reset = false) {
    let allTrack = "";
    if (reset) {
      cardContainer.innerHTML = "";
      currentPage = 1;
    }

    allTrack = papers.map((paper) => paper?.conferenceTrack);

    // Use a Set to remove duplicates
    const uniqueTracks = [...new Set(allTrack)];

    let count = 0;
    const allTacks = uniqueTracks.map((tag) => {
      if (tag) {
        if (count)
          return `
      <option value="${tag}">${tag}</option>`;
      } else {
        count++;
        return `<option value="">All Tracks</option>`;
      }
    });

    // Filter papers by search term
    // Start with all papers
    let filteredPapers = papers;

    // 1. Filter by search (title or author)
    const searchTerm = searchInput.value.toLowerCase();
    filteredPapers = filteredPapers.filter((paper) => {
      const titleMatch = paper.paperTitle.toLowerCase().includes(searchTerm);
      // Assuming authors is an array of strings
      const authorMatch = paper.authors[0].name.some((author) =>
        author.toLowerCase().includes(searchTerm)
      );
      return titleMatch || authorMatch;
    });

    // Filter by selected tag
    const selectedTag = tagSelect.value;
    tagSelect.innerHTML = allTacks;
    tagSelect.value = selectedTag;
    if (selectedTag) {
      console.log(selectedTag);
      filteredPapers = filteredPapers.filter((paper) =>
        paper?.conferenceTrack?.includes(selectedTag)
      );
    }

    // 3. Filter by status (if selected)
    // Apply the status filter on the already filtered list!
    if (statusSelect.value) {
      filteredPapers = filteredPapers.filter(
        (paper) =>
          paper.selectedValue.action.toLowerCase() ===
          statusSelect.value.toLowerCase()
      );
    }

    // Sorting papers
    if (sortSelect.value === "title") {
      filteredPapers.sort((a, b) => a.paperTitle.localeCompare(b.title));
    } else if (sortSelect.value === "author") {
      filteredPapers.sort((a, b) =>
        a.authors[0].name[0].localeCompare(b.authors)
      );
    } else {
      filteredPapers.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    //filter the paper by status

    // Simulate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPapers = filteredPapers.slice(start, end);

    paginatedPapers.forEach((paper) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = paper.id;

      card.innerHTML = `

        <h3>${paper.paperTitle}</h3>
        <p><strong>Authors:</strong> ${paper.authors[0].name}</p>
        <p><strong>Abstract:</strong> ${paper.paperAbstract}</p>
        <p><strong>Date:</strong> ${paper.createdAt.split("T")[0]}</p>
        <p><strong>Conference Track:</strong> ${paper?.conferenceTrack}</p>

        

        <p class="status" style="color:${
          paper.selectedValue.color
        };" ><strong>Status:</strong> 
      ${paper?.selectedValue.action || "Pendding"}</p>

        <div class="card-actions">

        <form id="radioForm">
        <label class="accept">
        Accept <input type="radio" name="status" id="" value="Accept">
    </label>
       <label class="accept reject">
        Reject <input type="radio" name="status" id="" value="Reject"> 
      </label>
      <label class="accept resolve">
        Resolve  <input type="radio" name="status" value="Resolve">
      </label>
      </form>
          <button id ="send-status">Send Status</button>
        </div>
        <div class="more-details">${paper.details}</div>
      `;

      //Sent Status to the user from the fetch
      async function sendStatusMail(selectedValue, emailBody) {
        const body = {
          selectedId: paper._id,
          selectedValue,
          emailBody: emailBody ? emailBody : "",
        };

        const response = await fetch(`${api}/send-ststus-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          document.querySelector("#emailBody").value = "";
        } else {
          alert(data.message);
        }
      }

      //add event listener to the send status button to sent the statu
      function sendStatus(e) {
        e.preventDefault();
        const selectedStatus = card.querySelector("#radioForm");

        const status = selectedStatus.querySelector(
          "input[type='radio']:checked"
        );
        console.log(e.target.id);

        if (status.value === "Resolve" && e.target.id === "send-status") {
          alert("Please press send mail button");
        } else {
          const emailBody = document.querySelector("#emailBody")?.value;
          if (status) {
            sendStatusMail(status.value, emailBody);
          } else {
            alert("Please select a status");
          }
        }
      }

      card.querySelector("#send-status").addEventListener("click", sendStatus);

      // Card click for modal popup (if not clicking on a button)
      // card.addEventListener("click", function (e) {});

      // Admin actions for status updates
      card.addEventListener("click", function (e) {
        if (card.querySelector("#send-status").style.display === "none") {
          card.querySelector("#send-status").style.display = "block";
          card
            .querySelector("#send-status")
            .addEventListener("click", sendStatus);
        }
        const emailCard = card.querySelector(".email-body-card");
        if (e.target.name === "status") {
          e.stopPropagation();
          const selectedStatus = e.target.value;
          card.querySelector(".status").innerText = selectedStatus;
          if (
            emailCard &&
            emailCard.style.display === "block" &&
            selectedStatus !== "Resolve"
          ) {
            if (card.querySelector("#send-status").style.display === "none") {
              card.querySelector("#send-status").style.display = "block";
              card
                .querySelector("#send-status")
                .addEventListener("click", sendStatus);
            }
            emailCard.style.display = "none";
            card.querySelector(".resolve").addEventListener("click", resolve);
          }
          card.querySelector(".resolve").addEventListener("click", resolve);
        } else {
          if (
            e.target.tagName !== "BUTTON" &&
            e.target.tagName !== "LABEL" &&
            e.target.tagName !== "INPUT" &&
            !emailCard?.contains(e.target)
          ) {
            if (emailCard && emailCard.style.display === "block") {
              emailCard.style.display = "none";
              if (card.querySelector("#send-status").style.display === "none") {
                card.querySelector("#send-status").style.display = "bolck";
                card
                  .querySelector("#send-status")
                  .addEventListener("click", sendStatus);
              }
              card.querySelector(".resolve").addEventListener("click", resolve);
            }
            openModal(paper);
          }
        }
      });

      card.querySelector(".resolve").addEventListener("click", resolve);

      function resolve(e) {
        if (card.querySelector("#send-status").style.display !== "none") {
          card.querySelector("#send-status").style.display = "none";
        }

        e.stopPropagation();
        card.innerHTML += `<div class="email-body-card">
        <button id= "email-card-close-btn">X</button>
        <h2>Resolve Paper Error</h2>
        <textarea id="emailBody" placeholder="Type your email message..."></textarea>
        <button class="send-mail-btn">Send Email</button>
    </div>`;

        card
          .querySelector(".send-mail-btn")
          .addEventListener("click", sendStatus);

        const emailCard = card.querySelector(".email-body-card");
        emailCard.addEventListener("click", (e) => {
          e.preventDefault();
          card.querySelector("#send-status").style.display = "none";
        });

        card.querySelector(".status").innerText = "Resolve";
        const acceptRadio = card.querySelector(
          'input[name="status"][value="Resolve"]'
        );
        if (acceptRadio) {
          acceptRadio.checked = true;
          // Select the "Accept" radio button
        }

        if ((emailCard.style.display = "none")) {
          emailCard.style.display = "block";
        }

        card
          .querySelector("#email-card-close-btn")
          .addEventListener("click", function (e) {
            card.querySelector(".resolve").addEventListener("change", resolve);
            e.preventDefault();
            if ((emailCard.style.display = "block")) {
              emailCard.style.display = "none";
            }
          });
      }

      //
      //
      //
      //
      //
      cardContainer.appendChild(card);
    });

    // Hide "Load More" button if no more papers to load
    if (end >= filteredPapers.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  }

  // Event listeners for filters and sort
  searchInput.addEventListener("input", () => renderPapers(true));
  sortSelect.addEventListener("change", () => renderPapers(true));
  tagSelect.addEventListener("change", () => renderPapers(true));
  statusSelect.addEventListener("change", () => renderPapers(true));
  // "Load More" button event
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderPapers();
  });

  // Modal functionality for detailed view, editing, and adding reviewer comments

  function openModal(paper) {
    const ReviewerCards = paper.Reviewers.map((reviewer) => {
      return `<div class="reviewer-card">
        <div class="reviewer-info">
        <button id="onedownloadBtn">Download Excel file this paper</button>
          <p>
            <strong>Reviewer Name:</strong> ${reviewer.reviewerName}
          </p>
          <p>
            <strong>Reviewer Email: </strong> ${reviewer.reviewerEmail}
          </p>
        </div>
  
        <div class="reviewerComments"></div>
        <h4>Reviewer Comments: </h4>
        <ul>
          ${
            reviewer?.reviewerComments
              .map((comment) => `<li>${comment}</li>`)
              .join("") || "No comments yet"
          }
        </ul>
      </div>`; // Removed extra semicolon here
    }).join("<br>");

    modalBody.innerHTML = `
      <h3>See Paper Details:</h3>
      <p><strong>Paper Title:</strong> ${paper.paperTitle}</p>
      <p><strong>Authors:</strong> ${paper.authors[0].name}</p>
      <p><strong>Conference Track:</strong> ${paper?.conferenceTrack}</p>
      <p><strong>Keywords:</strong> ${paper.keywords}</p>
        <p><strong>Abstract:</strong> ${paper.paperAbstract}</p>
        <p><strong>File Uploaded Date:</strong> ${
          paper.createdAt.split("T")[0]
        }</p>
        <p><label><strong>Paper File:</strong> <a href="${
          paper.paperFile.fileUrl
        }" target="_blank"> Download Link</a></p>
      </div>
      <hr>
      <div class="review-comments">
        <h4>Reviewer Section</h4>

 
           ${ReviewerCards}
       
              
          <div class="review-form">
       

        <div class="email-section">
        <form id = "reviewer-email">
        <label>Reviewer Name:</label>
        <input type="text" id="reviewerName" required><br><br>

        <label>Reviewer Email:</label>
        <input type="email" id="reviewerEmail" required><br><br>

        <label for="subject"><strong>Subject:</strong></label>
        <input type="text" id="subject" value="Invitation to Review a Manuscript" required>

        <label for="message"><strong>Message:</strong></label>
        <textarea id="message" rows="4" required >
        Dear [Reviewer’s Name],
        
        I hope this email finds you well. I am reaching out to request your valuable feedback on a research paper titled "${
          paper.paperTitle
        }" submitted for review. Your expertise in this field will greatly help enhance the quality of this work.
        
        Please find the manuscript attached. Kindly let us know if you require any additional details. We would appreciate receiving your feedback by [Deadline Date].
        
        Thank you for your time and consideration. Looking forward to your response.
        
        Best regards,
        [Your Name]
        [Your Institution/Organization]
        [Your Contact Information]"</textarea>

        <button class="send-btn" type = "submit">Send Email</button>
        </form>
    </div>

        </div>
        </div>
        `;

    //download the one paper excel files
    document
      .getElementById("onedownloadBtn")
      .addEventListener("click", function () {
        window.location.href = `${api}/onedownload-excel/${paper._id}`;
      });

    const reviewerForm = document.getElementById("reviewer-email");

    reviewerForm.onsubmit = async function (e) {
      e.preventDefault();

      // Get form values
      const ReviewerName = document.getElementById("reviewerName").value;
      const ReviewerEmail = document.getElementById("reviewerEmail").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;
      const paperId = paper._id;

      // Create form data object
      const formData = {
        ReviewerName,
        ReviewerEmail,
        message,
        subject,
        paperId,
      };

      try {
        // Send POST request
        const response = await fetch(`${api}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Convert formData to JSON string
        });

        // Parse the response to JSON

        const doc = await response.json();
        // Handle response
        if (response.ok) {
          alert(doc.message);
          reviewerForm.reset();
        } else {
          alert("Failed to send email");
        }

        // Optionally, log the response for debugging
        console.log(doc);
      } catch (error) {
        // Handle any errors that occurred during the fetch
        console.error("Error during form submission:", error);
        alert("An error occurred while submitting the form");
      }
    };

    // addReviewComment

    // Save edit changes event
    // document.getElementById("saveEdit").addEventListener("click", function () {
    //   paper.paperTitle = document.getElementById("editTitle").value;
    //   paper.authors[0].name = document.getElementById("editAuthors").value;
    //   paper.paperAbstract = document.getElementById("editAbstract").value;
    //   paper.createdAt.split("T")[0] = document.getElementById("editDate").value;
    //   alert("Paper details updated!");
    //   renderPapers(true);
    //   closeModal();
    // });

    // Add reviewer comment event
    // document
    //   .getElementById("addReviewComment")
    //   .addEventListener("click", function () {
    //     const commentInput = document.getElementById("newReviewComment");
    //     if (commentInput.value.trim() !== "") {
    //       paper.reviewerComments.push(commentInput.value.trim());
    //       commentInput.value = "";
    //       openModal(paper); // Refresh modal content to show the new comment
    //     }
    //   });

    paperModal.style.display = "flex";
  }
  // Initial render of papers
  renderPapers();
})();
function closeModal() {
  paperModal.style.display = "none";
}

modalClose.addEventListener("click", closeModal);
window.addEventListener("click", function (e) {
  if (e.target === paperModal) {
    closeModal();
  }
});
