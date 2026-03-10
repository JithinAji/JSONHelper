# JSON Engine

[![npm version](https://img.shields.io/npm/v/@jithinaji/json-engine)](https://www.npmjs.com/package/@jithinaji/json-engine)

A lightweight **JSON state manager** with built‑in **undo/redo**, **batch operations**, and **path‑based listeners**.

## Live Playground

Try the engine in your browser:

👉 https://jithinaji.github.io/JSONHelper/

The engine helps manage complex JSON structures safely by tracking mutations using the **Command Pattern**.  
All state changes are reversible and observable.

📦 **npm package:**  
https://www.npmjs.com/package/@jithinaji/json-engine

---

# Installation

Install the package from npm:

```bash
npm install @jithinaji/json-engine
```

Then import it in your project:

```js
import createJSONEngine from "@jithinaji/json-engine"
```

---

# Features

- Dot‑path based state updates (`a.b.c`)
- Undo / Redo history
- Batch operations (transaction-like updates)
- Change listeners scoped by path
- Immutable reads using `structuredClone`
- Lightweight and dependency‑free

---

# Creating an Engine

```js
const engine = createJSONEngine({
  user: {
    name: "Aji"
  }
})
```

---

# API Reference

## getData()

Returns a deep clone of the entire JSON state.

```js
const data = engine.getData()
```

---

## get(path)

Returns a cloned value from the specified path.

```js
engine.get("user.name")
```

Throws if the path does not exist.

---

## has(path)

Checks if a path exists.

```js
engine.has("user.name")
```

---

## set(path, value)

Sets a value using dot‑notation paths.

```js
engine.set("user.age", 25)
```

If intermediate objects do not exist they are created automatically.

---

## deleteKey(path)

Deletes a key at a path.

```js
engine.deleteKey("user.age")
```

Throws if the key does not exist.

---

## update(path, updater)

Updates a value using a function.

```js
engine.update("counter", v => v + 1)
```

---

## replace(newState)

Replaces the entire JSON state.

```js
engine.replace({
  count: 10
})
```

The previous state is stored in history so it can be undone.

---

## log()

Pretty prints the current state.

```js
engine.log()
```

---

# Undo / Redo

## undo()

Reverts the most recent change.

```js
engine.undo()
```

## redo()

Re‑applies the last undone change.

```js
engine.redo()
```

## clearHistory()

Clears both undo and redo history stacks.

```js
engine.clearHistory()
```

---

# Batch Operations

Groups multiple updates into a single history entry.

```js
engine.batch(() => {
  engine.set("a", 1)
  engine.set("b", 2)
})
```

Calling `undo()` will revert both operations together.

If an error occurs during the batch, all changes are rolled back.

---

# Change Listeners

## Listen to All Changes

```js
engine.onChange(change => {
  console.log(change)
})
```

## Listen to a Specific Path

```js
engine.onChange(change => {
  console.log("User changed:", change)
}, "user")
```

## Remove a Listener

```js
engine.offChange(listener, "user")
```

---

# Change Object Format

Every mutation emits a change object.

```js
{
  type: "add" | "update" | "delete" | "replace",
  path: "user.name",
  oldValue: previousValue,
  newValue: newValue
}
```

---

# Example

```js
const engine = createJSONEngine()

engine.set("a", 1)
engine.set("a", 2)

engine.undo() // a = 1
engine.redo() // a = 2

engine.batch(() => {
  engine.set("b", 3)
  engine.set("c", 4)
})

engine.undo() // removes b and c
```

---

# Design Notes

The engine internally uses:

- **Command Pattern** for reversible operations
- **Transaction batching**
- **Path‑based change propagation**

This allows predictable and reversible state transitions.

---

# License

MIT
