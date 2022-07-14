const fs = require('fs').promises;

const TODO_FILE = './todo-data.json';
const ARCHIVE_FILE = './archive-data.json';

/**ファイル読み込み */
const readFile = async (filePath) => await fs.readFile(filePath, 'utf-8');
/**ファイル書き込み */
const writeFile = async (filePath, data) => await fs.writeFile(filePath, JSON.stringify(data, null, 2));
/**JSONレスポンス返却 */
const sendJsonResponse = async (req, res, filePath) => {
  const data = await parse(filePath);
  return res.json(data);
}
/**JSONコンバート */
const parse = async (filePath) => {
  const fileString = await readFile(filePath);
  return JSON.parse(fileString);
}



/**TODO取得 */
const getAllTodo = async (req, res) => {
  return await sendJsonResponse(req, res, TODO_FILE);
}
/**アーカイブ取得 */
const getArchive = async (req, res) => {
  return await sendJsonResponse(req, res, ARCHIVE_FILE);
}
/**TODO追加 */
const addTodo = async (req, res) => {
  const body = req.body;
  const promises = await Promise.all([
    parse(TODO_FILE), 
    parse(ARCHIVE_FILE)
  ]);

  const total = promises.reduce((prev, p) => p.length + prev, 0);
  body.id = total + 1;

  const [data] = promises;
  data.push(body);

  await writeFile(TODO_FILE, data);
  return res.json(data);
}

const getTodo = async (req, res) => {
  const id = req.param.id;
  const todo = await readFile(TODO_FILE);

  const item = todo.find(x => x.id === id);
  if (item == null) {
    return res.json(null);
  }
  return res.json(item);
}

/**アーカイブへ移動 */
const moveArchive = async (req, res) => {
  const body = req.body;
  const [todos, currents] = await Promise.all([
    parse(TODO_FILE),
    parse(ARCHIVE_FILE)
  ]);
  
  const targets = todos.filter(t => body.some(b => b === t.id));
  const archives = currents.concat(targets);
  const untilTodo = todos.filter(t => body.every(b => b !== t.id));

  await Promise.all([
    writeFile(ARCHIVE_FILE, archives),
    writeFile(TODO_FILE, untilTodo),
  ])

  return res.json({
    todo: untilTodo,
    archive: archives,
  });
}

/**アーカイブ削除 */
const removeArchive = async (req, res) => {
  await writeFile(ARCHIVE_FILE, []);
  return res.json(true);
}

module.exports = {
  getAllTodo,
  getTodo,
  getArchive,
  addTodo,
  moveArchive,
  removeArchive
};