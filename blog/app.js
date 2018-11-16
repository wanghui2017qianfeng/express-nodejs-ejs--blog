var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");

var User = require("./models/User");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
//

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 一定要注意位置，还要引入user数据库
app.use(function(req, res, next){
  req.userInfo = {};
 
	if(req.cookies.userInfo){
    try{
      //获取登录信息
      //在数据库中查找，是否是管理员
      req.userInfo =req.cookies.userInfo;
      User.findById(req.userInfo['_id']).then(function(userInfo){
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next()
      })
    }catch(err){
      next();
    }
	}else{
		next();
	}
})

//静态资源
app.use(express.static(path.join(__dirname, 'public')));

//使用node_modules里面下载的bootstrap等文件
app.use("/lib",express.static(path.join(__dirname, 'node_modules')));


app.use("/",require("./routes/main"))
app.use('/api', require("./routes/api"));
app.use("/admin",require("./routes/admin"))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  console.log("1111111111111111111")
    
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



//加载数据库模块
var mongoose = require("mongoose");
//链接数据库
mongoose.connect("mongodb://127.0.0.1:27017/test",{ useNewUrlParser: true }, function(err){
	if(err){
		console.log("数据库链接失败：" + err);
	}else{
		console.log("数据库链接成功");
		//当我们数据库链接成功以后，监听http请求
	}
});



module.exports = app;
