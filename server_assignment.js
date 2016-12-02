var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');

var assert = require('assert');
var mongourl = 'mongodb://johnwong:johnwong@ds119768.mlab.com:19768/s381fproject';
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var fileUpload = require('express-fileupload');

var app = express();
app = express();

/*
var users = new Array(
	{name: 'developer', password: 'developer'},
	{name: 'guest', password: 'guest'},
	{name: 'demo', password: 'demo'}
);
*/

app.set('view engine','ejs');


//60*1000 = 60 sec
app.use(session({
  			name: 'session',
  			keys: ['key1','key2'],
  			maxAge: 10 * 60 * 1000
		})
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));




app.get('/',function(req,res) {
console.log('path: get-> / (root)\n');
	console.log("session :"+req.session);
	if (!req.session.authenticated) {
	console.log('session not exist');
		res.redirect('/login');
	}else {
	//res.status(200).end('Hello, ' + req.session.username + '!  This is a secret page!');
		console.log('user login :'+req.session.username);
	res.redirect('/read');	 
	}
});

//send register.html form to client
app.get('/register',function(req,res) {
console.log('path: get-> /register \n');
	res.sendFile(__dirname + '/public/register.html');

});

//received by user register data
app.post('/register',function(req,res) {
console.log('path: post-> /register \n');
/// to do code

	if(req.body.name != null && req.body.password != null){
		console.log(req.body);
		queryForInsert = req.body;
		queryForFind ={};
		queryForFind.name = req.body.name;
		var ok= true;
		MongoClient.connect(mongourl, function(err, db) {
			assert.equal(err,null);
			console.log('Connected to MongoDB\n');
			///===============================================================================================================
			/////error on create user // ok on checking same username //open new function // error on callback function
/*		
			findUser(db,queryForFind,function(doc){
			console.log("doc.find :"+doc.find);
				if(doc!=null&& doc.find){
					console.log('have user!');
					res.render('error.ejs',{msg: "Username is not avalible!!! "});
					
				}else{
				ok= doc.find;
				}
				 
			});  // end find user funciton
*/
var isUser = '1';
console.log(isUser);
CheckUser(db,queryForFind,function(result){
	if(result.find!='1'){
		console.log('3');
			createUser(db,queryForInsert,function(doc) {
			console.log("true:"+ok);
				if(doc != null){
					console.log(doc);
					req.session.authenticated = true;
					req.session.username = doc.name;
					res.redirect('/');
				}else{
					res.render('error.ejs',{msg: "Error"});
				}
			}); 
	}else{
console.log('2');
	//res.redirect('/'); // user name is used
	res.render('error.ejs',{msg: "User name is used"});
	}
});
/*

			createUser(db,queryForInsert,function(doc) {
			console.log("true:"+ok);
				if(doc != null){
					console.log(doc);
					req.session.authenticated = true;
					req.session.username = doc.name;
					res.redirect('/');
				}else{
					res.render('error.ejs',{msg: "Error"});
				}
			});*/ //end create user function

////=========================================================================================================================
		});
	}else{
		res.render('error.ejs',{msg: "Usernamd and password is required"});
	}
});


app.get('/login',function(req,res) {
console.log('path: get-> /login \n');
	if (req.session.authenticated) {
		res.redirect('/read');	 
	}else{
		res.sendFile(__dirname + '/public/login.html');
	}
});

app.post('/login',function(req,res) {
console.log('path: post-> /login \n');
/*
	for (var i=0; i<users.length; i++) {
		if (users[i].name == req.body.name &&
		    users[i].password == req.body.password) {
			req.session.authenticated = true;
			req.session.username = users[i].name;
		}
	}
*/
req.session.authenticated = false;
req.session.username = null;
	if(req.body.name != null && req.body.password != null){
		queryAsObject = req.body;
		MongoClient.connect(mongourl, function(err, db) {
			assert.equal(err,null);
			console.log('Connected to MongoDB\n');
			findUser(db,queryAsObject,function(doc){
				if(doc.name!=null && doc.find==true ){
					console.log(doc);
					req.session.authenticated = true;
					req.session.username = doc.name;
					console.log(req.session.username);
					console.log(req.session.authenticated);
					res.redirect('/read');
				}else{
					res.sendFile(__dirname + '/public/login.html');
				}
				
			});
		db.close();

		});
	}
	
	
});

