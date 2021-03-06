'use strict'

const AWS = require('aws-sdk')

const { ipcRenderer } = require('electron')
const request = require('request')

var genre = ""
var artist = ""

// create add song window button
document.getElementById('addSongBtn').addEventListener('click', () => {
  var albumName = document.getElementById("albumName").innerText
  ipcRenderer.send('add-song-window', genre, artist, albumName)
})

// create add song window button
document.getElementById('deleteAlbumBtn').addEventListener('click', () => {
  var songName = document.getElementById("albumName").innerHTML
  ipcRenderer.send('delete-song', albumName)
})

// Add event listener for song-name
ipcRenderer.on("song-name", (event, albumName) => {
  console.log("changing song name in album.js")
  document.getElementById("songName").innerText = albumName
})

// on receive songs
ipcRenderer.on('refresh-songs', () => {

  console.log("Calling refresh songs")
  var albumName = document.getElementById("artistName").innerText
  const songList = document.getElementById('songList')
  songList.innerHTML="";

  request('https://oaysqwb5t8.execute-api.us-east-1.amazonaws.com/dev/songs/for/album?artist='+artistName, (error, response, body) => {

    if(error){
      console.log(error);
    }else{

      var songs = JSON.parse(body).Songs;
      for(var i=0; i<songs.length; i++){

        // set list html to the song items
        songList.innerHTML = songList.innerHTML + "<li id='album" + songs[i] + "' >" 
        + songs[i] + "<br></li>"
      }
    }
  });
});

// Add event listener for genre-name
ipcRenderer.on("genre-name", (event, genreName) => {
  console.log("Changing genre name in addAlbum.js to: " + genreName)
  genre = genreName;
})

// Add event listener for artist-name
ipcRenderer.on("artist-name", (event, artistName) => {
  console.log("Changing genre name in addAlbum.js to: " + artistName)
  artist = artistName;
})

// Add event listener for album
ipcRenderer.on("album-name", (event, albumName) => {
  console.log("Changing album name in addAlbum.js to: " + albumName)
  document.getElementById("albumName").innerText = albumName;
})