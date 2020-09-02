var express = require('express');
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/register.html', function (req, res)
{
res.sendFile( __dirname + "/" + "register.html" );
})

app.get('/login.html', function (req, res)
{
res.sendFile( __dirname + "/" + "login.html" );
})

app.get('/homepage.html', function (req, res)
{
res.sendFile(__dirname + "/" + "login.html" );
})
function getRandomInt(max)
{
return Math.floor(Math.random() * Math.floor(max));
}


app.post('/register',urlencodedParser,function (req, res)
{
var name=req.body.name;
var email=req.body.email;
var pwd=req.body.password;
var mysql = require('mysql');
var code=getRandomInt(1000);
var myObj={code:code,name:name,email:email,password:pwd};
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("user").find({}).toArray(function(err,result)
{
var foundError=0;
if (err) throw err;
for(var i=0;i<result.length;++i)
{
if(result[i].email==email)
{
console.log("Email Matched");
foundError=1;
break;
}
}
if(foundError==0)
{
dbo.collection("user").insertOne(myObj, function(err,data)
{
if(err) throw err;
db.close();
res.cookie("error",""); 
return res.redirect("/login.html" );  
});
}
else
{
db.close();
res.cookie("error","Username Already Exists!!!"); 
return res.redirect("/register.html" );
}
});
});
})
app.post('/login',urlencodedParser,function(req, res)
{
var username=req.body.username;
var pwd=req.body.password;
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("user").find({}).toArray(function(err,result)
{
var foundError=0;
if (err) throw err;
var code;
for(var i=0;i<result.length;++i)
{
if(result[i].email==username && pwd==result[i].password)
{
code=result[i].code;
console.log("Email & Password Matched");
foundError=1;
break;
}
}
if(foundError==0)
{
db.close();
res.cookie("error","Invalid Credentials"); 
res.cookie("username","");
return res.redirect("/login.html" );
}
else
{
db.close();
res.cookie("error",""); 
res.cookie("user_code",code); 
res.cookie("username",username); 
return res.redirect("/homepage.html" );
}
});
});
})


app.get('/getCategories',urlencodedParser,function(req, res)
{
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("category").find({}).toArray(function(err,result)
{
res.json({categories:result});
});
});
})


app.get('/getToDos',urlencodedParser,function(req, res)
{
var username=req.query.username;
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("toDos").find({}).toArray(function(err,result)
{
if (err) throw err;
res.json({toDos:result});
});
});
})


app.get('/addToDo',urlencodedParser,function(req, res)
{
var code=getRandomInt(1000);
var title=req.query.title;
var date=req.query.date;
var category_code=req.query.category_code;
var username=req.query.username;
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("user").find({}).toArray(function(err,result)
{
if (err) throw err;
for(var i=0;i<result.length;++i)
{
if(result[i].email==username)
{
var myobj={code:code,title:title,date:date,category_code:category_code,user_code:result[i].code};
dbo.collection("toDos").insertOne(myobj, function(err, data) {  
if (err) throw err;
res.json({toDo:myobj}); 
});  
db.close();
return;
}
}
});
});
});



app.get('/deleteToDo',urlencodedParser,function(req, res)
{
var code=parseInt(req.query.code,10);
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("ToDoDB");
  var myquery = { code:code};
  dbo.collection("toDos").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
res.send("Done");
  });
db.close();
});
})


app.get('/updateToDo',urlencodedParser,function(req, res)
{
var code=parseInt(req.query.code);
var title=req.query.title;
var date=req.query.date;
var category_code=req.query.category_code;
var username=req.query.username;
var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoClient.connect(url,function(err, db)
{
if(err) throw err;
var dbo=db.db("ToDoDB");
dbo.collection("user").find({}).toArray(function(err,result)
{
if (err) throw err;
for(var i=0;i<result.length;++i)
{
if(result[i].email==username)
{
var myquery= {code: code };
var myobj={$set:{title:title,date:date,category_code:category_code,user_code:result[i].code}};
 dbo.collection("toDos").updateOne(myquery, myobj, function(err,data) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
res.json({toDo:myobj});
  });}
}
});
});
});

function configureDatabase()
{
var mongoClient = require('mongodb').MongoClient;  
var url = "mongodb://localhost:27017/";  
mongoClient.connect(url, function(err, dbo) {
var db=dbo.db("ToDoDB");  
if (err) throw err;  
var myobj=[     
{ code:1,name: "Prayukti Jain",email:"prayukti@gmail.com",password:"prayukti"},  
{ code:2,name: "Shreyas Sharma",email:"shreyas@gmail.com",password:"shreyass"},  
{ code:3,name: "Prakash Pandey",email:"prakash@gmail.com",password:"prakashp"},  
{ code:4,name: "Mridula Bhan",email:"mridula@gmail.com",password:"mridulam"}  
];
db.collection("user").insert(myobj, function(err, res)
{  
if (err) throw err;  
});  
myobj = [     
{ code:1,title:"Home"},  
{ code:2,title:"Work"},  
{ code:3,title:"Leisure"},  
{ code:4,title:"Health"},  
{ code:5,title:"Other"}
];
db.collection("category").insert(myobj, function(err, res) {  
if (err) throw err;  
});  

});
}
var server = app.listen(5050, function ()
{
   configureDatabase();
   var host ="localhost"
   var port = server.address().port
   console.log("App listening at http://%s:%s", host, port)
})