// RESTful function
app.post('/api/create',function(req,res){
console.log('path: post-> /api/create \n');
	console.log(req.body);
	console.log("Do api create");
	var data = {};
	if(req.body != null){
		if(req.body.name !=null && req.body.name !="") {
			var queryAsObject = req.body;
			data.name = queryAsObject.name;
			data.cuisine = (queryAsObject.cuisine!=null)?queryAsObject.cuisine : "";
			data.borough = (queryAsObject.borough!=null)?queryAsObject.borough : "";
			data['address'] ={};
			data.address.street =( queryAsObject.street!=null)? queryAsObject.street : "";
			data.address.building = (queryAsObject.building!=null)?queryAsObject.building : "";
			data.address.zipcode = (queryAsObject.zipcode!=null)?queryAsObject.zipcode : "";
			data['address']['coord'] =[];
			data.address.coord[0] = (queryAsObject.lon!=null)?queryAsObject.lon : "";
			data.address.coord[1] = (queryAsObject.lat!=null)?queryAsObject.lat : "";
			data.data = (queryAsObject.data!=null)?queryAsObject.data : "";
			data.mimetype = (queryAsObject.mimetype!=null)?queryAsObject.mimetype : "";
			console.log(data);
			
			if(req.body.userid != null && req.body.userid !=""){	
			  data.userid=req.body.userid ;
			}else{
				res.send({status : 'failed'});
				res.end();
				return;
			}
			// do create
			MongoClient.connect(mongourl, function(err, db) {
				assert.equal(err,null);
				console.log('Connected to MongoDB\n');
				apiCreate(db,data,function(doc){
					if(doc!=null){
						res.send({status : 'ok', _id : doc._id});
						res.end();
					}else{
						res.send({status : 'failed'});
						res.end();
					}
				});
			});		
		}else{
			res.send({status : 'failed'});
			res.end();
		}
		
	}else{
		res.send({status : 'failed'});
		res.end();
	}
	//res.end();
	
});
/*

app.get('/api/read/name/:name',function(req,res){
	var queryAsObject = req.params;
	console.log(queryAsObject);

	console.log("Do api read");
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		apiRead(db,queryAsObject,function(doc){
			if(doc!=null)
				res.send(doc);
			else
				res.send({});
			res.end();
		});
	});

});

app.get('/api/read/borough/:borough',function(req,res){
	var queryAsObject = req.params;
	console.log(queryAsObject);

	console.log("Do api read");
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		apiRead(db,queryAsObject,function(doc){
			if(doc!=null)
				res.send(doc);
			else
				res.send({});
			res.end();
		});
	});

});

app.get('/api/read/cuisine/:cuisine',function(req,res){
	var queryAsObject = req.params;
	console.log(queryAsObject);

	console.log("Do api read");
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		apiRead(db,queryAsObject,function(doc){
			if(doc!=null)
				res.send(doc);
			else
				res.send({});
			res.end();
		});
	});

});


app.get('/api/read/:name/:borough/:cuisine',function(req,res){
	var queryAsObject = req.params;
	console.log(queryAsObject);
	console.log("Do api read");
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		apiRead(db,queryAsObject,function(doc){
			if(doc.length != 0)
				res.send(doc);
			else
				res.send({});
			res.end();
		});
	});

});
*/

