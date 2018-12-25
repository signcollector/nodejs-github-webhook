const fs = require('fs');
var http    = require('http');
var spawn   = require('child_process').spawn;
var crypto  = require('crypto');
var url     = require('url');

var secret  = 'blastingyourmindawaywithit'; // secret key of the webhook
var port    = 8081; // port

const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./err.log', 'a');

http.createServer(function(req, res){

    console.log("request received");
    res.writeHead(400, {"Content-Type": "application/json"});

    var path = url.parse(req.url).pathname;

    if(req.method != 'POST'){
       var data = JSON.stringify({"error": "invalid request, expecting POST"});
       return res.end(data);
    }

    var jsonString = '';
    req.on('data', function(data){
        jsonString += data;
    });

    req.on('end', function(){
      var hash = "sha1=" + crypto.createHmac('sha1', secret).update(jsonString).digest('hex');
      if(hash != req.headers['x-hub-signature']){
          console.log('invalid key');
          var data = JSON.stringify({"error": "invalid key", key: hash});
          return res.end(data);
      }

      console.log("running hook.sh");

      var deploySh = spawn('sh', ['hook.sh'], {detached: true, stdio: ['ignore', out, err]});
      deploySh.unref();

      res.writeHead(200, {"Content-Type": "application/json"});

      var data = JSON.stringify({"success": true});
      return res.end(data);
    });
}).listen(port);