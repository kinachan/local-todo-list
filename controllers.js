const fs = require('fs').promises;


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
const getTodo = async (req, res) => {
  return await sendJsonResponse(req, res, './todo-data.json');
}
/**アーカイブ取得 */
const getArchive = async (req, res) => {
  return await sendJsonResponse(req, res, './archive-data.json');
}
/**TODO追加 */
const addTodo = async (req, res) => {
  const body = req.body;
  const promises = await Promise.all([
    parse('./todo-data.json'), 
    parse('./archive-data.json')
  ]);

  const total = promises.reduce((prev, p) => p.length + prev, 0);
  body.id = total + 1;

  const [data] = promises;
  data.push(body);

  await writeFile('./todo-data.json', data);
  return res.json(data);
}

/**アーカイブへ移動 */
const moveArchive = async (req, res) => {
  const body = req.body;
  const [todos, currents] = await Promise.all([
    parse('./todo-data.json'),
    parse('./archive-data.json')
  ]);
  
  const targets = todos.filter(t => body.some(b => b === t.id));
  const archives = currents.concat(targets);
  const untilTodo = todos.filter(t => body.every(b => b !== t.id));

  await Promise.all([
    writeFile('./archive-data.json', archives),
    writeFile('./todo-data.json', untilTodo),
  ])

  return res.json({
    todo: untilTodo,
    archive: archives,
  });
}

/**アーカイブ削除 */
const removeArchive = async (req, res) => {
  await writeFile('./archive-data.json', []);
  return res.json(true);
}

module.exports = {
  getTodo,
  getArchive,
  addTodo,
  moveArchive,
  removeArchive
};