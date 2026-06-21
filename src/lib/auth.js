import dns from "node:dns";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// MongoDB Atlas SRV/DNS issue কমানোর জন্য
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

if (process.env.NODE_ENV === "development") {
  if (!globalThis._lifedropMongoClient) {
    globalThis._lifedropMongoClient = new MongoClient(uri);
  }

  client = globalThis._lifedropMongoClient;
} else {
  client = new MongoClient(uri);
}

const db = client.db(dbName);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      bloodGroup: {
        type: "string",
        required: false,
      },

      district: {
        type: "string",
        required: false,
      },

      upazila: {
        type: "string",
        required: false,
      },

      role: {
        type: "string",
        required: false,
        defaultValue: "donor",
      },
    },
  },

  database: mongodbAdapter(db, {
    client,
  }),
});