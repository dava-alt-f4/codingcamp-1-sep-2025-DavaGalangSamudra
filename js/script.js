// Display current date
function today() {
  return new Date().toISOString().split("T")[0];
}
const toDoDateInput = document.getElementById("to-do_date_input");
toDoDateInput.min = today();
toDoDateInput.value = today();



// take input from the user
const toDoInput = document.getElementById("to-do_input");
const filterSelect = document.getElementById("filter");
const noTasksMessage = document.getElementById("no-tasks");
const tbody = document.querySelector("tbody");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


// Add task
function addTask() {
    const task = toDoInput.value.trim();
    const dueDate = toDoDateInput.value;
    if (task === "") {
        document.getElementById("error-message").textContent =
        "Task cannot be empty.";
  } else {
    if (task.length < 3) {
      document.querySelector(".error").textContent =
        "Task must be at least 3 characters long.";
    } else {
        let taskObject = {
            id: Date.now(),
            task: task,
            dueDate: dueDate,
            complete: false,
        };
        tasks.push(taskObject);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        toDoInput.value = "";
        toDoDateInput.value = "";
        document.location.reload();
    }
}
}

// Display tasks
function displayTasks(filter = "all") {
    tbody.innerHTML = "";
    let filteredTasks = tasks;
    if (filter === "completed") {
        filteredTasks = tasks.filter((task) => task.complete === true);
    } else if (filter === "pending") {
        filteredTasks = tasks.filter((task) => task.complete === false && task.dueDate >= today());
    } else if (filter === "late") {
        const todayStr = today();
        filteredTasks = tasks.filter(
            (task) => task.complete !== true && task.dueDate < todayStr
        );
    }
    if (filteredTasks.length === 0) {
        tbody.innerHTML = `
        <tr class="no-tasks" id="no-tasks">
        <td colspan="4">No tasks found. Time to add some!</td>
        </tr>
        `;
        return;
    }

  // Render filtered tasks
  filteredTasks.forEach(function (task) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td class="task" id="task-${task.id}">${task.task}</td>
      <td class="due-date" id="due-date-${task.id}">${task.dueDate}</td>
      <td class="status" id="status-${task.id}"><span>${task.complete ? "Completed" : task.dueDate < today() ? "Late" : "Pending"}</span></td>
      <td class="actions" id="actions-${task.id}">
      <button class="edit-btn" data-id="${task.id}" id="edit-${task.id}" onclick="editTask(${task.id})"><i data-feather="edit"></i></button>
      <button class="delete-btn" data-id="${task.id}" id="delete-${task.id}" onclick="deleteTask(${task.id})"><i data-feather="trash-2"></i></button>
      <button class="complete-btn" data-id="${task.id}" id="complete-${task.id}" onclick="completeTask(${task.id})"><i data-feather="${task.complete ? 'check-square' : 'square'}"></i></button>
      </td>
      `;
      tbody.appendChild(tr);

      if (!task.complete) {
        if (task.dueDate < today()) {
            document.querySelector(".status").classList.add("late");
            } else {
            document.querySelector(".status").classList.add("pending");
            }
        } else {
            document.querySelector(".status").classList.add("completed");
        }
    });
    feather.replace();
}
// Initial display
if (tasks.length > 0) {
    noTasksMessage.style.display = "none";
    displayTasks(filterSelect.value);
} else {
    noTasksMessage.style.display = "table-row";
}


// Filter tasks
filterSelect.addEventListener("change", function () {
  displayTasks(filterSelect.value);
});

// Delete all tasks
function deleteAllTasks() {
    document.getElementById("delete-alert").style.display = "block";
    document.getElementById("alert-overlay").style.display = "block";
}
function cancelDelete() {
    document.getElementById("delete-alert").style.display = "none";
    document.getElementById("alert-overlay").style.display = "none";
}
function continueDelete() {
    localStorage.removeItem("tasks");
    document.location.reload();
}

// Actions buttons
// Edit button
function editTask(id) {
  document.getElementById(`actions-${id}`).style.display = "none";
  //  New buttons
  const newActions = document.createElement("td");
  newActions.classList.add("new-actions");
  newActions.innerHTML = `
    <button class="save-btn" data-id="${id}" id="save-${id}" onclick="saveEdit(${id})"><i data-feather="check"></i></button>
    <button class="cancel-btn" data-id="${id}" id="cancel-${id}" onclick="cancelEdit(${id})"><i data-feather="x"></i></button>
  `;
  document.getElementById(`actions-${id}`).parentNode.appendChild(newActions);
  feather.replace();
  //   Edit fields
  document.getElementById(`task-${id}`).innerHTML = `<input type="text" class="edit-input" value="${tasks.find((task) => task.id === id).task}" />`;
  document.getElementById(`due-date-${id}`).innerHTML = `<input type="date" class="edit-input" value="${tasks.find((task) => task.id === id).dueDate}" />`;
}
// Save button
function saveEdit(id) { 
    const editedTask = document.querySelector(`#task-${id} input`).value.trim();
    const editedDueDate = document.querySelector(`#due-date-${id} input`).value.trim();
    if (editedTask == "") {
        document.getElementById("error-message").textContent =
            "Task cannot be empty.";
    } else {
        if (editedTask.length < 3) {
            document.querySelector(".error").textContent =
                "Task must be at least 3 characters long.";
        } else {
            const index = tasks.findIndex((task) => task.id === id);
            tasks[index].task = editedTask;
            tasks[index].dueDate = editedDueDate;
            localStorage.setItem("tasks", JSON.stringify(tasks));
            displayTasks();
        }
    }
}

// Cancel button
function cancelEdit(id) {
  document.getElementById(`task-${id}`).textContent = tasks.find((task) => task.id === id).task;
  document.getElementById(`due-date-${id}`).textContent = tasks.find((task) => task.id === id).dueDate;
  document.querySelector(`.new-actions`).remove();
  document.getElementById(`actions-${id}`).style.display = "table-cell";
}

// Delete button
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.location.reload();
}

// Complete button
function completeTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    tasks[index].complete = true;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks(filterSelect.value);
  }
  feather.replace();
}