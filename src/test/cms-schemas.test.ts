import { describe, expect, it } from "vitest";
import {
  presidentialSuiteBodySchema,
  roomCardShowcaseBodySchema,
  siteContentBodySchema,
} from "../modules/cms/schemas.js";

describe("roomCardShowcaseBodySchema", () => {
  it("accepts a valid payload", () => {
    const parsed = roomCardShowcaseBodySchema.parse({
      slug: "eden-haven",
      headline: "Eden Haven",
      description: "Cozy studio",
      sizeLabel: "400-500 sq ft",
      images: [
        {
          secureUrl: "https://example.com/a.jpg",
          publicId: "folder/a",
          alt: "A",
        },
      ],
      sortOrder: 1,
      published: true,
      bookHref: "/booking",
      startingPrice: 7500,
      showPricing: false,
    });
    expect(parsed.slug).toBe("eden-haven");
  });

  it("rejects invalid image url", () => {
    expect(() =>
      roomCardShowcaseBodySchema.parse({
        slug: "x",
        headline: "H",
        description: "D",
        images: [{ secureUrl: "not-a-url", publicId: "p" }],
      })
    ).toThrow();
  });
});

describe("presidentialSuiteBodySchema", () => {
  it("accepts a valid payload", () => {
    const parsed = presidentialSuiteBodySchema.parse({
      headline: "Presidential Suite",
      description: "Flagship residence",
      bookButtonLabel: "Book Now",
      images: [],
    });
    expect(parsed.headline).toBe("Presidential Suite");
  });
});

describe("siteContentBodySchema", () => {
  it("accepts homepage key with intros", () => {
    const parsed = siteContentBodySchema.parse({
      key: "homepage",
      pickYourRoomTitle: "Pick Your Room/Suite",
      pickYourRoomIntro: "Hello",
      membershipIntro: "Member",
    });
    expect(parsed.key).toBe("homepage");
  });
});
