var modTitlebar = extendModule({
	initialize: function(node_id) {
		console.log('modTitlebar initialize');
		this.node = document.getElementById(node_id);
		this.listen('channelView',this.onChannelView.bind(this));
	},
	onChannelView: function(event) {
		var cid = event.detail.channelId,
			cha = myApp.getChannelById(cid);
		console.log('onChannelView',cid);
	}
});