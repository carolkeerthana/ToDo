const taskInput = document.querySelector(".task-input input"),
notification = document.querySelector(".notification"),
filters = document.querySelectorAll(".filters span"),
clearAll = document.querySelector(".clear-btn"),
iconClick = document.querySelector(".icon"),
taskBox = document.querySelector(".task-box"),
allCountContainer = document.getElementById("all-count"),
pendingCountContainer = document.getElementById("pending-count"),
completedCountContainer = document.getElementById("completed-count");

let editId;
let isEditedTask = false;
//getting localStorage todo-list
let todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        showTodo(btn.id);
    })
})

function showNotification(text, id) {
    notification.textContent = text
    notification.classList.add(`${id}`)
    setTimeout(() => {
        notification.textContent = ""
        notification.classList.remove(`${id}`)
    }, 1000)
}

//  function is responsible for displaying tasks based on the specified filter.
function showTodo(filter){
    let li = "";
    let totalTasks = 0;
    let pendingTasks = 0;
    let completedTasks = 0;
    if(todos){
        todos.forEach((todo, id) => {
            //if todo status is completed, set the isCompleted value to checked
            let isCompleted = todo.status == "completed" ? "checked" : "";

            if(filter == todo.status || filter == "all"){
                li +=`<li class="task">
                        <label for="${id}">
                            <input onclick="handleCheckboxClick(event)" type="checkbox" id="${id}"${isCompleted}>
                        <p class="${isCompleted}">${todo.name}</p>
                        </label>
                        <div class="settings">
                        <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                        <ul class="task-menu">
                            <li onclick="editTask(${id}, '${todo.name}')"><i class="uil uil-pen"></i>Edit</li>
                            <li onclick="deleteTask(${id})"><i class="uil uil-trash"></i>Delete</li>
                        </ul>
                        </div>
                      </li>`;

                    // Count tasks based on the selected filter
                    totalTasks++;

                    if (todo.status === "pending") {
                        pendingTasks++;
                    } else if (todo.status === "completed") {
                        completedTasks++;
                    }
                    }
                });
            }
            // Set the filter-specific class on the taskBox container
            taskBox.className = `task-box filters-${filter}`;
            // if li isn't empty, insert this value inside taskbox else insert span
            taskBox.innerHTML = li;

            updateTaskCounts(filter, totalTasks, pendingTasks, completedTasks);
}
showTodo("all");

// Updating the task count containers based on the selected filter
function updateTaskCounts(filter, totalTasks, pendingTasks, completedTasks){
    allCountContainer.textContent = "";
    pendingCountContainer.textContent = "";
    completedCountContainer.textContent = "";

    if (filter === "all") {
        allCountContainer.textContent = `You have total ${totalTasks} tasks`;
    } else if (filter === "pending") {
        pendingCountContainer.textContent = `You have ${pendingTasks} pending tasks`;
    } else if (filter === "completed") {
        completedCountContainer.textContent = `You have completed ${completedTasks} tasks`;
    }
}

// Updating the showTask function to display counts based on the active filter
function showTask() {
    const activeFilter = document.querySelector("span.active").id;

    if (activeFilter === "all") {
        showTodo("all");
    } else if (activeFilter === "completed") {
        showTodo("completed");
    } else {
        showTodo("pending");
    }
}

// while pressing the settings icon
function showMenu(selectedTask){
    //getting task menu div
    let taskMenu = selectedTask.parentElement.lastElementChild;
    taskMenu.classList.add("show");
    document.addEventListener("click", e =>{
        //removing show class from the task menu on the document click
        if(e.target.tagName != "I" || e.target != selectedTask){
            taskMenu.classList.remove("show");
        }
    });
}

// -----Deleting a task---------

let taskToDelete; // Store the selected task globally for deletion confirmation

// Function to initiate task deletion
function deleteTask(deleteId) {
    // Store the task to delete globally
    taskToDelete = {
        id: deleteId,
        name: todos[deleteId].name
    };
    taskInput.value = "";
    
    // Show the delete confirmation popup
    showDeleteConfirmationPopup();
}

