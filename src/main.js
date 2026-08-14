import { invoke } from "@tauri-apps/api/core";

const list = document.getElementById("list");
const input = document.getElementById("new-item");
const statusEl = document.getElementById("status");
const STORAGE_KEY = "totoist.items";

let items = loadFromStorage();
let dragState = null;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.text === "string") : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function flash(msg) {
  statusEl.textContent = msg;
  statusEl.classList.add("show");
  clearTimeout(flash.t);
  flash.t = setTimeout(() => statusEl.classList.remove("show"), 1500);
}

function render() {
  list.innerHTML = "";
  if (items.length === 0) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = "All clear.";
    list.appendChild(div);
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    li.className = "item" + (item.done ? " done" : "");
    li.dataset.id = item.id;

    const handle = document.createElement("span");
    handle.className = "handle";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.done;
    cb.addEventListener("change", () => {
      item.done = cb.checked;
      settleOrder(item);
      persist();
      render();
    });

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = item.text;

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.title = "Delete";
    del.addEventListener("click", () => {
      items = items.filter((i) => i.id !== item.id);
      persist();
      render();
    });

    li.append(handle, cb, text, del);
    list.appendChild(li);
  }
}

function settleOrder(item) {
  const idx = items.indexOf(item);
  if (idx === -1) return;
  items.splice(idx, 1);
  const firstDone = items.findIndex((i) => i.done);
  if (firstDone === -1) items.push(item);
  else items.splice(firstDone, 0, item);
}

function addItem() {
  const text = input.value.trim();
  if (!text) return;
  items.push({ id: uid(), text, done: false });
  input.value = "";
  persist();
  render();
  input.focus();
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});

function placeDragged(el, clientY) {
  const siblings = [...list.querySelectorAll(".item")].filter((n) => n !== el);
  for (const sib of siblings) {
    const rect = sib.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      list.insertBefore(el, sib);
      return;
    }
  }
  list.appendChild(el);
}

list.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const li = e.target.closest(".item");
  if (!li || e.target.closest("input,button")) return;
  dragState = { el: li, startY: e.clientY, moved: false };
  li.setPointerCapture(e.pointerId);
});

list.addEventListener("pointermove", (e) => {
  if (!dragState) return;
  if (!dragState.moved) {
    if (Math.abs(e.clientY - dragState.startY) < 5) return;
    dragState.moved = true;
    dragState.el.classList.add("dragging");
  }
  e.preventDefault();
  placeDragged(dragState.el, e.clientY);
});

list.addEventListener("pointerup", () => {
  if (!dragState) return;
  const moved = dragState.moved;
  dragState.el.classList.remove("dragging");
  dragState = null;
  if (moved) {
    const order = [...list.querySelectorAll(".item")].map((li) => li.dataset.id);
    items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    persist();
  }
});

function toText() {
  return items.map((i) => (i.done ? "- [x] " : "- [ ] ") + i.text).join("\n");
}

function parseText(txt) {
  return txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (m) return { id: uid(), text: m[2], done: m[1].toLowerCase() === "x" };
      return { id: uid(), text: line, done: false };
    })
    .filter((i) => i.text.length > 0);
}

async function saveList() {
  const ok = await invoke("save_file", { content: toText() });
  if (ok) flash("Saved");
}

async function loadList() {
  const txt = await invoke("load_file");
  if (txt === null || txt === undefined) return;
  items = parseText(txt);
  persist();
  render();
  flash("Loaded");
}

document.getElementById("save-btn").addEventListener("click", saveList);
document.getElementById("load-btn").addEventListener("click", loadList);

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    saveList();
  }
});

render();
input.focus();
