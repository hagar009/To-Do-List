// ========================== Global Variables ==========================
const userInputTask = document.getElementById("userInputTask");
const searchInput   = document.getElementById("searchInput");

let editingId         = null;   // Tracks if we are editing a task
let lastCompletedTask = null;   // For Undo functionality
let undoTimeout       = null;   // Timeout controller for Undo snackbar

let tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

let finishedTasks = localStorage.getItem("finishetasks")
  ? JSON.parse(localStorage.getItem("finishetasks"))
  : [];

// Initial render
displayTasks();
displayFinishedTasks();

// ========================== Add or Update Task ==========================
function addTask() {
  const value = userInputTask.value.trim();
  if (value === "") return;

  if (editingId !== null) {
    // Update existing task
    const index = tasks.findIndex(t => t.id === editingId);
    if (index !== -1) {
      tasks[index].name = value;
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    editingId = null;
    document.querySelector(".btn-success").innerHTML = '<i class="fa fa-plus"></i>';
  } else {
    // Add new task
    const task = {
      id: Date.now(),
      name: value,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  userInputTask.value = "";
  displayTasks();
  userInputTask.focus();
}

// Enter key → add/save
userInputTask.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

// Escape key → cancel editing
userInputTask.addEventListener("keydown", e => {
  if (e.key === "Escape" && editingId !== null) {
    editingId = null;
    userInputTask.value = "";
    document.querySelector(".btn-success").innerHTML = '<i class="fa fa-plus"></i>';
  }
});

// ========================== Format Date (Arabic style) ==========================
function formatDate(isoString) {
  if (!isoString) return "Not specified";
  const date = new Date(isoString);
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  };
  let str = date.toLocaleDateString('ar-EG', options);
  return str.replace(' ص', ' صباحًا').replace(' م', ' مساءً');
}

// ========================== Display Active Tasks ==========================
function displayTasks() {
  document.getElementById("taskCount").textContent = tasks.length;
  let box = "";

  for (let task of tasks) {
    const createdDate = task.createdAt ? formatDate(task.createdAt) : '';

    box += `
      <div class="col-lg-7">
        <div class="task d-flex flex-column gap-3 p-3 rounded-2 position-relative">
          <div class="d-flex justify-content-between align-items-start">
            <p class="m-0 flex-grow-1 pe-3 fs-5">${task.name}</p>
            <div class="icons">
              <button onclick="checkTask(${task.id})" class="btn check" title="Complete">
                <i class="fa-solid fa-check"></i>
              </button>
              <button onclick="deleteTask(${task.id})" class="btn delete" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
              <button onclick="editTask(${task.id})" class="btn edit" title="Edit">
                <i class="fa-solid fa-edit"></i>
              </button>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <i class="fa-regular fa-clock text-cyan me-2"></i>
            <span class="text-light small">Created: ${createdDate}</span>
          </div>
        </div>
      </div>`;
  }

  document.getElementById("tasks").innerHTML = box || `<p class="text-center text-muted">No tasks yet</p>`;
}

// ========================== Display Completed Tasks ==========================
function displayFinishedTasks() {
  document.getElementById("finishedTaskCount").textContent = finishedTasks.length;
  let box = "";

  for (let task of finishedTasks) {
    const created = task.createdAt ? formatDate(task.createdAt) : '';
    const completed = task.completedAt ? formatDate(task.completedAt) : '';

    box += `
      <div class="col-lg-7">
        <div class="task d-flex flex-column gap-3 p-3 rounded-2">
          <p class="m-0 text-decoration-line-through text-success fs-5">${task.name}</p>
          <div class="small">
            <div class="d-flex align-items-center mb-1">
              <i class="fa-regular fa-clock text-cyan me-2"></i>
              <span class="text-light">Created: ${created}</span>
            </div>
            <div class="d-flex align-items-center text-success">
              <i class="fa-solid fa-check-circle me-2"></i>
              <span>Completed: ${completed}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  document.getElementById("finishedTasks").innerHTML = box || `<p class="text-center text-muted">No completed tasks</p>`;
}

// ========================= 2.0: Complete Task + Undo Snackbar ==========================
function checkTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Move to completed
  const completedTask = { ...task, completedAt: new Date().toISOString() };
  finishedTasks.push(completedTask);
  localStorage.setItem("finishetasks", JSON.stringify(finishedTasks));

  // Save for possible undo
  lastCompletedTask = task;

  // Remove from active tasks
  deleteTask(id);
  displayFinishedTasks();

  // Show Undo snackbar
  showUndoSnackbar();
}

// ========================== Show Undo Snackbar ==========================
function showUndoSnackbar() {
  // Remove any existing snackbar
  const old = document.getElementById("undoSnackbar");
  if (old) old.remove();

  const snackbar = document.createElement("div");
  snackbar.id = "undoSnackbar";
  snackbar.innerHTML = `
    <div class="d-flex align-items-center justify-content-between bg-dark text-light p-3 rounded shadow-lg border border-success">
      <div>
        <i class="fa-solid fa-check text-success me-2"></i>
        <strong>Task completed</strong>
      </div>
      <button onclick="undoComplete()" class="btn btn-sm btn-outline-light ms-3">Undo</button>
    </div>
  `;
  snackbar.style.cssText = `
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    z-index:9999; animation:slideUp 0.4s ease; max-width:400px;
  `;
  document.body.appendChild(snackbar);

  // Auto-hide after 5 seconds
  undoTimeout = setTimeout(() => {
    if (snackbar.parentElement) snackbar.remove();
    lastCompletedTask = null;
  }, 5000);
}

// ========================== Undo Completion ==========================
function undoComplete() {
  if (!lastCompletedTask) return;

  // Return task to active list
  tasks.push(lastCompletedTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Remove from completed list
  finishedTasks = finishedTasks.filter(t => t.id !== lastCompletedTask.id);
  localStorage.setItem("finishetasks", JSON.stringify(finishedTasks));

  // Refresh UI
  displayTasks();
  displayFinishedTasks();

  // Remove snackbar immediately
  const snackbar = document.getElementById("undoSnackbar");
  if (snackbar) snackbar.remove();
  clearTimeout(undoTimeout);
  lastCompletedTask = null;
}

// ========================== Delete Task ==========================
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

// ========================== Edit Task ==========================
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    userInputTask.value = task.name;
    userInputTask.focus();
    editingId = id;
    document.querySelector(".btn-success").innerHTML = '<i class="fa-solid fa-check"></i> Save';
  }
}

// ========================== Search Tasks ==========================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchTask() {
  const term = searchInput.value.trim();
  if (term === "") { displayTasks(); return; }

  const filtered = tasks.filter(t => t.name.toLowerCase().includes(term.toLowerCase()));
  let box = "";

  if (filtered.length === 0) {
    box = `<div class="col-12"><h5 class="text-danger text-center">Not found</h5></div>`;
  } else {
    for (let task of filtered) {
      let taskName = task.name;
      if (term) {
        const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
        taskName = taskName.replace(regex, '<span class="highlight">$1</span>');
      }
      const createdDate = task.createdAt ? formatDate(task.createdAt) : '';

      box += `
        <div class="col-lg-7">
          <div class="task d-flex flex-column gap-3 p-3 rounded-2">
            <div class="d-flex justify-content-between align-items-start">
              <p class="m-0 flex-grow-1 pe-3 fs-5">${taskName}</p>
              <div class="icons">
                <button onclick="checkTask(${task.id})" class="btn check"><i class="fa-solid fa-check"></i></button>
                <button onclick="deleteTask(${task.id})" class="btn delete"><i class="fa-solid fa-trash"></i></button>
                <button onclick="editTask(${task.id})" class="btn edit"><i class="fa-solid fa-edit"></i></button>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <i class="fa-regular fa-clock text-cyan me-2"></i>
              <span class="text-light small">Created: ${createdDate}</span>
            </div>
          </div>
        </div>`;
    }
  }
  document.getElementById("tasks").innerHTML = box;
}

// ========================== Clear All ==========================
function clearAll() {
  if (confirm("Are you sure you want to delete all tasks?")) {
    localStorage.removeItem("tasks");
    localStorage.removeItem("finishetasks");
    tasks = [];
    finishedTasks = [];
    displayTasks();
    displayFinishedTasks();
  }
}