// Function to show the delete confirmation popup
function showDeleteConfirmationPopup() {
    const taskDetailsContainer = document.getElementById('taskDetails');
    taskDetailsContainer.innerHTML = `<strong>Are you sure you want to delete the task?</strong> <br> <div id="taskDetailsContent" class="task-container"> ${taskToDelete.name} </div>`;
    // class to the popup to style the container
    taskDetailsContainer.classList.add('popup-delete');

    document.getElementById('deleteConfirmationOverlay').style.display = 'flex';
}

// Function to hide the delete confirmation popup
function hideDeleteConfirmationPopup() {
    document.getElementById('deleteConfirmationOverlay').style.display = 'none';
}

// if ok btn is pressed
function confirmDeleteTask() {
        // removing selected task from array/todos
        todos.splice(taskToDelete.id, 1);
        localStorage.setItem("todo-list", JSON.stringify(todos));
        // showTodo("all");
        hideDeleteConfirmationPopup(); // Hide the delete confirmation popup
        showNotification("Deleted the task", "danger");
        showTask();
}

// if cancel btn is pressed
function cancelDeleteTask() {
    hideDeleteConfirmationPopup(); // Hide the delete confirmation popup
}

// --------------ClearALL----------------------
// Function to update "Clear All" button state
function updateClearAllButtonState() {
    clearAll.disabled = taskInput.value.trim() === "" && (!localStorage.getItem("todo-list") || JSON.parse(localStorage.getItem("todo-list")).length === 0);
}

// Function to check if there are tasks in localStorage
function checkLocalStorageTasks() {
    updateClearAllButtonState();
}

// Event listener for input changes
taskInput.addEventListener("input", updateClearAllButtonState);

// Call the function when the page loads
window.addEventListener("DOMContentLoaded", checkLocalStorageTasks);

// CSS to change cursor style when hovering over disabled button
clearAll.addEventListener("mouseover", function() {
    if (clearAll.disabled) {
        clearAll.style.cursor = "not-allowed";
        clearAll.style.opacity = "0.5"; // Dimming the button
    }
});

clearAll.addEventListener("mouseout", function() {
    clearAll.style.cursor = ""; // Reset cursor style when mouse moves out
    clearAll.style.opacity = ""; // Reset opacity when mouse moves out
});

// Function to show the popup
function showPopup() {
    document.getElementById('confirmationPopup').style.display = 'flex';
}

// Function to hide the popup
function hidePopup() {
    document.getElementById('confirmationPopup').style.display = 'none';
}

// Function to handle the "Ok" button click
function confirmClear(){
    // removing all items of array/todos
    todos.splice(0, todos.length);
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo("all");
    hidePopup();

    // Disable the "Clear All" button after clearing todos
    clearAll.setAttribute("disabled", "disabled");
}

clearAll.addEventListener("click", showPopup);

// -----Updating a task---------

let selectedCheckbox; // Store the selected checkbox globally

// Function to handle the checkbox click
function handleCheckboxClick(event) {
    selectedCheckbox = event.target; // Store the selected checkbox
    let taskName = selectedCheckbox.parentElement.querySelector('p').textContent; // Get the task name
    showStatusUpdatePopup(taskName); // Show the status update popup
}

// Function to show the status update popup
function showStatusUpdatePopup(taskName) {
    
    // Display the task name in the existing paragraph element
    document.getElementById('taskToUpdate').innerHTML = `<strong> Are you sure you want to update the task status? </strong> <br><div class="task-container"> ${taskName}</div>`;
    document.getElementById('statusUpdateOverlay').style.display = 'flex';
}

// Function to hide the status update popup
function hideStatusUpdatePopup() {
    document.getElementById('statusUpdateOverlay').style.display = 'none';
}

// Function to cancel the status update
function cancelStatusUpdate() {
    selectedCheckbox.checked = !selectedCheckbox.checked; // Toggle the checkbox state back if canceled
    hideStatusUpdatePopup(); // Hide the status update popup
}

// Function to update the status
function updateStatus(){
//getting paragraph that contains task name
    let taskName = document.getElementById('taskToUpdate').innerText;
        if(selectedCheckbox.checked){
            selectedCheckbox.parentElement.lastElementChild.classList.add("checked");
            //updating the status of selected task to completed
            todos[selectedCheckbox.id].status = "completed";
        }else{
            selectedCheckbox.parentElement.lastElementChild.classList.remove("checked"); 
            //updating the status of selected task to pending
            todos[selectedCheckbox.id].status = "pending";
        }
    localStorage.setItem("todo-list", JSON.stringify(todos));
    hideStatusUpdatePopup(); // Hide the status update popup after confirming
    showNotification("Successfully updated the task", "complete");
    showTask();
}