app.get('/api/read/:key/:value',function(req,res){
 console.log('path: post-> /api/read \n');
	var queryAsObject = req.params;
var stringj='{"'+req.params.key + '" : "'+req.params.value+'"}';
	var query = {};
	query = JSON.parse(stringj);
	console.log(query);
	console.log("Do api "+stringj);
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		apiRead(db,query,function(doc){
			if(doc.length != 0)
				res.send(doc);
			else
				res.send({});
			res.end();
		});
	});

});
//

//middleware check session authenticated ture or false
app.use(function (req,res,next){
console.log("middleware check authenticated \n");
console.log("authenticated: "+req.session.authenticated +"\n");
 if (!req.session.authenticated || !req.path==='/login') {
 		console.log('session not exist');
		res.redirect('/login');
	}else {
	//res.status(200).end('Hello, ' + req.session.username + '!  This is a secret page!');
	console.log('user login :'+req.session.username +"\n");
	next(); 
	}
});

app.get('/logout',function(req,res) {
console.log('path: get-> /logout \n');
console.log('user logout :'+req.session.username +"\n");
	req.session = null;
	res.redirect('/');
});




//read
app.get('/read',function(req,res) {
	console.log('path:/read \n');
	var queryAsObject = req.query;
	read_n_print(req,res,queryAsObject);
	//res.render('read',{user:req.session.username});
}); 


app.get('/change',function(req,res){
	console.log('path:/change \n');
	var queryAsObject = req.query;
	console.log(queryAsObject);
	if(queryAsObject != null){
		var rId = queryAsObject._id;
		MongoClient.connect(mongourl, function(err, db) {
			assert.equal(err,null);
			console.log('Connected to MongoDB\n');
			read(db,rId,function(doc){
				if(doc!=null){
					console.log('Restaurant found');
					if(doc.userid == req.session.username){
						res.render('update.ejs',{restaurant:doc,rId:rId});
					}else{
						res.render('error.ejs',{msg:"You are not authorized to edit!!! "}); // Not owner
					}
				}else{
					res.render('error.ejs',{msg:'No such _id'});
				}
			});
			
		});
	}
	//res.redirect('/read');		
});



app.get('/remove',function(req,res){
	console.log('path:/delete \n');
	deleteR(req,res);
	console.log('delete \n');
	//res.redirect('/read');		
});

//display item
app.get('/display',function(req,res) {
	console.log('path:/display \n');
	
	var queryAsObject = req.query;
	displayRestaurtant(req,res,queryAsObject)
	//res.render('display',{user:req.session.username});
}); 

app.get('/gmap',function(req,res) {
	console.log('path:/gmap \n');
	console.log('query'+ req.query.lat+","+req.query.lon+'\n ')
	var lat = req.query.lat;
	var lon = req.query.lon;
	var zoom =18;
	var title = req.query.title;

	res.render('gmap2.ejs',{lat:lat,lon:lon,zoom:zoom,title:title});
}); 

//send create form
app.get('/new',function(req,res){
	console.log('path: get->/new \n');
	res.sendFile(__dirname + '/public/create.html');
});

app.get('/rate',function(req,res){
	console.log('path:/rate \n');
	var queryAsObject = req.query;
	console.log(queryAsObject);
	if(queryAsObject._id != null){
		var rateData = {};
		rateData._id = queryAsObject._id;
		//rateData.username = res.session.username;
		console.log(rateData);
		res.render('rate.ejs',{rateData:rateData});
	}else{
		res.render('error.ejs',{msg:'No such _id'});
	}
	console.log('rate \n');
	//res.redirect('/read');		
});
app.post('/rate',function(req,res){
	console.log('path:/change \n');
	console.log(req.body);
	//console.log(req.query._id);
	if(req.body != null){
		console.log('Do rate');
		rate(req,res);
	}else{
		res.render('error.ejs',{msg:'No data'});
	}
	console.log('rate \n');
	//res.redirect('/read');		
});

app.use(fileUpload());

