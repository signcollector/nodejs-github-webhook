const fs = require('fs');
const http    = require('http');
const spawn   = require('child_process').spawn;
const crypto  = require('crypto');

const webhookSecret  = 'blastingyourmindawaywithit';
const port    = 8081;

const contenType = {"Content-Type": "application/json"};
const dateName = new Date().toISOString().replace(/\:/g, "-").replace(/\./g, "-");
const errFile = './'+dateName+'-err.log';
const outFile = './'+dateName+'-out.log';
const out = fs.openSync(outFile, 'a');
const err = fs.openSync(errFile, 'a');

http.createServer(function(req, res){
    console.log("request received");
    res.writeHead(400, contenType);

    if(req.method != 'POST'){
       const data = JSON.stringify({"error": "invalid request, expecting POST"});
       return res.end(data);
    }

    let jsonString = '';
    req.on('data', function(data){
        jsonString += data;
    });

    req.on('end', function(){
      const hash = "sha1=" + crypto.createHmac('sha1', webhookSecret).update(jsonString).digest('hex');
      if(hash != req.headers['x-hub-signature']){
          console.log('invalid key');
          const data = JSON.stringify({success: false, msg: "invalid key", key: hash});
          return res.end(data);
      }

      console.log("running hook.sh");

      const deploySh = spawn('sh', ['hook.sh'], {detached: true, stdio: ['ignore', out, err]});
      deploySh.on('close', (code) => {
        if(code !== 0){
            res.writeHead(500, contenType);   
            res.end(JSON.stringify({success: false, msg: fs.readFileSync(errFile), code}));
        }

        res.writeHead(200, contenType);

        const data = JSON.stringify({success: true});
        return res.end(data);
      });
    });
}).listen(port);