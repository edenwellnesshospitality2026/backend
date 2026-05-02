import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

const tierSelect = {
  id: true,
  title: true,
  description: true,
  priceLabel: true,
  features: true,
  isPopular: true,
  primaryCtaLabel: true,
  primaryCtaHref: true,
  secondaryCtaLabel: true,
  secondaryCtaHref: true,
  sortOrder: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MembershipTierSelect;

const storySelect = {
  id: true,
  headline: true,
  subtitle: true,
  youtubeUrl: true,
  body: true,
  rating: true,
  sideText: true,
  sortOrder: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GuestStorySelect;

const categorySelect = {
  id: true,
  title: true,
  slug: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GalleryCategorySelect;

const featuresToStrings = (j: Prisma.JsonValue): string[] =>
  Array.isArray(j) ? j.map((x) => String(x)) : [];

export const listMembershipTiersPublic = async () => {
  const rows = await prisma.membershipTier.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: tierSelect,
  });
  return rows.map((r) => ({ ...r, features: featuresToStrings(r.features) }));
};

export const listMembershipTiersAdmin = async () => {
  const rows = await prisma.membershipTier.findMany({
    orderBy: { sortOrder: "asc" },
    select: tierSelect,
  });
  return rows.map((r) => ({ ...r, features: featuresToStrings(r.features) }));
};

export const createMembershipTier = async (body: Record<string, unknown>) => {
  const row = await prisma.membershipTier.create({
    data: {
      title: String(body.title),
      description: String(body.description),
      priceLabel: (body.priceLabel as string) ?? "On request",
      features: Array.isArray(body.features) ? body.features : [],
      isPopular: Boolean(body.isPopular),
      primaryCtaLabel: (body.primaryCtaLabel as string) ?? undefined,
      primaryCtaHref: (body.primaryCtaHref as string) ?? undefined,
      secondaryCtaLabel: (body.secondaryCtaLabel as string) ?? undefined,
      secondaryCtaHref: (body.secondaryCtaHref as string) ?? undefined,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      published: body.published !== false,
    },
    select: tierSelect,
  });
  return { ...row, features: featuresToStrings(row.features) };
};

export const updateMembershipTier = async (id: string, body: Record<string, unknown>) => {
  try {
    const data: Prisma.MembershipTierUpdateInput = {};
    if (body.title !== undefined) data.title = String(body.title);
    if (body.description !== undefined) data.description = String(body.description);
    if (body.priceLabel !== undefined) data.priceLabel = String(body.priceLabel);
    if (body.features !== undefined) data.features = Array.isArray(body.features) ? body.features : [];
    if (body.isPopular !== undefined) data.isPopular = Boolean(body.isPopular);
    if (body.primaryCtaLabel !== undefined) data.primaryCtaLabel = String(body.primaryCtaLabel);
    if (body.primaryCtaHref !== undefined) data.primaryCtaHref = String(body.primaryCtaHref);
    if (body.secondaryCtaLabel !== undefined) data.secondaryCtaLabel = String(body.secondaryCtaLabel);
    if (body.secondaryCtaHref !== undefined) data.secondaryCtaHref = String(body.secondaryCtaHref);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.published !== undefined) data.published = Boolean(body.published);

    const row = await prisma.membershipTier.update({
      where: { id },
      data,
      select: tierSelect,
    });
    return { ...row, features: featuresToStrings(row.features) };
  } catch {
    return null;
  }
};

export const deleteMembershipTier = async (id: string) => {
  await prisma.membershipTier.delete({ where: { id } }).catch(() => undefined);
};

export const listGuestStoriesPublic = async () => {
  return prisma.guestStory.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: storySelect,
  });
};

export const listGuestStoriesAdmin = async () => {
  return prisma.guestStory.findMany({
    orderBy: { sortOrder: "asc" },
    select: storySelect,
  });
};

export const createGuestStory = async (body: Record<string, unknown>) => {
  return prisma.guestStory.create({
    data: {
      headline: String(body.headline),
      subtitle: (body.subtitle as string) ?? null,
      youtubeUrl: String(body.youtubeUrl),
      body: (body.body as string) ?? null,
      rating: typeof body.rating === "number" ? body.rating : null,
      sideText: (body.sideText as string) ?? null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      published: body.published !== false,
    },
    select: storySelect,
  });
};

