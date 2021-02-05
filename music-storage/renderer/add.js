'use strict'

const { ipcRenderer } = require('electron')

document.getElementById('songForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const input = evt.target[0].files

  console.log("Submitting song from add.js")
  console.log(input)

  for(var i = 0; i < input.length; i++){
    ipcRenderer.send('add-song', input[i].path)
  }

  // send todo to main process

})
