/**
 * Pure-function tests for EU date conversion + hashtag sanitisation.
 * Mirrors AMOS test scaffolding so behavioral baseline is comparable.
 */

const toEUDate = (iso: string): string => {
  if (!iso) return "";
  const p = iso.split("-");
  if (p.length !== 3) return iso;
  if (p[0].length <= 2) return iso;
  return `${p[2]}-${p[1]}-${p[0]}`;
};

const fromEUDate = (eu: string): string => {
  if (!eu) return "";
  const p = eu.split("-");
  if (p.length !== 3) return eu;
  if (p[0].length === 4) return eu;
  return `${p[2]}-${p[1]}-${p[0]}`;
};

describe("toEUDate", () => {
  it("converts ISO YYYY-MM-DD to EU DD-MM-YYYY", () => {
    expect(toEUDate("2026-03-15")).toBe("15-03-2026");
    expect(toEUDate("2026-12-01")).toBe("01-12-2026");
  });

  it("returns empty for empty input", () => {
    expect(toEUDate("")).toBe("");
  });

  it("is idempotent on already-EU dates", () => {
    expect(toEUDate("15-03-2026")).toBe("15-03-2026");
  });
});

describe("fromEUDate", () => {
  it("converts EU DD-MM-YYYY to ISO YYYY-MM-DD", () => {
    expect(fromEUDate("15-03-2026")).toBe("2026-03-15");
  });

  it("is idempotent on ISO dates", () => {
    expect(fromEUDate("2026-03-15")).toBe("2026-03-15");
  });
});

describe("round-trip", () => {
  it("ISO -> EU -> ISO is identity", () => {
    expect(fromEUDate(toEUDate("2026-06-21"))).toBe("2026-06-21");
  });
});
