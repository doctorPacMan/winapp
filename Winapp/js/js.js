var $App = {
	initialize: function() {

		//var tp = new modTvplayer('mod-tvplayer');
		//tp.load('http://hls.peers.tv/streaming/cam_krylova-krasny/16/variable.m3u8');
		//tp.load('http://www.cn.ru/data/files/test/countdown.mp4');
		//return;

		console.info('$App initialize');
		this._telecast = {};
		this._channels = {};

		var ml = new modLoading('mod-loading');
		cnapi.initialize(this.onready.bind(this), ml);
	},
	toggleSection: function(section,bttn) {
		var section = document.getElementById(section),
			st = !section.classList.contains('hidden');
		console.log(section, st, bttn);
		section.classList[st?'add':'remove']('hidden');
		bttn.classList[!st?'add':'remove']('active');
	},
	apinfo: function(brun) {
		//alert('INFO');
		console.log(cnapi)
	},
	apprun: function(brun) {
		cnapi.initialize(this.onready.bind(this));
		brun.onclick = function(){};
	},
	onready: function(playlist) {

		console.log('READY', playlist);
		
		this.informers();
		this.sbbuttons();
		//return cnapi.request.current(10338200);
		//return cnapi.request.idbytitle(['ЛДПР','Jasmin']);
		//return cnapi.request.schedule(10338262);
		//return cnapi.request.sauce(101613384);
		
		this._playlist = playlist;
		this.modChannels = new modChannels('mod-channels');
		this.modChannels.update(playlist.channels);

		this.modTvplayer = new modTvplayer('mod-tvplayer');
		this.modTitlebar = new modTitlebar('mod-titlebar');
		this.modSchedule = new modSchedule('mod-schedule');

		return;		
	},
	sbbuttons: function() {
		var bttn = document.getElementById('runapp');
		bttn.onclick = this.apprun.bind(this,bttn);
		
		bttn = document.getElementById('apinfo');
		bttn.onclick = this.apinfo.bind(this,bttn);
		
		bttn = document.getElementById('chlist');
		bttn.onclick = this.toggleSection.bind(this,'mod-channels',bttn);
		//bttn.onclick();

		bttn = document.getElementById('schdle');
		bttn.onclick = this.toggleSection.bind(this,'mod-schedule',bttn);
		//bttn.onclick();
	},
	informers: function() {
		var provlogo = document.getElementById('inf-provlogo'),
			acstoken = document.getElementById('inf-acstoken'),
			location = document.getElementById('inf-location');

		acstoken.innerText = cnapi.getAuthToken();
		location.innerText = cnapi.location;
		if(cnapi.provider) {
			provlogo.style.backgroundImage = cnapi.provider.logo ? 'url("'+cnapi.provider.logo+'")' : null;
			provlogo.innerText = cnapi.provider.name ? cnapi.provider.name[0] : '?';
			provlogo.title = cnapi.provider.name || 'Unknown';
		}
		else provlogo.innerText = '?';
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
		//this.modTvplayer.play(src);
	}
};