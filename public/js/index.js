const todoListElement = document.getElementById('todo-list');
const archiveListElement = document.getElementById('archive-list');
const todoInput = document.getElementById('todo');

let checkedList = [];

const checkboxEvent = (ev) => {
  const id = ev.target.getAttribute('data-id');
  const checked = ev.target.checked;

  if (checked) {
    checkedList.push(parseInt(id, 10));
    ev.target.setAttribute('checked', 'checked');
  } else {
    const index = checkedList.indexOf(id);
    checkedList.splice(index, 1);
    ev.target.removeAttribute('checked');
  }
}

const bindCheckboxEvent = () => {
  const checkboxes = document.querySelectorAll('.check');
  checkboxes.forEach(elem => {
    elem.removeEventListener('change', checkboxEvent);
    elem.addEventListener('change', checkboxEvent);
  });
}

const todoListRead = async () => {
  const res = await fetch('./todo', {
    method: 'GET',
  });
  const data = await res.json();

  checkedList = data.filter(x => x.checked).map(x => x.id);
  await dataRender(todoListElement, data, true);

  bindCheckboxEvent();
}

const archiveListRead = async () => {
  const res = await fetch('./archive', {
    method: 'GET',
  });
  const data = await res.json();
  return await dataRender(archiveListElement, data, false);
}

const dataRender = async (element, data, isTodo) => {
  const html = data.map(x => renderParts(x, isTodo)).join('');
  element.innerHTML = html;

  return data;  
}

const renderParts = (data, isTodo) => {
  return `
  <li>
    <label class="checkbox">
      <input type="checkbox" data-id="${data.id}" class="${isTodo ? "check" : "archive-check"}"
        name="checked" value="${data.checked}" ${data.checked ? 'checked="checked"' : '' }>
      ${data.name}
    </label>
  </li>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  todoListRead();
  archiveListRead();
});


const sendAddEvent = async () => {
  const todoTitle = todoInput.value;

  const res = await fetch('/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: null,
      name: todoTitle,
      checked: false,
    }),
  });
  const data = await res.json();
  dataRender(todoListElement, data, true);

  bindCheckboxEvent();

  todoInput.value = '';
  todoInput.focus();
}

todoInput.addEventListener('keydown', async (e) => {
  if (e.code === 'Enter') {
    await sendAddEvent();
  }
});

const addButton = document.getElementById('add');
addButton.addEventListener('click', sendAddEvent);

const archiveButton = document.getElementById('archive');
archiveButton.addEventListener('click', async (ev) => {
  const res = await fetch('/archive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(checkedList),
  });

  const data = await res.json();
  await dataRender(todoListElement, data.todo, true);
  await dataRender(archiveListElement, data.archive, false);

  bindCheckboxEvent();
})