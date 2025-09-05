import { connectDB } from "@/lib/mongo";
import User from "@/models/User";

// Ensure Node.js runtime for this route
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    // A quick ping: count users (collection auto-creates on first insert)
    const count = await User.countDocuments({}).catch(() => 0);

    return new Response(
      JSON.stringify({ ok: true, message: "DB connected", userCount: count }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
