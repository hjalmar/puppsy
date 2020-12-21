// filesystem
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// express
import express from 'express';
import http from 'http';
import https from 'https';

// puppeteer
import { loadURL, prefetch } from './puppeteer.js';

// user config
import config from './config.js';

// create our own __dirname implementation
const __dirname = dirname(fileURLToPath(import.meta.url));

// should handle these args better?
const args = process.argv.slice(2);
// are we in development mode?
const devMode = Boolean(args.find(arg => arg == '--dev'));

// server reference
let webserver;
// create the express server
const server = express();

// connection details
let protocol = 'http';
let connection = { ...config.server.host };
if(devMode){
  connection = { ...config.server.dev };
}

// handle ssl connection
if(connection.ssl){
  // update protocol to use https
  protocol = 'https';
  // load the certificates
  if(!connection.ssl.key || !connection.ssl.cert){
    throw new Error(`SSL requires a 'key' and 'cert'`);
  }
  const key = fs.readFileSync(connection.ssl.key);
  const cert = fs.readFileSync(connection.ssl.cert);
  // create the server
  webserver = https.createServer({ key, cert }, server);
}else{
  webserver = http.createServer(server);
}

// ssr config
const ssr = {
  cache: connection.cache, 
  allowlist: config.allowlist, 
  allowOrigin: config.allowOrigin
}

// middlewares
server.use(express.json()); 

// handle all requests
const request = async (req, res) => {
  const url = `${req.protocol}://${connection.hostname}:${connection.port}${req.url}`;
  if(req.header('puppsy')){
    res.sendFile(path.join(__dirname, config.root, 'index.html'));
  }else{
    try{ 
      // fetch page
      const response = await loadURL({ url, options: {}, dev: devMode, ssr });
      res.status(200).send(response.html);
    }catch(error){
      console.log(error.message);
      console.log('@', url)
      res.status(200).sendFile(path.resolve(__dirname, 'error.html'));
    }
  }
  // try{
  //   if(req.header('content-type') == 'application/json'){
  //     res.set('Content-Type', 'application/json');
  //     const response = await prefetch(url);
  //     if(!response.json){
  //       throw new Error(`Invalid json`); 
  //     }
  //     // TODO: enable caching yoo!
  //     return res.status(200).send(response.json);
  //   }
  // }catch(err){
  //   return res.status(500).send(JSON.stringify({message: 'something something error message!'}));
  // }  
};

// no middleware for root
server.get('/', request);
// define all the static assets to the root for all other requests
server.get('*', express.static(path.join(__dirname, config.root)), request);

// start server
webserver.listen(connection.port, () => {
  const message = `Server started @ ${protocol}://${connection.hostname}:${connection.port}`;
  console.log(message);
});