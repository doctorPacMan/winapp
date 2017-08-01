var $App = {
	initialize: function() {
		console.info('$App initialize');
		this._telecast = {};
		this._channels = {};
		//cnapi.initialize(this.onready.bind(this));

		var mtv = new modTvplayer('mod-tvplayer');
		mtv.play('http://hls.peers.tv/streaming/cam_krylova-krasny/16/variable.m3u8');

	},
	onready: function(playlist) {

		document.getElementById('inf-provider').innerText = cnapi.location+' '+(cnapi.provider ? cnapi.provider.name : 'undefined');
		document.getElementById('inf-acstoken').innerText = cnapi.getAuthToken();
		console.log('READY', playlist);
		
		this._playlist = playlist;
		this.modChannels = new modChannels('mod-channels');
		this.modChannels.update(playlist.channels);

		this.modTvplayer = new modTvplayer('mod-tvplayer');

return;
		
		this.modSchedule = new modSchedule('mod-schedule');
		this.modTitlebar = new modTitlebar('mod-titlebar');

		while(channels.length) this.pushChannel(channels.shift());
		this.modChannels.update(this._channels);
		
		//var cb = this._channels_list.querySelectorAll('a.chatile');
		//for(var i=0;i<cb.length;i++) cb[i].onclick = this.clickChannel.bind(this,cb[i]);

		//return this.request.schedule(10338262);
		return;
	},
	getChannelById: function(id) {
		return this._playlist.channels[id];
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
		//this._sauce.setAttribute('src',src);
		//this._video.setAttribute('src',src);
		//this._video.play();
		this.currentChannel = cid;

		this.modTvplayer.play(src);
	}
};