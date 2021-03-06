'use strict'

const { ipcRenderer } = require('electron')
const AWS = require('aws-sdk')
const sts = new AWS.STS()
var s3;
const fs = require('fs')

var genre = ""
var artist = ""
var album = ""

document.getElementById('songForm').addEventListener('submit', (evt) => {
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const input = evt.target[0].files

  console.log("Submitting song from add.js")
  console.log(input[0])

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

    const fileContent = fs.readFileSync(input[0].path)
    const params = {
      Bucket: 'cs493bucket',
      Key: input[0].name,
      Body: fileContent
    }
    s3.upload(params, function(err, data){
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response

      console.log(data.Location)
      console.log(data.Key)

      ipcRenderer.send('add-song', genre.replace(/\n/g,""), artist.replace(/"/g,""), album.replace(/"/g,""), data.Key, data.Location)
    })
  });
})

ipcRenderer.on("genre-name", (event, genreName) => {
  genre = genreName;
})

ipcRenderer.on("artist-name", (event, artistName) => {
  artist = artistName;
})

ipcRenderer.on("album-name", (event, albumName) => {
  album = albumName.replace(/\n/g,"");
})