app.post('/change',function(req,res){
	console.log('path:/change \n');
	console.log(req.body);
	//console.log(req.query._id);
	if(req.body != null){
		console.log('do update');
		update(req,res,req.body);
	}else{
		res.render('error.ejs',{msg:'No data'});
	}
	console.log('change \n');
	//res.redirect('/read');		
});


//receive form createfrom data
app.post('/create',function(req,res){
	console.log('path:post ->/create \n');
	
	var queryAsObject = req.body;
	console.log(req.body.name);
	create(res,req,queryAsObject);
});

app.get(/.*/,function(req,res){
console.log('path:post ->/.*/ \n');
res.redirect('/login');

});

///read function
function create(res,req,queryAsObject) {
console.log('function -> create \n');
	var r = {};  // new restaurant to be inserted => r = empty json object
	r['address'] = {};  // console.log(r); { address:{ } };
	r.address.street = (queryAsObject.street != null) ? queryAsObject.street : null; //console.log(r); { address:{ street:"xxx"} }
	r.address.zipcode = (queryAsObject.zipcode != null) ? queryAsObject.zipcode : null;
	r.address.building = (queryAsObject.building != null) ? queryAsObject.building : null; //console.log(r); { address:{ street:"xxx" , building:"zzz"} }
	r.address['coord'] = []; //array  > empty   //console.log(r); { address:{ street:"xxx" , building:"zzz" , coord:[] } }
	r.address.coord.push(queryAsObject.lon); //push mean add to array    //console.log(r); { address:{ street:"xxx" , building:"zzz" , coord:[10] } }
	r.address.coord.push(queryAsObject.lat);							//console.log(r); { address:{ street:"xxx" , building:"zzz" , coord:[10,20] } }
	r['borough'] = (queryAsObject.borough != null) ? queryAsObject.borough : null;
	r['cuisine'] = (queryAsObject.cuisine != null) ? queryAsObject.cuisine : null;
	
	if(queryAsObject.name == null || queryAsObject.name ==""){
	
	res.render("error.ejs",{msg:"Name is mandatory! "});
	return;
	}
	r['name'] = (queryAsObject.name != null) ? queryAsObject.name : null;
	
	

	
	//
	r['userid'] = req.session.username;
	if(!req.files.file){
		r['data']=null;
	}else{
		r['data'] = new Buffer(req.files.file.data).toString('base64');
    			r['mimetype'] =  req.files.file.mimetype;
				
	}
	
//
	if(r['name']==null){
		res.redirect('/read');  // render error page
		return;
	}
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		db.collection('restaurants').insertOne(r,
			function(err,result) {
				assert.equal(err,null);
				console.log("insertOne() was successful _id = " +
					JSON.stringify(result.insertedId));
				db.close();
				console.log('Disconnected from MongoDB\n');
				res.redirect('/display?_id='+result.insertedId);
				//res.writeHead(200, {"Content-Type": "text/plain"});
				//res.end('Insert was successful ' + JSON.stringify(r));
			});
	});
}

function read_n_print(req,res,criteria) {
console.log('function -> read_n_print\n');
		MongoClient.connect(mongourl, function(err, db) {
			assert.equal(err,null);
			console.log('Connected to MongoDB\n');
			findRestaurants(db,criteria,function(restaurants) {
				db.close();
				console.log('Disconnected MongoDB\n');
			/*	res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><head><title>Restaurant</title></head>');
				res.write('<body><H1>Restaurants</H1>');
				res.write('<H2>Showing '+restaurants.length+' document(s)</H2>');
				res.write('<H3>Criteria: </i>' + JSON.stringify(criteria) + '</i></H3>');
				res.write('<ol>');
				for (var i in restaurants) {
					res.write('<li>'+restaurants[i].name+'</li>');
				}
				res.write('</ol>');
				res.end('</body></html>');
			*/
			//display to ejs read.ejs file
			res.render('read',{userid:req.session.username,restaurants:restaurants,criteria:JSON.stringify(criteria)});
				return(restaurants);
			});
			
		});
}

