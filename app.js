const express = require('express');
const initializer = require('./initializer').initializer;
const app = express();
const port = 3000;

app.use(express.json());

/**ルーティング */
require('./router')(app);

app.use(express.static('public'));
initializer();


app.listen(port, () => {
  console.log(`todo app listeningon port ${port}`);
});