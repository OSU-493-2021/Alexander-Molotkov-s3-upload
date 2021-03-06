'use strict'

const { ipcRenderer } = require('electron')

var genre = ""

document.getElementById('artistForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const artist = evt.target[0]

  console.log(artist)
  console.log(genre)

  console.log("Submitting artist from addArtist.js")
  console.log(artist.value)

  // send todo to main process
  ipcRenderer.send('add-artist', genre.replace(/\n/g,""), artist.value.replace(/"/g,""))

  // reset input
  artist.value = '';
})

// Add event listener for genre-name
ipcRenderer.on("genre-name", (event, genreName) => {
  console.log("Changing genre name in addArtist.js to: " + genreName)
  genre = genreName;
})