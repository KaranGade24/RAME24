// const mime = require("mime-types");

// let storage; // Declare storage globally for this file

// exports.setMegaStorage = (megaStorage) => {
//   storage = megaStorage; // Assign the storage object passed from index.js
// };

// // Route to get image file by handle
// exports.megaCloudFiles = async (req, res) => {
//   const fileHandle = req.params.fileName;

//   const files = storage.files; // Access all files in Mega storage
//   let fileFound = false;

//   for (const fileName in files) {
//     const file = files[fileName];
//     if (file.name === fileHandle) {
//       fileFound = true; // File is found

//       // Log and save the file's link
//       const fileLink = await file.link();

//       // Determine the MIME type of the file
//       const fileExtension = file.name.split(".").pop();
//       const mimeType = mime.lookup(fileExtension);

//       if (!mimeType) {
//         return res.status(415).send("Unsupported Media Type.");
//       }

//       // Set the Content-Type and stream the file
//       res.setHeader("Content-Type", mimeType);
//       const downloadStream = file.download();
//       return downloadStream.pipe(res); // Send the file and end the response
//     }
//   }

//   if (!fileFound) {
//     // If no matching file is found, send a 404 response
//     res.status(404).send("File not found.");
//   }
// };
