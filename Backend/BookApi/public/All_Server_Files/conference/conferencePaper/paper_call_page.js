const { title } = require("process");
const model = require("../../../../model/conference");
const conferencedate = model.ConferenceSubmission;
const path = require("path");

exports.callForServicePage = async (req, res) => {
  const { shortcutTitle } = req.params;
  const title = shortcutTitle.replace(/-/g, " ");
  const conferences = await conferencedate.find();
  const conference = conferences.find(
    (conference) => conference.shortcutTitle === title
  );
  if (!conference) {
    return res.sendFile(path.resolve(__dirname, "../errorPage.html"));
  }

  const htmlForm = `

   

    <script>
       
    </script>

</body>
</html>
`;

  // Send the generated HTML as the response
  res.send(htmlForm);
};
