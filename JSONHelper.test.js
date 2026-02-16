import {describe, it, expect} from "vitest";
import createJSONEngine from "./JSONHelper.js";

describe("JSONEngine", () => {
  it("returns initial value via get", () => {
    const engine = createJSONEngine({a: 1});
    expect(engine.get("a")).toBe(1);
  });

  it("adds a new key using set", () => {
    const engine = createJSONEngine({a: 1});
    engine.set("b", 2);
    expect(engine.get("b")).toBe(2);
  });
})
