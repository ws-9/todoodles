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

  return {
    getProjects,
    addProject,
    getProject,
    updateProject,
    deleteProject
  }
})();

class Project {
  #id;
  #name;
  #description;
  #todos;

  constructor({ id = 0, name = "", description = "", todos = [] }) {
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#todos = todos.map(todo => todo.clone());
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
      todos: this.#todos
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
  constructor(id, title, description) {
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