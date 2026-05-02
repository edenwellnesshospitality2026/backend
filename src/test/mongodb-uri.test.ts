import { describe, expect, it } from "vitest";
import { mongoUriHasExplicitDatabase } from "../config/mongodb-uri.js";

describe("mongoUriHasExplicitDatabase", () => {
  it("returns true when path names a database", () => {
    expect(mongoUriHasExplicitDatabase("mongodb://127.0.0.1:27017/eden_test")).toBe(true);
    expect(
      mongoUriHasExplicitDatabase(
        "mongodb+srv://u:p@cluster.example.mongodb.net/eden?retryWrites=true"
      )
    ).toBe(true);
  });

  it("returns false when path is empty or only slash", () => {
    expect(mongoUriHasExplicitDatabase("mongodb+srv://u:p@cluster.example.mongodb.net/?appName=x")).toBe(
      false
    );
    expect(mongoUriHasExplicitDatabase("mongodb+srv://u:p@cluster.example.mongodb.net/")).toBe(false);
  });

  it("returns true on parse failure (do not warn)", () => {
    expect(mongoUriHasExplicitDatabase("not-a-url")).toBe(true);
  });
});
