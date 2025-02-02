var responseGet;
const form = document.getElementById("conferenceForm");
const updatebtn = document.querySelector(".update-btn");

// const api =
//   "https://8080-idx-rame24-1738211022490.cluster-3g4scxt2njdd6uovkqyfcabgo6.cloudworkstations.dev";
const api = "https://rame24.onrender.com";

// Get current date and time in the correct format (yyyy-mm-ddThh:mm)
const currentDate = new Date();
const currentDateString = currentDate.toISOString().slice(0, 16); // Format as 'yyyy-mm-ddThh:mm'

// Remove "min" attribute for the start date to allow past dates
document.getElementById("conferenceStartDate").removeAttribute("min");

// Set the "min" attribute for the end date to the current date and time
document
  .getElementById("conferenceEndDate")
  .setAttribute("min", currentDateString);

// Add event listener to dynamically update the end date min value based on the selected start date
document
  .getElementById("conferenceStartDate")
  .addEventListener("change", function () {
    const startDate = document.getElementById("conferenceStartDate").value;
    document.getElementById("conferenceEndDate").setAttribute("min", startDate);
  });

// Form submission event to show an alert with the selected dates (for testing purposes)
const conferenceForm = document.getElementById("conferenceForm");
conferenceForm.onsubmit = submit;

async function submit(event) {
  event.preventDefault(); // Prevent form submission for demo purposes

  const startDate = document.getElementById("conferenceStartDate").value;
  const endDate = document.getElementById("conferenceEndDate").value;
  // Check if end date is after start date
  if (new Date(endDate) <= new Date(startDate)) {
    alert("End date must be greater than the start date!");
  }
}

const submitButton = document.getElementById("btn");

// submitButton.addEventListener("click", (event) => submitBtn(event));

