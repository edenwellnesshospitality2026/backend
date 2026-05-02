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

  it("accepts optional EP/CP/MAP nightly rates", () => {
    const parsed = roomCardShowcaseBodySchema.parse({
      slug: "eden-haven",
      headline: "Eden Haven",
      description: "Studio",
      images: [],
      rateEp: 7500,
      rateCp: 8025,
      rateMap: 9000,
    });
    expect(parsed.rateEp).toBe(7500);
    expect(parsed.rateMap).toBe(9000);
  });

  it("accepts null rate fields to clear overrides", () => {
    const parsed = roomCardShowcaseBodySchema.parse({
      slug: "eden-haven",
      headline: "Eden Haven",
      description: "Studio",
      images: [],
      rateEp: null,
      rateCp: null,
      rateMap: null,
    });
    expect(parsed.rateEp).toBeNull();
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

  it("accepts optional rateEp rateCp rateMap", () => {
    const parsed = presidentialSuiteBodySchema.parse({
      headline: "Presidential Suite",
      description: "Flagship",
      images: [],
      rateEp: 35000,
      rateCp: 35525,
      rateMap: 36500,
    });
    expect(parsed.rateCp).toBe(35525);
  });

  it("accepts null to clear stored rates", () => {
    const parsed = presidentialSuiteBodySchema.parse({
      headline: "Presidential Suite",
      description: "Flagship",
      images: [],
      rateMap: null,
    });
    expect(parsed.rateMap).toBeNull();
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

  it("accepts hero slides and corporate fields", () => {
    const parsed = siteContentBodySchema.parse({
      key: "homepage",
      corporateLinkUrl: "https://drive.google.com/file/d/abc/view",
      corporateLinkVisible: false,
      heroSlides: [
        {
          secureUrl: "https://example.com/x.png",
          publicId: "cloud/1",
          title: "Hello",
        },
      ],
    });
    expect(parsed.heroSlides).toHaveLength(1);
    expect(parsed.corporateLinkVisible).toBe(false);
  });
});
