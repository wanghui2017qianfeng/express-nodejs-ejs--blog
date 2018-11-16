var express = require('express');
var router = express.Router();
var Content  =require("../models/Content")
var Category = require("../models/Category")

var data ;
router.use(function(req,res,next){
  data={
    userInfo:req.userInfo,
    categories:[]
  }
  Category.find().sort({_id:-1}).then(function(rs){
    data.categories=rs;
    next()
  })
})
router.get('/', function(req, res, next) {
  console.log(req.query)
  var categoryid=req.query.categoryid || "";

  data.page = req.query.page || 1,
	data.limit = 2,
	data.pages = 0, //总页数
	data.count = 0,
  data.category = categoryid;
  
  var where={}
  if(data.category){
    where.category = data.category;
  }

  Content.count().where(where).then(function(count){
    data.count =count;
    //计算总页数
		data.pages = Math.ceil(data.count / data.limit);
		//取值不能超过pages
		data.page = Math.min(data.page, data.pages);
		//取值不能小于1
    data.page = Math.max(data.page, 1);
    var skip = (data.page - 1) * data.limit;
    return Content.find().where(where).limit(data.limit).skip(skip).sort({_id: -1}).populate(["category", "user"]);
  }).then(function(contents){
    data.contents = contents;
    console.log('data-------------------------',data)
     
		//加载 index.html
		res.render("main/index", data);
	}) 
});

router.get("/view", function(req, res){
	var contentid = req.query.contentid || "";

	//查询该id下具体内容的信息
	Content.findOne({
		_id: contentid
	}).populate(["user", "category"]).then(function(content){
		// console.log(content);
		data.content = content;
		//设置阅读++
		content.views++;
		content.save();
    //渲染页面
    
		res.render("main/view", data);
	})
})


module.exports = router;

























/**
 * 这里面的获取cookies：req.cookies.name
 * 设置cookies：  res.cookie('userInfo', JSON.stringify({
            	_id: userInfo._id,
            	username: userInfo.username
            }), {
            // maxAge: 600000,
            httpOnly: true,
            path: '/',
            // secure:true //设置该选项，只有https网站才可以输出该cookie
        });
*/