import { 
  Project,
  Todo,
  projectsManager,
  Application,
  SideBar,
  MainContent
} from "./javascript.js"
import "./styles.css"

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