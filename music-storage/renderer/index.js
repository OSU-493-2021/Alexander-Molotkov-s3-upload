'use strict'

const { ipcRenderer, ipcMain } = require('electron')

// create add album window button
document.getElementById('createAlbumBtn').addEventListener('click', () => {
  ipcRenderer.send('add-album-window')
})

// on receive album
ipcRenderer.on('album', (event, album) => {

  // get the albumList ul
  const albumList = document.getElementById('albumList')

  console.log("Calling album in index.js")
  var albumText = JSON.stringify(album)
  console.log(albumText)
  albumText= albumText.replace(/"/g,"")

  // set list html to the todo items
  albumList.innerHTML = albumList.innerHTML + "<li id='album" + albumText + "' >" 
  + albumText + "<br></li>"

  // add event listener to open up album details
  albumList.querySelectorAll("li").forEach(item => {

    item.addEventListener('click', function(e) {
      ipcRenderer.send("album-window", this.innerHTML.replace(/"/g,""))     
    })
  })
})

ipcRenderer.on('delete-album', (event, album) =>{

  console.log("calling delete-album in index.js")
  console.log("album" + album)

  const li = document.getElementById("album" + album)
  li.parentNode.removeChild(li)
})
