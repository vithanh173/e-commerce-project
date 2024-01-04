import bcryptjs from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import createToken from "../utils/createToken.js";
import sendEmail from "../utils/sendEmail.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new Error("Please fill all the inputs");
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(400).send("User already exists");
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    token: crypto.randomBytes(16).toString("hex"),
  });
  try {
    await newUser.save();
    createToken(res, newUser._id);
    const link = `http://localhost:5000/api/users/verify/${newUser.token}`;
    sendEmail(newUser.email, link);
    res.status(200).json({ message: "User created successfully!", newUser });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const existUser = await User.findOne({ email });
  if (existUser) {
    const validPassword = bcryptjs.compareSync(password, existUser.password);
    if (validPassword) {
      createToken(res, existUser._id);
      res.status(201).json({
        _id: existUser._id,
        username: existUser.username,
        email: existUser.email,
        isAdmin: existUser.isAdmin,
      });
      return;
    } else {
      res.status(404).send("Wrong password!");
    }
  } else {
    res.status(404).send("User not found!");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("access_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully!" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, username: user.username, email: user.email });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const hashedPassword = bcryptjs.hashSync(req.body.password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user!");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed successfully!" });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, email: updatedUser.email, isAdmin: updatedUser.isAdmin });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ token });
  const expire = new Date(user.tokenExpire);
  const now = new Date();
  try {
    if ((now - expire) / 1000 > 60) {
      return res.status(400).send("Your token is expired");
    }
    if (user) {
      await User.updateOne({ _id: user._id }, { $set: { token: null, isVerified: true } });
    }
    res.status(200).send("Email is verified!");
  } catch (error) {
    res.status(500);
    throw new Error("Verify failed!");
  }
});

export {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyEmail,
};
