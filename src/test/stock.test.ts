import { describe, expect, it } from "vitest";
import { stockLabel } from "@/components/StockBadge";

describe("stock badges", () => {
  it("shows Out of stock at 0", () => expect(stockLabel(0)).toBe("Out of stock"));
  it("shows Only N left at 5 or fewer", () => expect(stockLabel(5)).toBe("Only 5 left"));
  it("shows In stock above 5", () => expect(stockLabel(6)).toBe("In stock"));
});
