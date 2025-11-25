const mongoose = require("mongoose");

const { Schema } = mongoose;
const { handleSaveError, preUpdate } = require("./hooks");

const emailRegexp = /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, "Set password for user"],
    },
    token: { type: String },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);
userSchema.pre("findOneAndUpdate", preUpdate);
userSchema.post("findOneAndUpdate", handleSaveError);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
