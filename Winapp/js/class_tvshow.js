"use strict";
var TvShow = function(){return this.initialize.apply(this,arguments)};
TvShow.prototype = {
	initialize: function(json) {
		
		var json = Object.assign({},json);

		for(var k in json) this[k] = json[k];
		this.channel = json.channel.channelId;
		
		var d = json.date;
		this.dura = json.duration*1e3;
		this.time = new Date(d.year, d.month-1, d.day, d.hour, d.minute);
		this.ends = new Date(this.time.getTime() + this.dura);
		this.progress = this.getProgress();
		this.sauce = undefined;
		this.files = false;

		var telecastImage = 'img/poster.jpg';
		var telecastPoster = 'img/poster.jpg';
		(json.telecastImages || []).forEach(function(v){
			if(v.profile===2) telecastPoster = v.location;
			else if(v.profile===0) telecastImage = v.location;
		});
		this.image = telecastImage;
		this.poster = telecastPoster;

		this._json = json;
		//console.log(json);
	},
	getProgress: function() {
		if(typeof(this.progress)=='boolean') return this.progress;

		var now = Date.server();
		if(this.time > now) return true;
		else if(this.ends < now) return false;
		else {
			var p = now - this.time;
			return Math.round(1e3 * p/this.dura)/1e3;
		}
	},
	getNodeList: function() {
		var pg = this.getProgress(),
			node = document.createElement('a'),
			name = document.createElement('span'),
			time = document.createElement('time');
			
		time.setAttribute('datetime',this.time.getHtmlTime());
		time.innerText = this.time.format('h:nn');
		name.innerText = this.title;

		node.appendChild(time);
		node.appendChild(name);

		if(pg===true) node.className = 'pg-next';
		else if(pg===false) node.className = 'pg-past';
		else node.className = 'pg-live';
		
		return node;
	}
};