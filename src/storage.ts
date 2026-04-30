import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Listing, StoreData, BookingPayload } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "store.json");

const defaultData: StoreData = {
  listings: [],
  bookings: [],
};

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultData, null, 2), "utf-8");
  }
};

export const readStore = async (): Promise<StoreData> => {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw) as StoreData;
};

export const writeStore = async (next: StoreData) => {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), "utf-8");
};

export const listListings = async () => {
  const store = await readStore();
  return store.listings;
};

export const saveListing = async (listing: Listing) => {
  const store = await readStore();
  const idx = store.listings.findIndex((x) => x.id === listing.id);
  if (idx >= 0) {
    store.listings[idx] = listing;
  } else {
    store.listings.unshift(listing);
  }
  await writeStore(store);
  return listing;
};

export const deleteListing = async (id: string) => {
  const store = await readStore();
  store.listings = store.listings.filter((x) => x.id !== id);
  await writeStore(store);
};

export const appendBooking = async (booking: BookingPayload) => {
  const store = await readStore();
  store.bookings.unshift(booking);
  await writeStore(store);
  return booking;
};
