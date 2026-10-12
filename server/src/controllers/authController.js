import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { generateToken } from "../utils/token.js";

export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      res.status(400);
      throw new Error("Name, email, and password are required.");
    }

    if (normalizedPassword.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long.");
    }

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      res.status(409);
      throw new Error("An admin with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const admin = await Admin.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      data: {
        token: generateToken(admin._id),
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
      message: "Admin account created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedEmail || !normalizedPassword) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(normalizedPassword, admin.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.json({
      success: true,
      data: {
        token: generateToken(admin._id),
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
      message: "Login successful.",
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentAdmin = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};
