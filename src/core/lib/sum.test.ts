import { describe, it, expect } from "vitest";
import { sum, multiply } from "./sum";

describe("sum", () => {
  it("should add two positive numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });

  it("should add negative numbers", () => {
    expect(sum(-1, -2)).toBe(-3);
  });

  it("should handle zero", () => {
    expect(sum(0, 5)).toBe(5);
    expect(sum(5, 0)).toBe(5);
  });
});

describe("multiply", () => {
  it("should multiply two positive numbers", () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it("should handle zero", () => {
    expect(multiply(5, 0)).toBe(0);
  });

  it("should handle negative numbers", () => {
    expect(multiply(-2, 3)).toBe(-6);
  });
});
