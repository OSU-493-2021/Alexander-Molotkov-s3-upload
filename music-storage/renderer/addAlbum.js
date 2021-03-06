'use strict'

const { ipcRenderer } = require('electron')

var genre = ""
var artist = ""

document.getElementById('albumForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const album = evt.target[0]

  console.log("Submitting album from addAlbum.js")
  console.log(album.value)
  console.log(genre)
  console.log(artist)

  // send todo to main process
  ipcRenderer.send('add-album', genre.replace(/\n/g,""), artist.replace(/"/g,""), album.value.replace(/"/g,""))

  // reset input
  album.value = '';
})

// Add event listener for genre-name
ipcRenderer.on("genre-name", (event, genreName) => {
  console.log("Changing genre name in addAlbum.js to: " + genreName)
  genre = genreName;
})

// Add event listener for genre-name
ipcRenderer.on("artist-name", (event, artistName) => {
  console.log("Changing artist name in addAlbum.js to: " + artistName)
  artist = artistName;
})