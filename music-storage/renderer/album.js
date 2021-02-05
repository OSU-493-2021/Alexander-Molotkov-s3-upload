'use strict'

const AWS = require('aws-sdk')

const { ipcRenderer } = require('electron')
var s3 = new AWS.S3()

// create add song window button
document.getElementById('uploadSongBtn').addEventListener('click', () => {
  ipcRenderer.send('add-song-window')
})

// create add song window button
document.getElementById('deleteAlbumBtn').addEventListener('click', () => {
  
  var albumName = document.getElementById("albumName").innerHTML
  ipcRenderer.send('delete-album', albumName)

})

// Add event listener for album-name
ipcRenderer.on("album-name", (event, albumName) => {

  console.log("changing album name in album.js")

  document.getElementById("albumName").innerHTML = albumName
})

// on receive songs
ipcRenderer.on('song', (event, songs) => {

  // get the songList ul
  const songList = document.getElementById('songList')
  var albumName = document.getElementById('albumName').innerText
  albumName = albumName.substring(0, albumName.indexOf('\n'))

  console.log("Calling song in album.js")
  const songPath = JSON.stringify(songs)
  console.log(songPath)

  var songTitle = songPath.substring(songPath.lastIndexOf('\\') + 1, songPath.length -1)
  console.log(songTitle)

  songList.innerHTML = songList.innerHTML + "<li id='song" + songTitle + "' >" 
  + songTitle + "<br></li>"

  var data = {song: songPath.substring(0,songPath.length - 1), album: albumName}
  ipcRenderer.send('upload-song', data)

})

ipcRenderer.on('add-song', (event, song) => {

  console.log("Calling add song")
  const songList = document.getElementById('songList')
  var shortSong = song.substring(song.lastIndexOf('/') + 1, song.length -1)
  songList.innerHTML = songList.innerHTML + "<li id='song" + shortSong + "' >" 
  + shortSong + "<br></li>"

})

ipcRenderer.on('get-album-name', function(event){

  var albumName = document.getElementById("albumName").innerHTML
  var albumText= albumName.replace(/"/g,"")
  albumWindow.webContents.send('delete-album', albumText)

})