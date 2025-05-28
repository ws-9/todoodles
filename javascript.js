class Application {
  #sidebar;
  #mainContent;

  constructor(sidebar, mainContent) {
    this.#sidebar = sidebar;
    this.#mainContent = mainContent;
    this.#sidebar.setMediator(this);
    this.#mainContent.setMediator(this);
  }

  notify({ component, event, projectId, todoId, }) {
    const webpageContainer = document.querySelector(".webpage-container");
    switch (event) {
      case "itemSelected":
        webpageContainer.removeChild(webpageContainer.lastElementChild);
        webpageContainer.insertAdjacentElement("beforeend", this.#mainContent.render(projectId, todoId));
        break;
      case "itemUpdatedInMainContent":
        webpageContainer.removeChild(webpageContainer.lastElementChild);
        webpageContainer.insertAdjacentElement("beforeend", this.#mainContent.render(projectId, todoId));
        webpageContainer.removeChild(webpageContainer.firstElementChild);
        webpageContainer.insertAdjacentElement("afterbegin", this.#sidebar.render());
        break;
      case "itemEditedInMainContent":
        webpageContainer.removeChild(webpageContainer.firstElementChild);
        webpageContainer.insertAdjacentElement("afterbegin", this.#sidebar.render());
        break;
      default:
        break;
    }
  }

  init() {
    const webpageContainer = document.createElement("div");
    webpageContainer.className = "webpage-container";
    webpageContainer.insertAdjacentElement("afterbegin", this.#sidebar.render());
    webpageContainer.insertAdjacentElement("beforeend", this.#mainContent.render());
    document.querySelector("body").appendChild(webpageContainer);
  }
}

class MainContent {
  #mediator;
  #projectManager;

  constructor(projectManager) {
    this.#projectManager = projectManager;
  }

  setMediator(mediator) {
    this.#mediator = mediator;
  }

  render(projectId, todoId) {
    if (projectId === undefined && todoId === undefined) {
      return this.#projectManager.renderEmptyMainContent();
    } else if (projectId !== undefined && todoId === undefined) {
      const mainContent = this.#projectManager.renderProjectMainContent(projectId);
      const projectName = mainContent.querySelector("input.project-name");
      projectName.addEventListener("change", (e) => {
        const projectId = +mainContent.dataset.projectId;
        if (!Number.isNaN(projectId)) {
          this.#projectManager.updateProject(projectId, { name: e.target.value.trim() });
          e.target.value = this.#projectManager.getProject(projectId).getName();
          this.#mediator.notify({
            component: this,
            event: "itemEditedInMainContent",
          });
        }
      });

      const contextMenuBtn = mainContent.querySelector(".project-context-menu-btn");
      const contextMenu = contextMenuBtn.firstElementChild;
      contextMenuBtn.addEventListener("click", (e) => {
        contextMenu.classList.toggle("hidden");
        if (!contextMenu.classList.contains("hidden")) {
          e.stopPropagation();
          document.addEventListener("click", closeOnClick);
        }
        function closeOnClick() {
          contextMenu.classList.add("hidden");
          document.removeEventListener("click", closeOnClick);
        }
      });

      contextMenu.addEventListener("click", (e) => {
        const projectId = +mainContent.dataset.projectId;
        if (Number.isNaN(projectId)) {
          return;
        }

        if (e.target === contextMenu.firstElementChild) {
          this.#projectManager.addTodoToProject(projectId, new Todo({ title: "New To-do" }));
          this.#mediator.notify({
            component: this,
            event: "itemUpdatedInMainContent",
            projectId: projectId,
          });
          /* Add todo here */
        } else if (e.target === contextMenu.lastElementChild) {
          this.#projectManager.deleteProject(projectId);
          this.#mediator.notify({
            component: this,
            event: "itemUpdatedInMainContent",
          });
        }
      });

      const todoContainer = mainContent.querySelector("div.todo-container");
      todoContainer.addEventListener("click", (e) => {
        const todoCard = e.target.closest(".todo-card")
        if (todoCard) {
          const projectId = +mainContent.dataset.projectId;
          const todoId = +todoCard.dataset.todoId;
          if (!Number.isNaN(projectId) && !Number.isNaN(todoId)) {
            this.#mediator.notify({
              component: this,
              event: "itemSelected",
              projectId: projectId,
              todoId: todoId
            });
          }
        }
      });
      return mainContent;
    } else if (projectId !== undefined && todoId !== undefined) {
      const mainContent = this.#projectManager.renderTodoMainContent(projectId, todoId);
      const title = mainContent.querySelector(".todo-title");
      title.addEventListener("change", (e) => {
        const projectId = +mainContent.dataset.projectId;
        const todoId = +mainContent.dataset.todoId;
        if (!Number.isNaN(projectId) && !Number.isNaN(todoId)) {
          this.#projectManager.updateTodoFromProject(projectId, todoId, { title: e.target.value.trim() })
          this.#mediator.notify({
            component: this,
            event: "itemUpdatedInMainContent",
            projectId: projectId,
            todoId: todoId
          });
        }
      });
      return mainContent;
    }
  }
}

class SideBar {
  #mediator;
  #projectManager;

  constructor(projectManager) {
    this.#projectManager = projectManager;
  }

  setMediator(mediator) {
    this.#mediator = mediator;
  }
  
