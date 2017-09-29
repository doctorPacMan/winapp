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
		this.sauce = undefined;
		this.source = undefined;
		//this.files = false;
		this.onair = false;
		this.progress = this.getProgress();

		var telecastImage = 'img/poster.jpg';
		var telecastPoster = 'img/poster.jpg';
		var telecastPreview = 'img/poster.jpg';
		(json.telecastImages || []).forEach(function(v){
			if(v.profile===2) telecastPoster = v.location;
			else if(v.profile===0) telecastImage = v.location;
			else if(v.profile===3) telecastPreview = v.location;
		});
		this.image = telecastImage;
		this.poster = telecastPoster;
		this.preview = telecastPreview;
		this._json = json;
		//console.log(json);
	},
	update: function(json) {
		
		this.getProgress();

		return this;
	},
	getStartime: function() {
		
		var ddt = this.time.getDate() - Date.server().getDate(),
			stt = this.time;

		if(ddt == 0) stt = this.time.format('h:nn');
		else if(ddt == 1) stt = 'Tomorrow '+this.time.format('h:nn');
		else if(ddt ==-1) stt = 'Yesterday '+this.time.format('h:nn');
		else stt = this.time.format('dd mmmm h:nn');

		return stt;
	},
	getProgress: function() {
		if(typeof(this.progress)=='boolean') return this.progress;

		var now = Date.server(), prg;
		if(this.time > now) prg = true;
		else if(this.ends < now) prg = false;
		else {
			var p = now - this.time;
			prg = Math.round(1e3 * p/this.dura)/1e3;
		}
		this.onair = (typeof(prg)!='boolean');
		return this.progress = prg;
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
	},
	getNodeNowair: function() {
		var node = document.createElement('a'),
			img = document.createElement('img'),
			i = document.createElement('i'),
			s = document.createElement('strong'),
			n = document.createElement('span');
		
		node.className = 'tvsair tvs-nowair';
		
		img.setAttribute('src',this.poster);
		i.appendChild(img);
		node.appendChild(i);

		s.innerText = this.channel;
		node.appendChild(s);

		n.innerText = this.title;
		node.appendChild(n);

/*
					<a class="tvsair">
						<i><img src="img/poster16x9.jpg"></i>
						<strong>Первый общеобразовательный общеобразовательный</strong>
						<time>22:22, </time>
						<span>Первый общеобразовательный телеканал телеканал телеканал</span>
					</a>
		var node = document.createElement('a'),
			titl = document.createElement('strong'),
			name = document.createElement('span'),
			time = document.createElement('time'),
			img = document.createElement('img'),
			a = document.createElement('a'),
			i = document.createElement('i');
		

		time.setAttribute('datetime',this.time.getHtmlTime());

		time.innerText = this.time.format('h:nn');
		name.innerText = this.title;

		
		a.appendChild(time);
		a.appendChild(name);
		node.appendChild(a);

*/


		return node;
	}
};