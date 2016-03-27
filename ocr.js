var request = require('request');
var fs = require('fs');
var path    = require('path');
var _    = require('lodash');
var yargs   = require('yargs').argv;

//   node permutate.js --recipe=permutations5.json --result=candidates5.json

var API_KEY = process.env.GOOGLE_VISION
var imagePath = yargs.image
var resultPath = yargs.result

var resultHandler;

if(!resultPath){
  resultHandler = function(result, resultPath){console.log(result);};
} else {
  resultHandler = writeResultToDisk;
}

readImage(imagePath)
  .then(function(result){
    resultHandler(result, resultPath);
  })
  .catch(function(result){
    resultHandler(result);
  })

function readImage(imagePath){
  if(!imagePath){
    throw new Error("No --image path defined");
  }
  if(!API_KEY){
    throw new Error("No GOOGLE_VISION environment variable defined");
  }
  var base64EncodedImage = base64Encode(imagePath);
  return sendImageToGoogle(base64EncodedImage);
}

function writeResultToDisk(result, resultPath){
  fs.writeFile(resultPath, JSON.stringify(result, null, 4), function(err){});
}

function sendImageToGoogle(image){
  const API_ADDRESS = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`

  const body = {
    "requests":[
      {
        "image":{
          "content":image
        },
        "features":[
          {
            "type":"TEXT_DETECTION",
            "maxResults":1
          }
        ]
      }
    ]
  }

  const options = {
    url: API_ADDRESS,
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    json: true,
    body: body
  } 


  return new Promise(function(resolve,reject){
    request(options, (function(error, response, body){
      var result = [];

      if(!(body.error)){
        console.log("===================")
        console.log("Request Successful");
        console.log(body);
        console.log("===================")
      } else {
        reject(null);
      }

      if(body['responses']){
        body['responses'].forEach(function(response){
          response.textAnnotations.forEach(function(annotation){
            result.push(annotation.description);
          })
        })
      }

      resolve(result);
    }));
  })
}

/**
 * base64 encode file
 * @param  {String | Path} path to the image
 * @return {[type]}      [description]
 */
function base64Encode(path) {
  // read binary data
  var bitmap = fs.readFileSync(path);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}