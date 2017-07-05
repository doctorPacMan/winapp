var $Ajax = function(url,onComplete,params) {

		var params = params || {}, body = [];
		for (var j in params) body.push(j+'='+encodeURIComponent(params[j]));

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		//xhr.setRequestHeader('Authorization','Bearer 00954bafe0c6182bb730d240f5147dd8');
		//xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		xhr.onreadystatechange = function () {
			//console.log(xhr.readyState, xhr.status);
			if(xhr.readyState != 4) return;
			
			if(xhr.status != 200) onComplete(null, xhr);
			else {
				var text = xhr.responseText, json;
				try{json = JSON.parse(xhr.responseText)}catch(e){};
				onComplete(json || text, xhr);
			}
		};
		xhr.send(body.length ? body.join('&') : null);
};
var cnapi = {
	//token: '00954bafe0c6182bb730d240f5147dd8',
	apiurl: 'http://api.peers.tv',
	whereami: function(onComplete) {
		$Ajax(this.apiurl+'/registry/2/whereami.json',onComplete);
	},
	channels: function(onComplete) {
		var url = this.apiurl+'/tvguide/2/channels.json?t=16&fields=channelId,title,logoURL,hasSchedule,alias,ageRestriction,type';
		$Ajax(url,onComplete);
		//if(data.location) url_params.push('t='+data.location);
		//if(data.fields) url_params.push('fields=' + data.fields);
		//if(data.channel) url_params.push('channel='+data.channel);
		//url += url_params.join('&');

		//this.api.queryAPI(url, params.success, params.error, params.create, params.complete);
	},
	getToken: function() {
		var onComplete = function(d){console.log('token',d)};
		var params = {
			'grant_type': 'inetra:anonymous',
			'client_id': 'demoapp',
			'client_secret': 'demoapp'
		};
		$Ajax(this.apiurl+'/auth/2/token',onComplete,params);
	}
}