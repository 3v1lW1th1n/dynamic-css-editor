(function () {
  "use strict";
	
	// Called when the user clicks on the browser action.
	chrome.browserAction.onClicked.addListener(function(tab) {
		
		if(tab.url.match(/chrome:\/\/|:\/\/chrome/g)){
			alert(chrome.i18n.getMessage('extChromeURLError'));
			return;
		}
	
		chrome.tabs.executeScript(null, {file: "js/jquery-1.11.3.min.js"}, function(){
			chrome.tabs.executeScript(null, {file: "js/editor.js"}, function(){
				chrome.tabs.executeScript(null, {code: "DCSSEditor()"});
			});
		});
	  
	});

}());