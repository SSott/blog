// 当前项目（包） 的入口文件

// 封装一个 render() 函数
// 将 render 函数挂在到 res 对象上，可以通过 res.render() 来访问
// 实现 get 方式添加新闻
// - 实现在原来 list 数组的基础上追加新闻，而不是覆盖
// 实现 post 方式提交新闻
// 实现首页显示新闻列表
// 实现显示新闻详情页
// 封装 读取 data.json 文件 和写入 data.json 文件的方法、封装获取用户 post 提交数据的方法



// 1. 加载 http 模块
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var url = require('url');
var querystring = require('querystring');
var _ = require('underscore');


// 2. 创建服务
http.createServer(function(req, res) {
  // 要在这里写大量的代码

  // 为 res 对象添加一个 render() 函数，方便后续使用
  // 因为现在要渲染的 index.html 中需要用到模板数据, 所以给 render 函数增加了第二个参数
  // 第二个参数的作用就是用来传递 html 页面中要使用的模板数据
  res.render = function(filename, tplData) {

    fs.readFile(filename, function(err, data) {
      if (err) {
        res.writeHead(404, 'Not Found', { 'Content-Type': 'text/html;charset=utf-8' });
        res.end('404, not found.');
        return;
      }
      // 如果用户传递了模板数据，那么就使用 underscore 的 template 方法进行替换
      // 如果用户没有传递 模板数据，那么就不进行替换
      if (tplData) {
        // 如果用户传递了模板数据，表示要进行模板替换
        var fn = _.template(data.toString('utf8'));
        data = fn(tplData);
      }

      res.setHeader('Content-Type', mime.getType(filename));
      res.end(data);
    });
  };

  // 将用户请求的url 和 method 转换为小写字母
  req.url = req.url.toLowerCase();
  req.method = req.method.toLowerCase();

  // 通过 url 模块，调用 url.parse() 方法解析用户请求的 url（req.url）
  var urlObj = url.parse(req.url, true);

  // 先根据用户请求的路径（路由），将对应的HTML页面显示出来
  if (req.url === '/' || req.url === '/index' && req.method === 'get') {

    // 1. 读取 data.json 文件中的数据，并将读取到的数据转换为 list 数组
    readNewsData(function(list) {
      // 2. 在服务器端使用模板引擎，将 list 中的数据和 index.html 文件中的内容结合 渲染给客户端
      res.render(path.join(__dirname, 'views', 'index.html'), { list: list });
    });


  } else if (req.url === '/submit' && req.method === 'get') {
    // 读取 submit.html 并返回
    res.render(path.join(__dirname, 'views', 'submit.html'));
  } else if (urlObj.pathname === '/item' && req.method === 'get') {
    // 1. 获取当前用户请求的新闻的 id
    // urlObj.query.id 
    // 2. 读取 data.json 文件中的数据，根据 id 找到对应新闻

    readNewsData(function(list_news) {

      var model = null;
      // 循环 list_news 中的数据，找到和 id 值相等的数据
      for (var i = 0; i < list_news.length; i++) {

        // 判断集合中是否有与用户提交的 id 相等的新闻
        if (list_news[i].id.toString() === urlObj.query.id) {
          // 如果找到了相等的新闻，则将其记录下来
          model = list_news[i];
          break;
        }
      }

      if (model) {
        // 3. 调用 res.render() 函数进行模板引擎的渲染
        res.render(path.join(__dirname, 'views', 'details.html'), { item: model });
      } else {
        res.end('No Such Item');
      }
    });


  } else if (req.url.startsWith('/add') && req.method === 'get') {

    // 1. 读取 data.json 文件的数据
    readNewsData(function(list) {

      // 2.
      // 在把 新闻 添加到 list 之前，为新闻增加一个 id 属性
      urlObj.query.id = list.length;
      // 向数组对象 list 中 push 一条新闻
      list.push(urlObj.query);


      // 3. 写入 data.json 文件
      writeNewsData(JSON.stringify(list), function() {
        // 重定向
        res.statusCode = 302;
        res.statusMessage = 'Found';
        res.setHeader('Location', '/');
        res.end();
      });

    });

  } else if (req.url === '/add' && req.method === 'post') {

    // 1. 读取 data.json
    readNewsData(function(list) {

      // 2. 读取用户post提交的数据
      postBodyData(req, function(postData) {

        // 3. 为用户提交的新闻增加一个 id 属性，并且把新闻对象 push 到list中
        postData.id = list.length;
        list.push(postData);


        // 4. 将新的 list 数组，在写入到 data.json 文件中
        writeNewsData(JSON.stringify(list), function() {
          // 重定向
          res.statusCode = 302;
          res.statusMessage = 'Found';
          res.setHeader('Location', '/');

          res.end();
        });
      });

    });

  } else if (req.url.startsWith('/resources') && req.method === 'get') {
    // 如果用户请求是以 /resources 开头，并且是 get 请求，就认为用户是要请求静态资源
    // /resources/images/s.gif
    res.render(path.join(__dirname, req.url));
  } else {
    res.writeHead(404, 'Not Found', {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('404, Page Not Found.');
  }

}).listen(9090, function() {
  console.log('http://localhost:9090');
});




// 封装一个读取 data.json 文件的函数
function readNewsData(callback) {

  fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', function(err, data) {
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
    var list = JSON.parse(data || '[]');

    // 通过调用回调函数 callback() 将读取到的数据 list，传递出去
    callback(list);
  });

}



// 封装一个写入 data.json 文件的函数
function writeNewsData(data, callback) {

  fs.writeFile(path.join(__dirname, 'data', 'data.json'), data, function(err) {
    if (err) {
      throw err;
    }

    // 调用 callback() 来执行当写入数据完毕后的操作
    callback();

  });
}



// 封装一个获取用户 post 提交的数据的方法
function postBodyData(req, callback) {

  var array = [];

  req.on('data', function(chunk) {
    array.push(chunk);
  });

  // 监听 request 对象的 end 事件
  // 当 end 事件被触发的时候，表示上所有数据都已经提交完毕了
  req.on('end', function() {

    var postBody = Buffer.concat(array);
    // 把 获取到的 buffer 对象转换为一个字符串
    postBody = postBody.toString('utf8');

    // 把 post 请求的查询字符串，转换为一个 json 对象
    postBody = querystring.parse(postBody);

    // 把用户 post 提交过来的数据传递出去
    callback(postBody);

  });
}