function findRestaurants(db,criteria,callback) {
console.log('function -> findRestaurants\n');
	var restaurants = [];
	//cursor = db.collection('restaurants').find(criteria).limit(20);
	cursor = db.collection('restaurants').find(criteria);
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			restaurants.push(doc);
		} else {
			callback(restaurants); // ref in -> read_n_print function ->findRestaurants(db,criteria, -_>function(restaurants)<_-
		}
	});
}

//for display restaurtant photo and info detail
function displayRestaurtant(req,res,criteria) {
console.log('function -> displayRestaurtant \n');

		 MongoClient.connect(mongourl,function(err,db) {
    console.log('Connected to mlab.com');
    console.log('Finding id = ' + req.query._id)
    assert.equal(null,err);

    var bfile;
    var key = req.query._id;
	  if (key != null) {
      read(db, key, function(doc) {
        if (doc != null) {
          console.log('Found: ' + key)
  /*        res.writeHead(200,{'Content-Type':'text/html'});
		res.write("<html><body>");
		res.write('<center><img src="data:'+ doc.mimetype +';base64,'+ doc.data +'"/><br/>');
		res.write('<b>'+doc.caption+'</b><br/>');
		res.write('Date :'+doc.month+'/'+doc.year+'<br/></center>');
	
        res.end('</body></html>');
*/
	//console.log(doc);
		var lat  = doc.address.coord[1];
		var lon  = doc.address.coord[0];
console.log(lat);
console.log(lon);
	res.render('display',{restaurant:doc,lat:lat,lon:lon, currentUser:req.session.username});
        } else {
          res.status(404);
          res.end(key + ' not found!');
          console.log(key + ' not found!');
        }
        db.close();
      });
    } else {
      res.status(500);
      res.end('Error: query parameter "key" is missing!');
    }
});
}

function read(db,target,callback) {
  var bfile = null;
  var mimetype = null;
  db.collection('restaurants').findOne({"_id": ObjectId(target)}, function(err,doc) {
    assert.equal(err,null);
    //if(doc != null)
	callback(doc);
  });
}
function deleteR(req,res){

	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(null,err);
		var key = req.query._id;
	  		if (key != null) {
			read(db, key, function(doc){
				if(doc!=null){
					if(doc.userid == req.session.username){
					   db.collection('restaurants').deleteMany({"_id":ObjectId(key)},function(err,result){
							assert.equal(null,err);
							console.log('delete '+ key);
							db.close();
						});

						// render success page
						res.render('info.ejs',{msg:"Delete was successful "});
					}else{
						//render  error page Not owner
						db.close();
						res.render('error.ejs',{msg:"You are not authorized to delete!!! "});
					}
					
				}else{
					db.close();//render  error page No object id
					res.render('error.ejs',{msg: "No such _id to delete!!! "});
				}


			});
		}
	});		
}
function findUser(db,criteria,callback){
	var user = {};
	console.log( "db match:"+ JSON.stringify(criteria));
	cursor = db.collection('users').find(criteria);
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			user.name = doc.name;
			user.find= true;
			
		}else{
				  // cant find related user 
		
		user.find=false;
			
		
		}
		callback(user);
	});
}

function CheckUser(db,criteria,callback){
isUser = {};
isUser.find = 1;
	console.log( "db match:"+ JSON.stringify(criteria));
	db.collection('users').findOne(criteria,function(err,doc){
		assert.equal(err,null);
		if (doc != null) {
console.log('here');
console.log(isUser);
			isUser.find = '1';
		}else{
console.log('no user');
	 		isUser.find = '0'; // cant find related user 

console.log(isUser);
		}
		callback(isUser);
	});



}


