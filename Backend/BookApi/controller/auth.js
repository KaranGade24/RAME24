const jwt = require("jsonwebtoken");
const model = require("../model/auth");
const AuthSchema = model.AuthSchema;
const bcrypt = require("bcrypt");
const path = require("path");
const { mongoose } = require("mongoose");

//responce

const responce = `
<html>
  <head>
    <meta http-equiv="refresh" content="0;url=/login-page" />
  </head>
  <body>
    Redirecting to login...
  </body>
</html>
`;

//rendering signup page
exports.signupPage = (req, res) => {
  res.render("auth/signup.ejs");
};
// Backend/BookApi/views/auth/signup.ejs
// signup method
exports.signup = async (req, res) => {
  try {
    var token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET);
    // console.log(token);
    const bcryptPassword = bcrypt.hashSync(req.body.password, 10);
    console.log(bcryptPassword);
    try {
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
      console.log("cookie set");
    } catch (err) {
      console.log(err);
      return res.json({ message: "cookie not set" });
    }

    try {
      const user = new AuthSchema({
        userName: req.body.username,
        password: bcryptPassword,
        email: req.body.email,
        token: token,
      });
      await user.save();
    } catch (err) {
      console.log(err);
      if (err.code === 11000)
        return res.json({ message: "Email already exists" });
      else return res.json({ message: "signup failed" });
    }
    res.json({ message: "signup successful", token });
  } catch (err) {
    console.log(err);
    res.json({ message: "signup failed" });
  }
};

//rendering login page
exports.loginPage = (req, res) => {
  res.render("auth/login.ejs");
};

//login method

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await AuthSchema.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate new JWT Token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    AuthSchema.findByIdAndUpdate(
      user._id,
      { token },
      { new: true, runValidators: false }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    console.log("login cookie set");
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Chech user login or no for showing Prfile logo

// authMiddleware

exports.authMiddleware = async (req, res, next) => {
  const url = req.originalUrl;
  console.log({ url });
  const token = req.cookies.token; // Extract token from "Bearer token"
  console.log({ token });
  if (!token) {
    console.log("NOT ok");
    res.cookie("currentUrl", url, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    if (["POST", "PATCH", "DELETE"].includes(req.method)) {
      return res.json({
        message: "Unauthorized, please login",
        redirectUrl: "/login-page",
      });
    }
    return res.redirect("/login-page");
  }

  try {
    console.log("verifiying token");
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AuthSchema.findOne({ email: verified.email });
    // console.log(user);
    if (verified) {
      console.log("alreay logedin");
      req.user = user;
      next();
      // res.status(200).json({ message: "alreay logedin", user });
    } else {
      console.log("Invalid token");
      return res.redirect("/login-page");
      // res.status(400).send({ message: "Invalid token" });
    }
    // next(); // Proceed to next middleware
  } catch (error) {
    console.log(error);
    return res.redirect("/login-page");
    // res.status(400).send({ message: "Invalid token" });
  }
};

//check login for public files

exports.publicCheckLogin = (req, res, next) => {
  const token = req?.cookies.token; // Extract token from cookies
  console.log(token);
  if (!token) {
    console.log("NOT LOGIN");
    return res.send({ isLoggedIn: false, message: "User not logged in" });
  }

  console.log("LOGIN");
  return res.send({ isLoggedIn: true, message: "User is logged in" });
};

//Check login or not
exports.checkLogin = (req, res, next) => {
  const url = req.originalUrl;
  console.log({ url });
  const token = req?.cookies?.token; // Extract token from "Bearer token"
  console.log({ token });
  if (!token) {
    console.log("NOT LOGIN");
    res.cookie("currentUrl", url, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.message = { message: "not login" };
    next();
  } else {
    // res.send({ message: "login" });
    console.log("LOGIN");
    res.message = { message: "login" };
    next();
  }
};

//log out function

exports.logout = (req, res) => {
  res.clearCookie("token"); // Remove token from cookies
  res.redirect("/");
};
