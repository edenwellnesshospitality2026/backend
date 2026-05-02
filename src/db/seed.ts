import bcrypt from "bcrypt";
import "dotenv/config";
import { prisma } from "./prisma.js";

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
  await prisma.$connect();

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      mustChangePassword: false,
    },
    update: {
      passwordHash,
      role: "admin",
      mustChangePassword: false,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${adminEmail}`);

  const count = await prisma.membershipTier.count();
  if (count === 0) {
    await prisma.membershipTier.createMany({
      data: defaultMembershipTiers.map((t) => ({
        title: t.title,
        description: t.description,
        priceLabel: t.priceLabel,
        features: t.features,
        isPopular: t.isPopular,
        sortOrder: t.sortOrder,
        published: t.published,
      })),
    });
    // eslint-disable-next-line no-console
    console.log("Seeded default membership tiers");
  }

  await prisma.$disconnect();
};

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
