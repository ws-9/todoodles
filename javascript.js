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
