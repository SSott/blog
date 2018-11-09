#项目：利用node开发一个博客网站
###首先你要先安装node（这个在网上都是有教程的）
[点击前往中文网站]：（http://nodejs.cn/）
[点击前往英文网站]：（https://nodejs.org/en/）
##其次写的是各个页面的布局
1. 这个项目主要还是实现添加随笔的功能，以及如何把新增的随笔呈现到页面上，还有个页面的跳转之类的，具体可以看下一下项目
##需要新建一个入口文件
1. 该入口文件有三大模块
    1. 加载http模块 (非全局的api都需要加载模块以便使用:npm install mine/underscore)
     ' var http = require('http');  
      var fs = require('fs');  
      var path = require('path');  
      var mime = require('mime');  
      var url = require('url');  
      var querystring = require('querystring');  
      var _ = require('underscore'); '  
     2. 创建服务模块  
     ' http.createServer(function (req, res) {       	
       }).listen(9090, function () {  
         console.log('http://localhost:9090');  
       });'
     3. 设计路由模块  
      该模块要在http.createServer(function (req, res)里面写   
2. 设计路由模块的攥写  
     1.先实现node的读取文件实现页面跳转功能  
     2.在提交随笔的功能上，实现的是get/post的方式
#关于get请求
1. get请求其实就是在对于GET方式的请求，浏览器会把http header和data一并发送出去，服务器响应200（返回数据）；  
    1. 定义一个新的空数组，把用户提交的内容（我们可以截取url后面的get请求的部分）push到这个空数组里。
#关于post请求        
1. 而对于POST，浏览器先发送header，服务器响应100 continue，浏览器再发送data，服务器响应200 ok（返回数据）。
   1. 步骤与get请求的方法类似，但由于post请求的数据庞大，我们需要分批传数据，最后把碎片的数据push到空数组里。
   2. 如何查看该数组已经push完呢？只要监听data与是否触发end事件。
