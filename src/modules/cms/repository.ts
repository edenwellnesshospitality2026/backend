import mongoose from "mongoose";
import { GalleryCategoryModel } from "../../models/GalleryCategory.js";
import { GalleryImageModel } from "../../models/GalleryImage.js";
import { GuestStoryModel } from "../../models/GuestStory.js";
import { MembershipTierModel } from "../../models/MembershipTier.js";
import { PresidentialSuiteModel } from "../../models/PresidentialSuite.js";
import { RoomShowcaseModel } from "../../models/RoomShowcase.js";
import { SiteContentModel } from "../../models/SiteContent.js";

const PRESIDENTIAL_KEY = "default";

export const listMembershipTiersPublic = async () => {
  return MembershipTierModel.find({ published: true }).sort({ sortOrder: 1 }).lean();
};

export const listMembershipTiersAdmin = async () => {
  return MembershipTierModel.find().sort({ sortOrder: 1 }).lean();
};

export const createMembershipTier = async (body: Record<string, unknown>) => {
  return MembershipTierModel.create(body);
};

export const updateMembershipTier = async (id: string, body: Record<string, unknown>) => {
  return MembershipTierModel.findByIdAndUpdate(id, { $set: body }, { returnDocument: "after" }).lean();
};

export const deleteMembershipTier = async (id: string) => {
  await MembershipTierModel.findByIdAndDelete(id);
};

export const listGuestStoriesPublic = async () => {
  return GuestStoryModel.find({ published: true }).sort({ sortOrder: 1 }).lean();
};

export const listGuestStoriesAdmin = async () => {
  return GuestStoryModel.find().sort({ sortOrder: 1 }).lean();
};

export const createGuestStory = async (body: Record<string, unknown>) => {
  return GuestStoryModel.create(body);
};

export const updateGuestStory = async (id: string, body: Record<string, unknown>) => {
  return GuestStoryModel.findByIdAndUpdate(id, { $set: body }, { returnDocument: "after" }).lean();
};

export const deleteGuestStory = async (id: string) => {
  await GuestStoryModel.findByIdAndDelete(id);
};

export const getGalleryPublic = async () => {
  const categories = await GalleryCategoryModel.find().sort({ sortOrder: 1 }).lean();
  const images = await GalleryImageModel.find({ published: true }).sort({ sortOrder: 1 }).lean();
  const byCat = new Map<string, typeof images>();
  for (const img of images) {
    const cid = String(img.categoryId);
    const arr = byCat.get(cid) ?? [];
    arr.push(img);
    byCat.set(cid, arr);
  }
  return categories.map((c) => ({
    ...c,
    id: String(c._id),
    images: (byCat.get(String(c._id)) ?? []).map((im) => ({
      ...im,
      id: String(im._id),
      categoryId: String(im.categoryId),
    })),
  }));
};

export const listGalleryCategoriesAdmin = async () => {
  return GalleryCategoryModel.find().sort({ sortOrder: 1 }).lean();
};

export const createGalleryCategory = async (body: Record<string, unknown>) => {
  return GalleryCategoryModel.create(body);
};

export const updateGalleryCategory = async (id: string, body: Record<string, unknown>) => {
  return GalleryCategoryModel.findByIdAndUpdate(id, { $set: body }, { returnDocument: "after" }).lean();
};

export const deleteGalleryCategory = async (id: string) => {
  await GalleryImageModel.deleteMany({ categoryId: new mongoose.Types.ObjectId(id) });
  await GalleryCategoryModel.findByIdAndDelete(id);
};

export const listGalleryImagesAdmin = async (categoryId?: string) => {
  const q = categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {};
  return GalleryImageModel.find(q).sort({ sortOrder: 1 }).lean();
};

export const createGalleryImage = async (body: Record<string, unknown>) => {
  return GalleryImageModel.create({
    ...body,
    categoryId: new mongoose.Types.ObjectId(String(body.categoryId)),
  });
};

export const updateGalleryImage = async (id: string, body: Record<string, unknown>) => {
  const patch = { ...body };
  if (typeof body.categoryId === "string") {
    (patch as Record<string, unknown>).categoryId = new mongoose.Types.ObjectId(body.categoryId);
  }
  return GalleryImageModel.findByIdAndUpdate(id, { $set: patch }, { returnDocument: "after" }).lean();
};

export const deleteGalleryImage = async (id: string) => {
  await GalleryImageModel.findByIdAndDelete(id);
};

