var userInputTask = document.getElementById("userInputTask");
var searchInput = document.getElementById("searchInput");

// get task localStorage
var tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];
var finishedTasks = localStorage.getItem("finishetasks")
  ? JSON.parse(localStorage.getItem("finishetasks"))
  : [];

// عرض المهام أول ما الصفحة تفتح
displayTasks();
displayFinishedTasks();

// create or add new task
function addTask() {
  if (userInputTask.value.trim() === "") return; // ما تضيفش مهمة فاضية

  var task = {
    id: Date.now(),
    name: userInputTask.value.trim(),
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  userInputTask.value = "";
  displayTasks();
}

// view task
function displayTasks() {
  document.getElementById("taskCount").innerHTML = tasks.length;

  var box = "";
  for (var i = 0; i < tasks.length; i++) {
    box += `
            <div class="col-lg-7">
                <div class="task d-flex justify-content-between p-2 rounded-2">
                    <p class="m-0 d-flex align-items-center">${tasks[i].name}</p>
                    <div class="icons">
                        <button onclick="checkTask(${tasks[i].id})" class="btn check">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button onclick="deleteTask(${tasks[i].id})" class="btn delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <button onclick="editTask(${tasks[i].id})" class="btn delete">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>`;
  }
  document.getElementById("tasks").innerHTML =
    box || "<p class='text-center text-muted'>No tasks yet</p>";
}

// finished task
function displayFinishedTasks() {
  document.getElementById("finishedTaskCount").innerHTML = finishedTasks.length; // عدّاد منفصل

  var box = "";
  for (var i = 0; i < finishedTasks.length; i++) {
    box += `
            <div class="col-lg-7">
                <div class="task d-flex justify-content-between p-2 rounded-2">
                    <p class="m-0 d-flex align-items-center text-decoration-line-through text-success">
                        ${finishedTasks[i].name}
                    </p>
                </div>
            </div>`;
  }
  document.getElementById("finishedTasks").innerHTML =
    box || "<p class='text-center text-muted'>No finished tasks</p>";
}

// delete task
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id != id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

// done task
function checkTask(id) {
  var task = tasks.find((t) => t.id == id);
  if (task) {
    finishedTasks.push(task);
    localStorage.setItem("finishetasks", JSON.stringify(finishedTasks));

    deleteTask(id); // احذفها من المهام العادية
    displayFinishedTasks();
  }
}

// delete all tasks
function clearAll() {
  if (confirm("هل أنت متأكد من مسح كل المهام؟")) {
    localStorage.removeItem("tasks");
    localStorage.removeItem("finishetasks");
    tasks = [];
    finishedTasks = [];
    displayTasks();
    displayFinishedTasks();
  }
}

// serch in tasks
function searchTask() {
  var term = searchInput.value.trim().toLowerCase();
  var filtered = tasks.filter((task) => task.name.toLowerCase().includes(term));

  var box = "";
  if (filtered.length === 0) {
    box = `<h5 class="text-danger text-center">لا توجد مهام بهذا الاسم</h5>`;
  } else {
    for (var i = 0; i < filtered.length; i++) {
      box += `
                <div class="col-lg-7">
                    <div class="task d-flex justify-content-between p-2 rounded-2">
                        <p class="m-0 d-flex align-items-center">${filtered[i].name}</p>
                        <div class="icons">
                            <button onclick="checkTask(${filtered[i].id})" class="btn check">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button onclick="deleteTask(${filtered[i].id})" class="btn delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
    }
  }
  document.getElementById("tasks").innerHTML = box;
}

function editTask(id) {
  var task = tasks.find((t) => t.id === id); /* => serche in array for id */
  if (task) {
    userInputTask.value = task.name; /* => show name in input  */
    userInputTask.focus();
    editingId = id; /* => save number id  */
    // change btn
    document.querySelector(".btn-success").innerHTML =
      '<i class="fa-solid fa-check"></i> Save';
  }
}
