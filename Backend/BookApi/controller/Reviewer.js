// const jsforce = require("jsforce");
const nodemailer = require("nodemailer");
const { PaperSubmission } = require("../model/paperUploadUser");
const mongoose = require("mongoose");
const path = require("path");
const api = "https://rame24.onrender.com";

//authMiddleware for reviewers

// authMiddleware for reviewers
exports.authReviewerMiddleware = async (req, res, next) => {
  try {
    let { paperId, reviewerEmail, RviewerValidation } = req.params;

    console.log("Paper ID:", paperId);
    console.log("Email:", reviewerEmail);
    console.log("RviewerValidation:", RviewerValidation);

    // Validate that the paperId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      console.log("NO mongoose validation");
      return res.sendFile(
        path.join(__dirname, "../public/All_Server_Files/errorPage.html")
      );
    }

    paperId = new mongoose.Types.ObjectId(paperId);

    const paper = await PaperSubmission.findById(paperId);
    if (!paper) {
      console.log("NO paper found");
      return res.sendFile(
        path.join(__dirname, "../public/All_Server_Files/errorPage.html")
      );
    }

    try {
      const reviewers = paper.Reviewers.filter(
        (reviewer) => reviewer.reviewerEmail == reviewerEmail
      );
      if (reviewers.length) {
        console.log({ reviewers });

        // Destructure the required values from the first reviewer object
        const { RviewerValidation, reviewerEmail, paperId } = reviewers[0];
        console.log({ paperId, RviewerValidation, reviewerEmail });

        // Create an array with the values (in the desired order)
        req.body.paperId = [];
        req.body.paperId.push(mongoose.Types.toString(paperId));
        req.body.paperId.push(RviewerValidation);
        req.body.paperId.push(reviewerEmail);

        console.log(req.body, req.body.paperId, "middleware");
        return next();
      }
      return res.sendFile(
        path.join(__dirname, "../public/All_Server_Files/errorPage.html")
      );
    } catch (err) {
      console.log(err);
      return res.sendFile(
        path.join(__dirname, "../public/All_Server_Files/errorPage.html")
      );
    }
  } catch (err) {
    console.log(err);
    return res.render(
      path.resolve(__dirname, "../public/All_Server_Files/errorPage.html")
    );
  }
};

// Helper function for error page response
const sendErrorPage = (res, errorMessage) => {
  console.log(errorMessage);
  return res.sendFile(
    path.join(__dirname, "../public/All_Server_Files/errorPage.html")
  );
};

exports.ReviewrFeedbackStore = async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "AMP-Access-Control-Allow-Source-Origin",
      req.headers["amp-source-origin"] || process.env.EMAIL
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "AMP-Access-Control-Allow-Source-Origin"
    );

    console.log(req.body, "logging from feedback");
    // const [RviewerValidation, ReviewerEmail] = req.body.paperId; // Extract paperId, RviewerValidation, and ReviewerEmail
    if (!req.body.paperId) {
      console.log("No paperId found in request body");
      return res
        .status(404)
        .send({ message: "Paper ID not found in request body" });
    }
    const paperId = req.body.paperId[0];
    const RviewerValidation = req.body.paperId[1];
    const ReviewerEmail = req.body.paperId[2];

    console.log(req.body.paperId[0], { RviewerValidation }, { ReviewerEmail });
    const paper = await PaperSubmission.findById(paperId);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const reviews = req.body.review.split(","); // Assuming review is a comma-separated string
    console.log(reviews, "Reviews split");

    // Check if reviewer has already submitted the review
    const existingReviewers = paper.Reviewers.filter(
      (reviewer) =>
        reviewer.reviewerEmail === ReviewerEmail &&
        reviewer.RviewerValidation !== RviewerValidation
    );

    if (existingReviewers.length) {
      console.log("reviewer already review");
      return res.status(200).json({
        message: `Paper already reviewed! Thank you, ${req.body.name}! Your review for “${paper.paperTitle}” has already been submitted.`,
      });
    }

    // Update the review for the reviewer
    try {
      const doc = await PaperSubmission.updateOne(
        { _id: paperId, "Reviewers.reviewerEmail": ReviewerEmail },
        {
          $set: {
            "Reviewers.$.reviewerComments": reviews,
            "Reviewers.$.RviewerValidation": new Date().getTime(), // Store current timestamp
          },
        },
        { runValidators: false }
      );

      if (!doc) {
        console.log("Error storing Reviewer Email");
        return res.status(404).json({ message: "Error storing review" });
      }
      console.log("rreturn");
      return res.status(200).json({
        message: `Thank you, ${req?.body?.name}! Your review for “${paper?.paperTitle}” has been submitted.`,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error storing review" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error processing review submission" });
  }
};

//send mail to reviewer

