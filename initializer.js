const fs = require('fs');

const initializer = () => {
  const files = ['./todo-data.json', './archive-data.json'];

  files.forEach(f => {
    if (!fs.existsSync(f)) {
      fs.writeFileSync(f, '[]');
    }
  });
}

module.exports = {
  initializer,
};