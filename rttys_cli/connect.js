#!/usr/bin/env node
'use strict';

const http = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const fs = require('fs');
const WebSocket = require('ws');
var timeout = 10; // seconds

const casigningcert = new Buffer.from("LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUQrekNDQXVPZ0F3SUJBZ0lVVi8weEV1ZkhPQnlRUkJJWFQzS0JkVmNZUUF3d0RRWUpLb1pJaHZjTkFRRUwKQlFBd2dZd3hDekFKQmdOVkJBWVRBbFZUTVJBd0RnWURWUVFJREFkSFpXOXlaMmxoTVE4d0RRWURWUVFIREFaQwpkV1p2Y21ReEVqQVFCZ05WQkFvTUNWTjVibUZ0WldScFlURU5NQXNHQTFVRUN3d0VaVkpFU3pFVk1CTUdBMVVFCkF3d01ZMkV1Ykc5allXeG9iM04wTVNBd0hnWUpLb1pJaHZjTkFRa0JGaEY0ZVhwQWMzbHVZVzFsWkdsaExtTnYKYlRBZUZ3MHlNakEyTVRNeE56UTBNelJhRncwME9URXdNamd4TnpRME16UmFNSUdNTVFzd0NRWURWUVFHRXdKVgpVekVRTUE0R0ExVUVDQXdIUjJWdmNtZHBZVEVQTUEwR0ExVUVCd3dHUW5WbWIzSmtNUkl3RUFZRFZRUUtEQWxUCmVXNWhiV1ZrYVdFeERUQUxCZ05WQkFzTUJHVlNSRXN4RlRBVEJnTlZCQU1NREdOaExteHZZMkZzYUc5emRERWcKTUI0R0NTcUdTSWIzRFFFSkFSWVJlSGw2UUhONWJtRnRaV1JwWVM1amIyMHdnZ0VpTUEwR0NTcUdTSWIzRFFFQgpBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQ2hSck1iL2RnMUh4ZmtjeUhpcklMQ0VLNkNCWXRpSC9ueERwQU5rWG90CmtZdCtlYVJmUG9aazM0WTZpWWxlTDNjZjRtU21FbzlaWVl2c3FQS1pmZ0tEQk54bHI2dm9pQWtuSWF6ZFFNaFkKMktwdG1tTk1FbHZsOUpRT1VMRFRMaERJOUErOWppbm00U3gxNFdMV0xIYU9Mbk9kNTUwV0U2QWlBTXNQdHhLNwp1L3NIcUV6YXhBSGZFVDJqYjNFTVZPSmgwdmcrbXJMYlMzZU03WXdyVWVOTm42SUFJdHhTUHYrODdlNVpDYkVPCkYyS1RDd1AyOVdkK3B4bXhwdURONUo0eFhjVktTeENWNjZJRUgyakR4TkRrc3E4dGl3SGJNTHlJaytsNHlnR3EKTjRPd2gvbXdGZzFjTjZSVlBOYXJuUlRRNktudHpEcE5NanJkOCtyenR6QmxBZ01CQUFHalV6QlJNQjBHQTFVZApEZ1FXQkJSSUpxNC9obk51aVZEZzZ1M1NyeVh1bmRRTzdqQWZCZ05WSFNNRUdEQVdnQlJJSnE0L2huTnVpVkRnCjZ1M1NyeVh1bmRRTzdqQVBCZ05WSFJNQkFmOEVCVEFEQVFIL01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQXAKSlNTZHJJT1BsQ2RVaHk0SlZKeTJ5ZUFsY0ZlU3dncjJ5MUtjVlcxMml2cFUyMWorN2RjWEJkRDQ0Q0lwVllvZQp3amZXTHJ2RUZVcmNleXZtV3pSUFdxSkhrYlVYNEU1ZHJlZjBDVGdWTDBaM1NMY00xbUg0RExuejlFSmRXaHVRCklnM0hFaDVIL3pGY3hJMTZJVmNGTWR2d1BrVnVySUlLcm81akxQZTRuWmdjYjRWbnhvZU5jcUt2OG1jZ3hrMDUKa05mdDVZRG9HNUFmV1Nqekp4Q1k4TkFzYW1WajZpZkhtMzhpajF1dlhqMnoxcXRBazZIOVp2eFp4aEhUSzZ4ZApralA5eFU2M0t6K2cvK21SRi9JQXRsNndkck1JUG9HOFhieVl3aCtNbUsvdklBaVdPQmJPS0VXVlI1ckRVenZ3CjIwNklGblZzdVJ3U2xzUWdOYndvCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K", "base64");
const LoginErrorOffline = 0x01;
const LoginErrorBusy = 0x02;
const MsgTypeFileData = 0x03;
const ReadFileBlkSize = 16 * 1024;
const AckBlkSize = 4 * 1024;

// This sends us each key press
process.stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)
process.stdin.resume();

// Specify string encoding
process.stdin.setEncoding( 'utf8' );

