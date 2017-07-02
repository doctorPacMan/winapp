var myApp = {
	token: '00954bafe0c6182bb730d240f5147dd8',
	ajax: function(url,onComplete) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function () {
			//if(xhr.readyState==4) console.log(xhr.status);
			if(xhr.readyState != 4) return;
			
			if(xhr.status != 200) onComplete(null, xhr);
			else {
				var json = JSON.parse(xhr.responseText);
				onComplete(json, xhr);
			}
		};
		xhr.send(null);
	},
	load: function() {

		console.log('myAppLoad');
		this.ajax('http://api.peers.tv/registry/2/whereami.json',this.onload.bind(this));

	},
	onload: function(json) {
		console.log(json);
		var resp = document.getElementById('resp'),
			prov = json.contractor,
			terr = json.territories[0];

		resp.innerText = '['+prov.contractorId+']'+prov.name;
		resp.innerText+=' ['+terr.territoryId+']'+terr.name;
	}
};