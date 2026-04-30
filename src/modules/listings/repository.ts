import { pool } from "../../db/pool.js";
import type { Listing, RatePlan } from "../../types.js";

interface ListingRow {
  id: string;
  name: string;
  slug: string | null;
  listing_type: string;
  category: string;
  short_description: string;
  full_description: string | null;
  max_guests: number;
  base_occupancy: number;
  amenities: string[];
  thumbnail: string | null;
  gallery_images: string[];
  base_price: string;
  discount_price: string | null;
  taxes_info: string | null;
  available_inventory: number;
  total_inventory: number;
  status: "active" | "inactive";
  created_at: string;
}

interface RatePlanRow {
  id: string;
  listing_id: string;
  code: "EP" | "CP" | "MAP";
  title: string;
  description: string;
  meal_inclusion: string;
  price_per_night: string;
  discounted_price: string | null;
  availability: string;
  cancellation_policy_snippet: string;
  status: "active" | "inactive";
  available_inventory: number;
  total_inventory: number;
}

const mapRatePlan = (row: RatePlanRow): RatePlan => ({
  id: row.id,
  code: row.code,
  title: row.title,
  description: row.description,
  mealInclusion: row.meal_inclusion,
  pricePerNight: Number(row.price_per_night),
  discountedPrice: row.discounted_price ? Number(row.discounted_price) : undefined,
  availability: row.availability,
  cancellationPolicySnippet: row.cancellation_policy_snippet,
  status: row.status,
  availableInventory: row.available_inventory,
  totalInventory: row.total_inventory,
});

const mapListing = (row: ListingRow, ratePlans: RatePlan[]): Listing => ({
  id: row.id,
  name: row.name,
  slug: row.slug ?? undefined,
  listingType: row.listing_type,
  category: row.category,
  shortDescription: row.short_description,
  fullDescription: row.full_description ?? undefined,
  maxGuests: row.max_guests,
  baseOccupancy: row.base_occupancy,
  amenities: row.amenities,
  thumbnail: row.thumbnail ?? undefined,
  galleryImages: row.gallery_images,
  basePrice: Number(row.base_price),
  discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
  taxesInfo: row.taxes_info ?? undefined,
  availableInventory: row.available_inventory,
  totalInventory: row.total_inventory,
  status: row.status,
  createdAt: row.created_at,
  ratePlans,
});

export const listListings = async (): Promise<Listing[]> => {
  const listingsResult = await pool.query<ListingRow>(
    "SELECT * FROM listings ORDER BY created_at DESC"
  );
  const ratePlansResult = await pool.query<RatePlanRow>("SELECT * FROM rate_plans");
  const plansByListing = new Map<string, RatePlan[]>();
  for (const plan of ratePlansResult.rows) {
    const curr = plansByListing.get(plan.listing_id) ?? [];
    curr.push(mapRatePlan(plan));
    plansByListing.set(plan.listing_id, curr);
  }
  return listingsResult.rows.map((row: ListingRow) =>
    mapListing(row, plansByListing.get(row.id) ?? [])
  );
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  const listings = await listListings();
  return listings.find((listing) => listing.id === id) ?? null;
};

export const upsertListing = async (listing: Listing): Promise<Listing> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
      INSERT INTO listings (
        id, name, slug, listing_type, category, short_description, full_description,
        max_guests, base_occupancy, amenities, thumbnail, gallery_images, base_price,
        discount_price, taxes_info, available_inventory, total_inventory, status, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10::jsonb, $11, $12::jsonb, $13,
        $14, $15, $16, $17, $18, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        listing_type = EXCLUDED.listing_type,
        category = EXCLUDED.category,
        short_description = EXCLUDED.short_description,
        full_description = EXCLUDED.full_description,
        max_guests = EXCLUDED.max_guests,
        base_occupancy = EXCLUDED.base_occupancy,
        amenities = EXCLUDED.amenities,
        thumbnail = EXCLUDED.thumbnail,
        gallery_images = EXCLUDED.gallery_images,
        base_price = EXCLUDED.base_price,
        discount_price = EXCLUDED.discount_price,
        taxes_info = EXCLUDED.taxes_info,
        available_inventory = EXCLUDED.available_inventory,
        total_inventory = EXCLUDED.total_inventory,
        status = EXCLUDED.status;
      `,
      [
        listing.id,
        listing.name,
        listing.slug ?? null,
        listing.listingType,
        listing.category,
        listing.shortDescription,
        listing.fullDescription ?? null,
        listing.maxGuests,
        listing.baseOccupancy,
        JSON.stringify(listing.amenities),
        listing.thumbnail ?? null,
        JSON.stringify(listing.galleryImages),
        listing.basePrice,
        listing.discountPrice ?? null,
        listing.taxesInfo ?? null,
        listing.availableInventory,
        listing.totalInventory,
        listing.status,
        listing.createdAt,
      ]
    );

    await client.query("DELETE FROM rate_plans WHERE listing_id = $1", [listing.id]);
    for (const plan of listing.ratePlans) {
      await client.query(
        `
        INSERT INTO rate_plans (
          id, listing_id, code, title, description, meal_inclusion, price_per_night,
          discounted_price, availability, cancellation_policy_snippet, status,
          available_inventory, total_inventory
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13
        )
        `,
        [
          plan.id,
          listing.id,
          plan.code,
          plan.title,
          plan.description,
          plan.mealInclusion,
          plan.pricePerNight,
          plan.discountedPrice ?? null,
          plan.availability,
          plan.cancellationPolicySnippet,
          plan.status,
          plan.availableInventory,
          plan.totalInventory,
        ]
      );
    }
    await client.query("COMMIT");
    return listing;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteListing = async (id: string) => {
  await pool.query("DELETE FROM listings WHERE id = $1", [id]);
};

export const updateInventory = async (
  id: string,
  availableInventory: number,
  totalInventory?: number
) => {
  const query =
    typeof totalInventory === "number"
      ? `UPDATE listings
         SET available_inventory = $2, total_inventory = $3
         WHERE id = $1`
      : `UPDATE listings
         SET available_inventory = $2
         WHERE id = $1`;
  const values = typeof totalInventory === "number" ? [id, availableInventory, totalInventory] : [id, availableInventory];
  await pool.query(query, values);
};
