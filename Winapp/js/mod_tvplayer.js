var modTvplayer = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		this._video = this.node.querySelector('video');
		this._hls_type = this.hlsPlayType(this._video);
		
		this._hlsjs = new Hls({});
		this._hlsjs.on(Hls.Events.MEDIA_ATTACHED,function(event,data){
			var sauce = data.media.getElementsByTagName('source')[0];
			this._hlsjs.loadSource(sauce.getAttribute('src'));
		}.bind(this));

		console.log('modTvplayer initialize', this._hls_type);

		//this.onTelecastView({detail:{id:100435894}});
	},
	onChannelView: function(event) {
		var id = event.detail.channelId,
			cha = $App.getChannelById(id);
		
		this.play(cha.src);

		console.log('onChannelView',cha);
	},
	onTelecastView: function(event) {
		var id = event.detail.id,
			tvs = $App.getTelecastById(id);
		
		console.log('onTelecastView', id, tvs);
		
		var onComplete = function(vv){console.log('onComplete!!',vv)};
		var onComplete = this.load.bind(this);
		cnapi.request.sauce(id,onComplete);
	},
	hlsPlayType: function(video) {
		var cp = false,
			tp = ['application/x-mpegURL','application/vnd.apple.mpegURL','application/vnd.apple.mpegurl'];

		while(tp.length) {
			var type = tp.shift();
			if(video.canPlayType(type)=='') continue;
			//else console.log('hlsPlayType', type, video.canPlayType(type));
			cp = type;
			break;
		};
		return cp;
	},
	stop: function() {

		this._hlsjs.stopLoad();
		this._hlsjs.detachMedia(this._video);

		this._video.pause();
		this._video.currentTime = 0;
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._video.removeAttribute('autoplay');
		var so = Array.prototype.slice.call(this._video.querySelectorAll('source'));
		while(so.length) this._video.removeChild(so.pop());

	},
	play: function(src) {

		this.load(src, true);

	},
	load: function(src, autoplay) {

		this.stop();

		var dfsrc = document.createDocumentFragment(),
			sauce = document.createElement('source'),
			hls = /\.(m3u8|m3u)($|\?|#)/.test(src),
			avp = autoplay===true,
			htp = this._hls_type;

		dfsrc.appendChild(sauce=sauce.cloneNode(true));
		if(hls && htp) sauce.setAttribute('type', htp);
		sauce.setAttribute('src', src);
		this._video.appendChild(dfsrc);

		if(!hls) this._video.load();
		else this._hlsjs.attachMedia(this._video);

		console.log('LOAD', src, hls, htp, avp);
/*
this._hlsjs
		if(src===null) {
			this._sauce.removeAttribute('src');
			this._video.removeAttribute('src');
		} else {
			this._sauce.setAttribute('src', src);
			this._video.setAttribute('src', src);
		}

		if(!hls) {
			this._sauce.removeAttribute('type');
			this._video.load();
		} else if(this._hls_type) {
			this._sauce.setAttribute('type',this._hls_type);
			this._video.load();
		} else {
			this._sauce.setAttribute('type','application/x-mpegURL');
			this._hlsjs.attachMedia(this._video);
		}


		 
*/	
	},
	loadVideo: function(src, autoplay) {
		
		this.stop();

		var dfsrc = document.createDocumentFragment(),
			sauce = document.createElement('source'),
			hls = /\.(m3u8|m3u)($|\?|#)/.test(src),
			avp = autoplay===true;

		console.log('LOAD', hls, src, avp);

		dfsrc.appendChild(sauce = sauce.cloneNode(true));
		if(hls) sauce.setAttribute('type','application/x-mpegURL');
		sauce.setAttribute('src',src);

		if(hls) {
			dfsrc.appendChild(sauce = sauce.cloneNode(true));
			sauce.setAttribute('type','video/mp4');
			sauce.setAttribute('src','http://www.cn.ru/data/files/test/video.mp4');
		}
		
		if(avp) this._video.setAttribute('autoplay','');
		else this._video.removeAttribute('autoplay');
		
		//this._video.setAttribute('src',src);
		this._video.appendChild(dfsrc);
		this._video.load();
	},
	loadHlsjs: function(src, autoplay) {
		if(!Hls.isSupported()) return;
		
		var video = this._video;
		var hls = new Hls();
		//hls.loadSource('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
		hls.loadSource(src);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED,function() {
			video.play();
		});
	}	
});