import {describe, it, expect, beforeEach, vi} from "vitest";
import createJSONEngine from "../src/json-engine.js";

describe("JSONEngine", () => {
  let engine;

  beforeEach(() => {
    engine = createJSONEngine({a: 1});
  });

  describe("Get and has", () => {

    it("getData returns a copy and does not mutate internal state", () => {
     const data = engine.getData();
      data.a = 0;
      expect(engine.get("a")).toBe(1);
    });

    it("gets correct value using getData", () => {
      expect(engine.getData()).toEqual({a: 1});
    });

    it("throws on getting invalid path", () => {
      expect(() => engine.get("x.y")).toThrow();
    })
    
    it("has returns true for existing key", () => {
      expect(engine.has("a")).toBe(true);
    })

    it("has returns false for non existing key", () => {
      expect(engine.has("b")).toBe(false);
    })
  });

  describe("Mutation",() => {
    it("adds a new key using set", () => {
      engine.set("b", 2);
      expect(engine.get("b")).toBe(2);
    });


    it("deletes and add nested keys", () => {
      engine.set("b.c.d", 3);
      expect(engine.get("b.c.d")).toBe(3);
      engine.deleteKey("b.c.d");
      expect(engine.getData()).toEqual({a: 1, b: {c: {}}});
    });

    it("throws when deleting non existing key", () => {
      expect(() => engine.deleteKey("x")).toThrow();
    });

    it("replaces object without error", () => {
      engine.replace({z: 2});
      expect(engine.get("z")).toBe(2);
    });

    it("updates values", () => {
      engine.update("a", v => v * 10);
      expect(engine.get("a")).toBe(10);
    });

    it("test update with same value does not change state", () => {
      engine.update("a", v => v);

      expect(engine.get("a")).toBe(1);
    })

    it("throws if update recieves non function", () => {
      expect(() => engine.update("a", 10)).toThrow();
    });

    it("throws if replace has non object value", () => {
      expect(() => engine.replace(5)).toThrow();
    })

    it("batch roll back if error occurs", () => {
      expect(() => {
        engine.batch(() => {
          engine.set("b", 2);
          throw new Error("fail");
        })
      }).toThrow();

      expect(engine.get("a")).toBe(1);
    })

  });

  describe("Undo Redo", () => {
    it("undo reverts last change", () => {
      engine.set("b", 2);
      engine.undo();
      expect(() => engine.get("b")).toThrow();
    });

    it("redo reverts undo", () => {
      engine.set("b", 2);
      engine.undo();
      expect(() => engine.get("b")).toThrow();
      engine.redo();
      expect(engine.get("b")).toBe(2);
    });

    it("does not create history for identical values", () => {
      engine.set("a", 1);
      engine.undo();
      expect(engine.get("a")).toBe(1);
    });

    it("batch groups multiple changes in to one undo", () => {
      engine.batch(() => {
        engine.set("b", 2);
        engine.set("c", 3);
      });
      expect(engine.getData()).toEqual({a: 1, b: 2, c: 3});

      engine.undo();
      expect(engine.getData()).toEqual({a: 1});

      engine.redo();
      expect(engine.getData()).toEqual({a: 1, b: 2, c: 3});
    });

    it("undo works with nested path", () => {
      engine.set("b.c.d", 5);
      engine.undo();

      expect(engine.has("b.c.d")).toBe(false);
    });

    it("redo history is cleared after new mutation", () => {
      engine.set("b", 2);
      engine.undo();

      engine.set("c", 3);
      engine.redo();

      expect(engine.has("b")).toBe(false);
    });

    it("replace supports undo", () => {
      engine.replace({z: 5});
      engine.undo();

      expect(engine.get("a")).toBe(1);
    });

    it("replace supports redo", () => {
      engine.replace({z: 5});
      engine.undo();
      engine.redo();

      expect(engine.get("z")).toBe(5);
    });

    it("update can be undone", () => {
      engine.update("a", v => v * 5);
      engine.undo();

      expect(engine.get("a")).toBe(1);
    });

    it("clearHistory removes undo history", () => {
      engine.set("b", 2);
      engine.clearHistory();
      engine.undo();

      expect(engine.get("b")).toBe(2);
    })

    it("clearHistory clears redo stack", () => {
      engine.set("b", 2);
      engine.undo();
      engine.clearHistory();

      engine.redo();
      expect(() => engine.get("b")).toThrow();
    })

    it("nested batch still creates a single history entry", () => {
      engine.batch(() => {
        engine.batch(() => {
          engine.set("b", 2);
        })
      });

      engine.undo();

      expect(engine.has("b")).toBe(false);
    })
  });


  describe("Listeners", () => {
    it("notifies listeners on change", () => {
      const fn = vi.fn();
      engine.onChange(fn);
      engine.set("b", 2);
      expect(fn).toHaveBeenCalled();
    });

    it("notifies only relevant path listeners", () => {
      const root = vi.fn();
      const nested = vi.fn();

      engine.onChange(root);
      engine.onChange(nested, "b.c");

      engine.set("b.c.d", 5);

      expect(root).toHaveBeenCalled();
      expect(nested).toHaveBeenCalled();
    });

    it("does not notify unrelated listeners", () => {
      const fn = vi.fn();

      engine.onChange(fn, "x.y");
      engine.set("b.c", 10);

      expect(fn).not.toHaveBeenCalled();
    })

    it("listener recieves correct change object", () => {
      const fn = vi.fn();

      engine.onChange(fn);

      engine.set("b", 2);

      expect(fn).toHaveBeenCalledWith({
        type: "add",
        path: "b",
        oldValue: undefined,
        newValue: 2
      })
    })
  });
})
