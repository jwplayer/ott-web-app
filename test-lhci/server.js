const path = require('path');

const express = require('express');

const app = express();
const PORT = 4000;

const csp = "base-uri 'self' ; " 
    + "object-src 'none' ; "
    + "style-src 'self' 'unsafe-inline' https://*.adyen.com ; "
    + "script-src 'self' 'unsafe-inline' https://*.jwplatform.com http://*.jwpcdn.com https://*.adyen.com http://*.gstatic.com ; "
    + "connect-src 'self' https://*.jwplatform.com https://*.jwpltx.com https://*.jwpsrv.com https://*.cleeng.com ; "
    + "img-src 'self' 'unsafe-inline' https://*.jwplatform.com https://*.jwpsrv.com http://*.jwpltx.com https://*.adyen.com ; "
    + "frame-src https://*.adyen.com ; " 
    + "media-src blob: ; "
    + "worker-src blob: ; ";

function handleRequest(req, res) {
  const options = {
    root: path.join(__dirname, '../build'),
    dotfiles: 'deny',
    headers: {
      // "Content-Security-Policy": csp
    }
  };

  res.sendFile('index.html', options);
}

app.get('/', handleRequest);


app.use(express.static(path.join(__dirname, '../build')));

app.get('*', handleRequest);

app.listen(PORT, () => console.info(`Server listening on port: ${PORT}`));