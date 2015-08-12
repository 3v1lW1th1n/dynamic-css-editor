document.addEventListener("DOMContentLoaded", function(ev) {
	document.getElementsByTagName('title')[0].innerText = chrome.i18n.getMessage('extOptTitle');
	document.getElementsByTagName('h1')[0].innerText = chrome.i18n.getMessage('extOptTitle');
	document.getElementById('lblTab').innerText = chrome.i18n.getMessage('extTabSpaceLbl');
	document.getElementById('save').value = chrome.i18n.getMessage('extOptSave');
	document.getElementById('lblChkSvCss').innerText = chrome.i18n.getMessage('extChkSvCssLbl');
	
	var tab = document.getElementById('tab');
	var chkSaveCss = document.getElementById('chkSaveCss');
	var saveBtn = document.getElementById('save');
	
	GetStorage();
	
	tab.addEventListener("focusout", function(){ if(tab.value.length < 1 || tab.value < 2){ tab.value = 2;}}, false);
	saveBtn.addEventListener('click', Save, false);
});

function Save(){
  var tabSp = document.getElementById('tab').value;
  chrome.storage.local.set({'tabSp': tabSp});
	document.getElementById('chkSaveCss').checked == true ? 
		chrome.storage.local.set({'svCss': true}): chrome.storage.local.set({'svCss': false});
	
	GetStorage();
	
	alert('Options saved!');
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function GetStorage(){ // Retrieve data from chrome.storage and apply to fields

	chrome.storage.local.get('tabSp', function (res) { 
		inArray('tabSp', Object.keys(res))? tab.value = res.tabSp : tab.value = 2;
	});
	chrome.storage.local.get('svCss', function (res) {
		inArray('svCss', Object.keys(res))? chkSaveCss.checked = res.svCss : res.svCss = false;
	});
}