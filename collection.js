const addAlbum = document.forms["add-album"];
const btnAddAlbum = document.getElementById("btnAddAlbum");
const btnUpdateAlbum = document.getElementById("btnUpdateAlbum");
const tbody = document.querySelector("#cd-table > tbody");
const title = document.querySelector("#title-box > h1");

// Initialize database and object store
let db = null;
let store = null;
let request = indexedDB.open("collection", 1);

request.onupgradeneeded = function(e) {
  db = request.result;
  let objectStore = db.createObjectStore("albums", { autoIncrement: true });
  objectStore.createIndex("band_name", "band", { unique: false });
  objectStore.createIndex("genre_name", "genre", { unique: false });
}

request.onsuccess = function(e) {
  db = e.target.result;
  let tx = db.transaction("albums", "readwrite");
  store = tx.objectStore("albums");
}

request.onerror = function(e) {
  console.log(e.target.error)
}

// Data entry
const btnDataRefresh = document.getElementById("btnDataRefresh");
btnDataRefresh.onclick = function(e) {
  for (let item of addAlbum.elements) {
    if (item.tagName == "INPUT") {
      item.value = "";
    }
  }
}
addAlbum.onchange = function(e) {
  let target = e.target.closest("input");
  target.value = target.value.toLowerCase();
  let splitString = target.value.split(" ");
  let newString = splitString.map(str => {
    return str.substring(0, 1).toUpperCase() + str.slice(1)
  });
  target.value = newString.join(" ");
}
function addItem() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    if(confirm("About added record, Are you sure ?")) {
      store.put({
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

btnAddAlbum.addEventListener("click", addItem);

// Completing the html-table
function read() {
  let n = 1;
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = request.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let cursor = store.openCursor();
    cursor.onsuccess = function() {
    let curRes = cursor.result;
    if (curRes) {
      tbody.innerHTML += `
        <tr>
          <td>${n++}</td>
          <td>${curRes.value.genre}</td>
          <td>${curRes.value.band}</td>
          <td>${curRes.value.album}</td>
          <td>${curRes.value.year}</td>
          <td class="icon upd" title="update record" onclick="showUpdateButton(${curRes.key})"><i class="fa fa-cog"></i></td>
          <td class="icon del" title="delete record" onclick="del(${curRes.key})"><i class="fa fa-trash"></i></td>
        </tr>
        `
        curRes.continue();
      } 
    }
  }
}

read();

// Prepare form fields for update record
let primaryKey;
function showUpdateButton(key) {
  btnAddAlbum.style.display = "none";
  btnUpdateAlbum.style.display = "block";
  primaryKey = key;
  addAlbum[1].focus();
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let cursor = store.openCursor(primaryKey);
    cursor.onsuccess = function(e) {
      let curRes = cursor.result;
      if (curRes) {
        addAlbum[1].value = curRes.value.genre;
        addAlbum[2].value = curRes.value.band;
        addAlbum[3].value = curRes.value.album;
        addAlbum[4].value = curRes.value.year;
        curRes.continue();
      }
    }
  }
}

//Update the selected record in the database
function update() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    store = tx.objectStore("albums");
    if (confirm("About update record, Are you sure?")) {
      store.put({
        genre: addAlbum[1].value,
        band: addAlbum[2].value,
        album: addAlbum[3].value,
        year: addAlbum[4].value
      }, primaryKey);
      setTimeout(function(){window.location = window.location}, 1000);
    } else {
      setTimeout(function(){window.location = window.location}, 1000);
    }
  }
}

btnUpdateAlbum.addEventListener("click", update);

//Deleting the selected record in the database
function del(key) {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    store = tx.objectStore("albums");
    if (confirm("About delete record, Are you sure ?")) {
      store.delete(key);
    } else {
      return false;
    }
    setTimeout(function(){window.location = window.location}, 100);
  }
}

// Search handlers
const searchInput = document.getElementById("search-input");
const btnSearch = document.getElementById("btnSearch");
const btnRefresh = document.getElementById("btnRefresh");
const thNumber = document.getElementById("thNumber");
searchInput.onchange = function() {
  searchInput.value = searchInput.value.toLowerCase();
  let splitString = searchInput.value.split(" ");
  let newString = splitString.map(element => {
    return element.substring(0, 1).toUpperCase() + element.slice(1)
  });
  searchInput.value = newString.join(" ");
}
const searchSource = document.getElementById("search-source");
let indexName = searchSource.value;
searchSource.onchange = ()  => {
  indexName = searchSource.value;
}
function search() {
  let n = 1;
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = request.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let index = store.index(indexName);
    let getRequest = index.getAll(searchInput.value);
    getRequest.onsuccess = function(e) {
      let result = e.target.result;
      if (result.length > 0) {
      tbody.innerHTML = "";
      
      for (let x of result) {
        tbody.innerHTML += `
        <tr>
          <td>${n++}</td>
          <td>${x.genre}</td>
          <td>${x.band}</td>
          <td>${x.album}</td>
          <td>${x.year}</td>
        </tr>
        `
      }
      } else {
        alert(`No ${indexName} found in collection!`);
      }
    } 
  }
}

btnSearch.addEventListener("click", search);
btnRefresh.addEventListener("click", () => {
  searchInput.value = "";
});

title.onclick = () => location.reload();

// Sorting the table based on headers
function showTable(sort, index) {
  read();
  setTimeout(() => {
    sort(tbody, index)
  }, 20);
}
function sorting(tbody, index) {
  let mapItem = Array.from(tbody.rows)
  mapItem.sort((a, b) => a.cells[index].innerHTML.localeCompare(b.cells[index].innerHTML));
  tbody.innerHTML = "";
  for (let x of mapItem) {
  tbody.innerHTML += x.innerHTML;
  }
}
let number = document.getElementById("number");
number.addEventListener("click", () => {
  tbody.innerHTML = "";
  setTimeout(() => {
    showTable(sorting, 0);
  }, 200);
});
let genre = document.getElementById("genre");
genre.addEventListener("click", () => {
  tbody.innerHTML = "";
  setTimeout(() => {
    showTable(sorting, 1);
  }, 200);
});
let band = document.getElementById("band");
band.addEventListener("click", () => {
  tbody.innerHTML = "";
  setTimeout(() => {
    showTable(sorting, 2);
  }, 200);
});
let album = document.getElementById("album");
album.addEventListener("click", () => {
  tbody.innerHTML = "";
  setTimeout(() => {
    showTable(sorting, 3);
  }, 200);
});
let year = document.getElementById("year");
year.addEventListener("click", () => {
  tbody.innerHTML = "";
  setTimeout(() => {
    showTable(sorting, 4);
  }, 200);
});