export const updateGuestStory = async (id: string, body: Record<string, unknown>) => {
  try {
    const data: Prisma.GuestStoryUpdateInput = {};
    if (body.headline !== undefined) data.headline = String(body.headline);
    if (body.subtitle !== undefined) data.subtitle = (body.subtitle as string) ?? null;
    if (body.youtubeUrl !== undefined) data.youtubeUrl = String(body.youtubeUrl);
    if (body.body !== undefined) data.body = (body.body as string) ?? null;
    if (body.rating !== undefined) data.rating = typeof body.rating === "number" ? body.rating : null;
    if (body.sideText !== undefined) data.sideText = (body.sideText as string) ?? null;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.published !== undefined) data.published = Boolean(body.published);

    return await prisma.guestStory.update({
      where: { id },
      data,
      select: storySelect,
    });
  } catch {
    return null;
  }
};

export const deleteGuestStory = async (id: string) => {
  await prisma.guestStory.delete({ where: { id } }).catch(() => undefined);
};

export const getGalleryPublic = async () => {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: categorySelect,
  });
  const images = await prisma.galleryImage.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  const byCat = new Map<string, typeof images>();
  for (const img of images) {
    const cid = img.categoryId;
    const arr = byCat.get(cid) ?? [];
    arr.push(img);
    byCat.set(cid, arr);
  }
  return categories.map((c) => ({
    ...c,
    id: c.id,
    images: (byCat.get(c.id) ?? []).map((im) => ({
      ...im,
      id: im.id,
      categoryId: im.categoryId,
    })),
  }));
};

export const listGalleryCategoriesAdmin = async () => {
  return prisma.galleryCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: categorySelect,
  });
};

export const createGalleryCategory = async (body: Record<string, unknown>) => {
  return prisma.galleryCategory.create({
    data: {
      title: String(body.title),
      slug: String(body.slug),
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    },
    select: categorySelect,
  });
};

export const updateGalleryCategory = async (id: string, body: Record<string, unknown>) => {
  try {
    const data: Prisma.GalleryCategoryUpdateInput = {};
    if (body.title !== undefined) data.title = String(body.title);
    if (body.slug !== undefined) data.slug = String(body.slug);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    return await prisma.galleryCategory.update({
      where: { id },
      data,
      select: categorySelect,
    });
  } catch {
    return null;
  }
};

export const deleteGalleryCategory = async (id: string) => {
  await prisma.galleryImage.deleteMany({ where: { categoryId: id } });
  await prisma.galleryCategory.delete({ where: { id } }).catch(() => undefined);
};

export const listGalleryImagesAdmin = async (categoryId?: string) => {
  return prisma.galleryImage.findMany({
    where: categoryId ? { categoryId } : {},
    orderBy: { sortOrder: "asc" },
  });
};

export const createGalleryImage = async (body: Record<string, unknown>) => {
  return prisma.galleryImage.create({
    data: {
      categoryId: String(body.categoryId),
      secureUrl: String(body.secureUrl),
      publicId: String(body.publicId),
      alt: (body.alt as string) ?? "",
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      published: body.published !== false,
    },
  });
};

export const updateGalleryImage = async (id: string, body: Record<string, unknown>) => {
  try {
    const data: Prisma.GalleryImageUpdateInput = {};
    if (body.categoryId !== undefined) {
      data.category = { connect: { id: String(body.categoryId) } };
    }
    if (body.secureUrl !== undefined) data.secureUrl = String(body.secureUrl);
    if (body.publicId !== undefined) data.publicId = String(body.publicId);
    if (body.alt !== undefined) data.alt = String(body.alt);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.published !== undefined) data.published = Boolean(body.published);

    return await prisma.galleryImage.update({ where: { id }, data });
  } catch {
    return null;
  }
};

export const deleteGalleryImage = async (id: string) => {
  await prisma.galleryImage.delete({ where: { id } }).catch(() => undefined);
};
