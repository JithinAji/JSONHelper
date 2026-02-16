import createJSONEngine from "./JSONHelper.js";

let data1 = createJSONEngine({
  a: 1,
  b: 2,
});

let data2 = createJSONEngine({
  c: 3,
  d: {"z": 5},
})

const subscribe = (change => {
  console.log(change);
});
data2.onChange(subscribe, "d");

data2.set("d.k.l", 8);
data2.deleteKey("d.z");

data1.log();
data2.log();
