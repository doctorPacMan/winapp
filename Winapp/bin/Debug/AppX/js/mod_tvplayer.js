var modTvplayer = extendModule({
	initialize: function(node_id) {
		this.node = document.getElementById(node_id);
		this.listen('telecastView',this.onTelecastView.bind(this));
		this.listen('channelView',this.onChannelView.bind(this));
		
		console.log('modTvplayer initialize', this.node);

		this._video = this.node.querySelector('video');

		this.onTelecastView({detail:{id:100435894}});
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = $App.getChannelById(cid);
		
		this.play(cha.sauce);

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
		this.load([[{uri:src}]]);
		this._video.play();
	},
	load: function(files) {
		
		this.stop();
		
		var part0 = files[0] || [];
		console.log('PLAY', files, part0);

		var first = false,
			dfsrc = document.createDocumentFragment(),
			sauce = document.createElement('source');
		sauce.setAttribute('type','application/x-mpegURL');

		part0.forEach(function(p){
			dfsrc.appendChild(sauce = sauce.cloneNode(true));
			sauce.setAttribute('src',p.uri);
			//dfsrc.appendChild(sauce);
			console.log('sauce',p.uri);
			if(!first) first = p.uri;
		});
		
		if(1) {
			sauce = sauce.cloneNode(true);
			sauce.setAttribute('type','video/mp4');
			sauce.setAttribute('src','http://www.cn.ru/data/files/test/adv/banner0.mp4');
			dfsrc.appendChild(sauce);
			first = false;
		}
		//if(first) this._video.setAttribute('src',first);
		this._video.appendChild(dfsrc);
		this._video.load();
	}
});