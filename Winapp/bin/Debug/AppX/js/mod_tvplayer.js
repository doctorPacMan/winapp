var modTvplayer = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		console.log('modTvplayer initialize', this.node);

		this._video = this.node.querySelector('video');

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
	stop: function() {

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
	load: function(src, autoplay) {
		if(!Hls.isSupported()) return;
		
		var video = this._video;
		var hls = new Hls();
		hls.loadSource('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED,function() {
			video.play();
		});
	}	
});