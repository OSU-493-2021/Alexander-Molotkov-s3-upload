'use strict'

const { ipcRenderer, ipcMain } = require('electron')

// create add genre window button
document.getElementById('createGenreBtn').addEventListener('click', () => {
  ipcRenderer.send('add-genre-window')
})

// on receive genre
ipcRenderer.on('genre', (event, genre) => {

  // get the genreList ul
  const genreList = document.getElementById('genreList')

  console.log("Calling genre in index.js")
  console.log(genre)

  // set list html to the todo items
  genreList.innerHTML = genreList.innerHTML + "<li id='genre" + genre + "' >" 
  + genre + "<br></li>"

  // add event listener to open up genre details
  genreList.querySelectorAll("li").forEach(item => {

    item.addEventListener('click', function(e) {
      ipcRenderer.send("genre-window", this.innerHTML)     
    })
  })
})

ipcRenderer.on('delete-genre', (event, genre) =>{

  console.log("calling delete-genre in index.js")
  console.log("genre" + genre)

  const li = document.getElementById("genre" + genre)
  li.parentNode.removeChild(li)
})
