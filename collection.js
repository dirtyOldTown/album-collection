const addAlbum = document.forms["add-album"];
const btnAddAlbum = document.getElementById("btnAddAlbum");
const btnUpdateAlbum = document.getElementById("btnUpdateAlbum");
const tbody = document.querySelector("#cd-table > tbody");

// Initialize database and object store
let db = null;
let store = null;
let request = indexedDB.open("collection", 1);
request.onupgradeneeded = function(e) {
  db = request.result;
  let objectStore = db.createObjectStore("albums", { autoIncrement: true });
  objectStore.createIndex("band_name", "band", { unique: false });
}
request.onsuccess = function(e) {
  db = e.target.result;
  let tx = db.transaction("albums", "readwrite");
  store = tx.objectStore("albums");
}
request.onerror = function(e) {
  console.log(e.target.error)
}

// Creating an indexed database, Create Object Store, Data entry
function addItem() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    if(confirm("About added record, Are you sure ?")) {
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

btnAddAlbum.addEventListener("click", addItem);

// Completing the html-table
function read() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = request.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let cursor = store.openCursor();
    cursor.onsuccess = function() {
    let curRes = cursor.result;
    if (curRes) {
      console.log(curRes);
      tbody.innerHTML += `
        <tr>
          <td>${curRes.value.number}</td>
          <td>${curRes.value.genre}</td>
          <td>${curRes.value.band}</td>
          <td>${curRes.value.album}</td>
          <td>${curRes.value.year}</td>
          <td class="icon upd" onclick="showUpdateButton(${curRes.key})"><i class="fa fa-cog"></i></td>
          <td class="icon del" onclick="del(${curRes.key})"><i class="fa fa-trash"></i></td>
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
  addAlbum[0].focus();
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let cursor = store.openCursor(primaryKey);
    cursor.onsuccess = function(e) {
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

//Update the selected record in the database
function update() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    store = tx.objectStore("albums");
    if (confirm("About update record, Are you sure?")) {
      store.put({
        number: addAlbum[0].value,
        genre: addAlbum[1].value,
        band: addAlbum[2].value,
        album: addAlbum[3].value,
        year: addAlbum[4].value
      }, primaryKey);
      location.reload();
    } else {
      return false;
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
    location.reload()
  }
}

// Search handler
const searchInput = document.getElementById("search-input");
const btnSearch = document.getElementById("btnSearch");
const btnRefresh = document.getElementById("btnRefresh");

searchInput.onchange = () => {
  searchInput.value = searchInput.value.substring(0, 1).toUpperCase() + searchInput.value.slice(1)
}
function search() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = request.result;
    let tx = db.transaction("albums", "readonly");
    store = tx.objectStore("albums");
    let index = store.index("band_name");
    let getRequest = index.getAll(searchInput.value);
    getRequest.onsuccess = function(e) {
      let result = e.target.result;
      if (result.length > 0) {
      tbody.innerHTML = "";
  
      for (let x of result) {
        tbody.innerHTML += `
        <tr>
          <td>${x.number}</td>
            <td>${x.genre}</td>
            <td>${x.band}</td>
            <td>${x.album}</td>
            <td>${x.year}</td>
          </tr>
          `
      }

      } else {
        alert(`No band found in collection!`);
      }
    } 
  }
}

btnSearch.addEventListener("click", search);
btnRefresh.addEventListener("click", () => {
  searchInput.value = "";
})
