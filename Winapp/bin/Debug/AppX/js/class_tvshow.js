var TvShow = function(){return this.initialize.apply(this,arguments)};
TvShow.prototype = {
	initialize: function(json) {
		for(var k in json) this[k] = json[k];
		this.channel = json.channel.channelId;
		
		var img = json.telecastImages ? json.telecastImages[0] : null,
			d = json.date;
		this.time = new Date(d.year, d.month-1, d.day, d.hour, d.minute);
		this.ends = new Date(this.time.getTime() + 1000*json.duration);
		this.image = img ? img.location : null;
		this.sauce = null;
		this._data = json;

		//var day = new Date(this.time);
		//if(day.getHours()<6) day.setHours(-18,0,0,0);
		//else day.setHours(6,0,0,0);
		//this.scheduleDate = day;//.format('yyyy-mm-dd');

		//console.log(json);
	},
	getNodeList: function() {
		var node = document.createElement('a'),
			name = document.createElement('span'),
			time = document.createElement('time');
			
		time.setAttribute('datetime',this.time.getHtmlTime());
		time.innerText = this.time.format('h:nn');
		name.innerText = this.title;

		node.appendChild(time);
		node.appendChild(name);
		return node;
	}
};