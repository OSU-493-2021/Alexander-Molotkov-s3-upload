'use strict'

const path = require('path')
const { app, ipcMain, ipcRenderer } = require('electron')

const Window = require('./Window')
const AWS = require('aws-sdk')
const sts = new AWS.STS()
const fs = require('fs')
const ddb = new AWS.DynamoDB({region: 'us-east-1'})
const request = require('request')

function main () {

  // todo list window
  let mainWindow = new Window({
    file: path.join('renderer', 'index.html')
  })

  // add genre window
  let addGenreWin
  // add artist window
  let addArtistWin
  // add album window
  let addAlbumWin
  // add song window
  let addSongWin
  // genre detail window
  let genreWin
  // artist detail window
  let artistWin
  // album detail window
  let albumWin

  mainWindow.once('ready-to-show', () => {


    // get and list genres from API
    request('https://oaysqwb5t8.execute-api.us-east-1.amazonaws.com/dev/genres', (error, response, body) => {

      if(error){
        console.log(error);
      }else{
        var genres = JSON.parse(body).Genres;
        
        for(var i=0; i<genres.length; i++){
          mainWindow.send('genre', genres[i])
        }
      }
    });
  });

  // create add genre window
  ipcMain.on('add-genre-window', () => {
    // if addTodoWin does not already exist
    if (!addGenreWin) {
      addGenreWin = new Window({
        file: path.join('renderer', 'addGenre.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      });

      // cleanup
      addGenreWin.on('closed', () => {
        addGenreWin = null
      });
    }
  });

  // create add song window
  ipcMain.on('add-artist-window', (event, genreName) => {
    if (!addArtistWin) {
      addArtistWin = new Window({
        file: path.join('renderer', 'addArtist.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: genreWin
      })

      // cleanup
      addArtistWin.on('closed', () => {
        addArtistWin = null
      })
      addArtistWin.once('show', () => {
        addArtistWin.webContents.send('genre-name', genreName)
      })
    }
  })
  
  // create add song window
  ipcMain.on('add-song-window', (event, genreName, artistName, albumName) => {
    // if addTodoWin does not already exist
    if (!addSongWin) {
      addSongWin = new Window({
        file: path.join('renderer', 'add.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: albumWin
      })

      // cleanup
      addSongWin.on('closed', () => {
        addSongWin = null
      })
      addSongWin.on('show', () => {
        addSongWin.webContents.send('genre-name', genreName)
        addSongWin.webContents.send('artist-name', artistName)
        addSongWin.webContents.send('album-name', albumName)
      })
    }
  })

  // create add album window
  ipcMain.on('add-album-window', (event, genreName, artistName) => {
    // if addTodoWin does not already exist
    if (!addAlbumWin) {
      // create a new add todo window
      addAlbumWin = new Window({
        file: path.join('renderer', 'addAlbum.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      addAlbumWin.on('closed', () => {
        addAlbumWin = null
      })
      addAlbumWin.once('show', () => {
        addAlbumWin.webContents.send('genre-name', genreName)
        addAlbumWin.webContents.send('artist-name', artistName)
      });
    }
  });

  ipcMain.on('genre-window', (event, genreName) => {

    if (!genreWin) {
      // create a new album window
      genreWin = new Window({
        file: path.join('renderer', 'genre.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })
      // cleanup
      genreWin.on('closed', () => {
        genreWin = null
      })
      genreWin.once('show', () => {
        genreWin.webContents.send('genre-name', genreName)
        genreWin.webContents.send('refresh-artists')
      })
    }
  });

  ipcMain.on('artist-window', (event, genreName, artistName) => {

    if (!artistWin) {
      // create a new artist window
      artistWin = new Window({
        file: path.join('renderer', 'artist.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: genreWin
      })
      // cleanup
      artistWin.on('closed', () => {
        artistWin = null
      })
      artistWin.once('show', () => {
        artistWin.webContents.send('genre-name', genreName)
        artistWin.webContents.send('artist-name', artistName)
        artistWin.webContents.send('refresh-albums')
      })
    }
  });

  ipcMain.on('album-window', (event, genreName, artistName, albumName) => {

    if (!albumWin) {
      // create a new artist window
      albumWin = new Window({
        file: path.join('renderer', 'album.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: artistWin
      })
      // cleanup
      albumWin.on('closed', () => {
        albumWin = null
      })
      albumWin.once('show', () => {
        albumWin.webContents.send('genre-name', genreName)
        albumWin.webContents.send('artist-name', artistName)
        albumWin.webContents.send('album-name', albumName)
        //albumWin.webContents.send('refresh-songs')
      })
    }
  });

  // add genre
  ipcMain.on('add-genre', (event, genre, artist) => {
    console.log('Calling add-genre in main.js')

    var params = {
      TableName:'music',
      Item:{
        Genres:{
          'S': genre
        },
        Artists:{
          'S': artist
        },
        Albums:{
          'L': []
        },
        Songs:{
          'L': []
        }
      }
    }
    ddb.putItem(params, (err, data) => {
      if(err){
        console.log(err)
      }else{
        console.log("genre added: " + genre)
      }
    })
    mainWindow.send('genre', genre)
  })

  // add artist
  ipcMain.on('add-artist', (event, genre, artist) => {
    console.log('Calling add-artist in main.js')

    console.log(genre)
    console.log(artist)

    var params = {
      TableName:'music',
      Item:{
        Genres:{
          'S': genre
        },
        Artists:{
          'S': artist
        },
        Albums:{
          'L': []
        },
        Songs:{
          'L': []
        },
      }
    }
    ddb.putItem(params, (err, data) => {
      if(err){
        console.log(err)
      }else{
        console.log("artist added: " + artist)
        genreWin.send('refresh-artists')
      }
    })
  })

  // add album
  ipcMain.on('add-album', (event, genre, artist, album) => {

    var dc = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

    console.log('Calling add-album in main.js')

    console.log(genre)
    console.log(artist)
    console.log(album)
    
    var params = {
      TableName:'music',
      Key:{
        "Genres": genre,
        "Artists": artist
      },
      UpdateExpression: "SET Albums = list_append(Albums, :i)",
      ExpressionAttributeValues: {
        ':i':[album]
      },
      ReturnValues:"UPDATED_NEW"
    }

    dc.update(params, (err, data) => {
      if(err){
        console.log(err)
      }else{
        console.log("album added: " + album)
      }
    })
  })

  ipcMain.on('add-song', (event, genre, artist, album, song, songurl) => {

    var dc = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

    console.log('Calling add-song in main.js')

    console.log(genre)
    console.log(artist)
    console.log(album)
    console.log(song)
    console.log(songurl)
    
    var params = {
      TableName:'music',
      Key:{
        "Genres": genre,
        "Artists": artist
      },
      UpdateExpression: "SET Songs = list_append(Songs, :s)",
      ExpressionAttributeValues: {
        ':s':[songurl, song]
      },
      ReturnValues:"UPDATED_NEW"
    }

    dc.update(params, (err, data) => {
      if(err){
        console.log(err)
      }else{
        console.log("song added: " + song)
      }
    })
  })

  // delete-song from song list window
  ipcMain.on('delete-song', (event, todo) => {
    const updatedTodos = todosData.deleteTodo(todo).todos

    mainWindow.send('songs', updatedTodos)
  })

  ipcMain.on('delete-album', (event, album) => {

    console.log("calling delete album in main.js")
    var shortAlbum = album.substring(0, album.indexOf("<"))

    const params = {
      Bucket: 'cs493bucket',
      Key: 'Albums/' + shortAlbum + '/',
    }

    s3.deleteObject(params, function(err, data){
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

    mainWindow.webContents.send('delete-album', shortAlbum)
    albumWin.close()
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
