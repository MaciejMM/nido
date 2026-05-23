import mongoose from "mongoose";

import { connectMongo } from "../lib/db";
import { seedDefaultCategories } from "../services/finance/category.service";
import { CustodyEntry } from "../models/CustodyEntry";
import { ExpenseCategory } from "../models/ExpenseCategory";
import { User } from "../models/User";

async function seed() {
  await connectMongo();

  await User.deleteMany({});
  await CustodyEntry.deleteMany({});
  await ExpenseCategory.deleteMany({});

  const parentA = await User.create({
    name: "Anna",
    email: "anna@example.com",
    role: "parentA",
  });

  const parentB = await User.create({
    name: "Bartek",
    email: "bartek@example.com",
    role: "parentB",
  });

  const entries = await CustodyEntry.insertMany([
    {
      startDate: new Date("2025-01-02"),
      endDate: new Date("2025-01-08"),
      ownerId: parentA._id,
      notes: "Winter break with Anna",
    },
    {
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-01-21"),
      ownerId: parentB._id,
      notes: "Ski trip week",
    },
    {
      startDate: new Date("2025-02-10"),
      endDate: new Date("2025-02-16"),
      ownerId: parentA._id,
    },
    {
      startDate: new Date("2025-02-20"),
      endDate: new Date("2025-02-26"),
      ownerId: parentB._id,
    },
    {
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-07"),
      ownerId: parentA._id,
      notes: "Spring break start",
    },
    {
      startDate: new Date("2025-03-15"),
      endDate: new Date("2025-03-21"),
      ownerId: parentB._id,
    },
  ]);

  await seedDefaultCategories();
  console.log("Finance categories seeded");

  console.log("Seed complete");
  console.log("Parent A:", parentA._id.toString(), parentA.name);
  console.log("Parent B:", parentB._id.toString(), parentB.name);
  console.log(
    "Entries:",
    entries.map((e) => e._id.toString()).join(", "),
  );

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
