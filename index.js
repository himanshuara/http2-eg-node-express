

const http2 = require("http2");
const fs = require("fs");
const path = require("path");
const utils = require("./utils");

const { HTTP2_HEADER_PATH,NGHTTP2_REFUSED_STREAM } = http2.constants;

const server = http2.createSecureServer({
    key: fs.readFileSync(__dirname + '/localhost-privkey.pem'),
    cert:  fs.readFileSync(__dirname + '/localhost-cert.pem')
});

function push(stream, path) {
  const file = utils.getFile(path);
  if (!file) {
    return;
  }
  stream.pushStream({ [HTTP2_HEADER_PATH]: path }, (err,pushStream) => {
    pushStream.respondWithFD(file.content, file.headers);
    pushStream.on('error', (err) => {
        const isRefusedStream = err.code === 'ERR_HTTP2_STREAM_ERROR' &&
                                pushStream.rstCode === NGHTTP2_REFUSED_STREAM;
        if (!isRefusedStream)
          throw err;
      });
  });
}

server.on("stream", (stream, headers) => {
    push(stream,'/main-es5.2f6a7b6df8fd1a005529.js');
    push(stream,'/main-es2015.8291a65da48e3a65a9a1.js');
    push(stream,'/polyfills-es5.a0792728ce5392602d15.js');
    push(stream,'/polyfills-es2015.67440de7256e16fa5d43.js')
    push(stream, '/runtime-es5.f26a3ca86d137fc59cd5.js');
    push(stream, '/runtime-es2015.b95404c3b715e3d6c968.js');
    push(stream, '/styles.9eff0e182e839a971dba.css')  ;
    push(stream, '/uniware.svg');

  const file = utils.getFile("/index.html");

  // Serve file
  stream.respondWithFD(file.content, file.headers);
});


server.listen(3000);