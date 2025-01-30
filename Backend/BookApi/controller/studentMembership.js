
const model = require("../model/studentMembership");
const studentMembershipModel = model.studentMembership;

exports.studentMembership = async (req, res) => {
  try {
    const formData = req.body;

    // Check if form data exists
    if (!formData || Object.keys(formData).length === 0) {
      return res.status(400).send({ message: "No form data received." });
    }

    // Process the form data (e.g., save to database)
    console.log("Received form data:", formData);

    const newStudentMembership = new studentMembershipModel(formData);
    await newStudentMembership.save();

    // Send success response
    res.status(200).send({ message: "Application submitted successfully!" });

  } catch (error) {
    console.error("Error during form submission:", error);
    res.send(error.message);
  }
};
