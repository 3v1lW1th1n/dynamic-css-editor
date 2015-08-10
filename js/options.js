document.addEventListener("DOMContentLoaded", function(ev) {
	document.getElementsByTagName('title')[0].innerText = chrome.i18n.getMessage('extOptTitle');
	document.getElementsByTagName('h1')[0].innerText = chrome.i18n.getMessage('extOptTitle');
	document.getElementById('tablbl').innerText = chrome.i18n.getMessage('extTabSpaceLbl');
	document.getElementById('save').value = chrome.i18n.getMessage('extOptSave');
	
	var tab = document.getElementById('tab');
	var saveBtn = document.getElementById('save');
	
	chrome.storage.local.get('tabSp', function (res) { // Retrieve tab spacing data from chrome.storage
		
		inArray('tabSp', Object.keys(res))? tab.value = res.tabSp : tab.value = 2;
		
	});
	tab.addEventListener("focusout", function(){if(tab.value.length < 1 || tab.value < 2){ tab.value = 2;}}, false);
	saveBtn.addEventListener('click', save, false);
});

function save()
{
    var tabSp = document.getElementById('tab').value;
    chrome.storage.local.set({'tabSp': tabSp}, function(){
			alert('Options saved!');
		});
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}