#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');
let http = require('http');
let WebSocket = require('ws');
var timeout = 10; // seconds

// This sends us each key press
process.stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself unless an error or process.exit() happens)
process.stdin.resume();

// Specify string encoding
process.stdin.setEncoding( 'utf8' );

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
/**                                 ***/
/**    Let's connect to the rttys   ***/
/**                                 ***/
/**                                 ***/
/**************************************/
let connect = function(address, protocols, options) {
   let ws = new WebSocket(address, protocols, options);
   let timerTimeout = setTimeout(() => ws.terminate(), timeout * 1000); // force close unless cleared on 'open'
   let count = 0;
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

   ws.on('message', data => { 
      if ( ! isJson(data.toString() ) ) {
         process.stdout.write( data.toString() )
         count = count + 1
         ws.send('{"type":"ack","ack":'+count+'}');
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


/**************************************/
/**                                 ***/
/**                                 ***/
/**    Let's get the sessionID      ***/
/**                                 ***/
/**                                 ***/
/**************************************/
let get_sid = function(hostname, port, username, password, cb) {
   const data = JSON.stringify({
      username:username, 
      password:password
   });

   const options = {
      hostname: hostname,
      port: port,
      path: '/signin',
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Content-Length': data.length,
      },
   };

   const req = http.request(options, res => {
      if (res.statusCode == 200) {
         res.on('data', d => {
            cb(JSON.parse(d).sid);
         });
      }
      else {
         console.error("ERROR GETTING SID: ", res.statusCode, res.statusMessage);
         process.exit();
      }
   });

   req.on('error', error => {
      console.error("ERROR GETTING SID: ", error);
      process.exit();
   });

   req.write(data);
   req.end();
}

/**************************************/
/**                                 ***/
/**                                 ***/
/**    Execute a command            ***/
/**                                 ***/
/**                                 ***/
/**************************************/
let do_command = function(hostname, port, sid, did, username, password, cmd, params, cb) {
   const data = JSON.stringify({
      username:username, 
      password:password,
      cmd:cmd,
      params:JSON.parse(params),
   });

   const options = {
      hostname: hostname,
      port: port,
      path: '/cmd/'+did+"?wait=30",
      method: 'POST',
      headers: { 'Cookie': 'sid='+sid },
   };

   const req = http.request(options, res => {
      if (res.statusCode == 200) {
         res.on('data', d => {
            cb(JSON.parse(d));
         });
      }
      else {
         console.error("ERROR DO CMD: ", res.statusCode, res.statusMessage);
         process.exit();
      }
   });

   req.on('error', error => {
      console.error("ERROR DO CMD: ", error);
      process.exit();
   });

   req.write(data);
   req.end();
}


/**************************************/
/**                                 ***/
/**                                 ***/
/**    Let's get the device list    ***/
/**                                 ***/
/**                                 ***/
/**************************************/
let list_devices = function(hostname, port, sid, cb) {
   const options = {
      hostname: hostname,
      port: port,
      path: '/devs',
      method: 'GET',
      headers: { 'Cookie': 'sid='+sid },
   };

   const req = http.request(options, res => {
      if (res.statusCode == 200) {
         res.on('data', d => {
            cb(JSON.parse(d));
         });
      }
      else {
         console.error("ERROR GETTING DEVS: ", res.statusCode, res.statusMessage);
         process.exit();
      }
   });

   req.on('error', error => {
      console.error("ERROR GETTING DEVS: ", error);
      process.exit();
   });

   req.end();
}

const parser = new ArgumentParser({
  description: 'Commandline utility for RTTYS'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-l', '--list', { help: 'List available devices', action:'store_true' });
parser.add_argument('-s', '--server_name', { help: 'RTTYS hostname' });
parser.add_argument('-p', '--port', { type: "int", help: 'RTTYS port' });
parser.add_argument('-u', '--rtty_username', { help: 'RTTYS Username' });
parser.add_argument('-w', '--rtty_password', { help: 'RTTYS Password' });
parser.add_argument('-x', '--device_username', { help: 'Device Username' });
parser.add_argument('-y', '--device_password', { help: 'Device Password' });
parser.add_argument('-d', '--device_id', { help: 'Device ID' });
parser.add_argument('-c', '--command', { help: 'Command to execute' });
parser.add_argument('-r', '--params', { help: 'Command params', default:""});

let args = parser.parse_args();
get_sid(args.server_name, args.port, args.rtty_username, args.rtty_password, function(sid) {
   if (args['list'] == true) {
      list_devices(args.server_name, args.port, sid, function(devs){
         console.log(JSON.stringify(devs));
         process.exit();
      });
   } else if (args.command) {
      do_command(args.server_name, args.port, sid, args.device_id, args.device_username, args.device_password, args.command, args.params, function(result){
         if (result.msg == "operation not permitted") {
            console.log(JSON.stringify(result));
            process.exit();
         } else {
            console.log(JSON.stringify(result));
            process.exit();
         }
      });
   } else {
      // got sid, now let's connect
      const url = "ws:///"+args.server_name+":"+args.port+"/connect/"+args.device_id;
      connect(url, {
         headers: {
            Cookie: 'sid='+sid
         }
      });
   }
})
