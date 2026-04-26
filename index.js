'use strict';
const http = require('node:http');
const pug = require('pug');
const fs = require('fs');
const server = http
  .createServer((req, res) => {
    const now = new Date();
    console.info(` Requested by ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    switch (req.method) {
      case 'GET':
        const category_directory =  typeof req.url.split('/').slice(1)[0] === 'undefined' ? 'undefined' : req.url.split('/').slice(1)[0];
        switch (category_directory) {
          case '':
            res.write(
              pug.renderFile('./top.pug', {enquetes_path: '/enquetes'})
            )
            break;
          case 'enquetes':
            const enquetes = JSON.parse(fs.readFileSync('./enquetes.json'))
            const end_directory = req.url.split('/').slice(-1)[0];
            const enquete = enquetes[end_directory];
            if (end_directory === 'enquetes') {
              res.write(
                pug.renderFile('./enquetes_top.pug', {enquetes: enquetes})
              );
            } else if (typeof enquete != 'undefined') {
              res.write(
                pug.renderFile('./form.pug', Object.assign({path: req.url}, enquete))
              );
            } else {
              console.info(`無効なURL${category_directory}`)
            };
            break;
          default:
            res.write('このページは存在しません')
            console.info(`無効なURL${category_directory}`)
            break;
        };
        res.end();
        break;
      case 'POST':
        let rawData = '';
        req
          .on('data', chunk => {
            rawData += chunk;
          })
          .on('end', () => {
            const answer = new URLSearchParams(rawData);
            const body = `${answer.get('name')}さんは${answer.get('favorite')}に投票しました`;
            console.info(`${body}`);
            res.write(
              `<!DOCTYPE html><html lang="ja"><body><h1>${body}</h1></body></html>`
            );
            res.end();
          });
        break;
      default:
        break;
    }
  })
  .on('error', e => {
    console.error(`Server Error`, e);
  })
  .on('clientError', e => {
    console.error(`Client Error`, e);
  });
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info(`Listening on ${port}`);
});