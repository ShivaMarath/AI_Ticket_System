import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

// SIGNUP
export const signup = async (req, res) => {
  const { email, password, skills } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ email, password: hashed, skills });

    // Optional: wrap Inngest in try-catch to avoid crashing
    try {
      await inngest.send({
        name: "user/signup",
        data: { email },
      });
    } catch (inngestError) {
      console.error("Inngest send failed:", inngestError.message);
    }

    // Sign JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // optional expiry
    );

    res.json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};


// SIGNIN
export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ msg: "Unauthorized" });

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(403).json({ msg: "Unauthorized" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signin failed", details: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ msg: "Unauthorized, no token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return res.status(401).json({ msg: "Unauthorized, invalid token" });
      return res.json({ msg: "Logged out successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;

  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User doesn't exist" });

  if (skills.length) user.skills = skills;
  if (role) user.role = role;

  await user.save();
  res.json({ msg: "User updated", user });
};

// GET ALL USERS
export const getUser = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};
