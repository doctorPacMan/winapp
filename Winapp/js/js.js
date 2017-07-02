var myApp = {
	load: function() {

		console.log('myAppLoad');
		cnapi.whereami(this.onload.bind(this));

	},
	onload: function(json) {
		console.log(json);
		var resp = document.getElementById('resp'),
			prov = json.contractor,
			terr = json.territories[0];

		resp.innerText = '['+prov.contractorId+']'+prov.name;
		resp.innerText+=' ['+terr.territoryId+']'+terr.name;
		
		cnapi.channels(this.onloadChannels.bind(this));

	},
	onloadChannels: function(data) {
		var re = new RegExp('^cam_'),
			list = data.channels;
		for(var j=0,cha; j<list.length; j++) {
			cha = list[j];
			if(cha.hasSchedule!=1) continue;
			else if(!re.test(cha.alias)) continue;
			else if(cha.ageRestriction===undefined) continue;
			console.log(cha.hasSchedule, cha.ageRestriction, cha.alias);
		}
	}
};