  render() {
    const component = this.#projectManager.renderSidebarComponent();

    const projectsList = component.querySelector("ul.projects-list");
    projectsList.addEventListener("click", (e) => {
      /* Selected project using its display */
      if (e.target.closest(".project-item-display") && e.target.tagName != "BUTTON") {
        const projectId = +e.target.closest("li.project-item").dataset.projectId;
        if (!Number.isNaN(projectId)) {
          this.#mediator.notify({
            component: this,
            event: "itemSelected",
            projectId: projectId,
          });
        }
      /* Selected dropdown button */
      } else if (e.target.closest(".project-item-display") && e.target.tagName === "BUTTON") {
        let projectId = +e.target.closest("li.project-item").dataset.projectId;
        let newHidden = this.#projectManager.getProject(projectId).getHidden() ? false : true;
        this.#projectManager.updateProject(projectId, { hidden: newHidden });
        const todoList = e.target.closest("li.project-item").querySelector("ul.todo-list");
        todoList.classList.toggle("hidden")
      }
    });
    
    const projectItems = projectsList.querySelectorAll("li.project-item");
    projectItems.forEach(project => {
      project.querySelector("ul.todo-list").addEventListener("click", (e) => {
        /* Selected to-do from the to-do list */
        if (e.target.closest("li[data-todo-id]")) {
          const projectId = +e.target.closest("li.project-item").dataset.projectId;
          const todoId = +e.target.parentElement.dataset.todoId;
          if (!Number.isNaN(projectId) && !Number.isNaN(todoId)) {
            this.#mediator.notify({
              component: this,
              event: "itemSelected",
              projectId: projectId,
              todoId: todoId
            });
          }
        }
      });
    });

    return component;
  }
}

const projectsManager = (function initProjectsManagerIIFE() {
  let idCounter = 1;
  const projectsList = [];

  function renderEmptyMainContent() {
    const mainContent = document.createElement("div");
    mainContent.classList = "main-content empty-content"
    mainContent.append(document.createElement("h1"), document.createElement("p"));
    mainContent.firstElementChild.textContent = "This is a to-do.";
    mainContent.lastElementChild.textContent = "This is a to-do description.";
    return mainContent;
  }

  function renderProjectMainContent(projectId) {
    return getProject(projectId).renderMainContentComponent();
  }

  function renderTodoMainContent(projectId, todoId) {
    const mainContent = getTodoFromProject(projectId, todoId).renderMainContentComponent();
    mainContent.dataset.projectId = projectId;
    return mainContent;
  }

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
    renderEmptyMainContent,
    renderProjectMainContent,
    renderTodoMainContent,
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

  renderMainContentComponent() {
    const mainContentComponent = document.createElement("div");
    mainContentComponent.classList = "main-content project-item-content";
    mainContentComponent.dataset.projectId = this.#id;

    const projectTopDisplay = document.createElement("div");
    projectTopDisplay.className = "project-main-content-display";

    const projectName = document.createElement("input");
    projectName.className = "project-name"
    projectName.value = this.#name;
    projectName.setAttribute("type", "text");

    const contextMenuBtn = document.createElement("button");
    contextMenuBtn.classList = "project-context-menu-btn";
    contextMenuBtn.textContent = "⋯";

    const contextMenu = document.createElement("ul");
    contextMenu.classList = "project-context-menu hidden";
    contextMenu.append(document.createElement("li"), document.createElement("li"));
    contextMenu.firstElementChild.textContent = "Add New To-do"
    contextMenu.lastElementChild.textContent = "Delete Project"

    contextMenuBtn.appendChild(contextMenu);
    projectTopDisplay.append(projectName, contextMenuBtn);

    const todoContainer = document.createElement("div");
    todoContainer.className = "todo-container";
    for (const todo of this.#todosList) {
      todoContainer.appendChild(todo.renderMainContentProjectItemComponent());
    }
    mainContentComponent.append(projectTopDisplay, todoContainer);
    return mainContentComponent;
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
        if (setterName === "setName") {
          this[setterName](value || "Default Project Name");
        } else {
          this[setterName](value);
        }
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

  renderMainContentComponent() {
    const mainContentComponent = document.createElement("div");
    mainContentComponent.classList = "main-content todo-item-content";
    mainContentComponent.dataset.todoId = this.#id;

    const todoTopDisplay = document.createElement("div");
    todoTopDisplay.className = "todo-main-content-display";

    const title = document.createElement("input");
    title.className = "todo-title";
    title.value = this.#title;
    title.setAttribute("type", "text");

    const contextMenuBtn = document.createElement("button");
    contextMenuBtn.classList = "todo-context-menu-btn";
    contextMenuBtn.textContent = "⋯";
    
    todoTopDisplay.append(title, contextMenuBtn);
    mainContentComponent.append(
        todoTopDisplay,
        document.createElement("p")
    );
    mainContentComponent.lastElementChild.textContent = this.#description;
    return mainContentComponent;
  }

  renderMainContentProjectItemComponent() {
    const todoCard = document.createElement("div");
    todoCard.className = "todo-card"
    todoCard.dataset.todoId = this.#id;
    const todoTitle = document.createElement("h3");
    const dueDate = document.createElement("h4");
    todoTitle.textContent = this.#title;
    dueDate.textContent = this.#dueDate ?? "No due date";
    todoCard.append(todoTitle, dueDate);
    return todoCard;
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

  update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      if (typeof this[setterName] === "function") {
        if (setterName === "setTitle") {
          this[setterName](value || "Default To-Do Title");
        } else {
          this[setterName](value);
        }
      } else {
        console.warn(`No setter found for property "${key}"`);
      }
    }
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