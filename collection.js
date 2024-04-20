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
}

btnAddAlbum.addEventListener("click", addItem);