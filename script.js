let books = JSON.parse(localStorage.getItem('books')) || [
  { title: 'Fourth Wing', author: 'Rebecca Yarros', total: 498, read: 210, borrowed: true, due: new Date(Date.now() + 2*86400000).toISOString().split('T')[0] },
  { title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', total: 432, read: 150, borrowed: false, due: '' },
  { title: 'Binding 13', author: 'Chloe Walsh', total: 520, read: 520, borrowed: true, due: new Date(Date.now() - 1*86400000).toISOString().split('T')[0] },
  { title: 'The Housemaid', author: 'Freida McFadden', total: 336, read: 80, borrowed: true, due: new Date(Date.now() + 5*86400000).toISOString().split('T')[0] },
  { title: 'The Let Them Theory', author: 'Mel Robbins', total: 336, read: 45, borrowed: false, due: '' },
  { title: 'Noli Me Tangere', author: 'Jose Rizal', total: 300, read: 120, borrowed: true, due: new Date(Date.now() + 1*86400000).toISOString().split('T')[0] },
];
let currentFilter = 'All';

document.getElementById('isBorrowed').addEventListener('change', function() {
  document.getElementById('dueDate').style.display = this.checked ? 'block' : 'none';
});

function save() { localStorage.setItem('books', JSON.stringify(books)); }

function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBooks();
}

function addBook() {
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim() || 'Unknown';
  const total = parseInt(document.getElementById('totalPagesInput').value);
  const borrowed = document.getElementById('isBorrowed').checked;
  const due = document.getElementById('dueDate').value;
  if (!title || !total) { alert('Lagyan mo ng Title at Total Pages bes!'); return; }
  books.push({ title, author, total, read: 0, borrowed, due });
  save(); renderBooks();
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('totalPagesInput').value = '';
}

function addPages(index) {
  if (books[index].read + 10 <= books[index].total) books[index].read += 10;
  else books[index].read = books[index].total;
  save(); renderBooks();
}

function deleteBook(index) {
  if (confirm('Delete this book?')) { books.splice(index, 1); save(); renderBooks(); }
}

function renderBooks() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('bookList');
  list.innerHTML = '';
  let reading = 0, pages = 0, finished = 0, overdue = 0;

  books.forEach((b, i) => {
    const isFinished = b.read >= b.total;
    let isOverdue = false;
    if (b.borrowed && b.due) {
      if (new Date(b.due) < new Date(new Date().toISOString().split('T')[0])) isOverdue = true;
    }
    if (isFinished) finished++; else reading++;
    pages += b.read;
    if (isOverdue) overdue++;

    if (currentFilter === 'Reading' && isFinished) return;
    if (currentFilter === 'Finished' && !isFinished) return;
    if (currentFilter === 'Overdue' && !isOverdue) return;
    if (currentFilter === 'Borrowed' && !b.borrowed) return;
    if (search && !b.title.toLowerCase().includes(search) && !b.author.toLowerCase().includes(search)) return;

    const pct = Math.round((b.read / b.total) * 100);
    let dueText = '', dueColor = 'gray';
    if (b.borrowed && b.due) {
      const diff = Math.ceil((new Date(b.due) - new Date()) / 86400000);
      if (diff < 0) { dueText = 'OVERDUE! Isaauli na!'; dueColor = 'red'; }
      else if (diff === 0) { dueText = 'Due TODAY!'; dueColor = 'red'; }
      else if (diff <= 3) { dueText = 'Due in ' + diff + ' days'; dueColor = 'orange'; }
      else { dueText = 'Due in ' + diff + ' days'; dueColor = '#0288D1'; }
    }

    list.innerHTML += `
      <div class="book-card">
        <h4>${b.title} <span class="badge ${b.borrowed ? 'badge-borrowed' : 'badge-own'}">${b.borrowed ? 'BORROWED' : 'OWN'}</span></h4>
        <small>${b.author} • ${b.read} / ${b.total} pages</small>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <small style="color:#0288D1;font-weight:bold;">${pct}% finished</small><br>
        ${dueText ? `<span class="due" style="color:${dueColor}">${dueText}</span><br>` : ''}
        <br>
        <button class="btn-small btn-plus" onclick="addPages(${i})">+ 10 Pages</button>
        <button class="btn-small btn-del" onclick="deleteBook(${i})">Delete</button>
      </div>`;
  });

  if (list.innerHTML === '') list.innerHTML = '<p style="text-align:center;color:gray;">Walang libro dito.</p>';
  document.getElementById('totalReading').textContent = reading;
  document.getElementById('totalPages').textContent = pages;
  document.getElementById('totalFinished').textContent = finished;
  document.getElementById('totalOverdue').textContent = overdue;
}
renderBooks();