// const api =
//   "https://8080-idx-rame24-1738211022490.cluster-3g4scxt2njdd6uovkqyfcabgo6.cloudworkstations.dev";

const api = "https://rame24.onrender.com";

// Dummy data for papers

// Pagination variables
let currentPage = 1;
const itemsPerPage = 2; // Adjust to simulate pagination

// Get DOM elements
const cardContainer = document.getElementById("cardContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const tagSelect = document.getElementById("tagSelect");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const paperModal = document.getElementById("paperModal");
const modalClose = document.getElementById("modalClose");
const modalBody = document.getElementById("modalBody");

// Render papers based on current filters and pagination

let papers = []; // Global variable to store papers

async function getAllPapers() {
  const response = await fetch(`${api}/all-user-papers`);
  if (response.ok) {
    papers = await response.json();
    console.log("Data fetched from API:", papers);
  } else {
    console.log("Error fetching data from API");
    document.getElementById("userPanelContainer").innerHTML = `
      <style>
        .container {
          background: #ffffff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 90%;
          margin:auto;
        }
        h1 {
          color: #e74c3c;
          margin-bottom: 20px;
        }
        p {
          font-size: 16px;
          color: #333333;
          line-height: 1.5;
        }
        a {
          display: inline-block;
          margin-top: 30px;
          padding: 12px 24px;
          background-color: #3498db;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        a:hover {
          background-color: #2980b9;
        }
      </style>
      <div class="container">
        <h1>No Paper Uploaded</h1>
        <p>It looks like you haven't uploaded your paper yet. To participate in the conference, please upload your paper by clicking the button below.</p>
        <a href="/conferences">Go to Conference Page</a>
      </div>

    `;
  }
}
(async function () {
  await getAllPapers(); // Ensures papers are available globally

  // Initial render
  renderPapers();

  searchInput.addEventListener("input", () => renderPapers(true));
  sortSelect.addEventListener("change", () => renderPapers(true));
  tagSelect.addEventListener("change", () => renderPapers(true));
})();

async function renderPapers(reset = false) {
  if (reset) {
    cardContainer.innerHTML = "";
    currentPage = 1;
  }
  let filteredPapers = papers;
  // Apply search filter
  const searchTerm = searchInput.value.toLowerCase();
  filteredPapers = filteredPapers?.filter((paper) => {
    const titleMatch = paper.paperTitle.toLowerCase().includes(searchTerm);
    // Assuming authors is an array of strings

    const authorMatch = paper?.authors[0].name.some((author) =>
      author?.toLowerCase().includes(searchTerm)
    );
    return titleMatch || authorMatch;
  });

  // Apply tag filter
  const selectedTag = tagSelect.value;
  if (selectedTag) {
    console.log(selectedTag);
    filteredPapers = filteredPapers.filter(
      (paper) => paper.selectedValue.action === selectedTag
    );
  }

  // Apply sorting
  if (sortSelect.value === "title") {
    filteredPapers.sort((a, b) => a.paperTitle.localeCompare(b.title));
  } else if (sortSelect.value === "author") {
    filteredPapers.sort((a, b) =>
      a.authors[0].name[0].localeCompare(b.authors)
    );
  } else {
    filteredPapers.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Simulate pagination
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedPapers = filteredPapers.slice(start, end);

  // Render each paper card
  paginatedPapers.forEach((paper) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = paper.id;

    // Card content
    card.innerHTML = `
    <h3>${paper.paperTitle}</h3>
    <p><strong>Authors:</strong> ${paper.authors[0].name}</p>
    <p><strong>Abstract:</strong> ${paper.paperAbstract}</p>
    <p><strong>Date:</strong> ${"paper.createdAt.split()[0]"}</p>
    <p><strong>Conference Track:</strong> ${paper?.conferenceTrack}</p>

    

    <p class="status" style="color:${
      paper.selectedValue.color
    };" ><strong>Status:</strong> 
  ${paper?.selectedValue.action || "Pendding"}</p>

    <button class="expand">Expand</button>
    `;

    // Card event listeners
    // Open modal on card click (except for button clicks)
    card.addEventListener("click", function (e) {
      if (e.target.tagName !== "BUTTON") {
        openModal(paper);
      }
    });

    // Favorite button functionality

    // Expand/Collapse functionality
    const expandBtn = card.querySelector(".expand");
    expandBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openModal(paper);
    });

    cardContainer.appendChild(card);
  });

  // Hide load more if no more papers to load
  if (end >= filteredPapers.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }
}

// Event Listeners for filters and sort

// Load More Button
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderPapers();
});

// Modal functionality
function openModal(paper) {
  modalBody.innerHTML = `
    <h3>Edit Paper Details</h3>
    <div class="edit-form">
      <form id = "edit-form" id = "paperForm" method="PATCH" enctype="multipart/form-data">
      <label>Title:</label>
      <input type="text" id="editTitle" value="${paper.paperTitle}"disabled>

      <label>Authors:</label>
      <input type="text" id="editAuthors" value="${
        paper.authors[0].name
      }" disabled> 
       <label>Authors Email:</label>
      <input type="text" id="email" value="${paper.authors[0].email}" disabled> 
      
      <label>Keywords:</label>
      <input type="text" id="keywords" value="${paper.keywords}" disabled> 
      
      <label>Paper File: <a href="${
        paper.paperFile.fileUrl
      }" target="_blank"> Download Link</a></label>
      
      <input type="file" id="paperFile" disabled name="paperFile" title = "You cannot edit until status resolved" >

      <label>Abstract:</label>
      <textarea id="editAbstract" disabled >${paper.paperAbstract}</textarea>
      <label>File Uploaded Date:</label>
      <input type="date" id="editDate" value="${
        paper?.createdAt?.split("T")[0]
      }" disabled >
        <button id="saveEdit" type="submit" title="You cannot edit until status resolved" disabled >Save Changes</button>
</form>
    </div>
    <hr>
`; // Removed extra semicolon here

  if (paper.selectedValue.action === "🔷 Resolved") {
    const editForm = document.querySelector(".edit-form"); // Select form container
    document.getElementById("saveEdit").style.cursor = "pointer";
    const title = document.getElementById("saveEdit").removeAttribute("title");
    document.getElementById("paperFile").removeAttribute("disabled");
    document.getElementById("saveEdit").removeAttribute("disabled");
    document.getElementById("paperFile").removeAttribute("title");
  }

  document.getElementById("edit-form").onsubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById("edit-form");
    const formData = new FormData(form); // Collect form data
    formData.set("paperId", paper._id);
    console.log(formData.paperId, "login form data");
    try {
      const response = await fetch(`${api}/update-paper/${paper._id}`, {
        method: "PATCH",
        body: formData, // Sending form data correctly
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error details
        console.log(errorText);
        throw new Error(
          `HTTP Error! Status: ${response.status} - ${errorText} `
        );
      }

      const doc = await response.json();

      alert(doc.message);
      if (doc.redirectUrl) {
      }
      form.reset(); // Reset the form
    } catch (error) {
      alert("Submission failed! " + error.message);
    }
  };

  paperModal.style.display = "flex";
}

function closeModal() {
  paperModal.style.display = "none";
}

modalClose.addEventListener("click", closeModal);
window.addEventListener("click", function (e) {
  if (e.target === paperModal) {
    closeModal();
  }
});
