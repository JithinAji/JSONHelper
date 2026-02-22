import {describe, it, expect, beforeEach} from "vitest";
import createJSONEngine from "./JSONHelper.js";

describe("JSONEngine", () => {
  let engine;
  beforeEach(() => {
    engine = createJSONEngine({a: 1});
  })

  it("returns initial value via get", () => {
    const data = engine.getData();
    data.a = 0;
    expect(engine.get("a")).toBe(1);
  });

  it("adds a new key using set", () => {
    engine.set("b", 2);
    expect(engine.get("b")).toBe(2);
  });

  it("gets correct value using getData", () => {
    expect(engine.getData()).toEqual({a: 1});
  });

  it("deletes and add nested keys", () => {
    engine.set("b.c.d", 3);
    expect(engine.get("b.c.d")).toBe(3);
    engine.deleteKey("b.c.d");
    expect(engine.getData()).toEqual({a: 1, b: {c: {}}});
  });

  it("undo reverts last change", () => {
    engine.set("b", 2);
    engine.undo();
    expect(() => engine.get("b")).toThrow();
  });

  it("redo reverts undo", () => {
    engine.set("b", 2);
    engine.undo();
    engine.redo();
    expect(engine.get("b")).toBe(2);
  })
})
