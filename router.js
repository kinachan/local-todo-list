const controllers = require('./controllers');
const { addTodo, getArchive, getTodo, moveArchive, removeArchive } = controllers;

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

module.exports = function(app) {
  app.get('/todo', wrap(async (req, res) => {
    return await getTodo(req, res);
  }));

  app.get('/archive', wrap(async (req, res) => {
    return await getArchive(req, res);
  }));

  app.post('/add', wrap(async (req, res) => {
    return await addTodo(req, res);
  }));

  app.post('/archive', wrap(async (req, res) => {
    return await moveArchive(req, res);
  }));

  app.post('/remove', wrap(async (req, res) => {
    return await removeArchive(req, res);
  }));
}