/**************************************/
/**                                 ***/
/**    Is string a JSON string??    ***/
/**                                 ***/
/**************************************/
let isJson = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**************************************/
/**                                 ***/
/**    Send the file                ***/
/**                                 ***/
/**************************************/
let send_file = function(ws, pathname, filename, cb) {


   fs.stat(pathname, function (error, stats) {
      console.log(stats.size);

      const msg = {type: 'fileInfo', size: stats.size, name: filename};
      ws.send(JSON.stringify(msg));

      
      let CHUNK_SIZE = (stats.size > 1024) ? 1024 : stats.size;

      // 'r' specifies read mode
      fs.open(pathname, "r", function (err, fd) {
         if (err) throw err;

         var buffer = new Buffer.alloc(CHUNK_SIZE);

         function readNextChunk() {
            fs.read(fd, buffer, 0, CHUNK_SIZE, null, function(err, nread) {
               if (err) throw err;

               if (nread === 0) {
                  // done reading file, do any necessary finalization steps

                  fs.close(fd, function(err) {
                     if (err) throw err;
                  });

                  // finished
                  cb();
               }

               var data;
               if (nread < CHUNK_SIZE)
                  data = buffer.slice(0, nread);
               else
                  data = buffer;

               const buf = new Array();
               buf.push(Buffer.from([1, MsgTypeFileData]));
               if (data !== null) buf.push(Buffer.from(data));
               ws.send(Buffer.concat(buf));
            });
         }
         readNextChunk();
      });
   });


}

/**************************************/
/**                                 ***/
/**    Download the file            ***/
/**                                 ***/
/**************************************/
let download_file = function(hostname, port, sid, pathname, cb) {
   const options = {
      hostname: hostname,
      port: port,
      path: '/file/'+sid,
      method: 'GET'
   };

   fs.open(pathname,'w', function(err, fd) {
      if (err) {
         throw 'could not open file: ' + err;
      }
      const req = http.request(options, res => {
         if (res.statusCode == 200) {
            res.on('data', d => {
               fs.write(fd, d, d.length, function(err) {
                  if(err) throw 'could not write to file: ' + err;
               })
            });
            res.on('end', d => {
               if (d) {
                  fs.write(fd, d, d.length, function(err) {
                     if(err) throw 'could not write to file: ' + err;
                  })
               }
               fs.close(fd);
               cb();
            });
         }
         else {
            console.error("ERROR DOWNLOADING FILE: ", res.statusCode, res.statusMessage);
            process.exit();
         }
      });

      req.on('error', error => {
         console.error("ERROR DOWNLOADING FILE: ", error);
         process.exit();
      });

      req.end();
   })

}

/**************************************/
/**                                 ***/
/**    Let's connect to the rttys   ***/
/**                                 ***/
/**************************************/
exports.connect = function(address, protocols, options) {
   let ws = new WebSocket(address, protocols, options);
   let timerTimeout = setTimeout(() => ws.terminate(), timeout * 1000); // force close unless cleared on 'open'
   let count = 0;
   let sid = null;
   ws.on('open', () => {
      clearTimeout(timerTimeout);
   });

   // Send key input to WS
   process.stdin.on( 'data', function( key ){
      if ( key === '\u0003' ) {
         process.exit();
      }
      ws.send(Buffer.from(key.toString(), 'utf16le').swap16());
   });

   ws.on('message', ev => { 
      let data = ev.toString();

      if (isJson(data)) {
        const msg = JSON.parse(data);
        if (msg.type === 'login') {
           if (msg.err === LoginErrorOffline) {
            console.log('Device offline');
            return;
          } else if (msg.err === LoginErrorBusy) {
            console.log('Sessions is full');
            return;
          }
          //console.log("SID: ",msg.sid);
          sid = msg.sid;
           /* TODO:  update fontsize 
          this.axios.get('/fontsize').then(r => {
            this.term.setOption('fontSize', r.data.size);
            this.fitTerm();
          });
          */
        } else if (msg.type === 'sendfile') {
           download_file("localhost", 5913, sid, "/tmp/"+msg.name, function() {})
        } else if (msg.type === 'recvfile') {
           send_file(ws, "/tmp/test", "TEST", function() {});
        } else if (msg.type === 'fileAck') {
           console.log(msg)
        } else {
         count += data.length;
         process.stdout.write(typeof(data) === 'string' ? data : new Uint8Array(data));
         if (count > AckBlkSize) {
            const msg = {type: 'ack', ack: count};
            ws.send(JSON.stringify(msg));
            count = 0;
         }
        }
      } else {
         count += data.length;
         process.stdout.write(typeof(data) === 'string' ? data : new Uint8Array(data));
         if (count > AckBlkSize) {
            const msg = {type: 'ack', ack: count};
            ws.send(JSON.stringify(msg));
            count = 0;
         }
      }
   });

   ws.on('close', () => {
      clearTimeout(timerTimeout);
      console.log('\x1b[41m%s\x1b[0m', "<connection broken>");  
      process.exit();
   });
   ws.on('error', reason => {
      clearTimeout(timerTimeout);
      console.error('Websocket error: ' + reason.toString())
      process.exit();
   });
   return ws;
}

