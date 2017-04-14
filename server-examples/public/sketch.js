var responseDiv;

function setup() {
	noCanvas();
	// make 10 buttons with random levels for brightness and fade:
	for (var b=0; b<10; b++){
		var thisButton = createButton('cue ' + b);	// make a new button
		var light = 5;															// set your light number
		var level = Math.round(random(255));				// random level
		var time = Math.round(random(100));					// random fade time
		thisButton.id(light + '/' +level + '/' + time); // pur params in button id
		thisButton.touchEnded(runCue);							// set callback
	}
	responseDiv = createDiv('');									// make response div
	responseDiv.position(30, 30);
}

function showResult(data) {
	responseDiv.html(data);
}

function runCue() {
	var parameters = this.id();
	responseDiv.html(parameters);
	httpGet('/setLight/' + parameters, 'text', showResult);
	console.log(parameters);
}