exports.sentMail = async (req, res) => {
  try {
    console.log(req.body);
    const paper = await PaperSubmission.findById(req.body.paperId);
    if (!paper) {
      return res.send({ message: "paper not found for review" });
    }
    const paperTitle = paper.paperTitle;
    const ReviewerName = req.body.ReviewerName;
    const ReviewerEmail = req.body.ReviewerEmail;
    const message = req.body.message;
    const subject = req.body.subject;
    const RviewerValidation = new Date().getTime();

    //
    //
    //
    //

    const UrlForForm = `${api}/${paper._id}/${RviewerValidation}/${ReviewerEmail}`;

    const messageForReviewer = (
      ReviewerName,
      paperTitle,
      paperAbstract,
      senderName,
      senderAffiliation,
      senderEmail,
      message
    ) => {
      return message
        ? message
        : `  <div>
      Dear ${ReviewerName},
      <br><br>
       I hope this message finds you well. I am writing to kindly request
       your expertise in reviewing my paper titled <strong>"${paperTitle}"</strong>.
       Your feedback would be invaluable in helping me improve and refine
       the work before submission.
       
       Please find the abstract and details of the paper below:
       <br><br>
       Paper Title: ${paperTitle}<br>
       Abstract: ${paperAbstract}
       <br><br>
       I would greatly appreciate your comments on the paper's strengths,
       weaknesses, and overall clarity, as well as any suggestions for
       improvements.
       
       Please let me know if you are available to review the paper, and I
       will send you the full manuscript.
      
       Thank you in advance for your time and consideration.
       <br><br>
       Best regards,<br>
       ${senderName}<br>
       ${senderAffiliation}<br>
       ${senderEmail}<br>
       <br><br>
       </div>`;
    };

    const AMP = (
      messageForReviewer,
      paperId,
      RviewerValidation,
      ReviewerEmail
    ) => {
      return `<!doctype html>
      <html ⚡4email>
        <head>
          <meta charset="utf-8">
          <title>Review Feedback</title>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
          <!-- Required AMP extensions -->
          <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
          <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
          <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
          <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
          <style amp4email-boilerplate>body{visibility:hidden}</style>
          <style amp-custom>
            body {
              font-family: Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #fafafa;
            }
            form {
              background: #fff;
              padding: 20px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            fieldset {
              border: 0;
              margin-bottom: 16px;
            }
            label {
              display: block;
              margin-bottom: 4px;
              font-weight: 600;
            }
            input, textarea, select {
              width: 100%;
              padding: 10px;
              margin-bottom: 8px;
              font-size: 14px;
              border: 1px solid #ccc;
              border-radius: 2px;
            }
            button {
              background: #4285f4;
              color: #fff;
              border: none;
              padding: 12px 20px;
              font-size: 16px;
              border-radius: 2px;
              cursor: pointer;
            }
            button[disabled] {
              background: #ccc;
              cursor: not-allowed;
            }
            button:hover:not([disabled]) {
              background: #357ae8;
            }
            .message {
              margin-top: 16px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
      ${messageForReviewer}
          <form method="post"
                action-xhr="${api}/reviewer"
                id="reviewForm">
            <div id="formInputs" [hidden]="formSubmitted">
              <fieldset>
                <label for="name">Reviewer Name</label>
                <input type="text" id="name" name="name" placeholder="Enter your full name" required>
              </fieldset>
      
              <!-- Hidden field for paper info -->
              <fieldset>
              <input type="hidden" id="hiddenInfo" style="height:0px;" name="paperId" value=${paperId}>
            </fieldset>

              <fieldset>
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="you@example.com" required>
              </fieldset>
              <fieldset>
                <label for="paperTitle">Paper Title</label>
                <input type="text" id="paperTitle" name="paperTitle" placeholder="Title of the paper" required>
              </fieldset>


              <fieldset>
              <input type="hidden" id="hiddenInfo" style="height:0px;" name="paperId" value=${RviewerValidation}>
            </fieldset> 

              <fieldset>
                <label for="rating">Rating (1 to 5)</label>
                <select id="rating" name="rating" required>
                  <option value="">Select a rating</option>
                  <option value="1">1 – Poor</option>
                  <option value="2">2 – Fair</option>
                  <option value="3">3 – Good</option>
                  <option value="4">4 – Very Good</option>
                  <option value="5">5 – Excellent</option>
                </select>
              </fieldset>
              <fieldset>
                <label for="review">Detailed Review Comments</label>
                <textarea id="review" name="review" rows="6" placeholder="Enter your comments separated by commas (e.g comment1, comment2, comment3)" required></textarea>
              </fieldset>

              <fieldset>
              <input type="hidden" id="hiddenInfo" style="height:0px;" name="paperId" value=${ReviewerEmail}>
            </fieldset>

              <br>
              <button type="submit">Submit Review</button>
            </div>
      
            <!-- Success message: on success, AMP sets formSubmitted to true, which hides the input container -->
      
            <div submitting>
            <p>Submitting the Reviwe...</p>
            </div>
      
      
            <div submit-success class="message"
                 on="submit-success:AMP.setState({formSubmitted:true})">
              <template type="amp-mustache">
                {{message}}
                <br><br>
                <amp-anim width="250" height="200"
                          src="https://media1.giphy.com/media/LMcUzgsJ7a5xKZq7pI/giphy.gif"
                          alt="Thank You for Your Review"></amp-anim>
              </template>
            </div>
      
            <!-- Error message: AMP requires submit-error to be inside a div, not on template -->
            <div submit-error class="message">
              <template type="amp-mustache">
                {{message}}
              </template>
            </div>
          </form>
        </body>
      </html>
      `;
    };

    //email
    const messageForReviewerMsg = messageForReviewer(
      ReviewerName,
      paperTitle,
      paper.paperAbstract,
      "req.body.senderName",
      "req.body.senderAffiliation",
      process.env.EMAIL,
      message,
      subject
    );
    const AMPMsg = AMP(
      messageForReviewerMsg,
      paper._id,
      RviewerValidation,
      ReviewerEmail
    );

    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like Outlook, Yahoo
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: "gadekaran24@gmail.com", // Receiver Email
      subject: subject ? subject : `Review Request for Paper: ${paperTitle}`, // Dynamic subject based on the request body

      text: "This is the plain text version of the email.",
      html: message
        ? ` <html>
      <head>
        <style amp-custom>
          /* Your custom styles here */
        </style>
      </head>
      <body>
${message}
<p>If Review form not Visible then follow these steps :</p>
<ol>
  <li>Sign in to Gmail on your personal computer.</li>
  <li>Select Settings in the top right corner of the screen.</li>
  <li>Click on See All Settings under General and select Dynamic Email.</li>
  <li>Next, click on the Developer option to allow or add ${process.env.EMAIL} to your email list.</li>
</ol>
<br>
<p>Other wise follow the link to submit the review :</p>
<a href="${UrlForForm}">Click here to submit the review</a>
      </body>
      </html>
      `
        : `
      <html>
      <head>
        <style amp-custom>
          /* Your custom styles here */
        </style>
      </head>
      <body>
      ${messageForReviewer(
        ReviewerName,
        paperTitle,
        paper.paperAbstract,
        "req.body.senderName",
        "req.body.senderAffiliation",
        process.env.EMAIL,
        message,
        subject
      )}
      <p>If Review form not Visible then follow these steps :</p>
      <ol>
        <li>Sign in to Gmail on your personal computer.</li>
        <li>Select Settings in the top right corner of the screen.</li>
        <li>Click on See All Settings under General and select Dynamic Email.</li>
        <li>Next, click on the Developer option to allow or add ${
          process.env.EMAIL
        } to your email list.</li>
      </ol>
      <br>
      <p>Other wise follow the link to submit the review :</p>
      <a href="${UrlForForm}">Click here to submit the review</a>
    </body>
    </html>
      `,
      amp: AMPMsg,
    };

    await transporter.sendMail(mailOptions);
    let bool = false;
    if (paper?.Reviewers?.length) {
      for (i = 0; i < paper.Reviewers.length; i++) {
        const reviewer = paper.Reviewers[i];
        console.log(
          reviewer?.reviewerEmail === ReviewerEmail &&
            reviewer?.paperId === req?.body?.paperId,
          reviewer?.paperId?.toString(),
          req?.body?.paperId
        );
        if (
          reviewer?.reviewerEmail === ReviewerEmail &&
          reviewer?.paperId?.toString() === req?.body?.paperId // Convert ObjectId to string before comparison
        ) {
          console.log(
            reviewer?.reviewerEmail,
            ReviewerEmail,
            reviewer?.paperId
          );
          bool = true; // Found a matching reviewer
        }
      }
    }
    console.log(bool);
    if (bool) {
      console.log("reviewer already exist");
    } else {
      const doc = await PaperSubmission.findByIdAndUpdate(
        paper._id,
        {
          $push: {
            Reviewers: {
              reviewerEmail: ReviewerEmail,
              reviewerName: ReviewerName,
              reviewerComments: "NO REVIEW YET...",
              paperId: req.body.paperId,
              RviewerValidation: RviewerValidation,
            },
          },
        },
        { new: true, runValidators: false } // Corrected options
      );
      if (!doc) {
        return res.send({ meaasge: "Error to store Reviewer Email" });
      }
      console.log({ doc }, doc.RviewerValidation);
    }
    res.status(200).send({
      message: `Email sent successfully to "${req.body.ReviewerName}" for the paper "${paper.paperTitle}"`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: `Error sending email: ${err.message}`,
    });
  }
};
