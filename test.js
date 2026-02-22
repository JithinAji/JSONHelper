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
data2.onChange(subscribe, "d");

data2.log();

data2.set("d.z.k", {a: 5});
data2.log();
