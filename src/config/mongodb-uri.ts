/**
 * Returns true when the URI path names a database (e.g. .../eden?...).
 * URIs like ...mongodb.net/?... use "/" only and often end up on MongoDB's default DB.
 */
export const mongoUriHasExplicitDatabase = (uri: string): boolean => {
  try {
    const u = new URL(uri);
    const segment = u.pathname.replace(/^\//, "").split("/")[0];
    return segment.length > 0;
  } catch {
    return true;
  }
};
