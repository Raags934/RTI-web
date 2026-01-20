const express = require('express');
const http = require('http');
const path = require('path');
const app = express();

const port = 8080;

app.use(express.static(path.join(__dirname, 'dist/src/browser')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/src/browser/index.html'));
});

const server = http.createServer(app);

server.listen(port, () => console.log('Running...'));
