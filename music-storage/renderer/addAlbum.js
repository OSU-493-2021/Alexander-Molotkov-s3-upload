'use strict'

const { ipcRenderer } = require('electron')

document.getElementById('albumForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const input = evt.target[0]

  console.log("Submitting album from addAlbum.js")
  console.log(input.value)

  // send todo to main process
  ipcRenderer.send('add-album', input.value.replace(/"/g,""))

  // reset input
  input.value = ''
})