/** Pick Your Room / Suite — grid cards only. */
export const listRoomCardsPublic = async () => {
  return RoomShowcaseModel.find({ published: true }).sort({ sortOrder: 1 }).lean();
};

export const listRoomCardsAdmin = async () => {
  return RoomShowcaseModel.find().sort({ sortOrder: 1 }).lean();
};

const RATE_KEYS = ["rateEp", "rateCp", "rateMap"] as const;

export const createRoomCard = async (body: Record<string, unknown>) => {
  const cleaned = { ...body };
  for (const k of RATE_KEYS) {
    if (cleaned[k] === null) delete cleaned[k];
  }
  return RoomShowcaseModel.create(cleaned);
};

export const updateRoomCard = async (id: string, body: Record<string, unknown>) => {
  const set: Record<string, unknown> = { ...body };
  const unset: Record<string, 1> = {};
  for (const k of RATE_KEYS) {
    if (set[k] === null) {
      unset[k] = 1;
      delete set[k];
    }
  }
  const update: mongoose.UpdateQuery<Record<string, unknown>> = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;
  return RoomShowcaseModel.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
};

export const deleteRoomCard = async (id: string) => {
  await RoomShowcaseModel.findByIdAndDelete(id);
};

/** Presidential Suite — singleton marketing block (separate API from room cards). */
export const getPresidentialSuitePublic = async () => {
  return PresidentialSuiteModel.findOne({ key: PRESIDENTIAL_KEY, published: true }).lean();
};

export const getPresidentialSuiteAdmin = async () => {
  return PresidentialSuiteModel.findOne({ key: PRESIDENTIAL_KEY }).lean();
};

export const upsertPresidentialSuite = async (body: Record<string, unknown>) => {
  const patch: Record<string, unknown> = {
    key: PRESIDENTIAL_KEY,
    headline: body.headline,
    description: body.description,
    images: Array.isArray(body.images) ? body.images : [],
    published: body.published !== false,
    bookHref: typeof body.bookHref === "string" ? body.bookHref : "/booking",
    bookButtonLabel:
      typeof body.bookButtonLabel === "string" && body.bookButtonLabel.trim() ?
        body.bookButtonLabel.trim()
      : "Book Now",
    showPricing: body.showPricing === true,
  };
  if (typeof body.sizeLabel === "string") patch.sizeLabel = body.sizeLabel;
  if (typeof body.startingPrice === "number") patch.startingPrice = body.startingPrice;

  const unset: Record<string, 1> = {};
  for (const k of RATE_KEYS) {
    const v = body[k];
    if (v === null) unset[k] = 1;
    else if (typeof v === "number") (patch as Record<string, unknown>)[k] = v;
  }

  const update: mongoose.UpdateQuery<Record<string, unknown>> = { $set: patch };
  if (Object.keys(unset).length) update.$unset = unset;

  return PresidentialSuiteModel.findOneAndUpdate(
    { key: PRESIDENTIAL_KEY },
    update,
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  ).lean();
};

export const getSiteContentByKey = async (key: string) => {
  return SiteContentModel.findOne({ key }).lean();
};

export const upsertSiteContent = async (body: Record<string, unknown>) => {
  const key = String(body.key ?? "homepage");
  const pickYourRoomTitle =
    typeof body.pickYourRoomTitle === "string" ? body.pickYourRoomTitle : "";
  const pickYourRoomIntro =
    typeof body.pickYourRoomIntro === "string" ? body.pickYourRoomIntro : "";
  const membershipIntro =
    typeof body.membershipIntro === "string" ? body.membershipIntro : "";
  const guestStoriesIntro =
    typeof body.guestStoriesIntro === "string" ? body.guestStoriesIntro : "";

  const setDoc: Record<string, unknown> = {
    key,
    pickYourRoomTitle,
    pickYourRoomIntro,
    membershipIntro,
    guestStoriesIntro,
  };

  if (Array.isArray(body.heroSlides)) {
    setDoc.heroSlides = body.heroSlides;
  }
  if (typeof body.corporateLinkUrl === "string") {
    setDoc.corporateLinkUrl = body.corporateLinkUrl;
  }
  if (typeof body.corporateLinkVisible === "boolean") {
    setDoc.corporateLinkVisible = body.corporateLinkVisible;
  }

  return SiteContentModel.findOneAndUpdate(
    { key },
    { $set: setDoc },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  ).lean();
};
