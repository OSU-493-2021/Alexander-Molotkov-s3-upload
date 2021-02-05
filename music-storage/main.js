'use strict'

const path = require('path')
const { app, ipcMain, ipcRenderer } = require('electron')

const Window = require('./Window')
const AWS = require('aws-sdk')
const sts = new AWS.STS()
const fs = require('fs')

function main () {
  // todo list window
  let mainWindow = new Window({
    file: path.join('renderer', 'index.html')
  })

  // add song window
  let addSongWin

  // add album window
  let addAlbumWin

  // album detail window
  let albumWin

  var s3 = new AWS.S3()

  var albums = []
  
  // Use users AWS credentials
  var credentials = new AWS.SharedIniFileCredentials({profile: 'default'})
  AWS.config.credentials = credentials
  
  // Assume s3 role
  var params = {
    RoleArn: 'arn:aws:iam::751454240071:role/s3user',
    RoleSessionName: 'awssdk'
  }
  
  sts.assumeRole(params, function(err, data) {
    console.log("Assume role")
    if (err) console.log(err); // an error occurred
    else     console.log("Good role assume");           // successful response
  
    AWS.config.update({
      accessKeyId: data.Credentials.AccessKeyId,
      secretAccessKey: data.Credentials.SecretAccessKey,
      sessionToken: data.Credentials.SessionToken
    });
  
    // Connect to s3 with new credentials
    s3 = new AWS.S3();
  
    const bucketParams = {
      Bucket: 'cs493bucket',
      Delimiter: '/',
      Prefix: 'Albums/',
    };
  
    // List current albums
    s3.listObjectsV2(bucketParams , function (err, objects){
      console.log(objects.CommonPrefixes)
      for(var i = 0; i < objects.CommonPrefixes.length; i++){
  
        var name = objects.CommonPrefixes[i].Prefix
        name = name.substring(
          name.indexOf("/") +1,
          name.lastIndexOf("/"),
        )
        mainWindow.webContents.send('album', name)
      }
    });
  });
  
  // create add song window
  ipcMain.on('add-song-window', () => {
    // if addTodoWin does not already exist
    if (!addSongWin) {
      // create a new add todo window
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
    }
  })

  // create add album window
  ipcMain.on('add-album-window', () => {
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
    }
  })

 // create add album window
 ipcMain.on('album-window', (event, albumName) => {
  // if addAlbumWin does not already exist

  const album = albumName.substring(0, albumName.indexOf('<'))

  if (!albumWin) {
    // create a new album window
    albumWin = new Window({
      file: path.join('renderer', 'album.html'),
      width: 400,
      height: 400,
      // close with the main window
      parent: mainWindow
    })

    const bucketParams = {
      Bucket: 'cs493bucket',
      Prefix: 'Albums/' + album + '/',
    };
  
    
    // List current albums
    s3.listObjectsV2(bucketParams , function (err, objects){
      console.log(objects)
      for(var i = 0; i < objects.Contents.length; i++){
        
        var path = objects.Contents[i].Key

        if(path != 'Albums/' + album + '/'){
          albumWin.webContents.send('add-song', path)
        }
      }
    });

    // cleanup
    albumWin.on('closed', () => {
      albumWin = null
    })

    albumWin.once('show', () => {
      albumWin.webContents.send('album-name', albumName)
    })
  }
 })

  // add-song from add song window
  ipcMain.on('add-song', (event, songPath) => {

    console.log('Calling add-song in main.js')
    console.log(songPath)
    albumWin.webContents.send('song', songPath)

  })

  ipcMain.on('upload-song', (event, data) => {
    
    console.log(data)

    var songName = data.song.substring(data.song.lastIndexOf('\\')+1, data.song.length)
    
    const fileContent = fs.readFileSync(data.song.substring(1, data.song.length))

    const params = {
      Bucket: 'cs493bucket',
      Key: 'Albums/' + data.album + '/' + songName,
      Body: fileContent
    }


    s3.upload(params, function(err, data){
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    })
  })

  // add album
  ipcMain.on('add-album', (event, album) => {

    console.log('Calling add-album in main.js')

    const params = {
      Bucket: 'cs493bucket',
      Key: 'Albums/' + album + '/',
      ContentLength: 0
    }

    s3.putObject(params, function(err, data){
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

    mainWindow.send('album', album)

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
