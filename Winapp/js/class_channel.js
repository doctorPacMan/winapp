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
			var sd = new Date(v.year+'/'+v.month+'/'+v.day+' '+v.hour+':'+v.minute+':'+v.second);
			//scheduledDates.push(sd.setHours(6,0,0,0));
			scheduledDates.push(sd.format('dd/mm'));
		});
		this.scheduledDates = scheduledDates;

		this.squeeze = ([22301705,22615442,10338208,10338227,26424387,47803193,17406746,17003392].indexOf(this.cid)>=0);

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
			g = document.createElement('s');
		i.className = 'chaicon';
		g.className = 'logo_small logo_small_'+this.alias;
		i.appendChild(g);
		return i;
	},
	getIcon0: function() {
		var i = document.createElement('i'),
			g = document.createElement('img');
		i.className = 'chaicon';
		g.src = this.logo;
		i.appendChild(g);
		return i;
	}
};