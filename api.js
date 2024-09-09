// URL del servidor
const API_URL = "http://localhost:3000";

// Función para obtener las columnas desde el servidor
async function fetchColumns() {
  try {
    const response = await fetch(`${API_URL}/columns`);
    const columns = await response.json();
    return columns;
  } catch (error) {
    console.error("Error al obtener las columnas:", error);
  }
}

// Función para agregar una columna en el servidor
async function addColumn(columnData) {
  try {
    const response = await fetch(`${API_URL}/columns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(columnData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error al agregar la columna:", error);
  }
}

// Función para actualizar una columna (al moverla de columna o editarla)
async function updateColumn(columnId, updatedColumnData) {
  try {
    await fetch(`${API_URL}/columns/${columnId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedColumnData)
    });
  } catch (error) {
    console.error("Error al actualizar la columna:", error);
  }
}

/* // Función para eliminar una columna
async function deleteColumn(columnId) {
  try {
    await fetch(`${API_URL}/columns/${columnId}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.error("Error al eliminar la columna:", error);
  }
} */

// Función para eliminar una columna
  async function deleteColumn(columnId) {
    try {
      // Obtener todas las tareas asociadas a la columna
      const responseTasks = await fetch(`${API_URL}/tasks?status=${columnId}`);
      const tasks = await responseTasks.json();

      // Eliminar todas las tareas asociadas
      await Promise.all(tasks.map(task =>
        fetch(`${API_URL}/tasks/${task.id}`, {
          method: "DELETE"
        })
      ));

      // Eliminar la columna
      await fetch(`${API_URL}/columns/${columnId}`, {
        method: "DELETE"
      });

    } catch (error) {
      console.error("Error al eliminar la columna:", error);
    }
  }



// Función para obtener las tareas desde el servidor
async function fetchTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
  }
}

// Función para agregar una tarea en el servidor
async function addTask(taskData) {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error al agregar la tarea:", error);
  }
}

// Función para actualizar una tarea
async function updateTask(task) {
  try {
    if (!task.id) throw new Error('Task id is required');
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Error updating task');
      return await response.json();
  } catch (error) {
      console.error('Error:', error);
  }
}

// Función para eliminar una tarea
async function deleteTask(taskId) {
  try {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
  }
}