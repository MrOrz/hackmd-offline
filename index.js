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
  this.body = html;
});

app.listen(process.env.PORT || 3000);
