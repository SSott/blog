//入口文件


//加载http模块
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var url = require('url');
var querystring = require('querystring');
var _ = require('underscore');


//创建服务
http.createServer(function (req, res) {
	  // 设计路由
  res.render = function (filename, tplData) {

  	fs.readFile(filename, function (err, data) {
    if (err) {
      res.writeHead(404, 'Not Found', {'Content-Type': 'text/html;charset=utf-8'});
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

  
  
  // 当用户请求 /add 时，将用户提交的新闻保存到 data.json 文件中 - get 请求
  // 当用户请求 /add 时，将用户提交的新闻保存到 data.json 文件中 - post 请求
  // 将用户请求的url 和 method 转换为小写字母
  req.url = req.url.toLowerCase();
  req.method = req.method.toLowerCase();

    // 通过 url 模块，调用 url.parse() 方法解析用户请求的 url（req.url）
  var urlObj = url.parse(req.url, true);

  // 当用户请求 / 或 /index 时，显示新闻列表 - get 请求
  if(req.url === '/' || req.url === '/index' && req.method === 'get'){
  	fs.readFile(path.join(__dirname, 'data', 'data.json'),function(err, data){
  		if (err && err.code !== 'ENOENT') {
        throw err;
      }
      var list_news = JSON.parse(data || '[]');
      res.render(path.join(__dirname, 'views', 'index.html'),{list: list_news });
  	})
  	
  // 当用户请求 /submit 时，显示添加新闻页面 - get 请求
  }else if(req.url === '/submit' && req.method === 'get'){
  	res.render(path.join(__dirname, 'views', 'submit.html'));
  }else if(req.url === '/login' && req.method === 'get'){
    res.render(path.join(__dirname,'views', 'login.html'));
  }else if(req.url === '/register' && req.method === 'get'){
    res.render(path.join(__dirname,'views', 'register.html'));
	// 当用户请求 /item 时，显示新闻详情 - get 请求
  }else if(urlObj.pathname === '/item' && req.method === 'get'){
  	fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', function(err, data){
  		if (err && err.code !== 'ENOENT') {
  			throw err;
  		}
  		var list_news = JSON.parse(data || '[]');
  		var model = null;
  		// 循环 list_news 中的数据，找到和 id 值相等的数据
  		for (var i = 0; i < list_news.length; i++){
  			if(list_news[i].id.toString() === urlObj.query.id){
  				model = list_news[i];
  				break;
  			}
  		}
  		if (model) {
  			res.render(path.join(__dirname, 'views', 'details.html'), { item: model });
  		} else {
  			res.end('No Such Item');
      	}
  	});
  	
  }else if(req.url.startsWith('/add') && req.method === 'get'){
  	 // 表示 get 方法提交一条随笔
  	 //-避免再次提交的数据被覆盖
  	 //--首先读取data。json里面的文件，变成数组，再把新增的data变成数组push到新的数组当中
  	 fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf-8',function(err, data){
  	 	if (err && err.code !== 'ENOENT') {
  	 		throw err;
  	 	}
  	  // 如果读取到数据了，那么就把读取到的数据 data，转换为 list数组
      // 如果没有读取到数据，那么就把 '[]' 转换为数组
      var list = JSON.parse(data || '[]');
      //在每一条新闻前增加新闻id
  	  urlObj.query.id = list.length;
      list.push(urlObj.query);
      //把截取到的数据写入data.json里面
      fs.writeFile(path.join(__dirname, 'data', 'data.json'),JSON.stringify(list),function(err){
  	 	if (err) {
  	 		throw err;
  	 	}
  	 	console.log('ok');
      // 设置响应报文头，通过响应报文头告诉浏览器，执行一次页面跳转操作
      // 3. 跳转到随便列表页
      // 重定向
      	res.statusCode = 302;
      	res.statusMessage = 'Found';
      	res.setHeader('Location', '/');

      	res.end();
    });
  });
  }else if (req.url === '/add' && req.method === 'post') {
    // 表示 post 方法提交一条新闻
    fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', function(err, data) {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
      var list = JSON.parse(data || '[]');
      var array = [];
      req.on('data', function(chunk) {
        // 此处的 chunk 参数，就是浏览器本次提交过来的一部分数据
        // chunk 的数据类型是 Buffer（chunk就是一个Buffer对象）
        array.push(chunk);
      });
        req.on('end', function(){
    	//目前把所有的array汇总起来，集合成一个数组
    	var postBody = Buffer.concat(array);
    	// 把 获取到的 buffer 对象转换为一个字符串
        postBody = postBody.toString('utf8');
        // 把 post 请求的查询字符串，转换为一个 json 对象
        postBody = querystring.parse(postBody);
        //在每一条新闻前增加新闻id
  		  postBody.id = list.length;

        // 将用户提交的新闻 push 到 list 中
        list.push(postBody);
        // 将新的 list 数组，在写入到 data.json 文件中
        fs.writeFile(path.join(__dirname, 'data', 'data.json'), JSON.stringify(list), function(err) {
          if (err) {
            throw err;
          }

          console.log('ok');
          // 设置响应报文头，通过响应报文头告诉浏览器，执行一次页面跳转操作
          // 3. 跳转到新闻列表页
          // 重定向
          res.statusCode = 302;
          res.statusMessage = 'Found';
          res.setHeader('Location', '/');

          res.end();
        });

      });

    });
  }else if (req.url.startsWith('/resources') && req.method === 'get') {
    // 如果用户请求是以 /resources 开头，并且是 get 请求，就认为用户是要请求静态资源 
    res.render(path.join(__dirname, req.url));
  } else {
    res.writeHead(404, 'Not Found', {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end('404, Page Not Found.');
  }
}).listen(9090, function () {
  console.log('http://localhost:9090');
});





