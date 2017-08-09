var modTvplayer = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		this._ntype = this.node.querySelector('i');
		this._video = this.node.querySelector('video');
		this._sauce = this.node.querySelector('video > source[type="application/x-mpegURL"]');
		this._hlsPlayType = this.hlsPlayType(this._video);
		this._hlsjs = this.attachHlsjs(this._video);
		
		//console.log('modTvplayer initialize');
		this._ntype.innerText = this._hlsjs ? 'hlsjs' : (this._hlsPlayType || 'video');
		
		//this.onTelecastView({detail:{id:100435894}});
	},
	attachHlsjs: function(video) {

		if(this._hlsPlayType) return null;
		else if(!window.Hls || !Hls.isSupported()) return null;

		var hlsjs = new Hls({});
		hlsjs.on(Hls.Events.MEDIA_ATTACHED,function(event,data){
			var src = this._sauce.getAttribute('src');
				video = data.media;
			//console.log('attach', src);
		}.bind(this));
		hlsjs.on(Hls.Events.MEDIA_DETACHED,function(event,data){
			//console.log('detach');this._video.load();
		}.bind(this));
		video.className = 'hlsjs';
		return hlsjs;
	},
	onChannelView: function(event) {
		var id = event.detail.channelId,
			cha = $App.getChannelById(id);

		this.play(cha.stream);
		//console.log('onChannelView',cha);
	},
	onTelecastView: function(event) {
		var id = event.detail.id,
			tvs = $App.getTelecastById(id);
		
		console.log('onTelecastView', id, tvs.files);
		//console.log('onTelecastView', tvs);
		if(tvs.files) this.loadTelecast(id);
		else cnapi.request.sauce(id,this.loadTelecast.bind(this,id));
	},
	loadTelecast: function(id) {
		var tvs = $App.getTelecastById(id),
			cha = $App.getChannelById(tvs.channel),
			live = (typeof(tvs.getProgress())!='boolean');
		
		console.log('loadTelecast',tvs.getProgress());
		
		if(live) {
			this._video.setAttribute('poster', tvs.poster);
			this._video.setAttribute('controls','');
			this.play(cha.stream);
		}
		else if(tvs.files) {
			this._video.setAttribute('poster', tvs.poster);
			this._video.setAttribute('controls','');
			this.play(tvs.files[0].uri);
		} else {
			this.stop();
			this._video.setAttribute('poster', tvs.poster);
			this._video.removeAttribute('controls');
		}
		//else console.log(tvs);
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

		if(this._hlsjs) {
			this._hlsjs.stopLoad();
			this._hlsjs.detachMedia(this._video);
		}

		this._video.pause();
		this._video.currentTime = 0;
		this._video.removeAttribute('src');
		this._video.removeAttribute('poster');
		this._video.removeAttribute('autoplay');
		this._sauce.removeAttribute('type');
		this._sauce.removeAttribute('src');
		
		//var so = Array.prototype.slice.call(this._video.querySelectorAll('source'));
		//while(so.length) this._video.removeChild(so.pop());

	},
	play: function(src) {

		this.load(src, true);

	},
	load: function(src, autoplay) {

		this.stop();
		if(autoplay===true) this._video.setAttribute('autoplay','');
		else this._video.removeAttribute('autoplay');

		var hls = /\.(m3u8|m3u)($|\?|#)/.test(src),
			hpt = this._hlsPlayType;

		this._sauce.setAttribute('src',src);
		if(hls && hpt) this._sauce.setAttribute('type', hpt);
		else this._sauce.removeAttribute('type');

		if(!hls || !this._hlsjs) this._video.load();
		else setTimeout(function(){
			this._hlsjs.loadSource(src);
			this._hlsjs.attachMedia(this._video);
		}.bind(this),250);
	}	
});