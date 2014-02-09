/*
 * Open Earthquakea Project
 * GCM test top page
 *
 * (c)2013 Yuuichi Akagawa
 */
var async = require('async');
var redis = require('redis');
var rediscli = redis.createClient();

exports.index = function(req, res){
	rediscli.keys("*", function(err, obj){
		async.map(obj, getNode, function(err, nodes){
			res.render('index', { title: 'Open Earthquake', list: nodes });
		});
	});
}

function getNode(node, next){
        rediscli.hgetall(node, next);
}
