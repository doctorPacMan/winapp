"use strict";
var TvChannel = function(){return this.initialize.apply(this,arguments)};
TvChannel.prototype = {
	initialize: function(data, json) {
		var data = Object.assign({},data),
			json = Object.assign({},json);

		//console.log(data, json);
		this.pid = data.pid;
		this.cid = json.channelId;// || data.cid;
		this.alias = json.alias;
		this.title = data.title || json.title || 'Untitled';
		this.stream = data.src || json.src || null;
		this.logo = json.logoURL ? json.logoURL : 'img/logo150x150.png';
		this.hasSchedule = !!json.hasSchedule;

		var scheduledDates = [];
		if(json.scheduledDates)	json.scheduledDates.forEach(function(v){
			var sd = v.year+'/'+v.month+'/'+v.day;
			sd += ' '+v.hour+':'+v.minute+':'+v.second;
			scheduledDates.push(new Date(sd));//var tz = v.timezone/60;
		});
		this.scheduledDates = scheduledDates;

		this.squeeze = ([22301705,22615442,10338208,10338227,26424387,47803193].indexOf(this.cid)>=0);

		this._data = data;
		this._json = json;
		//if(cid==24646020) console.log(data);//HD
		//if(cid==58456826) console.log(data);//cam
		//if(!data.logoURL) console.log(data);
	},
	getLogo: function() {
		var i = document.createElement('i'),
			g = document.createElement('img');
		i.className = 'chalogo';
		g.src = this.logo;
		i.appendChild(g);
		return i;
	},
	getIcon: function() {
		var i = document.createElement('i'),
			g = document.createElement('img');
		i.className = 'chaicon';
		g.src = this.logo;
		i.appendChild(g);
		return i;
	}
};