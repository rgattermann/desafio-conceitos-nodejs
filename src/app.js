const express = require('express');
const cors = require('cors');

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validadeRepositoryId(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid repository ID'});
    }

    return next();
}

function findRepository(repositoryId) {

    const repositoryIndex = repositories.findIndex(repo => repo.id === repositoryId);

    if (repositoryIndex < 0) {
      return null;
    }

    return repositories[repositoryIndex];
}

app.use('/repositories/:id', validadeRepositoryId);

app.get('/repositories', (request, response) => {
  return response.json(repositories)
});

app.post('/repositories', (request, response) => {
  const {title, url, techs} = request.body;

  const repository = {
    id: uuid(), 
    title,
    url,
    techs: techs || [],
    likes: 0
  };

    repositories.push(repository)

    return response.json(repository);

});

app.put('/repositories/:id', (request, response) => {
    const { id } = request.params;
    const {title, url, techs} = request.body;
    
    const repository = findRepository(id);

    if (!repository) {
        return response.status(404).json({ error: 'Repository not found.'})
    }

    const newRepository = {
      id,
      title,
      url,
      techs,
      likes: repository.likes
    };

    repositories[repository.id] = newRepository;

    return response.json(newRepository);
});

app.delete('/repositories/:id', (request, response) => {
    const { id } = request.params;
    
    const repoIndex = repositories.findIndex(repo => repo.id === id);

    if (repoIndex < 0) {
        return response.status(404).json({ error: 'Repository not found.'})
    }

    repositories.splice(repoIndex, 1);

    return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
    const { id } = request.params;

    const repository = findRepository(id);

    if (!repository) {
        return response.status(404).json({ error: "Repository not found."})
    }

    repository.likes += 1;

    repositories[repository.id] = repository;

    return response.json(repository);
});

module.exports = app;
