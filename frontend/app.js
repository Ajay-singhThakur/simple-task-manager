const statusMessage = document.getElementById("statusMessage");
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const tasksList = document.getElementById("tasksList");

let editingId = null;

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMessage(text, kind = "info") {
  statusMessage.textContent = text;
  if (!text) {
    statusMessage.className = "status-message";
  } else {
    statusMessage.className = `status-message status-${kind}`;
  }
}

function resetForm() {
  editingId = null;
  titleInput.value = "";
  descriptionInput.value = "";
  submitBtn.textContent = "Add Task";
  cancelBtn.style.display = "none";
  statusMessage.textContent = "";
}

async function fetchJson(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = data?.error || `Request failed (${res.status})`;
    throw new Error(err);
  }

  return data;
}

async function loadTasks() {
  setMessage("Loading tasks...", "info");
  const data = await fetchJson("/api/tasks");
  renderTasks(data.tasks || []);
  setMessage("");
}

function renderTasks(tasks) {
  tasksList.innerHTML = "";

  if (!tasks.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Add one above.";
    tasksList.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task";

    const titleRow = document.createElement("div");
    titleRow.className = "task-row";

    const title = document.createElement("div");
    title.className = "task-title";
    title.innerHTML = escapeHtml(task.title);

    const badge = document.createElement("span");
    badge.className = `status-badge status-${task.status || "pending"}`;
    badge.textContent = task.status === "completed" ? "Completed" : "Pending";

    titleRow.appendChild(title);
    titleRow.appendChild(badge);

    const desc = document.createElement("div");
    desc.className = "task-desc";
    desc.textContent = task.description || "";
    if (!task.description) desc.classList.add("muted");

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn btn-secondary";
    toggleBtn.type = "button";
    toggleBtn.textContent = task.status === "completed" ? "Mark pending" : "Mark completed";
    toggleBtn.addEventListener("click", async () => {
      try {
        toggleBtn.disabled = true;
        const nextStatus = task.status === "completed" ? "pending" : "completed";
        await fetchJson(`/api/tasks/${task.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
        await loadTasks();
      } catch (e) {
        setMessage(e.message, "error");
      } finally {
        toggleBtn.disabled = false;
      }
    });

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-tertiary";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      editingId = task.id;
      titleInput.value = task.title || "";
      descriptionInput.value = task.description || "";
      submitBtn.textContent = "Update Task";
      cancelBtn.style.display = "inline-block";
      titleInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      const ok = window.confirm("Delete this task?");
      if (!ok) return;
      try {
        deleteBtn.disabled = true;
        await fetchJson(`/api/tasks/${task.id}`, { method: "DELETE" });
        if (editingId === task.id) resetForm();
        await loadTasks();
      } catch (e) {
        setMessage(e.message, "error");
      } finally {
        deleteBtn.disabled = false;
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(titleRow);
    li.appendChild(desc);
    li.appendChild(actions);

    tasksList.appendChild(li);
  }
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    setMessage("Title must not be empty.", "error");
    titleInput.focus();
    return;
  }

  const description = descriptionInput.value.trim();
  const payload = { title, description };

  try {
    submitBtn.disabled = true;
    setMessage(editingId ? "Updating task..." : "Adding task...", "info");

    if (editingId === null) {
      await fetchJson("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
    } else {
      await fetchJson(`/api/tasks/${editingId}`, { method: "PUT", body: JSON.stringify({ ...payload }) });
    }

    resetForm();
    await loadTasks();
  } catch (err) {
    setMessage(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

// Initial load
loadTasks().catch((e) => setMessage(e.message, "error"));

