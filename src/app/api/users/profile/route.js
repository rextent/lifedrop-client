import dns from "node:dns";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_DB_URI;
const dbName = process.env.AUTH_DB_NAME || process.env.DB_NAME;

if (!uri) {
  throw new Error("MONGO_DB_URI is missing in .env");
}

if (!dbName) {
  throw new Error("AUTH_DB_NAME or DB_NAME is missing in .env");
}

let client;

async function getDb() {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._lifedropProfileMongoClient) {
      globalThis._lifedropProfileMongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      await globalThis._lifedropProfileMongoClient.connect();
    }

    client = globalThis._lifedropProfileMongoClient;
  } else {
    if (!client) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      await client.connect();
    }
  }

  return client.db(dbName);
}

const allowedBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function cleanUser(user) {
  if (!user) return null;

  return {
    id: user.id || "",
    name: user.name || "",
    email: user.email || "",
    image: user.image || "",
    bloodGroup: user.bloodGroup || "",
    district: user.district || "",
    upazila: user.upazila || "",
    role: user.role || "donor",
    status: user.status || "active",
  };
}

function getUserQuery(sessionUser) {
  const conditions = [];

  if (sessionUser?.id) {
    conditions.push({ id: sessionUser.id });
  }

  if (sessionUser?.email) {
    conditions.push({ email: sessionUser.email });
  }

  return conditions.length > 1 ? { $or: conditions } : conditions[0];
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const db = await getDb();
    const userQuery = getUserQuery(session.user);

    const user = await db.collection("user").findOne(userQuery);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = body?.name?.trim();
    const image = body?.image?.trim();
    const bloodGroup = body?.bloodGroup?.trim();
    const district = body?.district?.trim();
    const upazila = body?.upazila?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    if (!allowedBloodGroups.includes(bloodGroup)) {
      return NextResponse.json(
        { success: false, message: "Valid blood group is required." },
        { status: 400 }
      );
    }

    if (!district) {
      return NextResponse.json(
        { success: false, message: "District is required." },
        { status: 400 }
      );
    }

    if (!upazila) {
      return NextResponse.json(
        { success: false, message: "Upazila is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const userQuery = getUserQuery(session.user);

    const existingUser = await db.collection("user").findOne(userQuery);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const updateDoc = {
      name,
      image: image || "",
      bloodGroup,
      district,
      upazila,
      updatedAt: new Date(),
    };

    await db.collection("user").updateOne(
      { _id: existingUser._id },
      {
        $set: updateDoc,
      }
    );

    const updatedUser = await db.collection("user").findOne({
      _id: existingUser._id,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: cleanUser(updatedUser),
    });
  } catch (error) {
    console.error("PROFILE_PATCH_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}