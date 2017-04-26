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

app.use(bodyParser.json());

app.post('/', upload.single('image'), function(req, res, next) {

var params=function(req){
  var q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}
	
req.params=params(req);

var user_id = req.params.user_id;

var planname = req.params.planname;

var name = req.body.name;

var dob = req.body.dob;

var sex = req.body.sex;

if(name && dob && sex)
{
	
sendmail({
from: 'no-reply@yourdomain.com',
to: 'sriharan40@gmail.com, himantgupta@gmail.com',
subject: 'Test sendmail',
html: JSON.stringify(req.body),
}, function(err, reply) {
console.log(err && err.stack);
console.dir(reply);
});


var text = "Your form was submitted successfully with the details as : Name : "+name+", Plan : "+planname+", Sex : "+sex+", DOB : "+dob+"";

var token = process.env.FB_PAGE_TOKEN;

var requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        dashbotTemplateId: 'right',		  
        recipient: {
			id:user_id
			},
        message: {
		   text:text	
		}
      }
};

console.log('RequestData:', requestData);

request(requestData, function(error, res, body) {  
if (error) {
  console.log('Error sending message: ', error);
} else if (res.body.error) {
  console.log('Error: ', res.body.error);
  }

});

  
var form1 = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css">'+
'<div id="envelope"><body align="left" onload=window.location="http://m.me/digitaldemofortelcos"><header><h2>Personal Details</h2></header><hr>' +
'<p>Details submitted successfully</p>'+
'</div>'+  
'</body></html>';

callback(null,form1);	

}

else
{
// Choices are: faces, landmarks, labels, logos, properties, safeSearch, texts
var types = ['text'];

//console.log("Req: "+req.body.toString());
  
console.log("Path: "+req.file.path);
  
// Send the image to the Cloud Vision API
vision.detect(req.file.path, types, function(err, detections, apiResponse) {
  if (err) {
      res.end('Cloud Vision Error '+err);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });

//var jsonOutput = JSON.parse(apiResponse);
var texts = JSON.stringify(apiResponse.responses[0].textAnnotations[0].description);

var textsHtmlwithoutQuotes = texts.replace(/"/g, '');

var textWithNextline = textsHtmlwithoutQuotes.replace(/\\n/g, '</br>');

console.log("Check texts ::>>" + textWithNextline);      
	  
var arr = textWithNextline.split("</br>");

console.log("Check splitted ::>>" + arr);      

var your_name = arr[4].toString().toUpperCase();

var sex = arr[9];

var dob = arr[10];
	  
var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data">' +
'<input type="file" style="font-size:32px;" name="image" accept="image/*" /><input type="submit" style="width:250px; padding:10px; font-size:32px;" value="Upload NRIC" /><br /><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Plan Name </label><input type="text" name="plan_name" class="field-style field-split align-left" value='+planname+' placeholder="Plan Name" /><br /><label>Your Name </label><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" value="'+your_name+'" />'+
'<label>Dob </label><input type="text" name="dob" class="field-style field-split align-right" placeholder="DOB" value="'+dob+'" />'+
'<label>Sex </label><input type="text" name="sex" class="field-style field-split align-left" placeholder="Sex" value="'+sex+'" />'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

	  res.write(form);
	  
      // Delete file (optional)
      fs.unlinkSync(req.file.path);

      res.end();
    }
  });
  		
}	

});

//var lat = event.params.querystring.lat;
//var lang = event.params.querystring.lang;
//var user_id = event.params.querystring.user_id;
// TODO implement
// Simple upload form

app.get('/', function(req, res) {

var params=function(req){
  var q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}
	
req.params=params(req);

var user_id = req.params.user_id;

var planname = req.params.planname;

var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data">' +
'<input type="file" style="font-size:32px;" name="image" accept="image/*" /><input type="submit" style="width:250px; padding:10px; font-size:32px;" value="Upload NRIC" /><br /><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Plan Name </label><input type="text" name="plan_name" class="field-style field-split align-left" value='+planname+' placeholder="Plan Name" /><br /><label>Your Name </label><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" />'+
'<label>Dob </label><input type="text" name="dob" class="field-style field-split align-right" placeholder="DOB" />'+
'<label>Sex </label><input type="text" name="sex" class="field-style field-split align-left" placeholder="Sex" />'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);

});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});
