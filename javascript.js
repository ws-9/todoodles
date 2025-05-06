const projectsManager = (function initProjectsManagerIIFE() {
  let idCounter = 1;
  const projectsList = [];

  function getProjects() {
    return projectsList.map(project => project.clone());
  }

  function addProject(project) {
    project.setId(idCounter++);
    projectsList.push(project);
  }

  function getProject(id) {
    return projectsList.find(project => project.getId() === id)?.clone() ?? null;
  }

  function updateProject(id, updates) {
    const project = projectsList.find(project => project.getId() === id);
    if (!project) {
      return false;
    }
    project.update(updates);
    return true;
  }

  function deleteProject(id) {
    const deletedIndex = projectsList.findIndex(project => project.getId() === id);
    if (deletedIndex !== -1) {
      return projectsList.splice(deletedIndex, 1);
    }
    return null;
  }

  function addTodoToProject(projectId, todo) {
    const project = projectsList.find(project => project.getId() === projectId);
    if (project) {
      project.addTodo(todo);
    }
  }

  function getTodosFromProject(projectId) {
    const project = projectsList.find(project => project.getId() === projectId);
    if (project) {
      return project.getTodos();
    }
  }

  function getTodoFromProject(projectId, todoId) {
    const project = projectsList.find(project => project.getId() === projectId);
    if (project) {
      return project.getTodo(todoId);
    }
  }

  function updateTodoFromProject(projectId, todoId, updates) {
    const project = projectsList.find(project => project.getId() === projectId);
    if (project) {
      return project.updateTodo(todoId, updates);
    }
  }

  function deleteTodoFromProject(projectId, todoId) {
    const project = projectsList.find(project => project.getId() === projectId);
    if (project) {
      return project.deleteTodo(todoId);
    }
  }

  return {
    getProjects,
    addProject,
    getProject,
    updateProject,
    deleteProject,
    addTodoToProject,
    getTodosFromProject,
    getTodoFromProject,
    updateTodoFromProject,
    deleteTodoFromProject
  }
})();

class Project {
  #id;
  #name;
  #description;
  #todosList;
  #idCounter;

  constructor({ id = 0, name = "", description = "", todos = [], idCounter = 1 }) {
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#todosList = todos.map(todo => todo.clone());
    this.#idCounter = idCounter;
  }

  getId() {
    return this.#id;
  }

  setId(id) {
    this.#id = id;
  }

  getName() {
    return this.#name;
  }

  setName(name) {
    this.#name = name;
  }
  
  getDescription() {
    return this.#description;
  }

  setDescription(description) {
    this.#description = description;
  }

  addTodo(todo) {
    todo.setId(idCounter++);
    this.#todosList.push(todo);
  }

  getTodos() {
    return this.#todosList.map(todo => todo.clone());
  }

  getTodo(todoId) {
    return this.#todosList.find(todo => todo.getId() === todoId)?.clone() ?? null;
  }

  updateTodo(todoId, updates) {
    const todo = this.#todosList.find(todo => todo.getId() === todoId);
    if (!todo) {
      return false;
    }
    todo.update(updates);
    return true;
  }

  deleteTodo(todoId) {
    const deletedIndex = this.#todosList.findIndex(todo => todo.getId() === todoId);
    if (deletedIndex !== -1) {
      return this.#todosList.splice(deletedIndex, 1);
    }
    return null;
  }

  update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      if (typeof this[setterName] === "function") {
        this[setterName](value);
      } else {
        console.warn(`No setter found for property "${key}"`);
      }
    }
  }

  clone() {
    return new Project({
      id: this.#id,
      name: this.#name,
      description: this.#description,
      todos: this.#todosList,
      idCounter: this.#idCounter
    });
  }
}

class Todo {
  #id;
  #title;
  #description;
  #dueDate;
  #priority;
  #notes;
  #checklist;
  constructor(id = 0, title = "", description = "") {
    this.#id = id;
    this.#title = title;
    this.#description = description;
  }

  getId() {
    return this.#id;
  }

  setId(id) {
    this.#id = id;
  }

  getTitle() {
    return this.#title;
  }

  setTitle(title) {
    this.#title = title;
  }

  getDescription() {
    return this.#description;
  }

  setDescription(description) {
    this.#description = description;
  }

  clone() {
    return new Todo({
      id: this.#id,
      title: this.#title,
      description: this.#description
    });
  }
}