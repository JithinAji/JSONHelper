export type ChangeType = "add" | "update" | "delete" | "replace"

export interface Change {
  type: ChangeType,
  path: string,
  oldValue: any,
  newValue: any
}

export type Listener = (change: Change) => void

export interface JSONEngine {
  getData(): any
  log(): void

  set(path: string, value: any): void
  deleteKey(path: string): void
  update(path: string, updater: (value: any) => any): void
  replace(newState: object): void

  get(path: string): any
  has(path: string): boolean

  undo(): void
  redo(): void
  batch(fn: () => void): void
  clearHistory(): void

  onChange(fn: Listener, path?: string): void
  offChange(fn: Listener, path?: string): void
}

export default function createJSONEngine(initialValue?: object): JSONEngine
