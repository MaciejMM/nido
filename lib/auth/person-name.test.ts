import { describe, expect, it } from "vitest";

import { kindeDisplayName, personLabel } from "./person-name";

describe("personLabel", () => {
  it("keeps a real name", () => {
    expect(personLabel("Maciej")).toBe("Maciej");
  });

  it("turns an email into a given name", () => {
    expect(personLabel("maciej.myslinski88@gmail.com")).toBe("Maciej");
  });

  it("returns nothing for a blank value", () => {
    expect(personLabel("  ")).toBeUndefined();
  });
});

describe("kindeDisplayName", () => {
  it("uses the given name and a real family name", () => {
    expect(
      kindeDisplayName({ given_name: "Maciej", family_name: "Myśliński" }),
    ).toBe("Maciej Myśliński");
  });

  it("ignores a family name that is an email", () => {
    expect(
      kindeDisplayName({
        given_name: "Zuza",
        family_name: "zuza@example.com",
      }),
    ).toBe("Zuza");
  });

  it("does not show the email when Kinde has no name", () => {
    expect(
      kindeDisplayName({
        given_name: "",
        family_name: "",
        email: "maciej.myslinski88@gmail.com",
      }),
    ).toBe("Maciej");
  });
});