form.onsubmit = async (event) => {
  event.preventDefault(); // Prevent traditional form submission
  // const submitButton = document.getElementsByTagName("button")[0];

  submitButton.disabled = true;
  submitButton.innerText = "Submitting...";

  console.log(submitButton.innerText);

  const formData = new FormData(form);
  console.log(formData);

  try {
    const response = await fetch(`${api}/add-conference`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json(); // Parse the response as JSON
    console.log(result);

    alert(result.message);
    // Optionally reset the form
  } catch (error) {
    console.error("Error submitting details:", error);
    alert("Failed to submit the details. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerText = "Submit";
    form.reset();
  }
};

//
//After adding the conferences

const addConferenceDiv = document.querySelector(".added-conferences");
var totalPages,
  currentPage = 1,
  response;

async function getdata(skipNo = 0) {
  const conferenceData = await fetch(`${api}/conferences-data/${skipNo}`, {
    method: "GET",
  });

  responseGet = await conferenceData.json();
  console.log(responseGet);
  console.log(responseGet.conferenceSubmissions);

  const conferences = responseGet.conferenceSubmissions;
  const totalPages = Math.ceil(responseGet.conferenceCount / 10);

  conferences.forEach((conference) => {
    // Create the main card div
    const card = document.createElement("div");
    card.className = "card";

    //create buttons to visit the site and view the uploaded papers
    const visitSiteBtn = document.createElement("button");
    visitSiteBtn.className = "btn";
    visitSiteBtn.className = "visit-site-btn";
    visitSiteBtn.innerText = "Visit Site";
    const viewPaperBtn = document.createElement("button");
    viewPaperBtn.className = "btn";
    viewPaperBtn.className = "visit-site-btn";
    viewPaperBtn.innerText = "View Submited Paper";
    //visit site button
    visitSiteBtn.addEventListener("click", () => {
      window.open(`${api}/conference/${conference?.shortcutTitle}`, "_blank");
    });

    //view paper button
    viewPaperBtn.addEventListener("click", () => {
      const conferenceId = conference?._id; // Your variable to pass
      window.open(
        "./Frontend/Conference/conferencePaperForm/uploadedPaperAdmin.html?data=" +
          encodeURIComponent(conferenceId),
        "_blank"
      );
    });

    card.appendChild(visitSiteBtn);
    card.appendChild(viewPaperBtn);

    // Append the buttons to the card
    card.appendChild(visitSiteBtn);
    card.appendChild(viewPaperBtn);

    // Function to create and append a labeled paragraph
    const createLabeledParagraph = (label, value) => {
      const div = document.createElement("div");
      div.innerHTML = `<p><strong>${label}:</strong> ${value}</p>`;
      card.appendChild(div);
    };

    // Add all fields to the card
    createLabeledParagraph(
      "cover",
      `<img src="${conference?.conferenceBanner?.cloudinaryUrl}" alt="conferenceBanner" width ="30%" />`
    );
    createLabeledParagraph("title", conference?.title);
    createLabeledParagraph("shortTitle", conference?.shortcutTitle);
    createLabeledParagraph("authors", conference?.authors);
    createLabeledParagraph("organizers", conference?.organizers);
    createLabeledParagraph("email", conference?.email);
    createLabeledParagraph("phone", conference?.phone);
    createLabeledParagraph(
      "conferenceStartDate",
      conference?.conferenceStartDate
    );
    createLabeledParagraph("conferenceEndDate", conference?.conferenceEndDate);
    createLabeledParagraph("indexed", conference?.indexed);
    createLabeledParagraph("keywords", conference?.keywords);
    createLabeledParagraph("publicationInfo", conference?.publicationInfo);
    createLabeledParagraph(
      "registrationDetails",
      conference?.registrationDetails
    );
    createLabeledParagraph("track", conference?.track);
    createLabeledParagraph("venueDetails", conference?.venueDetails);
    createLabeledParagraph("abstract", conference?.abstract);
    createLabeledParagraph(
      "paperSubmissionInfo",
      conference?.paperSubmissionInfo
    );
    createLabeledParagraph(
      "paperFile",
      `<a href="${conference?.paperFile.cloudinaryUrl}"target ="_blank">Download Paper</a>`
    );
    createLabeledParagraph(
      "programScheduleFile",
      `<a href="${conference?.programScheduleFile.cloudinaryUrl}" target ="_blank">Download Paper</a>`
    );
    createLabeledParagraph(
      "presentationScheduleFile",
      `<a href="${conference?.presentationScheduleFile.cloudinaryUrl}" target ="_blank">Download Paper</a>`
    );
    createLabeledParagraph(
      "presentationGuidelinesFile",
      `<a href="${conference?.presentationGuidelinesFile?.cloudinaryUrl}" target ="_blank">Download Paper</a>`
    );

    createLabeledParagraph(
      "brochureFile",
      `<a href="${conference?.brochureFile?.cloudinaryUrl}" target ="_blank">Download Paper</a>`
    );
    createLabeledParagraph(
      "pptFormatFile",
      `<a href="${conference?.pptFormatFile.cloudinaryUrl}" target ="_blank">Download Paper</a>`
    );

    // Append buttons for update and delete
    card.appendChild(createUpdateBtn(conference?._id));
    card.appendChild(createDeleteBtn(conference?._id));

    // Append the card to the container
    addConferenceDiv.appendChild(card);
  });
}

(async () => {
  await getdata();
  addNextPreviousBtn();
})();

//
//Next and Previous Buttons
function addNextPreviousBtn() {
  const BtnDiv = document.createElement("div");
  BtnDiv.className = "BtnDiv";
  BtnDiv.appendChild(createNextBtn());
  BtnDiv.appendChild(createPreviousBtn());
  const text = document.createElement("p");
  text.innerText = "PageNO: " + currentPage;
  text.style.color = "antiquewhite";
  text.style.fontSize = "1.3rem";
  BtnDiv.appendChild(text);
  addConferenceDiv.appendChild(BtnDiv);
}

//update and delete buttons
function createUpdateBtn(id) {
  const updateBtn = document.createElement("button");
  updateBtn.className = "btn";
  updateBtn.innerText = "Update";

  updateBtn.addEventListener("click", (e) => {
    e.preventDefault();

    submitButton.style.display = "none";
    updatebtn.style.display = "block";
    var responseData;

    form.reset();
    // console.log(responseGet);

    responseGet.conferenceSubmissions.forEach((ele) => {
      if (ele._id == id) {
        console.log(ele._id);
        responseData = ele;
      }
    });

    // Populate the form fields with existing data
    document.getElementById("title").value = responseData.title || "";
    document.getElementById("shortcutTitle").value =
      responseData.shortcutTitle || "";
    document.getElementById("organizers").value = responseData.organizers || "";
    document.getElementById("authors").value = responseData.authors || "";
    document.getElementById("email").value = responseData.email || "";
    document.getElementById("phone").value = responseData.phone || "";
    document.getElementById("abstract").value = responseData.abstract || "";
    document.getElementById("paperSubmissionInfo").value =
      responseData.paperSubmissionInfo || "";
    document.getElementById("keywords").value = responseData.keywords || "";
    document.getElementById("indexed").value = responseData.indexed || "";
    document.getElementById("track").value = responseData.track || "";
    document.getElementById("venue").value = responseData.venueDetails || "";
    document.getElementById("registration").value =
      responseData.registrationDetails || "";
    document.getElementById("publication").value =
      responseData.publicationInfo || "";
    // Disable submit and make only update work
    form.onsubmit = (e) => submitSecond(e);

    async function submitSecond(e) {
      e.preventDefault();
      const formData = new FormData(form);
      updatebtn.innerText = "Updating...";
      updatebtn.disabled = true;

      try {
        // console.log("logging id", id);

        // Make the PATCH request
        const response = await fetch(`${api}/update-conference/${id}`, {
          method: "PATCH",
          body: formData,
        });

        // Check if the response is ok
        if (!response.ok) {
          throw new Error(`Failed to update: ${response.statusText}`);
        }

        const responseData = await response.json();

        // Check for server response message
        if (responseData.message) {
          alert(responseData.message);
        }
      } catch (error) {
        console.error("Error while updating conference:", error);
        alert(`An error occurred: ${error.message}`);
      } finally {
        updatebtn.innerText = "Update";
        updatebtn.disabled = false;
        updatebtn.style.display = "none";
      }
    }
  });

  return updateBtn;
}

function createDeleteBtn(id) {
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn";
  deleteBtn.innerText = "Delete";

  deleteBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Confirm the delete action with the user
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      // Disable the button to prevent multiple clicks
      deleteBtn.disabled = true;
      deleteBtn.innerText = "Deleting...";

      // Send DELETE request to the API
      const response = await fetch(`${api}/delete-conference/${id}`, {
        method: "DELETE",
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Show success message and remove the item from the UI
      if (responseData.message) {
        alert(responseData.message);
        // Optionally, remove the deleted item's row or card from the UI
        const itemToDelete = document.getElementById(`item-${id}`);
        if (itemToDelete) itemToDelete.remove();
      }
    } catch (error) {
      console.error("Error while deleting conference:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      // Reset the button state

      deleteBtn.disabled = false;
      deleteBtn.innerText = "Delete";
    }
  });

  return deleteBtn;
}

//Next and Previous Buttons
function createNextBtn() {
  const nextBtn = document.createElement("button");
  nextBtn.innerText = "Next";
  if (currentPage == totalPages) {
    nextBtn.disabled = true;
    nextBtn.style.backgroundColor = "#a4bcd7";
  }
  nextBtn.addEventListener("click", async function next() {
    currentPage++;
    if (currentPage <= totalPages) {
      console.log(currentPage);
      let skipNo = (currentPage - 1) * 10;
      addConferenceDiv.innerHTML = "";
      await getdata(skipNo);
      addNextPreviousBtn();
    } else {
      nextBtn.removeEventListener("click", next);
      nextBtn.style.backgroundColor = "#a4bcd7";
    }
  });

  return nextBtn;
}

function createPreviousBtn() {
  const previousBtn = document.createElement("button");
  previousBtn.innerText = "Previous";
  if (currentPage == 1) {
    previousBtn.disabled = true;
    previousBtn.style.backgroundColor = "#a4bcd7";
  }
  previousBtn.addEventListener("click", async function previous() {
    currentPage--;
    if (currentPage > 0 && currentPage <= totalPages) {
      console.log(currentPage);
      let skipNo = (currentPage - 1) * 10;
      addConferenceDiv.innerHTML = "";
      await getdata(skipNo);
      addNextPreviousBtn();
    } else {
      previousBtn.removeEventListener("click", previous);
      previousBtn.style.backgroundColor = "#a4bcd7";
    }
  });

  return previousBtn;
}
