const koa = require('koa');
const router = require('koa-router')();
const proxy = require('koa-proxy');
const app = koa();
const fetch = require('node-fetch');


router.get('/proxy/**', proxy({
  host: 'https://cdnjs.cloudflare.com',
  map: path => path.slice('/proxy'.length),
}));

router.get('/build/**', proxy({
  host: 'https://hackmd.io',
}));

app.use(require('koa-static')('static'));
app.use(router.routes());
app.use(function *(){
  const {request, response} = this;
  const exportId = request.path.slice(1);
  console.log('exportId', exportId)

  const html = yield fetch(`https://hackmd.io/s/${exportId}`).then(resp => resp.text());
  const assetUrls = [];

  const regexp = /="(\/build\/[^"]*?)"/g;
  let match;
  while(match = regexp.exec(html)) {
    assetUrls.push(match[1]);
  }

  this.body = html
    .replace(/"https:\/\/cdnjs\.cloudflare\.com([^"]*)"/g, (m, path) => {
      const replacedPath = `/proxy${path}`
      assetUrls.push(replacedPath);
      return `"${replacedPath}"`;
    }).replace('</html>', `
        <script src="/upup.min.js"></script>
        <script>UpUp.start(({
          'content-url': ${JSON.stringify(exportId)},
          assets: ${JSON.stringify(assetUrls)}
        }))</script>
      </html>
    `)
  html.searc
});

app.listen(process.env.PORT || 3000);
