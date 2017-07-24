var $App = {
	initialize: function() {
		console.info('$App initialize');
		this._telecast = {};
		this._channels = {};

		this._video = document.getElementById('tvplayer');
		this._sauce = this._video.querySelector('source[type="application/x-mpegURL"]');

		this.modChannels = new modChannels('mod-channels');
		this.modSchedule = new modSchedule('mod-schedule');
		this.modTitlebar = new modTitlebar('mod-titlebar');

		var cb = this.modChannels.node.querySelectorAll('a.chatile');
		for(var i=0;i<cb.length;i++) cb[i].onclick = this.clickChannel.bind(this,cb[i]);

		//cnapi.initialize(this.onready.bind(this));
	},
	onready: function(channels) {

		document.getElementById('inf-provider').innerText = cnapi.location+' '+cnapi.provider;
		document.getElementById('inf-acstoken').innerText = cnapi.getAuthToken();
		console.log('READY', channels.length);
		
		while(channels.length) this.pushChannel(channels.shift());
		this.modChannels.update(this._channels);
		
		//var cb = this._channels_list.querySelectorAll('a.chatile');
		//for(var i=0;i<cb.length;i++) cb[i].onclick = this.clickChannel.bind(this,cb[i]);

		//return this.request.schedule(10338262);
		return;
	},
	getChannelById: function(cid) {
		return this._channels[cid];
	},
	getTelecastById: function(id) {
		return this._telecast[id];
	},
	registerTelecast: function(json) {
		if (!this._telecast[json.id]) this._telecast[json.id] = new TvShow(json);
		return this._telecast[json.id];
	},
	pushChannel: function(json) {
		if (this._channels[json.id]) return;
		else this._channels[json.id] = new TvChannel(json);
	},
	clickChannel: function(tile, event) {
		event.preventDefault();
		var href = tile.getAttribute('href'),
			cid = tile.getAttribute('data-cid'),
			src = href;
		
		if (!href) console.log('NOHREF');
		else if(href.indexOf('?sid=')>0) src = href.split('?sid=')[0];
		
		src = 'http://www.cn.ru/data/files/test/adv/banner0.mp4';
		this._sauce.setAttribute('src',src);
		this._video.setAttribute('src',src);
		this._video.play();
		this.currentChannel = cid;
		console.log(src);
	}
};