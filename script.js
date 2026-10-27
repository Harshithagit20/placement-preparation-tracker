const STORAGE_KEY = "prepTrackDataV1";
const defaultData = { tasks: [], dsa: [], goal: 3 };
let data = loadData();

const $ = (selector) => document.querySelector(selector);
const taskForm = $("#task-form");
const taskInput = $("#task-input");
const taskCategory = $("#task-category");
const taskList = $("#task-list");
const emptyState = $("#empty-state");
const dsaForm = $("#dsa-form");
const dsaInput = $("#dsa-input");

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : structuredClone(defaultData);
  } catch (error) {
    console.error("Could not load saved data:", error);
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderTasks() {
  taskList.replaceChildren();
  emptyState.hidden = data.tasks.length > 0;

  data.tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = `task-row${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.done ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveData();
      render();
    });

    const title = document.createElement("span");
    title.className = "task-text";
    title.textContent = task.title;

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = task.category;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", () => {
      data.tasks = data.tasks.filter((item) => item.id !== task.id);
      saveData();
      render();
    });

    row.append(checkbox, title, category, remove);
    taskList.append(row);
  });
}

function renderDsa() {
  const list = $("#dsa-list");
  list.replaceChildren();
  data.dsa.forEach((problem) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = problem.title;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${problem.title}`);
    remove.addEventListener("click", () => {
      data.dsa = data.dsa.filter((entry) => entry.id !== problem.id);
      saveData();
      render();
    });
    item.append(name, remove);
    list.append(item);
  });
}

function renderStats() {
  const completed = data.tasks.filter((task) => task.done).length;
  const total = data.tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  $("#completed-count").textContent = completed;
  $("#dsa-count").textContent = data.dsa.length;
  $("#goal-count").textContent = data.goal;
  $("#daily-goal").value = data.goal;
  $("#task-progress").textContent = `${percent}% complete`;
  $("#progress-fill").style.width = `${percent}%`;
}

function render() {
  renderTasks();
  renderDsa();
  renderStats();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  data.tasks.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    title,
    category: taskCategory.value,
    done: false
  });
  taskInput.value = "";
  saveData();
  render();
  taskInput.focus();
});

dsaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = dsaInput.value.trim();
  if (!title) return;
  data.dsa.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    title
  });
  dsaInput.value = "";
  saveData();
  render();
});

$("#save-goal").addEventListener("click", () => {
  const value = Number($("#daily-goal").value);
  if (!Number.isInteger(value) || value < 1 || value > 20) {
    alert("Please choose a daily goal from 1 to 20 tasks.");
    return;
  }
  data.goal = value;
  saveData();
  render();
});

$("#reset-data").addEventListener("click", () => {
  if (!confirm("This will delete all tasks and DSA entries saved in this browser. Continue?")) return;
  data = structuredClone(defaultData);
  saveData();
  render();
});

$("#today-date").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short", month: "short", day: "numeric"
}).format(new Date());

render();
