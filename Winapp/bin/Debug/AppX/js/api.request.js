cnapi.request = {}
cnapi.request.schedule = function(cid,day,onComplete) {
	
	var day = day ? new Date(day) : new Date,
		nxt = new Date(day.getTime() + 86400 * 1000),
		day_url = day.format('yyyy-mm-dd'),
		nxt_url = nxt.format('yyyy-mm-dd');
	
	console.log('cnapi.request.schedule',cid);
	var apiurl = cnapi.apiurl + '/tvguide/2/schedule.json?channel='+cid+'&dates='+day_url+','+nxt_url;
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
	var apiurl = cnapi.apis.media_locator + 'sources.json?id='+id;
	console.log('cnapi.request.sauce', id, apiurl);
	$Ajax(apiurl,this.sauce_onload.bind(this, onComplete));
};
cnapi.request.sauce_onload = function(callback, data) {
	//console.log(data, callback);
	var resp = !data ? null : data.replies,
		rply = !resp ? null : resp[0],
		rips = !rply ? [] : rply.rips,
		files = [];

	var pz;
	rips.forEach(function(rip){
		pz = [];
		rip.parts.forEach(function(prt){pz = pz.concat(prt.locations)});
		files.push(pz);
	});
	//console.log('FILES', files);
	if(!files.length) console.log(data);
	if(callback) callback(files);
	else console.log('SL',files);
};

cnapi.request.channels = function(ids, onComplete) {
	var apiurl = cnapi.apis.tvguide+'channels.json?t='+cnapi.location;
	apiurl += '&fields=channelId,title,alias,logoURL,categories,hasSchedule';
	//apiurl += ',description';
	//apiurl += ',scheduledDates';
	//apiurl += ',currentTelecast';
	apiurl += '&channel='+ids;
	$Ajax(apiurl,this.channels_onload.bind(this, onComplete));
};
cnapi.request.channels_onload = function(callback, data) {
	var clist = data ? data.channels : data;
	if(callback) callback(clist);
	else console.log('CL',clist);

};
