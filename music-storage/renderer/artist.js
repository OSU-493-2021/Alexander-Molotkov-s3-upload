'use strict'

const AWS = require('aws-sdk')

const { ipcRenderer } = require('electron')
const request = require('request')

var genre = ""

// create add album window button
document.getElementById('addAlbumBtn').addEventListener('click', () => {
  var artistName = document.getElementById("artistName").innerText
  ipcRenderer.send('add-album-window', genre, artistName)
})

// create add album window button
document.getElementById('deleteArtistBtn').addEventListener('click', () => {
  var albumName = document.getElementById("artistName").innerHTML
  ipcRenderer.send('delete-album', artistName)
})

// Add event listener for album-name
ipcRenderer.on("album-name", (event, artistName) => {
  console.log("changing album name in artist.js")
  document.getElementById("albumName").innerText = artistName
})

// on receive albums
ipcRenderer.on('refresh-albums', () => {

  console.log("Calling refresh albums")
  var artistName = document.getElementById("artistName").innerText
  const albumList = document.getElementById('albumList')
  albumList.innerHTML="";

  request('https://oaysqwb5t8.execute-api.us-east-1.amazonaws.com/dev/albums/for/artist?artist='+artistName, (error, response, body) => {

    if(error){
      console.log(error);
    }else{

      var albums = JSON.parse(body).Albums;
      for(var i=0; i<albums.length; i++){

        // set list html to the album items
        albumList.innerHTML = albumList.innerHTML + "<li id='artist" + albums[i] + "' >" 
        + albums[i] + "<br></li>"
      }

      // add event listener to open up album details
      albumList.querySelectorAll("li").forEach(item => {

        item.addEventListener('click', function(e) {
          ipcRenderer.send("album-window", genre, artistName, this.innerText)     
        });
      });
    }
  });
});

// Add event listener for genre-name
ipcRenderer.on("genre-name", (event, genreName) => {
  console.log("Changing genre name in addArtist.js to: " + genreName)
  genre = genreName;
})

// Add event listener for genre-name
ipcRenderer.on("artist-name", (event, artistName) => {
  console.log("Changing artist name in addArtist.js to: " + artistName)
  document.getElementById("artistName").innerText = artistName;
})