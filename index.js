const fs       = require('fs');
const http     = require('http');
const spawn    = require('child_process').spawn;
const execSync = require('child_process').execSync
const crypto   = require('crypto');

require('dotenv').config();
const webhookSecret  = process.env.WEBHOOK_SECRET;
const port    = 8081;
const contenType = {"Content-Type": "application/json"};

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

      console.log('deleting old logs');
      const keepXLatest = 10;
      execSync(`find . -name "*.*.log" | head -n +${keepXLatest} | xargs rm -f`);

      const nextFileNumber = Number(execSync('find . -name "*.*.log" | tail -n 1 | grep -oE "\d+" || echo "0"')) + 1;
      console.log('archiving current logs at ' + nextFileNumber);
      execSync(`mv out.log out.${nextFileNumber}.log || echo "creating logs"`);
      execSync(`mv err.log err.${nextFileNumber}.log || echo "creating logs"`);

      const out = fs.openSync('out.log', 'a');
      const err = fs.openSync('err.log', 'a');

      console.log("running hook.sh");
      const deploySh = spawn('sh', ['hook.sh'], {detached: true, stdio: ['ignore', out, err]});
      deploySh.unref();

      res.writeHead(200, contenType);

      const data = JSON.stringify({success: true});
      return res.end(data);
    });
}).listen(port);