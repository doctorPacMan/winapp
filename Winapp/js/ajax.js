var $Ajax = function(url,onComplete,params,async) {

		var async = async===false ? false : true;
		var params = params || {}, body = [];
		for (var j in params) body.push(j+'='+encodeURIComponent(params[j]));

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, async);
		//xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		var token = cnapi.getAuthToken();
		//if(url.indexOf('api.peers.tv')>=0) console.log('Token '+token);
		if(url.indexOf('api.peers.tv')>=0 && token) xhr.setRequestHeader('Authorization','Bearer '+token);

		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		xhr.onreadystatechange = function () {
			//console.log(xhr.readyState, xhr.status);
			if(xhr.readyState != 4) return;
			if(xhr.status != 200) onComplete(false, xhr);
			else {
				var text = xhr.responseText, json;
				try{json = JSON.parse(xhr.responseText)}catch(e){};
				//catch(e){console.log('Ajax error',e,text)};
				onComplete(json || text, xhr);
			}
		};
		xhr.send(body.length ? body.join('&') : null);
};
