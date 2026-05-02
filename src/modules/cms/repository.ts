import mongoose from "mongoose";
import { GalleryCategoryModel } from "../../models/GalleryCategory.js";
import { GalleryImageModel } from "../../models/GalleryImage.js";
import { GuestStoryModel } from "../../models/GuestStory.js";
import { MembershipTierModel } from "../../models/MembershipTier.js";

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
  return MembershipTierModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
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
  return GuestStoryModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
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
  return GalleryCategoryModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
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
  return GalleryImageModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
};

export const deleteGalleryImage = async (id: string) => {
  await GalleryImageModel.findByIdAndDelete(id);
};
