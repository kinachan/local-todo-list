
class TodoClient {
  constructor() {
    this.checkedList = [];
    this.todoListElement = document.getElementById('todo-list');
    this.archiveListElement = document.getElementById('archive-list');
    this.todoInput = document.getElementById('todo');
    this.addButton = document.getElementById('add');
    this.archiveButton = document.getElementById('archive');
    this.removeButton = document.getElementById('remove');
    this.descriptionInput = document.getElementById('description')

    this.init();
  }

  /**初期化処理 */
  init() {
    this.addButton.addEventListener('click', async () => await this.onClickAddButton());
    this.archiveButton.addEventListener('click', async () => await this.onClickArchiveButton());
    this.removeButton.addEventListener('click', async () => await this.onClickRemoveButton());

    window.addEventListener('DOMContentLoaded', () => {
      this.readTodo();
      this.readArchive();
    });
  }

  onChangeCheckbox(ev) {
    const id = ev.target.getAttribute('data-id');
    const checked = ev.target.checked;

    if (checked) {
      this.checkedList.push(parseInt(id, 10));
      ev.target.setAttribute('checked', 'checked');
    } else {
      const index = this.checkedList.indexOf(id);
      this.checkedList.splice(index, 1);
      ev.target.removeAttribute('checked');
    }
  }

  async onDoubleClickCheck(ev) {
    const id = ev.target.getAttribute('data-id');
    const res = await fetch('./todo/' + id, {
      method: 'GET',
    });


  }

  bindCheckboxEvent() {
    const checkboxes = document.querySelectorAll('.check');
    checkboxes.forEach(elem => {
      elem.removeEventListener('change', (ev) => this.onChangeCheckbox(ev));
      elem.addEventListener('change', (ev) => this.onChangeCheckbox(ev));
    });
  }

  bindUpdateEvent() {
    const checkboxes = document.querySelectorAll('.check');
    checkboxes.forEach(elem => {
      elem.removeEventListener('dblclick', async (ev) => await this.onDoubleClickCheck(ev))
      document.addEventListener('dblclick', async (ev) => await this.onDoubleClickCheck(ev))
    })
  }

  async readTodo() {
    const res = await fetch('./todo', {
      method: 'GET',
    });
    const data = await res.json();
  
    this.checkedList = data.filter(x => x.checked).map(x => x.id);
    await this.dataRender(this.todoListElement, data, true);
  
    this.bindCheckboxEvent();
    // this.bindUpdateEvent();
  }

  async readArchive() {
    const res = await fetch('./archive', {
      method: 'GET',
    });
    const data = await res.json();
    return await this.dataRender(this.archiveListElement, data, false);
  }

  async dataRender(element, data, isTodo) {
    if (data.length === 0) {
      element.innerHTML = '';
      return data;
    }

    const html = data.map(x => this.renderParts(x, isTodo)).join('');
    element.innerHTML = html;

    return data;
  }

  renderParts(data, isTodo) {
    const httpRegpex = /https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g;

    const description = data.description == null ? '' 
      : data.description.replace(httpRegpex, '<a target="_blank" href="$&">$&</a>');
   

    const childUl = data.description == null 
      ? ''
      : `
        <ul>
          <li>
            ${description}
          </li>
        </ul>
      `;
    return `
    <li>
      <label class="checkbox is-size-5">
        <input type="checkbox" data-id="${data.id}" class="${isTodo ? "check" : "archive-check"}"
          name="checked" value="${data.checked}" ${data.checked ? 'checked="checked"' : '' }>
        ${data.name}
        ${childUl}
      </label>
    </li>
    `;
  }

  async onClickAddButton() {
    const res = await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: null,
        name: this.todoInput.value,
        checked: false,
        description: this.descriptionInput.value === '' ? null : this.descriptionInput.value,
      }),
    });
    const data = await res.json();
    this.dataRender(this.todoListElement, data, true);
  
    this.bindCheckboxEvent();
  
    this.todoInput.value = '';
    this.descriptionInput.value = '';
    this.todoInput.focus();
  }

  async onClickArchiveButton(ev) {
    const res = await fetch('/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.checkedList),
    });
  
    const data = await res.json();
    await this.dataRender(this.todoListElement, data.todo, true);
    await this.dataRender(this.archiveListElement, data.archive, false);
  
    this.bindCheckboxEvent();
  }

  async onClickRemoveButton(){
    const res = await fetch('/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    if (res.ok) {
      await this.dataRender(this.archiveListElement, [], false);
    }
  }
}

const client = new TodoClient();


