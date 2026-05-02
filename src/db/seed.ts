import bcrypt from "bcrypt";
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { MembershipTierModel } from "../models/MembershipTier.js";
import { PresidentialSuiteModel } from "../models/PresidentialSuite.js";
import { RoomShowcaseModel } from "../models/RoomShowcase.js";
import { SiteContentModel } from "../models/SiteContent.js";
import { GuestStoryModel } from "../models/GuestStory.js";

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

const defaultHomepageSiteContent = {
  key: "homepage",
  pickYourRoomTitle: "Pick Your Room/Suite",
  pickYourRoomIntro:
    "Browse our Eden Haven, Eden Residence, Eden Grand, and Presidential Suite residences to match your needs",
  membershipIntro:
    "Choose a membership that matches how you want to experience Eden—wellness getaways, signature stays, or our inner circle for the complete retreat lifestyle.",
  guestStoriesIntro: "",
};

const defaultPresidentialSuite = {
  key: "default",
  headline: "Presidential Suite",
  description:
    "Our flagship residence with expanded living, premium finishes, and the highest level of space and privacy for extended stays and distinguished guests",
  sizeLabel: "1800-2200 sq ft",
  published: true,
  bookHref: "/booking",
  bookButtonLabel: "Book Now",
  startingPrice: 35000,
  showPricing: false,
  images: [
    {
      secureUrl:
        "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1949-Color-Grade.jpg?updatedAt=1749653418146",
      publicId: "seed/presidential/0",
      alt: "Presidential bedroom",
    },
    {
      secureUrl:
        "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1962-Color-Grade.jpg?updatedAt=1749653417819",
      publicId: "seed/presidential/1",
      alt: "Presidential kitchen",
    },
    {
      secureUrl:
        "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1929-Color-Grade.jpg?updatedAt=1749653417734",
      publicId: "seed/presidential/2",
      alt: "Presidential suite",
    },
    {
      secureUrl:
        "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/Cover---to-be-extracted-fom-the-video-cOLOR-GRADE.jpg?updatedAt=1749653416116",
      publicId: "seed/presidential/3",
      alt: "Presidential residence",
    },
  ],
};

const defaultRoomCards = [
  {
    slug: "eden-haven",
    headline: "Eden Haven",
    description:
      "Cozy Eden Haven (studio apartment) perfect for solo travelers seeking comfort and wellness",
    sizeLabel: "400-500 sq ft",
    sortOrder: 0,
    published: true,
    bookHref: "/booking",
    startingPrice: 7500,
    showPricing: false,
    images: [
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/Studio%20Appartment/Cover-Color-Grade.jpg?updatedAt=1749652804837",
        publicId: "seed/eden-haven/0",
        alt: "Studio cover",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/Studio%20Appartment/_DSC1548-Color-Grade.jpg?updatedAt=1749652804815",
        publicId: "seed/eden-haven/1",
        alt: "Studio living area",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/Studio%20Appartment/_DSC1588-Color-Grade.jpg?updatedAt=1749652804799",
        publicId: "seed/eden-haven/2",
        alt: "Studio bedroom",
      },
    ],
  },
  {
    slug: "eden-residence",
    headline: "Eden Residence",
    description: "Spacious one-bedroom apartment ideal for couples or individuals",
    sizeLabel: "600-800 sq ft",
    sortOrder: 1,
    published: true,
    bookHref: "/booking",
    startingPrice: 10000,
    showPricing: false,
    images: [
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/1BHK/_DSC6686-Color-Grade.jpg?updatedAt=1749653239184",
        publicId: "seed/eden-residence/0",
        alt: "1BHK kitchen",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/1BHK/_DSC6684-Color-Grade.jpg?updatedAt=1749653239126",
        publicId: "seed/eden-residence/1",
        alt: "1BHK balcony",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/1BHK/Cover-1.1-Color-Grade.jpg?updatedAt=1749653239013",
        publicId: "seed/eden-residence/2",
        alt: "1BHK cover",
      },
    ],
  },
  {
    slug: "eden-grand",
    headline: "Eden Grand",
    description: "Premium two-bedroom apartment perfect for families",
    sizeLabel: "900-1200 sq ft",
    sortOrder: 2,
    published: true,
    bookHref: "/booking",
    startingPrice: 15000,
    showPricing: false,
    images: [
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1946%20Color%20Grade.jpg?updatedAt=1749653423612",
        publicId: "seed/eden-grand/0",
        alt: "2BHK living room",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1949-Color-Grade.jpg?updatedAt=1749653418146",
        publicId: "seed/eden-grand/1",
        alt: "2BHK master bedroom",
      },
      {
        secureUrl:
          "https://ik.imagekit.io/sjuj0rpud/Eden%20Gallery/Gallery/2BHK/_DSC1962-Color-Grade.jpg?updatedAt=1749653417819",
        publicId: "seed/eden-grand/2",
        alt: "2BHK kitchen",
      },
    ],
  },
];

