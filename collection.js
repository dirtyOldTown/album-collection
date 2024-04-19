const addAlbum = document.forms["add-album"];
const btnAddAlbum = document.getElementById("btnAddAlbum");
const btnUpdateAlbum = document.getElementById("btnUpdateAlbum");
const tbody = document.querySelector("#cd-table > tbody");
let db = null;

btnAddAlbum.addEventListener("click", addItem);
btnUpdateAlbum.addEventListener("click", updates);

function addItem() {
  let request = indexedDB.open("cd-collection", 1);
  request.onupgradeneeded = function(e) {
    db = request.result;
    db.createObjectStore("albums", { autoIncrement: true });
  }
  request.onsuccess = () => function() {
    db =request.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    if (confirm("Added record !")) {
      store.put({
        number: addAlbum[0].value,
        genre: addAlbum[1].value,
        band: addAlbum[2].value,
        album: addAlbum[3].value,
        year: addAlbum[4].value,
      });
      location.reload();
    } else {
      return false;
    }
  }  
}
function read() {
  let request = indexedDB.open("cd-collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readonly");
    let store = tx.objectStore("albums");
    let cursor = store.openCursor();
    cursor.onsuccess = function() {
      let curRes = cursor.result;
      if (curRes) {
        tbody.innerHTML += `
          <tr>
            <td>${curRes.value.number}</td>
            <td>${curRes.value.genre}</td>
            <td>${curRes.value.band}</td>
            <td>${curRes.value.album}</td>
            <td>${curRes.value.year}</td>
            <td class="icon upd" onclick="update(${curRes.key})"><i class="fa fa-edit"></i></td>
            <td class="icon del" onclick="del(${curRes.key})"><i class="fa fa-trash"></i></td>
          </tr>
        `;
        curRes.continue();
      }
    }
  }
}

read();

let primaryKey;
function update(key) {
  btnAddAlbum.style.display = "none";
  btnUpdateAlbum.style.display = "block";
  addAlbum[0].focus();
  primaryKey = key;

  let request = indexedDB.open("cd-collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readonly");
    let store = tx.objectStore("albums");
    let cursor = store.openCursor(primaryKey);
    cursor.onsuccess = function() {
      let curRes = cursor.result;
      if (curRes) {
        addAlbum[0].value = curRes.value.number;
        addAlbum[1].value = curRes.value.genre;
        addAlbum[2].value = curRes.value.band;
        addAlbum[3].value = curRes.value.album;
        addAlbum[4].value = curRes.value.year;
        curRes.continue();
      }
    }
  }
}
function del(key) {
  let request = indexedDB.open("cd-collection", 1);
  request.onsuccess = function() {
    db = request.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    if (confirm("Delete record, Are you sure ?")) {
      store.delete(key);
    } else {
      return false;
    }
    location.reload()
  }
}

function updates() {
  let request = indexedDB.open("cd-collection", 1);
  request.onsuccess = function() {
    db = request.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    if (confirm("Update record, Are you ready ?")) {
      store.put({
        number: addAlbum[0].value,
        genre: addAlbum[1].value,
        band: addAlbum[2].value,
        album: addAlbum[3].value,
        year: addAlbum[4].value,
      }, primaryKey);
    }
    location.reload();
  }
}

