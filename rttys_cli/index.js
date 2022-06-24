#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');
let http = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
let WebSocket = require('ws');
var timeout = 10; // seconds

const casigningcert = new Buffer.from("LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUQrekNDQXVPZ0F3SUJBZ0lVVi8weEV1ZkhPQnlRUkJJWFQzS0JkVmNZUUF3d0RRWUpLb1pJaHZjTkFRRUwKQlFBd2dZd3hDekFKQmdOVkJBWVRBbFZUTVJBd0RnWURWUVFJREFkSFpXOXlaMmxoTVE4d0RRWURWUVFIREFaQwpkV1p2Y21ReEVqQVFCZ05WQkFvTUNWTjVibUZ0WldScFlURU5NQXNHQTFVRUN3d0VaVkpFU3pFVk1CTUdBMVVFCkF3d01ZMkV1Ykc5allXeG9iM04wTVNBd0hnWUpLb1pJaHZjTkFRa0JGaEY0ZVhwQWMzbHVZVzFsWkdsaExtTnYKYlRBZUZ3MHlNakEyTVRNeE56UTBNelJhRncwME9URXdNamd4TnpRME16UmFNSUdNTVFzd0NRWURWUVFHRXdKVgpVekVRTUE0R0ExVUVDQXdIUjJWdmNtZHBZVEVQTUEwR0ExVUVCd3dHUW5WbWIzSmtNUkl3RUFZRFZRUUtEQWxUCmVXNWhiV1ZrYVdFeERUQUxCZ05WQkFzTUJHVlNSRXN4RlRBVEJnTlZCQU1NREdOaExteHZZMkZzYUc5emRERWcKTUI0R0NTcUdTSWIzRFFFSkFSWVJlSGw2UUhONWJtRnRaV1JwWVM1amIyMHdnZ0VpTUEwR0NTcUdTSWIzRFFFQgpBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQ2hSck1iL2RnMUh4ZmtjeUhpcklMQ0VLNkNCWXRpSC9ueERwQU5rWG90CmtZdCtlYVJmUG9aazM0WTZpWWxlTDNjZjRtU21FbzlaWVl2c3FQS1pmZ0tEQk54bHI2dm9pQWtuSWF6ZFFNaFkKMktwdG1tTk1FbHZsOUpRT1VMRFRMaERJOUErOWppbm00U3gxNFdMV0xIYU9Mbk9kNTUwV0U2QWlBTXNQdHhLNwp1L3NIcUV6YXhBSGZFVDJqYjNFTVZPSmgwdmcrbXJMYlMzZU03WXdyVWVOTm42SUFJdHhTUHYrODdlNVpDYkVPCkYyS1RDd1AyOVdkK3B4bXhwdURONUo0eFhjVktTeENWNjZJRUgyakR4TkRrc3E4dGl3SGJNTHlJaytsNHlnR3EKTjRPd2gvbXdGZzFjTjZSVlBOYXJuUlRRNktudHpEcE5NanJkOCtyenR6QmxBZ01CQUFHalV6QlJNQjBHQTFVZApEZ1FXQkJSSUpxNC9obk51aVZEZzZ1M1NyeVh1bmRRTzdqQWZCZ05WSFNNRUdEQVdnQlJJSnE0L2huTnVpVkRnCjZ1M1NyeVh1bmRRTzdqQVBCZ05WSFJNQkFmOEVCVEFEQVFIL01BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQXAKSlNTZHJJT1BsQ2RVaHk0SlZKeTJ5ZUFsY0ZlU3dncjJ5MUtjVlcxMml2cFUyMWorN2RjWEJkRDQ0Q0lwVllvZQp3amZXTHJ2RUZVcmNleXZtV3pSUFdxSkhrYlVYNEU1ZHJlZjBDVGdWTDBaM1NMY00xbUg0RExuejlFSmRXaHVRCklnM0hFaDVIL3pGY3hJMTZJVmNGTWR2d1BrVnVySUlLcm81akxQZTRuWmdjYjRWbnhvZU5jcUt2OG1jZ3hrMDUKa05mdDVZRG9HNUFmV1Nqekp4Q1k4TkFzYW1WajZpZkhtMzhpajF1dlhqMnoxcXRBazZIOVp2eFp4aEhUSzZ4ZApralA5eFU2M0t6K2cvK21SRi9JQXRsNndkck1JUG9HOFhieVl3aCtNbUsvdklBaVdPQmJPS0VXVlI1ckRVenZ3CjIwNklGblZzdVJ3U2xzUWdOYndvCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K", "base64");

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
      ca: casigningcert
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
      ca: casigningcert
   };

   let result = ""

   const req = http.request(options, res => {
      if (res.statusCode == 200) {
         res.on('data', d => {
            result += d;
         });
         res.on('end', d => {
            cb(JSON.parse(result));
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
      ca: casigningcert
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

const parser = new ArgumentParser({ description: 'Commandline utility for RTTYS' });

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-s', '--server_name', { help: 'RTTYS hostname', default: "rttys" });
parser.add_argument('-p', '--port', { type: "int", help: 'RTTYS port', default: 5913 });
parser.add_argument('-u', '--rttys_username', { help: 'RTTYS Username', default: 'admin' });
parser.add_argument('-w', '--rttys_password', { help: 'RTTYS Password', default: 'admin' });

let subparsers = parser.add_subparsers({help:'sub-command help', dest:'subparser_name'})

// create the parser for the "command" command
let parser_command = subparsers.add_parser('command', {help:'Send a command to the client'})
parser_command.add_argument('-x', '--device_username', { help: 'Device Username' });
parser_command.add_argument('-y', '--device_password', { help: 'Device Password' });
parser_command.add_argument('-d', '--device_id', { help: 'Device ID' });
parser_command.add_argument('-c', '--command', { help: 'Command to execute' });
parser_command.add_argument('-r', '--params', { help: 'Command params', default:""});

// create the parser for the "list" command
let parser_list = subparsers.add_parser('list', {help:'List available devices'})

// create the parser for the "put_file" command
let parser_put_file = subparsers.add_parser('put', {help:'Put a file on the device'})

// create the parser for the "get_file" command
let parser_get_file = subparsers.add_parser('get', {help:'Get a file from the device'})

let parser_connect = subparsers.add_parser('connect', {help:'Connect to a device'})
parser_connect.add_argument('-d', '--device_id', { help: 'Device ID' });

let args = parser.parse_args();

get_sid(args.server_name, args.port, args.rttys_username, args.rttys_password, function(sid) {
   if (args['subparser_name'] == 'list') {
      list_devices(args.server_name, args.port, sid, function(devs){
         console.log(JSON.stringify(devs));
         process.exit();
      });
   } else if (args['subparser_name'] == 'command') {
      do_command(args.server_name, args.port, sid, args.device_id, args.device_username, args.device_password, args.command, args.params, function(result){
         if (result.msg == "operation not permitted") {
            console.log(JSON.stringify(result));
            process.exit();
         } else {
            console.log(JSON.stringify(result));
            process.exit();
         }
      });
   } else if (args['subparser_name'] == 'connect') {
      // got sid, now let's connect
      const url = "ws:///"+args.server_name+":"+args.port+"/connect/"+args.device_id;
      connect(url, {
         transports: ['websocket'],
         headers: {
            Cookie: 'sid='+sid
         }
      });
   }
   else {
      process.exit();
   }
})
