const { mongoose, Schema } = require("mongoose");

const AuthSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  userUploadedPaperIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "PaperSubmission",
  },
});

exports.AuthSchema = mongoose.model("AuthSchema", AuthSchema);
