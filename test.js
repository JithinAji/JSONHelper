import createJSONEngine from "./JSONHelper.js";

let data1 = {
  a: 1,
  b: 2,
};

let data2 = createJSONEngine({
  c: 3,
  d: {
    z: {}
  }
})

const subscribe = (change => {
  console.log(change);
});
data2.onChange(subscribe);



data2.batch(() => {
  data2.set("b", 4);
  data2.set("d", 5);
})

data2.undo();
data2.log();
data2.redo();
