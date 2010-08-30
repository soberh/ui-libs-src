/**
 * easyloader - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 */
(function(){
	var modules = {
		draggable:{
			js:'jquery.draggable.js'
		},
		droppable:{
			js:'jquery.droppable.js'
		},
		resizable:{
			js:'jquery.resizable.js'
		},
		linkbutton:{
			js:'jquery.linkbutton.js',
			css:'linkbutton.css'
		},
		pagination:{
			js:'jquery.pagination.js',
			css:'pagination.css',
			dependencies:['linkbutton']
		},
		datagrid:{
			js:'jquery.datagrid.js',
			css:'datagrid.css',
			dependencies:['panel','resizable','linkbutton','pagination']
		},
		panel: {
			js:'jquery.panel.js',
			css:'panel.css'
		},
		window:{
			js:'jquery.window.js',
			css:'window.css',
			dependencies:['resizable','draggable','panel']
		},
		dialog:{
			js:'jquery.dialog.js',
			css:'dialog.css',
			dependencies:['window']
		},
		messager:{
			js:'jquery.messager.js',
			css:'messager.css',
			dependencies:['linkbutton','window']
		},
		layout:{
			js:'jquery.layout.js',
			css:'layout.css',
			dependencies:['resizable','panel']
		},
		form:{
			js:'jquery.form.js'
		},
		menu:{
			js:'jquery.menu.js',
			css:'menu.css'
		},
		tabs:{
			js:'jquery.tabs.js',
			css:'tabs.css',
			dependencies:['panel']
		},
		splitbutton:{
			js:'jquery.splitbutton.js',
			css:'splitbutton.css',
			dependencies:['linkbutton','menu']
		},
		menubutton:{
			js:'jquery.menubutton.js',
			css:'menubutton.css',
			dependencies:['linkbutton','menu']
		},
		accordion:{
			js:'jquery.accordion.js',
			css:'accordion.css',
			dependencies:['panel']
		},
		calendar:{
			js:'jquery.calendar.js',
			css:'calendar.css'
		},
		combobox:{
			js:'jquery.combobox.js',
			css:'combobox.css',
			dependencies:['validatebox']
		},
		combotree:{
			js:'jquery.combotree.js',
			css:'combotree.css',
			dependencies:['tree','validatebox']
		},
		validatebox:{
			js:'jquery.validatebox.js',
			css:'validatebox.css'
		},
		numberbox:{
			js:'jquery.numberbox.js',
			dependencies:['validatebox']
		},
		tree:{
			js:'jquery.tree.js',
			css:'tree.css'
		},
		datebox:{
			js:'jquery.datebox.js',
			css:'datebox.css',
			dependencies:['calendar']
		},
		parser:{
			js:'jquery.parser.js'
		}
	};
	
	var locales = {
		'af':'easyui-lang-af.js',
		'bg':'easyui-lang-bg.js',
		'ca':'easyui-lang-ca.js',
		'cs':'easyui-lang-cs.js',
		'da':'easyui-lang-da.js',
		'de':'easyui-lang-de.js',
		'en':'easyui-lang-en.js',
		'fr':'easyui-lang-fr.js',
		'nl':'easyui-lang-nl.js',
		'zh_CN':'easyui-lang-zh_CN.js',
		'zh_TW':'easyui-lang-zh_TW.js'
	};
	
	var queues = {};
	
	function loadJs(url, callback){
		var done = false;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.language = 'javascript';
		script.src = url;
		script.onload = script.onreadystatechange = function(){
			if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
				done = true;
				script.onload = script.onreadystatechange = null;
				if (callback){
					callback.call(script);
				}
			}
		}
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	function runJs(url, callback){
		loadJs(url, function(){
			document.getElementsByTagName("head")[0].removeChild(this);
			if (callback){
				callback();
			}
		});
	}
	
	function loadCss(url, callback){
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.media = 'screen';
		link.href = url;
		document.getElementsByTagName('head')[0].appendChild(link);
		if (callback){
			callback.call(link);
		}
	}
	
	function loadSingle(name){
		queues[name] = 'loading';
		
		var module = modules[name];
		var jsStatus = 'loading';
		var cssStatus = (easyloader.css && module['css']) ? 'loading' : 'loaded';
		
		if (easyloader.css && module['css']){
			if (/^http/i.test(module['css'])){
				var url = module['css'];
			} else {
				var url = easyloader.base + 'themes/' + easyloader.theme + '/' + module['css'];
			}
			loadCss(url, function(){
				cssStatus = 'loaded';
				if (jsStatus == 'loaded' && cssStatus == 'loaded'){
					finish();
				}
			});
		}
		
		if (/^http/i.test(module['js'])){
			var url = module['js'];
		} else {
			var url = easyloader.base + 'plugins/' + module['js'];
		}
		loadJs(url, function(){
			jsStatus = 'loaded';
			if (jsStatus == 'loaded' && cssStatus == 'loaded'){
				finish();
			}
		});
		
		function finish(){
			queues[name] = 'loaded';
			easyloader.onProgress(name);
		}
	}
	
	function loadModule(name, callback){
		var p = [];
		var doLoad = false;
		
		if (typeof name == 'string'){
			add(name);
		} else {
			for(var i=0; i<name.length; i++){
				add(name[i]);
			}
		}
		
		function add(name){
			if (!modules[name]) return;
			
			var d = modules[name]['dependencies'];
			if (d){
				for(var i=0; i<d.length; i++){
					add(d[i]);
				}
			}
			p.push(name);
			if (!queues[name]){
				loadSingle(name);
				doLoad = true;
			}
		}
		function finish(){
			if (callback){
				callback();
			}
			easyloader.onLoad(name);
		}
		
		var time = 0;
		(function(){
			var b = true;
			for(var i=0; i<p.length; i++){
				if (queues[p[i]] == 'loading'){
					b = false;
					break;
				}
			}
			if (b == true){
				if (easyloader.locale && doLoad == true && locales[easyloader.locale]){
					var url = easyloader.base + 'locale/' + locales[easyloader.locale];
					runJs(url, function(){
						finish();
					});
				} else {
					finish();
				}
			} else {
				if (time < easyloader.timeout){
					time += 10;
					setTimeout(arguments.callee, 10);
				}
			}
		})();
	}
	
	easyloader = {
		modules:modules,
		locales:locales,
		
		base:'.',
		theme:'default',
		css:true,
		locale:null,
		timeout:2000,
	
		load: function(name, callback){
			if (/\.css$/i.test(name)){
				if (/^http/i.test(name)){
					loadCss(name, callback);
				} else {
					loadCss(easyloader.base + name, callback);
				}
			} else if (/\.js$/i.test(name)){
				if (/^http/i.test(name)){
					loadJs(name, callback);
				} else {
					loadJs(easyloader.base + name, callback);
				}
			} else {
				loadModule(name, callback);
			}
		},
		
		onProgress: function(name){},
		onLoad: function(name){}
	};

	var scripts = document.getElementsByTagName('script');
	for(var i=0; i<scripts.length; i++){
		var src = scripts[i].src;
		if (!src) continue;
		var m = src.match(/easyloader\.js(\W|$)/i);
		if (m){
			easyloader.base = src.substring(0, m.index);
			
//			var base = src.substring(0, m.index);
//			var index = base.length-2;
//			while(base.substring(index, index+1) != '/') index--;
//			easyloader.base = base.substring(0, index+1);
		}
	}

	window.using = easyloader.load;
	
	if (window.jQuery){
		jQuery(function(){
			easyloader.load('parser');
		});
	}
	
})();