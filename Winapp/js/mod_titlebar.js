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

		var vtime = this._vtime;
		vtime.innerText = new Date.server().format('h:nn');
		setInterval(function(){vtime.innerText = new Date.server().format('h:nn')},15000);
	},
	onTelecastView: function(event) {
		var id = event.detail.id,
			tvs = $App.getTelecastById(id);
		//console.log('onTelecastView', id, tvs);
		if(!tvs) this._tname.innerText = '';
		else this._tname.innerText = tvs.time.format('dd mmmm h:nn') + ' \u2014 ' +tvs.title;
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = $App.getChannelById(cid),
			tvs = $App.getTelecastById(cha.currentTelecast);
		//console.log('onChannelView',cha);

		this._image.setAttribute('src',cha.logo);
		this._cname.innerText = cha.title;
		this._tname.innerText = '';

		var tname = this._tname,
			tview = this.onTelecastView.bind(this);
		if(cha.cid) {
			cnapi.request.current(cha.cid, function(id){
				tview({detail:{id:id}});
			});
		} else this._tname.innerText = 'unknown telecast';

	}
});