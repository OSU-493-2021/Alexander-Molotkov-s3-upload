'use strict'

const { ipcRenderer } = require('electron')

document.getElementById('genreForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const genre = evt.target[0]
  const artist = evt.target[1]

  console.log("Submitting genre and artist from addGenre.js")
  console.log(genre.value)
  console.log(artist.value)

  // send todo to main process
  ipcRenderer.send('add-genre', genre.value.replace(/"/g,""), artist.value.replace(/"/g,""))

  // reset input
  genre.value = ''
  artist.value = ''
})
