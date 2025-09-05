import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongo";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

if (!username || !email || !password) {
  return NextResponse.json({ error: "All fields required" }, { status: 400 });
}

const existingUser = await User.findOne({ $or: [{ username }, { email }] });
if (existingUser) {
  return NextResponse.json({ error: "User already exists" }, { status: 400 });
}

const hashedPassword = await bcrypt.hash(password, 10);
const newUser = await User.create({ username, email, password: hashedPassword });

const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, {
  expiresIn: "7d",
});

return NextResponse.json({ token, userId: newUser._id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}