const StudentMembershipHtml = `<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RAME Student Membership</title>
    <link rel="icon" type="image/png" href="https://th.bing.com/th?id=OIP.4ODzmrtz6jvopPie4ZrBwQHaGh&w=80&h=80&c=1&vt=10&bgcl=f53f20&r=0&o=6&pid=5.1">
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="/All_Server_Files/studentMembership/studentMenbership.css"
    />
  </head>
  <body>
    <header>
      <h1>Welcome to RAME Student Membership</h1>
      <p>Join a thriving community of researchers and professionals.</p>
      <nav>
        <a href="#benefits">Benefits</a>
        <a href="#apply">Apply</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <div class="container">
      <!-- Membership Benefits Section -->
      <section id="benefits" class="membership-info">
        <h2>Membership Benefits</h2>
        <h3>Exclusive Perks</h3>
        <ul>
          <li>
            <i>✔</i> Free access to peer-reviewed journals and research
            articles.
          </li>
          <li>
            <i>✔</i> Discounts on publication fees and conference registrations.
          </li>
          <li>
            <i>✔</i> Priority invitations to workshops and training sessions.
          </li>
          <li><i>✔</i> Networking opportunities with international experts.</li>
          <li><i>✔</i> Certificates and recognition for active members.</li>
        </ul>
      </section>

      <!-- Membership Form Section -->
      <section id="apply">
        <h2>Apply for Membership</h2>
        <form
  id="membership-form"
  action="/student-membership"
  method="POST"
  enctype="application/x-www-form-urlencoded"
>
  <div class="form-group">
    <label for="fullName">Full Name:</label>
    <input
      type="text"
      id="fullName"
      name="fullName"
      placeholder="Enter your full name"
      required
    />
    <span class="error-message" id="name-error">Full name is required.</span>
  </div>
  <div class="form-group">
    <label for="email">Email:</label>
    <input
      type="email"
      id="email"
      name="email"
      placeholder="Enter your email"
      required
    />
    <span class="error-message" id="email-error">Valid email is required.</span>
  </div>
  <div class="form-group">
    <label for="phone">Phone Number:</label>
    <input
      type="number"
      min="1000000000"
      max="9999999999"
      id="phone"
      name="phone"
      placeholder="Enter your phone number"
      required
    />
    <span class="error-message" id="phone-error">Phone number is required.</span>
  </div>
  <div class="form-group">
    <label for="institution">Institution:</label>
    <input
      type="text"
      id="institution"
      name="institution"
      placeholder="Enter your institution"
      required
    />
    <span class="error-message" id="institution-error"
      >Institution is required.</span
    >
  </div>
  <div class="form-group">
    <label for="membershipType">Membership Type:</label>
    <select id="membershipType" name="membershipType" required>
      <option value="">Select Membership</option>
      <option value="basic">Basic</option>
      <option value="premium">Premium</option>
    </select>
    <span class="error-message" id="membership-type-error"
      >Please select a membership type.</span
    >
  </div>
  <div class="form-group">
    <label for="comments">Additional Information:</label>
    <textarea
      id="comments"
      name="comments"
      rows="4"
      placeholder="Enter any additional details"
    ></textarea>
  </div>
  <button type="submit">Submit Application</button>
</form>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="testimonials">
        <h2>What Our Members Say</h2>
        <div class="testimonial-item">
          <p>
            "Joining RAME has opened so many opportunities for my research. The
            resources are unparalleled!"
          </p>
        </div>
        <div class="testimonial-item">
          <p>
            "The workshops and networking sessions helped me connect with
            like-minded professionals."
          </p>
        </div>
      </section>
    </div>

    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>About RAME Publishers</h3>
          <ul>
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#author-guidelines">Author Guidelines</a></li>
            <li><a href="#publishing">Publishing Conference Paper</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3 id="contact">Help & Contact</h3>
          <ul>
            <li><a href="#help-overview">Help Overview</a></li>
            <li><a href="#faqs">FAQs</a></li>
            <li><a href="#privacy-policy">Privacy Policy</a></li>
            <li><a href="#terms">General Terms & Conditions</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>Address</h3>
          <p>
            RAME Publishers<br />
            33, Mandarkrupa Soc., Narsala Road,<br />
            Nagpur-440034, Maharashtra, India<br />
            <strong>Email:</strong>
            <a href="mailto:publisher@rame.org.in">publisher@rame.org.in</a>
          </p>
        </div>
        <div class="footer-section">
          <h3>Follow Us</h3>
          <div class="social-icons">
            <a href="#facebook">F</a>
            <a href="#twitter">T</a>
            <a href="#linkedin">L</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <br /><br />
        <p>&copy; 2024 RAME Publishers. All Rights Reserved.</p>
      </div>
    </footer>
<script>
 document.getElementById("membership-form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  const form = event.target;

  // Collect form data
  const formData = new FormData(form);

  // Convert to JSON
  const json = Object.fromEntries(formData.entries());

  // Display loading state
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    // Send POST request to the backend
    const response = await fetch("/student-membership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    if (response.ok) {
      const result = await response.json();
      alert("Application submitted successfully!");
      form.reset(); // Clear the form
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (err) {
    console.error("Submission error:", err);
    alert("Failed to submit application. Please try again.");
  } finally {
    // Reset the button state
    submitButton.disabled = false;
    submitButton.textContent = "Submit Application";
  }
});

</script>
  </body>
</html>

`;

exports.StudentMembershipHtml = (req, res) => {
  res.send(StudentMembershipHtml);
};
