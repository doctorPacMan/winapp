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

		this._data = data;
		this._json = json;
		//if(cid==24646020) console.log(data);//HD
		//if(cid==58456826) console.log(data);//cam
		//if(!data.logoURL) console.log(data);
	}
};