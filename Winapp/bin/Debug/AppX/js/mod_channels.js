var modChannels = extendModule({
	initialize: function(node_id, channels) {
		
//console.log('modChannels initialize');
		
		this.name = 'modChannels';
		this.node = document.getElementById(node_id);
		this.list = this.node.getElementsByTagName('ol')[0];
		this._channels = {};
		this._current = false;

		this.listen('channelView',this.onChannelView.bind(this));
//		console.log('MC init', this.node);

		var cb = this.node.querySelectorAll('a.chatile');
		for(var i=0;i<cb.length;i++) {
			//cb[i].onclick = this.clickChannel.bind(this,cb[i]);
			cb[i].onclick = function(e){console.log(e)};
		}

	},
	update: function(channels) {

		var df = document.createDocumentFragment(),
			li = document.createElement('li'),
			ch, ct;

		for(var cid in channels) {
			ch = channels[cid];
			ct = ch.getTile();
			li = li.cloneNode(false);
			li.appendChild(ct);
			df.appendChild(li);
			ct.onclick = this.onChannelClick.bind(this,cid);
			this._channels[cid] = li;
		}
		this.list.appendChild(df);
//		console.log('MCupdate',channels[34498202]);
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = $App.getChannelById(cid);
		
		if(this._current) this._channels[this._current].classList.remove('st-view');
		
		this._channels[cid].classList.add('st-view');
		this._current = cid;

		console.log('onChannelView',cha);
	},
	onChannelClick: function(cid, event) {
		if(event) event.preventDefault();
		this.fire('channelView',{channelId:cid});
	}
});