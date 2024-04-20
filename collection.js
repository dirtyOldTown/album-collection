const addAlbum = document.forms["add-album"];
const btnAddAlbum = document.getElementById("btnAddAlbum");
const btnUpdateAlbum = document.getElementById("btnUpdateAlbum");
const tbody = document.querySelector("#cd-table > tbody");
let db = null;

function addItem() {
  let request = indexedDB.open("collection", 1);
  request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore("albums", { autoIncrement: true});
  }
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readwrite");
    let store = tx.objectStore("albums");
    store.put({
      number: addAlbum[0].value,
      genre: addAlbum[1].value,
      band: addAlbum[2].value,
      album: addAlbum[3].value,
      year: addAlbum[4].value,
    });
  }
  read();
}

btnAddAlbum.addEventListener("click", addItem);

function read() {
  let request = indexedDB.open("collection", 1);
  request.onsuccess = function(e) {
    db = e.target.result;
    let tx = db.transaction("albums", "readonly");
    let store = tx.objectStore("albums");
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
            <td class="icon upd"><i class="fa fa-cog"></i></td>
            <td class="icon upd"><i class="fa fa-trash"></i></td>
          </tr>
        `
        curRes.continue();
      } 
    }
  }
}
