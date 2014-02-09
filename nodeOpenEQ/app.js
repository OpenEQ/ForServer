/**
 * Opn Earthquake Project
 * GCM console app
 * (c)2014 Yuuichi Akagawa
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var redis = require('redis');

var app = express();
var rediscli = redis.createClient();

//GCM API Key
var api_key = 'SET_YOUR_API_KEY';

// all environments
app.set('port', process.env.PORT || 8009);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//Send GCM message
app.post('/send',  function(req, res){
	var request = require('request');
	var msg = {
		registration_ids: [req.body.regId],
		collapse_key: "update",
		time_to_live: 180,
		data: {
			message: req.body.msg
		}
	};
	request.post({
		uri: 'https://android.googleapis.com/gcm/send',
		json: msg,
		headers: {
			Authorization: 'key=' + api_key
		}
	}, function(err, response, body) {
//		console.log(body);
		res.redirect('/');
	});
});

//Register Android Phone 
app.post('/register',  function(req, res){
	var dt = new Date();
	rediscli.hmset(req.body.Uuid, "regId", req.body.regId, "latitude", req.body.latitude, "longitude", req.body.longitude, "lastupdate", dt, function(){
		res.send(200);
    });
});

//Remove Android Phone 
app.post('/unreg',  function(req, res){
	rediscli.del(req.body.Uuid, function(){
		res.send(200);
//		console.log('unreg:' + req.body.Uuid);
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
