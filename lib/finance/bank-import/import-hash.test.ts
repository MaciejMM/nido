import { describe, expect, it } from "vitest";

import { computeImportHash } from "./import-hash";

describe("import-hash", () => {
  it("produces stable SHA-256 hashes from canonical fields", () => {
    const date = new Date("2025-05-09T00:00:00.000Z");
    const hashA = computeImportHash({
      operationDate: date,
      amount: 107.97,
      title: "LIDL",
      operationDescription: "Zakup towarów",
    });
    const hashB = computeImportHash({
      operationDate: date,
      amount: 107.97,
      title: "  lidl  ",
      operationDescription: "  ZAKUP TOWARÓW  ",
    });

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
  });
});
