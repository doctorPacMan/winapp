var myApp = {
    load: function () {

        console.log('myAppLoad');

        var wrp = document.getElementById('resp'),
            xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://cherio.io/ajax/', true);
        xhr.onreadystatechange = function () {
            console.log(xhr.readyState, xhr.status);
            if (xhr.readyState != 4) return;
            if (xhr.status == 200) {
                var rtxt = xhr.responseText,
                    json = JSON.parse(rtxt);
                console.log(json);
                wrp.childNodes[0].nodeValue = json.date;
            } else {
                console.log('XHR Error' + xhr.status);
            }
        };
        xhr.send(null);
    }
};