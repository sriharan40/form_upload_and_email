'use strict';

var express = require('express');
var fs = require('fs');
var util = require('util');
var bodyParser = require('body-parser');
var mime = require('mime');
var sendmail = require('sendmail')();
var request = require("request");
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


var text = "Your request was submitted successfully with the details as : Name : "+name+", Plan : "+planname+", Sex : "+sex+", DOB : "+dob+" \n\n Our sales team will contact you within 48Hours.";

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

res.writeHead(200, {
'Content-Type': 'text/html'
});
  
var form1 = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css">'+
'<div id="envelope"><body align="left"><header><h2>Personal Details</h2></header><hr>' +
'<p>Request submitted successfully</p>'+
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data">' +
'<label id="custom-file-upload">Choose File<input type="file" style="font-size:32px; float:left;" onchange= document.getElementById("custom-file-upload").style.backgroundColor="#32CD32"; name="image" accept="image/*" /></label><input type="submit" style="width:250px; padding:10px; font-size:32px; float:right;" value="Upload NRIC" /><div style="clear:both;"></div></form><form class="form-style-9" action="" method="post" enctype="multipart/form-data"><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Plan Name </label><input type="text" name="plan_name" class="field-style field-split align-left" value='+planname+' placeholder="Plan Name" readonly /><br /><label>Your Name </label><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" />'+
'<label>Dob </label><input type="text" name="dob" class="field-style field-split align-right" placeholder="DOB" />'+
'<label>Sex </label><input type="text" name="sex" class="field-style field-split align-left" placeholder="Sex" />'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body><script type="text/javascript">window.open("http://m.me/digitaldemofortelcos");window.close();</script></html>';

res.write(form1);

// Delete file (optional)
fs.unlinkSync(req.file.path);

res.end();

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


if(arr[3] == "Name")
{
var your_name = arr[4].toString().toUpperCase();
}

else if(arr[2] == "Name")
{
var your_name = arr[3].toString().toUpperCase();
}

else if(arr[1].match(/[IDENTITY CARD NO]/g))
{
var your_name = arr[2].toString().toUpperCase();
}

console.log("Name ::>>" + your_name);      

if(arr[8].match(/[A-Z]/g))
{
var sex = arr[8];
}

if(arr[9].match(/[A-Z]/g))
{
var sex = arr[9];
}

else if(arr[10].match(/[A-Z]/g))
{
var sex = arr[10];
}

else if(arr[11].match(/[A-Z]/g))
{
var sex = arr[11];
}

console.log("SEX ::>>" + sex);      

if(arr[7].match(/[0-9][0-9][-][0-9][0-9][-][0-9][0-9][0-9][0-9]/g))
{
var dob = arr[7];
}

if(arr[8].match(/[0-9][0-9][-][0-9][0-9][-][0-9][0-9][0-9][0-9]/g))
{
var dob = arr[8];
}

if(arr[9].match(/[0-9][0-9][-][0-9][0-9][-][0-9][0-9][0-9][0-9]/g))
{
var dob = arr[9];
}

else if(arr[10].match(/[0-9][0-9][-][0-9][0-9][-][0-9][0-9][0-9][0-9]/g))
{
var dob = arr[10];
}

else if(arr[11].match(/[0-9][0-9][-][0-9][0-9][-][0-9][0-9][0-9][0-9]/g))
{
var dob = arr[11];
}

console.log("DOB ::>>" + dob);      
	  
var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data">' +
'<label id="custom-file-upload">Choose File<input type="file" style="font-size:32px; float:left;" onchange= document.getElementById("custom-file-upload").style.backgroundColor="#32CD32"; name="image" accept="image/*" /></label><input type="submit" style="width:250px; padding:10px; font-size:32px; float:right;" value="Upload NRIC" /><div style="clear:both;"></div></form><form class="form-style-9" action="" method="post" enctype="multipart/form-data"><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Plan Name </label><input type="text" name="plan_name" class="field-style field-split align-left" value='+planname+' placeholder="Plan Name" readonly /><br /><label>Your Name </label><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" value="'+your_name+'" />'+
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
'<label id="custom-file-upload">Choose File<input type="file" style="font-size:32px; float:left;" onchange= document.getElementById("custom-file-upload").style.backgroundColor="#32CD32"; name="image" accept="image/*" /></label><input type="submit" style="width:250px; padding:10px; float:right; font-size:32px;" value="Upload NRIC" /><div style="clear:both;"></div></form><form class="form-style-9" action="" method="post" enctype="multipart/form-data"><p style="font-size:32px; line-height:40px;">Please validate that the info was captured in the form correctly. You can edit the info, in case the info was not captured.</p><br /><label>Plan Name </label><input type="text" name="plan_name" class="field-style field-split align-left" value='+planname+' placeholder="Plan Name" readonly /><br /><label>Your Name </label><input type="text" name="name" class="field-style field-split align-left" placeholder="Name" />'+
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
