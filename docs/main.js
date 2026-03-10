import createJSONEngine from "https://cdn.jsdelivr.net/npm/@jithinaji/json-engine/+esm"

const engine = createJSONEngine({
  counter: 0
})

const stateView = document.getElementById("state");
const logView = document.getElementById("log");


function render() {
  stateView.textContent = JSON.stringify(engine.getData(), null, 2);
}

engine.onChange(change => {
  logView.textContent +=
    `${change.type} ${change.path} ${JSON.stringify(change.newValue)}\n`;
  render();
});

render()

document.getElementById("add").onclick = () => {
  engine.update("counter", v => v + 1);
}

document.getElementById("undo").onclick = () => {
  engine.undo();
}

document.getElementById("redo").onclick = () => {
  engine.redo();
}

document.getElementById("batch").onclick = () => {
  engine.batch(() => {
    engine.set("a", 1);
    engine.set("b", 2);
  })
}
