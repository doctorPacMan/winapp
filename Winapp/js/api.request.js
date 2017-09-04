"use strict";
cnapi.request = {};
cnapi.request.schedule = function(cid,day,onComplete) {
	
	var day = day ? new Date(day) : new Date,
		nxt = new Date(day.getTime() + 86400 * 1000),
		day_url = day.format('yyyy-mm-dd'),
		nxt_url = nxt.format('yyyy-mm-dd');
	
	console.log('cnapi.request.schedule',cid);
	var apiurl = cnapi.apis.tvguide + 'schedule.json?channel='+cid+'&dates='+day_url+','+nxt_url;
	$Ajax(apiurl,this.schedule_onload.bind(this, onComplete, day));
};
cnapi.request.schedule_onload = function(callback, day, data) {
	//console.log('SO', data, callback);
	var list = data && data.telecastsList ? data.telecastsList : [],
		indx = [];

	list.forEach($App.registerTelecast.bind($App));
	indx = list.map(function(v){return v.id});
	if(callback) callback(indx,day);
	else console.log(data);
};

cnapi.request.sauce = function(id, onComplete) {

	var tvs = $App.getTelecastById(id),
		cha = $App.getChannelById(tvs.channel),
		pid = cha.pid,
		medialocator = cnapi.apis.medialocator[pid];
	console.log('cnapi.request.sauce', id, pid, medialocator);
	//console.log('cnapi.request.sauce', medialocator);
	//console.log('cnapi.request.sauce', tvs, cha);
	if(!medialocator) return !onComplete ? null : onComplete([]);
	
	var apiurl = medialocator + 'sources.json?id=' + id;
	$Ajax(apiurl,this.sauce_onload.bind(this,onComplete,id));
};
cnapi.request.sauce_onload = function(callback, id, data) {
	//console.log(id, data, callback);
	var	resp = !data ? null : data.replies,
		rply = !resp ? null : resp[0],
		ctid = !rply ? null : rply.catalogue_item_id,
		rips = !rply ? [] : rply.rips;

	var files = [];
	rips.forEach(function(rip){
		rip.parts.forEach(function(prt){files = files.concat(prt.locations)});
	});

	if(files.length) {
		var tvs = $App.getTelecastById(id);
		tvs['files'] = files;
	}
	//else console.log(data);
	//console.log('FILES', files);
	if (callback) callback(files);
	else console.log('SRC',files);
};

cnapi.request.channels = function(ids, onComplete) {
	var apiurl = cnapi.apis.tvguide+'channels.json?t='+cnapi.location;
	apiurl += '&fields=channelId,title,alias,logoURL,categories,hasSchedule';
	apiurl += ',scheduledDates';
	apiurl += '&channel='+ids;
	$Ajax(apiurl,this.channels_onload.bind(this, onComplete));
};
cnapi.request.channels_onload = function(callback, data) {
	var clist = data ? data.channels : data;
	if(callback) callback(clist);
	else console.log('CL',clist);
};

cnapi.request.nowonair = function(ids, onComplete) {
	var apiurl = cnapi.apis.tvguide+'channels.json?t='+cnapi.location;
	apiurl += '&fields=channelId,currentTelecast';
	apiurl += '&channel='+ids;
	$Ajax(apiurl,this.nowonair_onload.bind(this, onComplete));
};
cnapi.request.nowonair_onload = function(callback, data) {
	if(!data) return console.log('cnapi.request.nowonair fail', data);

	var resp = {};
	var data = data ? data.channels : data;
	data.forEach(function(res,k){
		var tvs = res.currentTelecast;
		if(!tvs.channel) tvs.channel = {channelId:res.channelId};
		var tlc = $App.registerTelecast(tvs);
		resp[res.channelId] = tvs.id;
	});
	if(callback) callback(resp);
	else console.log('NC',resp);
};

cnapi.request.current = function(cid, onComplete) {
	var apiurl = cnapi.apis.tvguide+'channels.json?t='+cnapi.location;
	apiurl += '&fields=channelId,currentTelecast';
	apiurl += '&channel='+cid;
	$Ajax(apiurl,this.current_onload.bind(this,onComplete));
};
cnapi.request.current_onload = function(callback, data) {
	if(!data) return console.log('cnapi.request.current fail', data);

	var res = data.channels.length ? data.channels[0] : null,
		tvs = !res ? null : res.currentTelecast;
	
	if(!tvs) return callback ? callback(null) : null;
	if(!tvs.channel) tvs.channel = {channelId:res.channelId};
	
	var tlc = $App.registerTelecast(tvs);
	if(callback) callback(tvs.id);
	else console.log('cT',tvs,tlc);
};

cnapi.request.idbytitle = function(cnames, onComplete) {

	var titles = [];
	cnames.forEach(function(name) {
		var n = name.replace(',','\\,').replace(' ','+');
		titles.push(n);
	});

	var apiurl = cnapi.apis.tvguide+'idbytitle.json?titles='+titles.join(',');
	$Ajax(apiurl,this.idbytitle_onload.bind(this,onComplete,cnames));
};
cnapi.request.idbytitle_onload = function(callback, cnames, data) {
	console.log('[BT]', cnames, data);
	var resp = [];
	for(var i=0;i<cnames.length;i++) {
		var cid = data.channels[i].channelId,
			title = data.channels[i].title;
		resp.push(cid ? {cid:cid,title:title} : null);
		console.log(cnames[i],(cid ? {cid:cid,title:title} : null));
	}
	if(callback) callback(resp);
	else console.log('TD',resp);
};