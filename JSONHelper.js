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
  const listeners = [];

  // Stuff for event listeners to work.

  const onChange = (fn) => {
    if (typeof fn !== "function") {
      throw new Error("onChange: Listener must be a function");
    }

    listeners.push(fn);
  }

  const offChange = (fn) => {
    if(typeof fn !== "function") {
      throw new Error("offChange: Listener must be a function")
    }

    const index = listeners.indexOf(fn);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  const notify = (change) => {
    listeners.forEach(fn => {
      try {
        fn(change);
      } catch (err) {
        console.error(err);
      }
    })
  }

  // Stuff to edit JSON data.

  const getData = () => structuredClone(value);

  const log = () => {
      console.log(value);
  };

  const set = (path, newValue) => {
    const {parent, key} = traverseToParent(path, true);

    const existed = key in parent;
    const oldValue = parent[key];

    if(existed && oldValue == newValue) return;
    
    parent[key] = newValue;

    notify({
      type: existed ? "update" : "add",
      path,
      oldValue,
      newValue
    })

  }


  const deleteKey = (path) => {
    const {parent, key} = traverseToParent(path, false);

    if(!(key in parent)) {
      throw new Error(`${key} does not exist`);
    }

    const oldValue = parent[key];

    delete parent[key];

    notify({
      type: "delete",
      path,
      oldValue,
      newValue: undefined
    });
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
        if(createMissing)
          pointer[attribute] = {};

        else throw new Error (`${attribute} does not exist`);
      }
      pointer = pointer[attribute];
    }

    const attribute = attributes[attributes.length - 1];
    return {parent: pointer, key: attribute};
  }
  
  return {
    getData,
    log,
    set,
    deleteKey,
    onChange,
    offChange,
    get
  }
   
}

export default createJSONEngine;
