class Application {
  #sidebar;
  #mainContent;

  constructor(sidebar, mainContent) {
    this.#sidebar = sidebar;
    this.#mainContent = mainContent;
    this.#sidebar.setMediator(this);
    this.#mainContent.setMediator(this);
  }

  clickProject() {

  }

  clickTodo() {

  }

  init() {
    const body = document.querySelector("body");
    body.insertAdjacentElement("afterbegin", this.#sidebar.getComponent());
    body.insertAdjacentElement("beforeend", this.#mainContent.getComponent());
  }
}

class MainContent {
  #mediator;
  #projectManager;
  #component;

  constructor(projectManager) {
    this.#projectManager = projectManager;
    this.render();
  }

  setMediator(mediator) {
    this.#mediator = mediator;
  }

  render() {
    const mainContent = document.createElement("div");
    mainContent.classList = "main-content todo-item-content";

    mainContent.append(document.createElement("h1"), document.createElement("p"));
    mainContent.firstElementChild.textContent = "This is a to-do.";
    mainContent.lastElementChild.textContent = "This is a to-do description.";

    this.#component = mainContent;
  }

  getComponent() {
    return this.#component;
  }
}

class SideBar {
  #mediator;
  #projectManager;
  #component

  constructor(projectManager) {
    this.#projectManager = projectManager;
    this.render();
  }

  setMediator(mediator) {
    this.#mediator = mediator;
  }
  
  render() {
    this.#component = this.#projectManager.renderSidebarComponent();

    const projectsList = this.#component.querySelector("ul.projects-list");
    projectsList.addEventListener("click", (e) => {
      /* Selected project using its display */
      if (e.target.closest(".project-item-display") && e.target.tagName != "BUTTON") {
        console.log(`Project id: ${e.target.closest("li.project-item").dataset.projectId}`);
      }
      
    });
    
    const projectItems = projectsList.querySelectorAll("li.project-item");
    projectItems.forEach(project => {
      project.querySelector("ul.todo-list").addEventListener("click", (e) => {
        /* Selected to-do from the to-do list */
        if (e.target.closest("li[data-todo-id]")) {
          console.log(`Todo id: ${e.target.parentElement.dataset.todoId}, Project id: ${e.target.closest("li.project-item").dataset.projectId}`);
        }
      });
    });
  }

  getComponent() {
    return this.#component;
  }
}

const projectsManager = (function initProjectsManagerIIFE() {
  let idCounter = 1;
  const projectsList = [];

  function renderSidebarComponent() {
    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";
    const sidebarTop = document.createElement("div");
    sidebarTop.className = "sidebar-top";
    sidebarTop.appendChild(document.createElement("h1"));
    sidebarTop.firstElementChild.textContent = "Projects";
    sidebarTop.appendChild(document.createElement("button"));
    sidebarTop.lastElementChild.textContent = "Add Project";

    const sidebarProjectsList = document.createElement("ul");
    sidebarProjectsList.className = "projects-list";

    for (const project of projectsList) {
      sidebarProjectsList.appendChild(project.renderSidebarComponent());
    }

    sidebar.append(sidebarTop, sidebarProjectsList);
    return sidebar;
  }

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
    renderSidebarComponent,
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
  #hidden;

  constructor({ id = 0, name = "", description = "", todos = [], idCounter = 1, hidden = false }) {
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#todosList = todos.map(todo => todo.clone());
    this.#idCounter = idCounter;
    this.#hidden = hidden;
  }

  renderSidebarComponent() {
    const projectItem = document.createElement("li");
    projectItem.className = "project-item";
    projectItem.dataset.projectId = this.#id;

    const projectItemDisplay = document.createElement("div");
    projectItemDisplay.className = "project-item-display";

    const projectTitle = document.createElement("h2");
    projectTitle.textContent = this.#name;

    const toggleProjectItem = document.createElement("button");
    toggleProjectItem.className = "toggle-project-item";
    toggleProjectItem.textContent = "Arrow";
    toggleProjectItem.addEventListener("click", (e) => {
      const todoList = e.target.closest("li.project-item").querySelector("ul.todo-list");
      this.#hidden = (this.#hidden) ? false : true;
      todoList.classList.toggle("hidden")
    })

    const todoList = document.createElement("ul");
    todoList.className = "todo-list";
    if (this.#hidden) {
      todoList.classList.add("hidden")
    }

    for (const todo of this.#todosList) {
      todoList.appendChild(todo.renderSidebarComponent());
    }

    projectItem.append(projectItemDisplay, todoList);
    projectItemDisplay.append(projectTitle, toggleProjectItem);

    return projectItem;
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
    todo.setId(this.#idCounter++);
    this.#todosList.push(todo);
  }

  getHidden() {
    return this.#hidden;
  }

  setHidden(hidden) {
    this.#hidden = hidden;
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
      idCounter: this.#idCounter,
      hidden: this.#hidden
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
  constructor({id = 0, title = "", description = ""}) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
  }

  renderSidebarComponent() {
    const todoItem = document.createElement("li");
    todoItem.className = "todo-item";
    todoItem.dataset.todoId = this.#id;

    const todoTitle = document.createElement("h3");
    todoTitle.textContent = this.#title;

    const todoDueDate = document.createElement("h4");
    todoDueDate.textContent = "11/11/11";

    todoItem.append(todoTitle, todoDueDate);

    return todoItem;
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

const proj1 = new Project({name: "foo", description: "bar"});
proj1.addTodo(new Todo({title: "fooTitle1", description: "barDesc1"}));
proj1.addTodo(new Todo({title: "fooTitle2", description: "barDesc2"}));
proj1.addTodo(new Todo({title: "fooTitle3", description: "barDesc3"}));

const proj2 = new Project({name: "baz", description: "baq", hidden: true});
proj2.addTodo(new Todo({title: "bazTitle1", description: "baqDesc1"}));
proj2.addTodo(new Todo({title: "bazTitle2", description: "baqDesc2"}));

projectsManager.addProject(proj1)
projectsManager.addProject(proj2)

const app = new Application(
    new SideBar(projectsManager),
    new MainContent(projectsManager)
);

app.init();