const defaultGuestStories = [
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/Gyrz0rGF174",
    sortOrder: 0,
    published: true,
  },
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/OAtTYAI4AmU",
    sortOrder: 1,
    published: true,
  },
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/1bcJ9O0AAg8",
    sortOrder: 2,
    published: true,
  },
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/u3MWGJ0xgIM",
    sortOrder: 3,
    published: true,
  },
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/v5EdZho4Hp0",
    sortOrder: 4,
    published: true,
  },
  {
    headline: "Guest story",
    youtubeUrl: "https://www.youtube.com/shorts/eqYtGrJZ414",
    sortOrder: 5,
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
    { upsert: true, returnDocument: "after" }
  );
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${adminEmail}`);

  const count = await MembershipTierModel.countDocuments();
  if (count === 0) {
    await MembershipTierModel.insertMany(defaultMembershipTiers);
    // eslint-disable-next-line no-console
    console.log("Seeded default membership tiers");
  }

  // Split legacy collection: `layout: featured` → PresidentialSuite; strip `layout` on card rows.
  const legacyFeatured = await RoomShowcaseModel.findOne({ layout: "featured" });
  if (legacyFeatured) {
    const x = legacyFeatured.toObject() as {
      headline?: string;
      description?: string;
      sizeLabel?: string;
      images?: unknown;
      published?: boolean;
      bookHref?: string;
      startingPrice?: number;
      showPricing?: boolean;
    };
    await PresidentialSuiteModel.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          key: "default",
          headline: x.headline ?? defaultPresidentialSuite.headline,
          description: x.description ?? defaultPresidentialSuite.description,
          sizeLabel: x.sizeLabel ?? "",
          images: x.images ?? [],
          published: x.published !== false,
          bookHref: x.bookHref ?? "/booking",
          bookButtonLabel: "Book Now",
          startingPrice: x.startingPrice,
          showPricing: x.showPricing === true,
        },
      },
      { upsert: true }
    );
    await RoomShowcaseModel.deleteOne({ _id: legacyFeatured._id });
    // eslint-disable-next-line no-console
    console.log("Migrated legacy featured room showcase → PresidentialSuite");
  }
  await RoomShowcaseModel.updateMany({ layout: { $exists: true } }, { $unset: { layout: 1 } });

  const pc = await PresidentialSuiteModel.countDocuments();
  if (pc === 0) {
    await PresidentialSuiteModel.create(defaultPresidentialSuite);
    // eslint-disable-next-line no-console
    console.log("Seeded default Presidential Suite content");
  }

  const rc = await RoomShowcaseModel.countDocuments();
  if (rc === 0) {
    await RoomShowcaseModel.insertMany(defaultRoomCards);
    // eslint-disable-next-line no-console
    console.log("Seeded default Pick Your Room cards");
  }

  await SiteContentModel.findOneAndUpdate(
    { key: defaultHomepageSiteContent.key },
    { $setOnInsert: defaultHomepageSiteContent },
    { upsert: true, returnDocument: "after" }
  );
  await SiteContentModel.updateOne(
    { key: "homepage", pickYourRoomTitle: { $exists: false } },
    { $set: { pickYourRoomTitle: "Pick Your Room/Suite" } }
  );
  // eslint-disable-next-line no-console
  console.log(`Ensured site content key: ${defaultHomepageSiteContent.key}`);

  const gs = await GuestStoryModel.countDocuments();
  if (gs === 0) {
    await GuestStoryModel.insertMany(defaultGuestStories);
    // eslint-disable-next-line no-console
    console.log("Seeded default guest stories");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
