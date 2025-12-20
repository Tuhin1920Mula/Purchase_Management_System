import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export const addUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password || !role) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User added successfully",
    });
  } catch (error) {
    console.error("❌ [Backend] Add User Error:", error);
    res.json({
      success: false,
      message: "Server error",
    });
  }
};