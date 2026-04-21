const API = "http://localhost:3000/api/tasks";

const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMsg = document.getElementById("empty-msg");
const taskForm = document.getElementById("task-form");
const formError = document.getElementById("form-error");
const taskModal = new bootstrap.Modal(document.getElementById("taskModal"));

async function fetchTasks() {
  const res = await fetch(API);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  taskCount.textContent =
    total === 0 ? "" : `${done} of ${total} task${total !== 1 ? "s" : ""} completed`;

  emptyMsg.classList.toggle("d-none", total > 0);

  tasks.forEach((task) => {
    taskList.appendChild(buildCard(task));
  });
}

function buildCard(task) {
  const card = document.createElement("div");
  card.className = `task-card${task.completed ? " completed" : ""}`;
  card.dataset.id = task.id;

  const due = task.due_date
    ? `<span class="task-due">Due: ${formatDate(task.due_date)}</span>`
    : "";

  card.innerHTML = `
    <input
      type="checkbox"
      class="task-toggle"
      title="Toggle completed"
      ${task.completed ? "checked" : ""} />
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ""}
      ${due}
    </div>
    <button class="btn-delete" title="Delete task">&#x2715;</button>
  `;

  card.querySelector(".task-toggle").addEventListener("change", () => toggleTask(task.id));
  card.querySelector(".btn-delete").addEventListener("click", () => deleteTask(task.id));

  return card;
}

async function toggleTask(id) {
  await fetch(`${API}/${id}/toggle`, { method: "PATCH" });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchTasks();
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.classList.add("d-none");

  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const due_date = document.getElementById("task-due-date").value || null;

  if (!title) {
    showFormError("Title is required.");
    return;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, due_date }),
  });

  if (!res.ok) {
    const data = await res.json();
    showFormError(data.error || "Could not create task.");
    return;
  }

  taskForm.reset();
  taskModal.hide();
  fetchTasks();
});

document.getElementById("taskModal").addEventListener("hidden.bs.modal", () => {
  taskForm.reset();
  formError.classList.add("d-none");
});

function showFormError(msg) {
  formError.textContent = msg;
  formError.classList.remove("d-none");
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${m}/${d}/${y}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

fetchTasks();
