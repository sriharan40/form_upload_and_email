'use strict';

var express = require('express');
var fs = require('fs');
var util = require('util');
var bodyParser = require('body-parser');
var mime = require('mime');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
const REST_PORT = (process.env.PORT || 5111);

// Set up auth
var gcloud = require('google-cloud')({
  keyFilename: 'GoogleOCRPOC-e4b04e9203c7.json',
  projectId: 'single-planet-159413'
});

var vision = gcloud.vision();

var app = express();

var user_id = "";

app.use(bodyParser.json());

app.post('/', function(req, res){

var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post">' +
'<input type="file" style="font-size:32px;" name="image" accept="image/*" /><input type="submit" style="width:250px; padding:10px; font-size:32px;" value="Upload NRIC" /><br /><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Your Name </label><input type="hidden" name="user_id" class="field-style field-split align-left" value="'+user_id+'" /><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" />'+
'<label>Email </label><input type="text" name="email" class="field-style field-split align-left" placeholder="Email" />'+
'<label>Dob </label><input type="text" name="dob" class="field-style field-split align-right" placeholder="DOB" />'+
'<label>Sex </label><input type="text" name="sex" class="field-style field-split align-left" placeholder="Sex" />'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

res.writeHead(200, {
    'Content-Type': 'text/html'
  });
res.end(form);

var image_url = req.body.image_url;

if(image_url)
{

console.log("Path: "+image_url);
  
res.write(content, null, 4);

res.end();
}	

});

//var lat = event.params.querystring.lat;
//var lang = event.params.querystring.lang;
//var user_id = event.params.querystring.user_id;
// TODO implement
// Simple upload form

var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post">' +
'<input type="file" style="font-size:32px;" name="image" accept="image/*" /><input type="submit" style="width:250px; padding:10px; font-size:32px;" value="Upload NRIC" /><br /><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Your Name </label><input type="hidden" name="user_id" class="field-style field-split align-left" value="'+user_id+'" /><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" />'+
'<label>Email </label><input type="text" name="email" class="field-style field-split align-left" placeholder="Email" />'+
'<label>Dob </label><input type="text" name="dob" class="field-style field-split align-right" placeholder="DOB" />'+
'<label>Sex </label><input type="text" name="sex" class="field-style field-split align-left" placeholder="Sex" />'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

app.get('/', function(req, res) {

res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);

});

// Get the uploaded image
// Image is uploaded to req.file.path
app.post('/upload', upload.single('image'), function(req, res, next) {

// Choose what the Vision API should detect
// Choices are: faces, landmarks, labels, logos, properties, safeSearch, texts
var types = ['text'];

//console.log("Req: "+req.body.toString());
  
console.log("Path: "+req.file.path);
  
// Send the image to the Cloud Vision API
vision.detect(req.file.path, types, function(err, detections, apiResponse) {
//vision.detectText(req.file.path, function(err, text, apiResponse) {  
  if (err) {
      res.end('Cloud Vision Error '+err);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write('<!DOCTYPE HTML><html><body>');

      // Base64 the image so we can display it on the page
      res.write('<img width=200 src="' + base64Image(req.file.path) + '">');

      //var jsonOutput = JSON.parse(apiResponse);
      var texts = JSON.stringify(apiResponse.responses[0].textAnnotations[0].description);
      var textsHtmlwithoutQuotes = texts.replace(/"/g, '');
      var textWithNextline = textsHtmlwithoutQuotes.replace(/\\n/g, '</br>');
      console.log("Check texts ::>>" + textWithNextline);
      // Write out the JSON output of the Vision API
       //res.write(JSON.stringify(jsonObj.textAnnotations, null, 4));
      
      res.write('<p>' + textWithNextline + '</p>', null, 4);

      // Delete file (optional)
      fs.unlinkSync(req.file.path);

      res.end('</body></html>');
    }
  });
});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

//console.log('Server Started');

// Turn image into Base64 so we can display it easily

function base64Image(src) {
  var data = fs.readFileSync(src).toString('base64');
  return util.format('data:%s;base64,%s', mime.lookup(src), data);
}
