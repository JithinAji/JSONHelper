# JSON Engine

A lightweight JSON state manager with built-in **undo/redo**, **batch
operations**, and **path-based change listeners**.

This engine simplifies working with deeply nested JSON objects while
keeping state transitions predictable and reversible using the Command
Pattern.

------------------------------------------------------------------------

## Features

-   Dot-path based `set`, `get`, and `delete`
-   Undo / Redo support
-   Batch multiple operations into a single history entry
-   Path-scoped change listeners
-   Immutable reads using `structuredClone`
-   No dependencies

------------------------------------------------------------------------

## Installation

Import the engine into your project:

``` js
import createJSONEngine from "./createJSONEngine";
```

------------------------------------------------------------------------

## Getting Started

### Create an Engine

``` js
const engine = createJSONEngine({
  user: {
    name: "Aji"
  }
});
```

------------------------------------------------------------------------

## API Reference

### set(path, value)

Sets a value at a dot-separated path.

``` js
engine.set("user.age", 25);
```

-   Automatically creates missing parent objects.
-   Records change in history (if actual change occurs).

------------------------------------------------------------------------

### get(path)

Returns a cloned value at the given path.

``` js
const name = engine.get("user.name");
```

Throws an error if the key does not exist.

------------------------------------------------------------------------

### deleteKey(path)

Deletes a key at the specified path.

``` js
engine.deleteKey("user.age");
```

Throws an error if the key does not exist.

------------------------------------------------------------------------

### getData()

Returns a deep cloned snapshot of the entire state.

``` js
const data = engine.getData();
```

------------------------------------------------------------------------

### log()

Pretty prints the current state.

``` js
engine.log();
```

------------------------------------------------------------------------

## Undo / Redo

### undo()

Reverts the most recent change.

``` js
engine.undo();
```

Behavior: - If a key was newly added → undo removes it. - If a key was
updated → undo restores previous value. - Batch operations revert as a
single unit.

------------------------------------------------------------------------

### redo()

Re-applies the last undone change.

``` js
engine.redo();
```

------------------------------------------------------------------------

## Batch Operations

Group multiple changes into a single history entry.

``` js
engine.batch(() => {
  engine.set("a", 1);
  engine.set("b", 2);
});
```

Calling:

``` js
engine.undo();
```

Will revert both changes together.

------------------------------------------------------------------------

## Change Listeners

### Listen to All Changes

``` js
engine.onChange((change) => {
  console.log(change);
});
```

------------------------------------------------------------------------

### Listen to a Specific Path

``` js
engine.onChange((change) => {
  console.log("User changed:", change);
}, "user");
```

------------------------------------------------------------------------

### Remove a Listener

``` js
engine.offChange(listenerFunction, "user");
```

------------------------------------------------------------------------

## Change Object Format

Every state mutation emits a change object:

``` js
{
  type: "add" | "update" | "delete",
  path: "user.name",
  oldValue: previousValue,
  newValue: newValue
}
```

------------------------------------------------------------------------

## Example

``` js
const engine = createJSONEngine();

engine.set("a", 1);
engine.set("a", 2);

engine.undo(); // a = 1
engine.redo(); // a = 2

engine.batch(() => {
  engine.set("b", 3);
  engine.set("c", 4);
});

engine.undo(); // removes both b and c
```

------------------------------------------------------------------------

## License

MIT License
