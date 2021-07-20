var express = require('express');
var routes = require('routes');
var http = require('http');
const multer=require("multer");
const fs=require("fs");
var url = require('url');
var path = require('path');
var body = require('body-parser');

var app = express();
var mysql = require('mysql');
app.use(body.json());
app.set('port',process.env.PORT || 4300);
app.set('views',path.join(__dirname,'views'));


app.set('view engine','ejs');
app.use(body.urlencoded({extended:true}));

var con = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'',
	database:'users'
});

const storage=multer.diskStorage({
destination:(req,file,callback)=>{
callback(null,"./public/uploads");
},
filename:(req,file,cb)=>{
cb(null,(file.filename=file.originalname));
}
});

var path = require('path');
const upload=multer({storage:storage});

app.use(express.static(path.join(__dirname,'public')));//to show image
app.use(express.static("./public/uploads"));

app.get("/",function(req,res){
	var sql="select * from items";
	con.query(sql,function(err,rows){
	if(err) throw err;
	res.render("main",{abc:rows});
	});
});

app.get("/login",function(req,res){
	res.render("login");
});

app.post("/register",function(req,res){
res.render("register");
});


var x,y;
app.post("/check",function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	x=username;
	y=password;
	if (username && password) {
		con.query('SELECT * FROM userinfo WHERE username = ? AND password = ?', [username, password], function(err, results, fields) {
			if(results.length)
			{
				if(results[0].username=="admin" && results[0].password=="admin"){
					res.render("user");
				}
				//fetching all products
				var sql="select * from items";
				con.query(sql,function(err,rows){
				if(err) throw err;
				res.render("welcome",{data:results,abc:rows});
				});
			}
			else {
			res.send('Incorrect Username and/or Password!');
			}
});
}
else {
	res.send('Please enter Username and Password!');
		res.end();
}

});



app.get("/edit",function(req,res){
	con.query('SELECT * FROM userinfo WHERE username = ? AND password = ?', [x, y], function(err, results, fields) {
		res.render("edit",{data1:results});
});
});



app.post("/save",upload.single("file"),(req,res,next)=>{
  var u = req.body.uname;
	var p = req.body.pass;
	var g = req.body.gender;
	var e = req.body.email;
	var m = req.body.mobile;
	var a = req.body.address;
	var c = req.body.city;
	var f = req.file.filename;
	var sql='update userinfo set password="'+p+'",gender="'+g+'",emailid="'+e+'",mobileno="'+m+'",address="'+a+'",city="'+c+'",imagename="'+f+'"  WHERE username = ?';
	con.query(sql, [x], function(err, results, fields) {
	res.send("changes saved");
});
});



app.post("/new",upload.single("file"),(req,res,next)=>{
	var u = req.body.uname;
	var p = req.body.pass;
	var g = req.body.gender;
	var e = req.body.email;
	var m = req.body.mobile;
	var a = req.body.address;
	var c = req.body.city;
	var f = req.file.filename;
	var sql='insert into userinfo values("'+u+'","'+p+'","'+g+'","'+e+'","'+m+'","'+a+'","'+c+'","'+f+'")';
	//console.log(sql);
	con.query(sql,function(err,results,fields){
		//console.log(results);
		res.send("new user created");
	});
});




app.get("/additem",function(req,res){
res.render("additem");
});


app.post("/newitem",upload.single("file"),(req,res,next)=>{
	var n=req.body.itemname;
	var d=req.body.description;
	var t=req.body.type;
	var td=req.body.typedes;
	var p=req.body.price;
	var f=req.file.filename;
	var i=req.body.itemid;
	var sql='insert into items values("'+n+'","'+d+'","'+t+'","'+td+'","'+p+'","'+f+'","'+i+'")';
	//console.log(sql);
	con.query(sql,function(err,results,fields){
		//console.log(results);
		res.send("new item added");
	});
});



app.get("/deleteitem",function(req,res){
var sql="select * from items";
con.query(sql,function(err,rows){
if(err) throw err;
res.render("deleteitem",{rows:rows});
});
});


app.get('/delete/:itemid', function (req, res) {
    //res.send(req.params);
	var sql = "delete from items where itemid='"+req.params.itemid+"'";
	con.query(sql,function(err,rows){
		if(err) throw err;
		res.redirect('/deleteitem');
	});
});



app.get('/cart/:itemid', function (req, res) {
	var sql = "select * from items where itemid='"+req.params.itemid+"'";
	con.query(sql,function(err,data){
		if(err) throw err;
		res.render('cart',{d:data});
	});
});


app.get('/details', function (req, res) {
		res.render('details');
});


http.createServer(app).listen(app.get('port'),function(){
	console.log('Express Server listening on Port '+app.get('port'));
});
