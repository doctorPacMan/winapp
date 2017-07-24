var TvChannel = function(){return this.initialize.apply(this,arguments)};
TvChannel.prototype = {
	initialize: function(json) {
		//console.log(json);
		this.id = json.id;
		this.title = json.title;
		this.sauce = json.src;
		this.image = json.logo;
		this.alias = json.alias;
		this._data = Object.assign({},json);
	},
	getTile: function() {
		var tile = document.createElement('a'),
			name = document.createElement('u'),
			logo = document.createElement('i'),
			cimg = document.createElement('img');
		
		name.innerText = this.title;
		cimg.setAttribute('src',this.image||'./img/logo150x150.png');
		logo.appendChild(cimg);

		tile.className = 'chatile';
		tile.setAttribute('data-cid',this.id);
		tile.setAttribute('href', this.sauce);
		tile.appendChild(logo);
		tile.appendChild(name);
		return tile;
	}
};