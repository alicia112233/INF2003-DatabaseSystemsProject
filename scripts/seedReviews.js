const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load .env variables

// MongoDB Connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}

const client = new MongoClient(uri);

async function seedReviews() {
  try {
    await client.connect();
    const db = client.db("game_haven"); // Change if your DB is different
    const collection = db.collection("review"); // Matches your MongoDB Compass

    const count = await collection.estimatedDocumentCount();
    if (count > 0) {
      console.log("Reviews already exist — skipping seed.");
      return;
    }

    const filePath = path.join(__dirname, "../backend/data/sample_reviews_final.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    await collection.insertMany(data);
    console.log("Sample reviews seeded successfully.");
  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await client.close();
  }
}

seedReviews();