function createUser(db,criteria,callback){
	var user = {};
	var doc = {};
	var queryForFind = {};

	console.log(criteria);
	if(criteria != null){


			user.name=criteria.name;
			user.password=criteria.password;
			console.log(user);
			db.collection('users').insertOne(user,function(err,result){
				assert.equal(err,null);
					console.log("insertOne() was successful _id = " +
						JSON.stringify(result.insertedId));
				doc.name=user.name;
				db.close();
				callback(doc);
			});

	}
};

function rate(req,res){
	
	var data2 = {};
	data2.user = req.session.username;
	data2.score= req.body.score;
	console.log(data2);


	MongoClient.connect(mongourl,function(err,db) {
		assert.equal(null,err);
		var key = req.body._id;
		read(db,key,function(doc){
			if(doc!=null){
				if(doc.grades != null){
					console.log(doc.grades);
					var isNotRated = false;
					for(var i=0; i< doc.grades.length ; i++){
						if(doc.grades[i].user == data2.user){
							isNotRated = true;
						}
					}
					if(!isNotRated){
						var data = {};
						data.grades = [];
						data.grades = doc.grades
						data.grades.push(data2);
						console.log(data.grades);
						updateRate(req,res,db,data);
					}else{
						res.render('error.ejs',{msg: "You have rated this restaurant"});// User have rated
					}
				}else{
					console.log("no grades");
					var data = {};
					data.grades = [];
					data.grades.push(data2);
					console.log(data);
					updateRate(req,res,db,data)
				}
			}else{
				res.render('error.ejs',{msg: "No such _id"}); // No doc
			}
			db.close();
		});
	});
}
function updateRate(req,res,db,data){
	db.collection('restaurants').updateOne({ "_id" : ObjectId(req.body._id) },{ $set: data},
		function(err, results) {
			assert.equal(null, err);
			console.log("data updated");
			res.redirect("/display?_id="+req.body._id);
		});
}

function update(req,res,queryAsObject){

	var data = {};
	data.name = queryAsObject.name;
	data.cuisine = (queryAsObject.cuisine!=null)?queryAsObject.cuisine : "";
	data.borough = (queryAsObject.borough!=null)?queryAsObject.borough : "";
	data['address'] ={};
	data.address.street =( queryAsObject.street!=null)? queryAsObject.street : "";
	data.address.building = (queryAsObject.building!=null)?queryAsObject.building : "";
	data.address.zipcode = (queryAsObject.zipcode!=null)?queryAsObject.zipcode : "";
	data['address']['coord'] =[];
	data.address.coord[0] = (queryAsObject.lon!=null)?queryAsObject.lon : "";
	data.address.coord[1] = (queryAsObject.lat!=null)?queryAsObject.lat : "";


	


	console.log(data);	
	if(!req.files.file){
		data['data']='';
	}else{
		data['data'] = new Buffer(req.files.file.data).toString('base64');
    			data['mimetype'] =  req.files.file.mimetype;
				
	}
	var updateRestaurants = function(db, callback) {
	console.log(req.body._id);
		db.collection('restaurants').updateOne({ "_id" : ObjectId(req.body._id) },{ $set: data},
			function(err, results) {
			console.log("data updated");
			callback();
		});
	};


	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(null, err);
		updateRestaurants(db, function() {
			db.close();
			res.redirect("/display?_id="+req.body._id);
			
		});
	});
}
function apiCreate(db,data,callback){
	db.collection('restaurants').insertOne(data,function(err,result){
		assert.equal(err,null);
		console.log("insertOne() was successful _id = " +
			JSON.stringify(result.insertedId));
		db.close();
		var doc = {};
		doc._id = result.insertedId;
		callback(doc);
	});
}
function apiRead(db,queryAsObject,callback){
	var result = [];
	cursor = db.collection('restaurants').find(queryAsObject);
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			result.push(doc);
		}else{
			callback(result);
		}
	});	
	
}
app.listen(process.env.PORT || 8099);
