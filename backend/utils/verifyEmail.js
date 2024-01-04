import { User } from "../models/user.js";

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user.isVerified) {
      return res.status(400).send("You must verify your email");
    }
    next();
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
