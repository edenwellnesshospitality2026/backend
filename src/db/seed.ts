import bcrypt from "bcrypt";
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { MembershipTierModel } from "../models/MembershipTier.js";

const adminEmail = "info@edenwellnesshospitality.com";
const adminPassword = "12345";

const defaultMembershipTiers = [
  {
    title: "Wellness Member",
    description: "Essential access for occasional retreats",
    priceLabel: "On request",
    features: ["Preferred booking windows", "Member rates on select stays", "Seasonal wellness updates"],
    isPopular: false,
    sortOrder: 0,
    published: true,
  },
  {
    title: "Signature Member",
    description: "Our most popular tier for regular guests",
    priceLabel: "On request",
    features: [
      "Priority reservations",
      "Complimentary room upgrades when available",
      "Spa & dining privileges",
      "Dedicated guest liaison",
    ],
    isPopular: true,
    sortOrder: 1,
    published: true,
  },
  {
    title: "Founders Circle",
    description: "The fullest Eden experience",
    priceLabel: "On request",
    features: [
      "Highest priority across dates",
      "Exclusive events & previews",
      "Extended-stay flexibility",
      "Curated itinerary planning",
    ],
    isPopular: false,
    sortOrder: 2,
    published: true,
  },
];

const run = async () => {
  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await UserModel.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      mustChangePassword: false,
    },
    { upsert: true, new: true }
  );
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${adminEmail}`);

  const count = await MembershipTierModel.countDocuments();
  if (count === 0) {
    await MembershipTierModel.insertMany(defaultMembershipTiers);
    // eslint-disable-next-line no-console
    console.log("Seeded default membership tiers");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
