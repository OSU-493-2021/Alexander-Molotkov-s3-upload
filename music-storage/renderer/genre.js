'use strict'

const AWS = require('aws-sdk')

const { ipcRenderer } = require('electron')
const request = require('request')

// create add artist window button
document.getElementById('addArtistBtn').addEventListener('click', () => {
  var genreName = document.getElementById("genreName").innerText
  ipcRenderer.send('add-artist-window', genreName)
})

// create delete genre window button
document.getElementById('deleteGenreBtn').addEventListener('click', () => {
  var genreName = document.getElementById("genreName").innerHTML
  ipcRenderer.send('delete-genre', genreName)
})

// Add event listener for genre-name
ipcRenderer.on("genre-name", (event, genreName) => {
  console.log("changing genre name in genre.js")
  document.getElementById("genreName").innerHTML = genreName
})

// on receive artists
ipcRenderer.on('refresh-artists', () => {

  console.log("Calling refresh artists")
  var genreName = document.getElementById("genreName").innerText
  const artistList = document.getElementById('artistList')
  artistList.innerHTML="";

  request('https://oaysqwb5t8.execute-api.us-east-1.amazonaws.com/dev/artists/for/genre?genre='+genreName, (error, response, body) => {

    if(error){
      console.log(error);
    }else{

      var artists = JSON.parse(body).Artists;
      for(var i=0; i<artists.length; i++){

        // set list html to the artist items
        artistList.innerHTML = artistList.innerHTML + "<li id='artist" + artists[i] + "' >" 
        + artists[i] + "<br></li>"
      }

      // add event listener to open up artist details
      artistList.querySelectorAll("li").forEach(item => {

        item.addEventListener('click', function(e) {
          ipcRenderer.send("artist-window", genreName, this.innerText.replace(/\n/g,""))     
        });
      });
    }
  });
});