var result1;
// const api = "https://test-purpose-yesu.onrender.com";
const api = "https://super-duper-robot-6jxv9g6w9xrh59p5-8080.app.github.dev";
const uploadBtn = document.getElementById("btn");
const uploadForm = document.getElementById("uploadForm");

// get all field in form

const bookName = document.getElementById("name");
const isbn = document.getElementById("isbn");
const genre = document.getElementById("genre");
const year = document.getElementById("year");
const printPrice = document.getElementById("printPrice");
const ebookPrice = document.getElementById("ebookPrice");
const editor = document.getElementById("editor");
const editorEmail = document.getElementById("editorEmail");
const coEditors = document.getElementById("coEditors");
const description = document.getElementById("description");
const Abstraction = document.getElementById("Abstraction");

async function toGetBooksForDisplaying() {
  try {
    const response = await fetch(api + "/bookss", { method: "GET" });

    if (response.ok) {
      result1 = await response.json();
      // Parse the JSON response
      console.log(result1);
      displayBooks(result1); // Function to display books on the frontend
    } else {
      console.error("Failed to fetch books. Status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

toGetBooksForDisplaying();

// Function to display the books
function displayBooks(books) {
  const bookList = document.getElementById("bookList");
  const bookUpdateDelete = document.getElementById("book-update-delete");
  bookList.innerHTML = ""; // Clear any existing books
  books.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");
    bookItem.innerHTML = `
     <p><strong>Book Cover:</strong></br></br><img src="${api}/mega-cloud/${book?.files[0]?.megaName}" alt="Book Cover" /></p>
      <p><strong>Name:</strong> ${book?.name}</p>
      <p><strong>ISBN:</strong> ${book?.isbn}</p>
      <p><strong>Genre:</strong> ${book?.genre}</p>
      <p><strong>Year:</strong> ${book?.year}</p>
      <p><strong>Print Price:</strong> ${book?.printPrice}</p>
      <p><strong>eBook Price:</strong> ${book?.ebookPrice}</p>
      <p><strong>Description:</strong> ${book?.description}</p>
      <p><strong>Abstraction:</strong> ${book?.Abstraction}</p>
      <p><strong>eBook:</strong> <a href="${api}/mega-cloud/${book?.files[1]?.megaName}" target="_blank" class="file-link">Download eBook</a></p>

`;
    //creating update button to update perticular book

    const updateBookBtn = document.createElement("button");
    updateBookBtn.className = "update-btn"; // Add classes to btn for style
    updateBookBtn.innerText = "Update"; // Set btn inner text

    // Adding event listener to the update button
    updateBookBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // console.log("updating");

      // Reset the form fields
      uploadForm.reset();

      // Populate the form with the book's existing data
      bookName.value = book.name;
      isbn.value = book.isbn;
      genre.value = book.genre;
      year.value = book.year;
      printPrice.value = book.printPrice;
      ebookPrice.value = book.ebookPrice;
      editor.value = book.editor;
      editorEmail.value = book.editorEmail;
      coEditors.value = book.coEditors;
      description.value = book.description;
      Abstraction.value = book.Abstraction;

      // Remove the previous submit handler, if any, and add the new one
      uploadForm.onsubmit = null;
      uploadForm.onsubmit = updateBookData;
      uploadBtn.innerText = "Update"; // Change the button text to "Update"
    });

    // The updateBookData function to handle form submission
    async function updateBookData(event) {
      event.preventDefault(); // Prevent the default form submission
      uploadBtn.innerText = "Updating...";
      const formData = new FormData(uploadForm); // Get form data from the form
      formData.append("bookId", book._id); // Append the bookId to the form data

      try {
        // Make the PATCH request to update the book data
        const response = await fetch(api + "/update", {
          method: "PATCH", // Use PATCH method to update
          body: formData, // Send the form data
        });

        if (!response.ok) {
          // Handle the case where the response is not successful (status codes >= 400)
          const errorData = await response.json();
          // console.error("Error updating book:", errorData);
          uploadBtn.innerText = "Update";
          alert(`Error updating book: ${errorData.message || "Unknown error"}`);
          return;
        }

        const result = await response.json(); // Parse the response as JSON

        // console.log("Book updated successfully:", result);
        alert("Book updated successfully!"); // Notify the user
        uploadBtn.innerText = "Update";
        // Optionally, reload or refresh the page to reflect changes
        location.reload(); // This will reload the page after the update
      } catch (error) {
        // Catch network errors or other issues with the request
        // console.error("Network error:", error);
        uploadBtn.innerText = "Update";
        alert("An error occurred while updating the book. Please try again.");
      }
    }

    //creating delete button to delete perticular book

    const deleteBtn = document.createElement("button"); //create delete button
    deleteBtn.className = "update-btn"; //add classes to btn for style
    deleteBtn.innerText = "Delete"; //set btn inner text
    deleteBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      deleteBtn.disabled = true; //prevent btn action to stop repeted clicks
      const confirmDelete = confirm(
        "Are you sure you want to delete this item?"
      );
      if (!confirmDelete) return;
      deleteBtn.innerText = "deleting...";
      // console.log(book?._id);
      // console.log(api);
      try {
        const deletedBookResponse = await fetch(api + "/" + book?._id, {
          method: "delete",
        }); //api call for deleting book data that select to delete
        if (deletedBookResponse.status === 200) {
          alert("book deleted successfully");
          deleteBtn.innerText = "delete";
          location.reload();
        }
      } catch (error) {
        deleteBtn.innerText = "delete";
        console.log(error);
      }
    });

    //append all books item,update and delete btn
    bookItem.appendChild(updateBookBtn);
    bookItem.appendChild(deleteBtn);
    bookList.appendChild(bookItem);
  });
}

//from uploading section

uploadForm.onsubmit = uploadBookDetailes;

async function uploadBookDetailes(event) {
  event.preventDefault(); // Prevent form from being submitted traditionally
  const formData = new FormData(this); // Get form data
  console.log(formData);

  // uploadBtn.disabled = true;
  uploadBtn.innerText = "uploading...";
  // const date = new Date(now);
  // console.log(date);
  // formData.append(date);
  try {
    const response = await fetch(api + "/add", {
      method: "POST",
      body: formData,
    });

    const result = await response.json(); // Parse response as JSON
    console.log(result);

    if (result.message) {
      // console.log(result.message); // Show success message
      alert(result.message);
    }
  } catch (error) {
    // console.error("Error uploading files:", error);
    alert("Failed to upload files. Please try again.");
  } finally {
    // location.reload(); // use to reload window when data is added
    uploadBtn.innerText = "upload";
    // uploadForm.reset();
  }
}
