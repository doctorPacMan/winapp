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