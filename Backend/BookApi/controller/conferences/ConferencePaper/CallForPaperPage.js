const model = require("../../../model/conference");
const conferences = model.ConferenceSubmission;
const path = require("path");

exports.CallForPaperPage = async (req, res) => {
  const { shortcutTitle } = req.params;
  const title = shortcutTitle.replaceAll("-", " ");
  const conference = await conferences.findOne({ shortcutTitle: title });

  if (conference) {
    res.render("conferences/ConferencesPaperSubmit/CallForPaper", {
      shortcutTitle,
    });
  } else {
    res.sendFile(
      path.resolve(__dirname, "../../../public/All_Server_Files/errorPage.html")
    );
  }
};
