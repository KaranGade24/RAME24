// const api = "https://rame24.onrender.com";
const api = "";
const form = document.getElementById("paperForm");
const selectedValue = document.getElementById("conferenceTrack");
let authorCount = 0;
console.log("hello");

function addAuthor() {
  const authorSection = document.getElementById("authorSection");

  // Create a new author section
  const newAuthorSection = document.createElement("div");
  newAuthorSection.classList.add("author-section");

  // Dynamically add HTML for the new author section
  newAuthorSection.innerHTML = `
        <label for="authorName">Author Name:</label>
        <input type="text" name="authors[${authorCount}][name]" required><br>

        <label for="authorAffiliation">Author Affiliation:</label>
        <input type="text" name="authors[${authorCount}][affiliation]" required><br>

        <label for="authorEmail">Author Email:</label>
        <input type="email" name="authors[${authorCount}][email]" required><br>

        <button type="button" class="remove-author-btn" onclick="removeAuthor(this)">Remove Author</button>
    `;

  // Append the new author section
  authorSection.appendChild(newAuthorSection);
  authorCount++;
}

function removeAuthor(button) {
  // Remove the author section associated with the clicked "Remove Author" button
  const authorSection = button.parentElement;
  authorSection.remove();
}

//to submit the form
form.onsubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission
  if (selectedValue.value === "select") {
    return alert("select the proper Conference track");
  }

  const conferenceName = getConferenceName(); // Extract conference name from URL
  const formData = new FormData(form); // Collect form data

  try {
    // console.log("📤 Sending form data to server...", formData);

    const response = await fetch(window.location.href, {
      method: "POST",
      body: formData, // Sending form data correctly
    });

    // ✅ Check if response is not okay
    if (!response.ok) {
      const errorText = await response.text(); // Get error details
      throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
    }

// ✅ Convert response to JSON
    const doc = await response.json();
    // console.log("✅ Server Response:", doc);
// console.log(doc);
    // ✅ Show success message to user
    alert(doc.message);
    if(doc.redirectUrl){
      window.location.href=  doc.redirectUrl;
    }
    form.reset(); // Reset the form
  } catch (error) {
    // console.error("❌ Error submitting form:", error.message);
    alert("Submission failed! " + error.message);
  }
};

function getConferenceName() {
  let url = window.location.href; // Get the current URL
  let parts = url.split("/");
  let conferenceName = parts[4] || "Not Found"; // Assuming the name is at index 5
  return conferenceName;
}
