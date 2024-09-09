document.addEventListener('DOMContentLoaded', async () => {
    const columnsContainer = document.getElementById('columns-container');
    const taskModal = document.getElementById('task-modal');
    const columnModal = document.getElementById('column-modal');
    const closeModalButtons = document.querySelectorAll('.modal-close, #cancel-btn, #cancel-column-btn');
    const taskForm = document.getElementById('task-form');
    const columnForm = document.getElementById('column-form');
    let editingTask = null;
    let editingColumn = null;

    // Cargar columnas y tareas desde la API
    async function loadColumns() {
        const columns = await fetchColumns();
        columns.forEach(column => renderColumn(column));
    }

    async function loadTasks() {
        const tasks = await fetchTasks();
        tasks.forEach(task => renderTask(task));
    }

    async function init() {
        await loadColumns();
        await loadTasks();
        addDragAndDropEventListeners(); 
    }

    init();

    // Función para renderizar una columna
    function renderColumn(column) {
        const columnHTML = `
            <article class="column" id="${column.id}">
                <header>
                    <h2 class="list-title">${column.name}</h2>
                    <div class="column-buttons">
                        <button class="edit-column-btn button is-small is-info is-light"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-column-btn button is-small is-danger is-light"><i class="fas fa-times"></i></button>
                    </div>
                </header>
                <div class="column-content" id="${column.id}-tasks" data-column-id="${column.id}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
                <footer>
                    <button class="button is-text add-task-btn" data-column="${column.id}">+ Add a Task</button>
                </footer>
            </article>
        `;
        columnsContainer.insertAdjacentHTML('beforeend', columnHTML);
        addColumnEventListeners(document.getElementById(column.id));
    }

    // Función para renderizar una tarea
    function renderTask(task) {
        const column = document.getElementById(task.status + '-tasks');
        if (column) {
            const taskElement = createTaskElement(task);
            column.appendChild(taskElement);
        }
    }

    // Función para crear un elemento de tarea
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.setAttribute('id', task.id);
        taskElement.setAttribute('draggable', 'true');
        taskElement.innerHTML = `
            <header>
                <h3 class="task-title">${task.title}</h3>
                <div class="task-buttons">
                    <button class="edit-task-btn button is-small is-info is-light"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-task-btn button is-small is-danger is-light"><i class="fas fa-times"></i></button>
                </div>
            </header>
            <div class="task-body">
                <p class="task-description">${task.description}</p>
                <p class="task-assigned">Assigned to: ${task.assigned}</p>
                <p class="task-priority">Priority: ${task.priority}</p>
                <p class="task-deadline">Deadline: ${task.deadline}</p>
            </div>
        `;
        addTaskEventListeners(taskElement);
        return taskElement;
    }

    // Handle adding a new column
    document.getElementById('create-column-btn').addEventListener('click', () => {
        columnForm.reset();
        columnModal.classList.add('is-active');
        editingColumn = null;
    });

    // Handle form submission for column
    columnForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('column-name').value;
        const columnData = { name };
        if (editingColumn) {
            const columnElement = document.getElementById(editingColumn);
            await updateColumn(editingColumn, columnData);
            columnElement.querySelector('.list-title').textContent = name;
        } else {
            const newColumn = await addColumn(columnData);
            renderColumn(newColumn);
        }
        columnModal.classList.remove('is-active');
    });

    // Handle column modal close
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            columnModal.classList.remove('is-active');
            taskModal.classList.remove('is-active');
        });
    });

    // Handle adding tasks
    document.addEventListener('click', (event) => {
        if (event.target.matches('.add-task-btn')) {
            const columnId = event.target.getAttribute('data-column');
            document.getElementById('task-column').value = columnId;
            taskForm.reset();
            taskModal.classList.add('is-active');
            editingTask = null;
        }
    });

    // Handle form submission for tasks
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const columnId = document.getElementById('task-column').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const assigned = document.getElementById('task-assigned').value;
        const priority = document.getElementById('task-priority').value;
        const deadline = document.getElementById('task-deadline').value;
        const taskData = { title, description, assigned, priority, deadline, status: columnId };
        if (editingTask) {
            await updateTask(editingTask, taskData);
            const taskElement = document.getElementById(editingTask);
            taskElement.querySelector('.task-title').textContent = title;
            taskElement.querySelector('.task-description').textContent = description;
            taskElement.querySelector('.task-assigned').textContent = `Assigned to: ${assigned}`;
            taskElement.querySelector('.task-priority').textContent = `Priority: ${priority}`;
            taskElement.querySelector('.task-deadline').textContent = `Deadline: ${deadline}`;
        } else {
            const newTask = await addTask(taskData);
            const column = document.getElementById(columnId + '-tasks');
            if (column) {
                const taskElement = createTaskElement(newTask);
                column.appendChild(taskElement);
            }
        }
        taskModal.classList.remove('is-active');
    });

    // Handle editing and deleting tasks and columns
    function addTaskEventListeners(taskElement) {
        taskElement.querySelector('.edit-task-btn').addEventListener('click', () => {
            const taskId = taskElement.getAttribute('id');
            editingTask = taskId;
            const taskTitle = taskElement.querySelector('.task-title').textContent;
            const taskDescription = taskElement.querySelector('.task-description').textContent;
            const taskAssigned = taskElement.querySelector('.task-assigned').textContent.replace('Assigned to: ', '');
            const taskPriority = taskElement.querySelector('.task-priority').textContent.replace('Priority: ', '');
            const taskDeadline = taskElement.querySelector('.task-deadline').textContent.replace('Deadline: ', '');
            document.getElementById('task-title').value = taskTitle;
            document.getElementById('task-description').value = taskDescription;
            document.getElementById('task-assigned').value = taskAssigned;
            document.getElementById('task-priority').value = taskPriority;
            document.getElementById('task-deadline').value = taskDeadline;
            document.getElementById('task-column').value = taskElement.closest('.column').getAttribute('id');
            taskModal.classList.add('is-active');
        });

        taskElement.querySelector('.delete-task-btn').addEventListener('click', async () => {
            const taskId = taskElement.getAttribute('id');
            await deleteTask(taskId);
            taskElement.remove();
        });
    }

    function addColumnEventListeners(columnElement) {
        columnElement.querySelector('.edit-column-btn').addEventListener('click', () => {
            editingColumn = columnElement.getAttribute('id');
            document.getElementById('column-name').value = columnElement.querySelector('.list-title').textContent;
            columnModal.classList.add('is-active');
        });

        columnElement.querySelector('.delete-column-btn').addEventListener('click', async () => {
            const columnId = columnElement.getAttribute('id');
            await deleteColumn(columnId);
            columnElement.remove();
        });
    }

    // Drag and drop
    function allowDrop(event) {
        event.preventDefault();
    }

    function drag(event) {
        event.dataTransfer.setData("text", event.target.id);
    }


    function drop(event) {
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text");
        const draggedElement = document.getElementById(taskId);
        const target = event.target;
    
        if (target && target.classList.contains('column-content')) {
            // Mueve la tarea al nuevo contenedor
            target.appendChild(draggedElement);
    
            // Actualiza el estado de la tarea
            const newStatus = target.getAttribute('data-column-id');
            
            // Obtén los datos de la tarea
            const taskTitle = draggedElement.querySelector('.task-title').textContent;
            const taskDescription = draggedElement.querySelector('.task-description').textContent;
            const taskAssigned = draggedElement.querySelector('.task-assigned').textContent.replace('Assigned to: ', '');
            const taskPriority = draggedElement.querySelector('.task-priority').textContent.replace('Priority: ', '');
            const taskDeadline = draggedElement.querySelector('.task-deadline').textContent.replace('Deadline: ', '');
    
            const taskData = {
                id: taskId,
                title: taskTitle,
                description: taskDescription,
                assigned: taskAssigned,
                priority: taskPriority,
                deadline: taskDeadline,
                status: newStatus
            };
    
            updateTask(taskData);
        }
    }

    function addDragAndDropEventListeners() {
        document.querySelectorAll('.task').forEach(task => {
            task.addEventListener('dragstart', drag);
        });

        document.querySelectorAll('.column-content').forEach(columnContent => {
            columnContent.addEventListener('dragover', allowDrop);
            columnContent.addEventListener('drop', drop);
        });
    }

    // Event listener for the escape key to close modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            columnModal.classList.remove('is-active');
            taskModal.classList.remove('is-active');
        }
    });
});
