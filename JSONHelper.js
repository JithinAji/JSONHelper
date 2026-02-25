/**
 * This is a JSON helper file
 * Sometimes things get complicated with JSON and it feels overwhelming
 * I find it really difficult to manage a complicated JSON
 * I am planning to make JSON tracking a bit more easier with this
 *
 *
 * Creator: Jithin Aji
 *
 */


const createJSONEngine = (initialValue = {}) => {
  let value = structuredClone(initialValue);

  const listeners = new Map();

  let history = [];
  let future = [];

  let isBatching = false;
  let batchChanges = [];

  // Stuff for event listeners to work.

  const onChange = (fn, path = "") => {
    if (typeof fn !== "function") {
      throw new Error("onChange: Listener must be a function");
    }

    if(!listeners.has(path)) {
      listeners.set(path, new Set());
    }

    listeners.get(path).add(fn);
  }

  const offChange = (fn, path = "") => {
    if(typeof fn !== "function") {
      throw new Error("offChange: Listener must be a function")
    }

    const set = listeners.get(path);
    if(!set) return;

    set.delete(fn);
    
    if(set.size === 0)
      listeners.delete(path);
  }

  const notify = (change) => {
    if(isBatching) {
      batchChanges.push(change);
      return;
    }
    const path = change.path;
    const callFunctions = new Set();
    for(const[key, value] of listeners) {
      if(key === "" || key.startsWith(`${path}.`) || key === path || path.startsWith(`${key}.`)) {
        for (const fn of value) {
          callFunctions.add(fn);
        }
      }
    }
    callFunctions.forEach(fn => {
      try {
        fn(change);
      } catch(err) {
        console.error(err);
      }
    });
  }

  const redo = () => {
    if(future.length == 0) {
      return;
    }

    let command = future.pop();

    if(command.type == "batch") {
      isBatching = true;
      for(let i = 0; i < command.changes.length; i++) {
        applyForward(command.changes[i]);
      }
      history.push(command);
      isBatching = false;

      let change = {
        type: "batch",
        changes: command.changes 
      }
      if(change) notify(change);

      return;
    }
    let change = applyForward(command);
    history.push(command);
    if(change) notify(change);
  }

  const undo = () => {
    if(history.length == 0) {
      return;
    }

    let command = history.pop();
    if(command.type == "batch") {
      isBatching = true;
      for(let i = command.changes.length -1 ; i >= 0 ; i--) {
        applyInverse(command.changes[i]);
      }
      isBatching = false;
      future.push(command);

      let change = {
        type: "batch",
        changes: command.changes 
      }
      if(change) notify(change);
    }
    else {
      let change = applyInverse(command);
      if(change) notify(change);
      future.push(command);
    }
  }

  const applyInverse = (command) => {
    let change = null;
    switch(command.type) {
      case "add": 
        let path = command.path;
        change = applyDelete(path);
        break;
      case "delete":
        change = applySet(command.path, command.oldValue);
        break;
      case "update":
        change = applySet(command.path, command.oldValue);
        break;     
    }
    return change;
  }

  const applyForward = (command) => {
    let change = null;
    switch(command.type) {
      case "add":
      case "update":
        change = applySet(command.path, command.newValue);
        break;
      case "delete":
        change = applyDelete(command.path);
        break;
    }
    
    return change;
  }

  // Batch function

  const batch = (fn) => {
    if(typeof fn !== "function") return;

    isBatching = true;
    fn();
    isBatching = false;
    let change = {
      type: "batch",
      changes: batchChanges
    }
    future = [];
    history.push(change);
    if(change) notify(change);
    batchChanges = [];
  }


  // Stuff to edit JSON data.

  const getData = () => structuredClone(value);

  const log = () => {
    console.log(JSON.stringify(value, null, 2));
  };

  const set = (path, newValue) => {
    const change = applySet(path, newValue);
    if(!change) return;
    future = [];
    notify(change);
    history.push(change);
  }

  const applySet = (path, newValue) => {
    const {parent, key } = traverseToParent(path, true);

    const existed = key in parent;
    const oldValue = parent[key];

    if(existed && Object.is(oldValue, newValue)) return;

    parent[key] = newValue;

    const change = {
      type: existed ? "update" : "add",
      path,
      oldValue,
      newValue
    }

    return change;
  }


  const deleteKey = (path) => {
    const change = applyDelete(path);
    if(!change) return;
    future = [];
    notify(change);
    history.push(change);
  }

  const applyDelete = (path) => {
    const {parent, key } = traverseToParent(path, false);

    if(!(key in parent)) {
      throw new Error(`${key} does not exist`);
    }

    const oldValue = parent[key];

    delete parent[key];

    const change = {
      type: "delete",
      path,
      oldValue,
      newValue: undefined
    }

    return change;
  }

  const get = (path) => {
    const {parent, key} = traverseToParent(path);

    if(!(key in parent)) throw new Error(`${key} does not exist`)

    return structuredClone(parent[key]);
  }

  // helper functions

  const checkInvalidPath = (path) => {
    if(!path || typeof path !== "string"){
      throw new Error("Invalid path name");
    }
  }

  const isNotObject = (attr) => typeof attr !== "object" || attr === null

  const traverseToParent = (path, createMissing = false) => {
    checkInvalidPath(path);

    let attributes = path.split(".");
    let pointer = value;

    for(let i = 0; i < attributes.length - 1; i++) {
      const attribute = attributes[i];

      if(attribute in pointer) {
        if(isNotObject(pointer[attribute])) {
          throw new Error (`${attribute} is not an object.`)
        }
      } else {
        if(createMissing) {
          pointer[attribute] = {};
        }

        else throw new Error (`${attribute} does not exist`);
      }
      pointer = pointer[attribute];
    }

    const attribute = attributes[attributes.length - 1];
    return {parent: pointer, key: attribute };
  }
  
  return {
    getData,
    log,
    set,
    deleteKey,
    onChange,
    offChange,
    get,
    undo,
    redo,
    batch
  }
   
}

export default createJSONEngine;
