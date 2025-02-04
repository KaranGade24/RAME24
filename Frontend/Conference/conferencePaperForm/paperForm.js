const pageTitle = document.getElementById("page-title");
//const api =
//"https://8080-idx-rame24-1738211022490.cluster-3g4scxt2njdd6uovkqyfcabgo6.cloudworkstations.dev";

const api = "https://rame24.onrender.com";
var conferenceId, mappedData;

function createCard(
  title,
  abstract,
  keywords,
  conferenceTrack,
  author,
  date,
  fileName,
  fileUrl,
  id,
  selectedValue
) {
  return `<div class="card">

  <div class = "select-card">

  <select name="select" id=${id}>
  <option value="select">Select</option>
  <option value="accept">Accept</option>
  <option value="reject">Reject</option>
</select>
<p class = "selectedValue" style = "color:${selectedValue.color}">${selectedValue.action}</p>
</div>

            <h3 class="card-title">${title}</h3>
            <p class="card-info"><strong>Authors:</strong> ${author}</p> 
            <p class="card-info"><strong>Conference Track</strong>: ${conferenceTrack}</p>
            <p class="card-info"><strong>Paper Abstract:</strong> ${abstract}</p>
            <p class="card-info"><strong>Submission Date:</strong> ${date}</p>
            <p class="card-info"><strong>Keywords:</strong> ${keywords}</p>
            <p class="card-info"><strong>File Name:</strong> ${fileName}</p>
            <div class="card-actions">
                <a href=${fileUrl} class="card-button"  target="_blank">See Uploaded Paper</a>
            </div>
        </div>`;
}

(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    conferenceId = params.get("data");
    console.log(conferenceId);

    if (!conferenceId) {
      console.error("conferenceId is missing!");
      return;
    }

    const response = await fetch(
      `${api}/conference/submit-paper/${conferenceId}`
    );
    // console.log(response);
    if (!response.ok) {
      const doc = await response.text();
      document.body.innerHTML = doc;
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const doc = await response.json(); // Use await to resolve JSON
    pageTitle.innerText = doc?.title;
    console.log(doc.uploadedPaper[0]);

    mappedData = await doc.uploadedPaper.map((item) => ({
      selectedValue: item.selectedValue,
      id: item._id,
      title: item.paperTitle, // Paper Title
      abstract: item.paperAbstract, // Paper Abstract
      keywords: item.keywords, // Keywords
      conferenceTrack: item.conferenceTrack, // Conference Trace
      author: item.authors
        .map((author) => {
          const authorsDetails = author.name
            .map((name, index) => {
              return `<br>${index + 1})<br>Name: ${name}<br>Affiliation: ${
                author.affiliation[index]
              }<br>Email: <a href="mailto:${author.email[index]}">${
                author.email[index]
              }</a>`;
            })
            .join("<br>"); // Join authors with a line break between each author's details
          return authorsDetails;
        })
        .join("<br><br>"), // Add space between different authors

      date: item.createdAt.split("T")[0], // Created Date (Extracting only the date part)
      fileName: item.paperFile.fileName, // File Name
      fileUrl: item.paperFile.fileUrl, // File URL
      fileSize: item.paperFile.fileSize, // File Size
      referenceConferenceId: item.ReferenceConferenceId, // Reference Conference ID
      id: item._id.toString(), // Paper ID (Convert ObjectId to string)
    }));

    console.log({ mappedData });
    const cardGrid = document.querySelector(".card-grid");
    mappedData.forEach((item) => {
      cardGrid.insertAdjacentHTML(
        "beforeend",
        createCard(
          item.title,
          item.abstract,
          item.keywords,
          item.conferenceTrack,
          item.author,
          item.date,
          item.fileName,
          item.fileUrl,
          item.id,
          item.selectedValue
        )
      );
    });

    console.log("Fetched Data:", doc[1]?.paperTitle);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();

//send mail by fetch to backend
document.addEventListener("change", async function (event) {
  if (event.target.tagName === "SELECT") {
    const selectedValue = event.target.value;
    const selectedId = event.target.id;
    console.log(`Selected ID: ${selectedId}, Value: ${selectedValue}`);

    if (selectedValue === "select") {
      alert("You need to select an option!");
    } else {
      try {
        const response = await fetch(`${api}/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedValue, selectedId }),
        });

        const doc = await response.json();
        console.log(doc);

        // Show success or error message in alert
        if (response.ok) {
          alert(doc.message || "Email sent successfully!");
        } else {
          alert(doc.error || "Failed to send email!");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while sending the email.");
      }
    }
  }
});
