import { 
  Project,
  Todo,
  projectsManager,
  Application,
  SideBar,
  MainContent
} from "./javascript.js"
import "./styles.css"

const app = new Application(
    new SideBar(projectsManager),
    new MainContent(projectsManager)
);

app.init();