document.addEventListener('DOMContentLoaded', () => {
    const addTaskButtons = document.querySelectorAll('.add-task-btn');
    const modal = document.getElementById('task-modal');
    const closeModalButtons = modal.querySelectorAll('.modal-close, #cancel-btn');
    const taskForm = document.getElementById('task-form');
    const taskColumnInput = document.getElementById('task-column');
    const taskIdInput = document.getElementById('task-id'); // Campo oculto para ID de tarea

    // Mostrar el modal en agregar tarea
    addTaskButtons.forEach(button => {
        button.addEventListener('click', () => {
            const column = button.getAttribute('data-column');
            taskColumnInput.value = column; 
            taskIdInput.value = ''; // Limpiar el ID de tarea
            modal.classList.add('is-active'); 
        });
    });

    // Cerrar el modal 
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('is-active'); 
            taskForm.reset(); // Limpia el formulario
        });
    });

    // Manejar el envío del formulario para agregar o editar una tarea
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const title = document.getElementById('task-title').value;
        const trimmedTitle = title.length > 25 ? title.substring(0, 25) + '...' : title;
        const description = document.getElementById('task-description').value;
        const assigned = document.getElementById('task-assigned').value;
        const priority = document.getElementById('task-priority').value;
        const deadline = document.getElementById('task-deadline').value;
        const column = taskColumnInput.value;
        const taskId = taskIdInput.value;

        const taskList = document.getElementById(`${column}-tasks`);
        
        if (taskId) {
            // Editar tarea existente
            const taskElement = taskList.querySelector(`.task[data-id="${taskId}"]`);
            taskElement.querySelector('strong').textContent = trimmedTitle;
            taskElement.querySelector('p').textContent = description;
            taskElement.querySelector('small').innerHTML = `Assigned: ${assigned}, Priority: ${priority}, Deadline: ${deadline}`;
        } else {
            // Agregar nueva tarea
            const taskHTML = `
                <li class="task" data-id="${Date.now()}">
                    <div class="task-content">
                        <strong>${trimmedTitle}</strong>
                        <div class="task-buttons">
                            <button class="edit-task-btn button is-small is-info is-light"><i class="fas fa-pencil-alt"></i></button>
                            <button class="delete-task-btn button is-small is-danger is-light"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <p>${description}</p>
                    <small>Assigned: ${assigned}, Priority: ${priority}, Deadline: ${deadline}</small>
                </li>
            `;
            taskList.insertAdjacentHTML('beforeend', taskHTML);
        }

        // Cerrar el modal y limpiar el formulario
        modal.classList.remove('is-active');
        taskForm.reset();
        
        // Agregar eventos de edición y eliminación a los botones recién creados
        addTaskEventListeners();
    });

    // Función para agregar eventos de edición y eliminación a los botones de tarea
    function addTaskEventListeners() {
        // Editar tareas
        document.querySelectorAll('.edit-task-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const taskElement = event.target.closest('.task');
                const taskId = taskElement.getAttribute('data-id');
                const title = taskElement.querySelector('strong').textContent;
                const description = taskElement.querySelector('p').textContent;
                const assigned = taskElement.querySelector('small').textContent.split('Assigned: ')[1].split(', ')[0];
                const priority = taskElement.querySelector('small').textContent.split('Priority: ')[1].split(', ')[0];
                const deadline = taskElement.querySelector('small').textContent.split('Deadline: ')[1];

                // Configurar el modal para editar la tarea
                document.getElementById('task-title').value = title;
                document.getElementById('task-description').value = description;
                document.getElementById('task-assigned').value = assigned;
                document.getElementById('task-priority').value = priority;
                document.getElementById('task-deadline').value = deadline;
                taskColumnInput.value = taskElement.closest('ul').id.replace('-tasks', '');
                taskIdInput.value = taskId; // Establecer el ID de tarea

                modal.classList.add('is-active'); // Mostrar el modal para edición
            });
        });

        // Eliminar tareas
        document.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const taskElement = event.target.closest('.task');
                taskElement.remove(); // Eliminar la tarea del DOM
            });
        });
    }

    // Llamar a la función para agregar eventos a las tareas existentes (si hay alguna al cargar)
    addTaskEventListeners();
});
