var DCSSEditor = function(){
	"use strict";

	if(!document.getElementById('dyEditor')){
		InitEditor();
	}else{
		CloseEditor();
		return;
	}
		
	var txtArea = document.getElementById('dyEditor-txtarea');
	var ln = document.getElementById("dyEditor-lineNum");
	
	RefreshLn();
	
	txtArea.onscroll = function () { ln.style.top = -(txtArea.scrollTop) + "px";}
	txtArea.onkeydown = function(ev){ HandleTabKey(ev);}
	txtArea.onkeyup = function(ev){
		
		if(ev.keyCode == 27){ //Esc
			CloseEditor();
			return;
		}
		
		RefreshLn();
		AppendStyleTag();
		ApplyStyleToTag();
		
		chrome.storage.local.get('svCss', function(res){
			if($.inArray('svCss', Object.keys(res)) > -1 && res.svCss == true){
				SaveCSS();
			}
		});
	}
	var supChk = document.getElementById('dyEditor-supChk');
	
	supChk.onclick = function(ev){
		if(supChk.checked == true){
			SuppressCSS();
		}else{
			UnSuppressCSS();
		}
	}
	
	function RefreshLn(){
		var count = txtArea.value.split("\n").length;

		ln.innerHTML = "";
		for (var i=1; i<=count; i++) {
			ln.innerHTML = ln.innerHTML + i + "." + "<br />"; //Append line numbers
		}
		ln.style.top = -(txtArea.scrollTop) + "px";
	}
	
	function SuppressCSS(){
		var tmpLnks = [];
		var stls = document.querySelectorAll('link:not([id="dyEditor-css"])[href][rel="stylesheet"], style:not([id="dyEditor-style"])');
		
		// Create comment copies of page stylesheets & inline css
		for(var i=0; i < stls.length; i++){
			stls[i].setAttribute('id', 'dyEditor-supCss');
			tmpLnks.push(stls[i]);
			var cmt = document.createComment(stls[i].outerHTML);
			stls[i].parentNode.insertBefore(cmt, stls[i]);
		}
		
		// Remove page stylesheets
		for(var i=0; i < tmpLnks.length; i++){
				tmpLnks[i].parentNode.removeChild(tmpLnks[i]);
		}
		
		// Track CSS suppressing in meta data
		var meta = document.createElement('meta');
		meta.setAttribute('name','dyEditor-supCss');
		document.getElementsByTagName('head')[0].appendChild(meta);
	}
	
	function UnSuppressCSS(){
		var html = document.getElementsByTagName('html')[0];
		var tmpNodes =[];
		
		// Retrieve stylesheets from DOM
		for(var i=0; i < html.childNodes.length; i++){
			if(html.childNodes[i].hasChildNodes()){
				GetCommentNodes(html.childNodes[i], tmpNodes);
			}
		}
		
		/* Recreate stylesheets */
		for(var i=0; i < tmpNodes.length; i++){
			//link elements
				
			if(tmpNodes[i].nodeValue.match(/<link/i)){
				var re = /href="((https?|ftp|file)?[\\a-z0-9\/\-_.#:|+&?~%@,;=^]*)"/i;			
				var elm = document.createElement('link');
				var href = tmpNodes[i].nodeValue.match(re)[1];
				elm.setAttribute('href', href);
				elm.setAttribute('rel', 'stylesheet');
				elm.setAttribute('type', 'text/css');
			}
			else //inline styles
			{
				var re = /<style\s*(.*)?\s+id="dyEditor\-supCss">((\s*.*)*)<\/style>/i;
				var elm = document.createElement('style');
				elm.innerText = tmpNodes[i].nodeValue.match(re)[2];
				elm.innerHTML = elm.innerHTML.replace(/<br>/g,'\n');
			}
			tmpNodes[i].parentNode.insertBefore(elm, tmpNodes[i]);
		}
		
		// Remove comments
		for(var i=0; i < tmpNodes.length; i++){
			tmpNodes[i].parentNode.removeChild(tmpNodes[i]);
		}
		
		// Remove CSS suppress meta data
		var metas = document.getElementsByTagName('meta');
		for(var i=0; i<metas.length; i++){
			if(metas[i].getAttribute('name') && metas[i].getAttribute('name') == 'dyEditor-supCss'){
				metas[i].parentNode.removeChild(metas[i]);
				break;
			}
		}
		
	}
	
	function GetCommentNodes(node, tmpNodes){
		var re = /(link|style).*id="dyEditor\-supCss".*/i;
		for(var j=0;j<node.childNodes.length;j++){
			if(node.childNodes[j].nodeType === 1 && node.childNodes[j].hasChildNodes()){
				GetCommentNodes(node.childNodes[j], tmpNodes);
			}else if(node.childNodes[j].nodeType === 8 && node.childNodes[j].nodeValue.match(re)){
				tmpNodes.push(node.childNodes[j]);
			}
		}
	}
	
	function HandleTabKey(ev){ //Tab
	
		if(ev.keyCode == 9){
			ev.preventDefault();
			
			chrome.storage.local.get('tabSp', function (res){
				
				var tab = 2;
				
				if($.inArray('tabSp', Object.keys(res)) > -1){
					tab = res.tabSp;
				}
				
				var tabSp = Array(parseInt(tab)+1).join(" ");
				
				var sS = txtArea.selectionStart;
				var sE = txtArea.selectionEnd;
				var re = /\r?\n/g;
				var txt = txtArea.value;
				var st = txt.substr(0, sS) + tabSp;
				
				// Single-Line Selection
				if(txt.indexOf('\n') == -1 || txt.indexOf('\n') >= sE){
					txtArea.value = st + txt.substr(sS, txt.length);
					txtArea.setSelectionRange(sS + parseInt(tab), sE + parseInt(tab));
				}
				// Multiline Selection
				else{
					var sel = txt.slice(sS, sE);
					var br = (sel.match(re)||[]).length;
					var selEnd = sE + parseInt(tab) + (br*tab); //current selectionEnd + tab + page break tabs

					sel = sel.replace(re, '\n'+tabSp);
					txtArea.value = st+sel+txt.substr(sE, txt.length);
					txtArea.setSelectionRange(sS + parseInt(tab), selEnd);
				}
			});
		}
	}
	
	function AppendStyleTag(){
		if(document.getElementById('dyEditor-style'))
			return;
		
		var style = document.createElement('style');
		style.setAttribute('id', 'dyEditor-style');
		document.getElementsByTagName('head')[0].appendChild(style);
	}
	
	function AppendLink(href){
		var s = Math.floor(Math.floor(Math.random() * (9999 - 1 + 1)) + 1);
		var elm = document.createElement('link');
		
		elm.setAttribute('rel', 'stylesheet');
		elm.setAttribute('href', chrome.extension.getURL(href+'?s='+s));
		elm.setAttribute('id', 'dyEditor-css');
		document.getElementsByTagName('head')[0].appendChild(elm);
	}
	
	function InitEditor(){
	
		if (!document.getElementById('dyEditor-css')) {
			AppendLink('css/font-awesome-4.4.0/css/font-awesome.min.css');
			AppendLink('css/background.css');
		}
		
		//Get co-ordinates of current scroll position
		var y = window.pageYOffset;
		var x = window.pageXOffset;
		
		var edt = document.createElement('div');
		edt.setAttribute('id', 'dyEditor');
		edt.innerHTML += EditorBody();
		document.body.appendChild(edt);
		
		//Check Meta for suppress data
		var metas = document.getElementsByTagName('meta');
		for(var i=0; i<metas.length; i++){
			if(metas[i].getAttribute('name') && metas[i].getAttribute('name') == 'dyEditor-supCss'){
				//metas[i].parentNode.removeChild(metas[i]);
				document.getElementById('dyEditor-supChk').checked = true;
				break;
			}
		}
		
		var edtFm = document.getElementById('dyEditor-frame');
		edtFm.addEventListener('mousedown', Draggable, false);
		var edtClose = document.getElementById('dyEditor-close');
		edtClose.addEventListener('click', CloseEditor, false);
		document.getElementById('dyEditor-txtarea').focus();
		
		window.scrollTo(x, y); //undo scroll caused by editor element
		
		//Retrieve css in style tag from a previous closed editor
		if(document.getElementById('dyEditor-style')){ 
			document.getElementById('dyEditor-txtarea').value = document.getElementById('dyEditor-style').innerText;
		}
		else{
			chrome.storage.local.get('svCss', function(res){
				if($.inArray('svCss', Object.keys(res)) > -1 && res.svCss == true){
					LoadCSS();
				}
			});
		}
	}
	
	function Draggable(ev) {
		$(this).parent().parent().addClass("dyEditor-draggable").parents()
			.on("mousemove", function(e) {
				$(".dyEditor-draggable").offset({
					top: e.pageY - $(".dyEditor-draggable").outerHeight() / 2, 
					left: e.pageX - $(".dyEditor-draggable").outerWidth() / 2
				})
			.on("mouseup", function() {$(this).removeClass("dyEditor-draggable");});});
  }
	
	function EditorBody(){
		return  '<div id="dyEditor-header">'+
								'<div id="dyEditor-frame">'+
									'<h1>'+chrome.i18n.getMessage("extName")+'</h1>'+
								'</div>'+
								'<span><a href="'+chrome.extension.getURL("options.html")+'" target="_blank"><i class="fa fa-gear"></i></a></span>'+
								'<span id="dyEditor-close"><i class="fa fa-close"></i></span>'+
							'</div>'+
						'<div>'+
						'<div id="dyEditor-lnContainer"><div id="dyEditor-lineNum"></div></div>'+
						'<textarea id="dyEditor-txtarea" spellcheck="false" '+
						'placeholder="'+chrome.i18n.getMessage("extPlaceholderTxt")+" "+document.location.origin+'">'+
						'</textarea><div id="dyEditor-chkOpts"><label>'+chrome.i18n.getMessage("extSupLbl")+
						'</label><input id="dyEditor-supChk" type="checkbox"></div></div>';
	}
	
	function CloseEditor(){
		var edt = document.getElementById('dyEditor');
		edt.parentNode.removeChild(edt);
	}
	
	function SaveCSS(){
    chrome.storage.local.get('css', function (res) {
			if($.inArray('css', Object.keys(res)) < 0){
				var css = [];
				var site = {
					'origin': document.location.origin,
					'data': txtArea.value
				};
				css.push(site);
				chrome.storage.local.set({'css': css});

			}else{
			
				var css = res.css;
				var site = res.css.filter(function(obj) {
					return obj.origin == document.location.origin;
				});
				if(site.length > 0){ // Remove from storage if no data is written in editor
					site[0].data = txtArea.value;
					if(site[0].data.length < 1){
						var idx = css.indexOf(site[0]);
						css.splice(idx, 1);
					}
				}else{
					css.push({'origin': document.location.origin, 'data': txtArea.value});
				}
				console.log(css);
				chrome.storage.local.set({'css': css});
			}
		});
	}
	
	function LoadCSS(){
		// Load from chrome storage
		chrome.storage.local.get('css', function(res){
			if($.inArray('css', Object.keys(res)) > -1){
				var site = res.css.filter(function(obj) {
					return obj.origin == document.location.origin;
				});
				if(site.length > 0){
					AppendStyleTag();
					if(site[0].data && site[0].data.length > 0){
						document.getElementById('dyEditor-txtarea').value = site[0].data;
						
						// get line count from new lines char
						var count = (site[0].data).split('\n').length;
						ln.innerHTML = "";
						for (var i=1; i<=count; i++) {
							ln.innerHTML = ln.innerHTML + i + "." + "<br />";
						}
						ApplyStyleToTag();
					}
				}
			}
		});
	}
	
	function ApplyStyleToTag(){
		var tgArea = document.getElementById('dyEditor-style');
		tgArea.innerText = txtArea.value;
		tgArea.innerHTML = tgArea.innerHTML.replace(/<br>/g,'\n');
	}
	
};