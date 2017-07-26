var modTitlebar = extendModule({
	initialize: function(node_id) {
		//console.log('modTitlebar initialize',node_id);
		this.node = document.getElementById(node_id);
		this._vtime = this.node.querySelector('time');
		this._cname = this.node.querySelector('div > b');
		this._tname = this.node.querySelector('div > u');
		this._image = this.node.querySelector('div > i > img');
		this.listen('channelView',this.onChannelView.bind(this));
		this.listen('telecastView',this.onTelecastView.bind(this));
		
		//this._vtime.innerText = cnapi.timezone;
	},
	onTelecastView: function(event) {
		var id = event.detail.id,
			tvs = $App.getTelecastById(id);
		//console.log('onTelecastView',id,tvs.title);
		this._tname.innerText = tvs.time.format('dd mmmm h:nn') + ' \u2014 ' +tvs.title;
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = $App.getChannelById(cid);
		//console.log('onChannelView',cid);

		this._image.setAttribute('src',cha.image);
		this._cname.innerText = cha.title;
	}
});