// To allow only alphanumeric values
taskInput.addEventListener("input", function(event){
    const enteredChar = event.data;
    const regex = /^[a-zA-Z0-9 ]*$/;
    if(!regex.test(enteredChar)){
        taskInput.value = taskInput.value.replace(enteredChar, '');
    showNotification("Invalid character entered", "warning");
    }
});

//--------To add a Task---------

taskInput.addEventListener("keyup", e =>{
//preventing to enter empty values using  trim() & if cdn(userTask)
    let userTask = taskInput.value.trim();

    // Check if the key pressed is Enter and userTask is not empty
    if (e.key === "Enter" && userTask) {
        // Check if the entered task contains only alphabets and numbers
        if (/^[a-zA-Z0-9 ]*$/.test(userTask)) {
            // Add task only if the entered task is valid
            addTask();
        } else {
            // Display a notification about the invalid character
            showNotification("Invalid character entered", "warning");
        }
    }
});

// Add an event listener to the GIF for the save operation
document.getElementById('gif').addEventListener('click', addTask);

// Add a flag to track whether typing is currently disabled
let typingDisabled = false;

// Add an event listener to limit the input to 100 characters
taskInput.addEventListener("input", function(event) {
    let userInput = event.target.value; // Get the user input from the input field
    // Limiting the userInput to 100 characters
    if (userInput.length > 100 && !typingDisabled) {
        typingDisabled = true; // Disable further typing
        event.target.value = userInput.substring(0, 100); // Truncate the input to 100 characters
        showNotification("Exceeds 100 characters", "warning");

        // Allow typing again after a short delay
        setTimeout(() => {
            typingDisabled = false;
        }, 10);
    }
});

function addTask(){
    let userTask = taskInput.value.trim();

     // Limiting the userTask to 100 characters
     if (userTask.length > 100) {
        showNotification("Exceeded 100 characters", "warning");
        return; // Exit the function if the input exceeds 100 characters
    }


    if(!isTaskAlreadyExists(userTask) && userTask.length>0){
    if(!isEditedTask){
        if(!todos){ // if todos isn't exist, pass an empty array to todos
            todos = [];
        }
        //by default task status will be pending
        let taskInfo = {name: userTask, status: "pending"};
        todos.unshift(taskInfo); //adding new task to todos
        clearAll.disabled = false;
        showNotification("Task is Added Successfully", "success");
    }else{
        isEditedTask = false;
        let editedTask = todos.splice(editId, 1)[0];
        editedTask.name = userTask;
        todos.unshift(editedTask); 
    }

    taskInput.value = "";  
    localStorage.setItem("todo-list", JSON.stringify(todos)); //saving to localStorage with todo-list name
    
    // Set the active filter to "All" after adding the task
    setActiveFilter("all");
    // Scroll the page to the top
    taskBox.scrollTo(0, 0);

    showTask();  // This will now show tasks for the "All" filter

    if (todos.length > 0) {
        clearAll.removeAttribute("disabled");
    } else {
        clearAll.setAttribute("disabled", "disabled");
    }
}else {
    // Shows a notification when the task already exists
    if(userTask !=""){
    showNotification("Task already exists", "warning");
    taskInput.value = "";
    }
}
}

// Function to check if the task already exists
function isTaskAlreadyExists(task) {
    return Array.isArray(todos) && todos.some(todo => todo.name === task);
}

// editing a task
function editTask(taskId, taskName){
    editId = taskId;
    isEditedTask = true;
    taskInput.value = taskName;
    taskInput.focus();
}

function setActiveFilter(filter) {
    const filterButtons = document.querySelectorAll('.filters span');

    filterButtons.forEach(button => {
        button.classList.remove('active');  // Remove 'active' class from all filter buttons
        if (button.id === filter) {
            button.classList.add('active');  // Add 'active' class to the selected filter button
        }
    });
}