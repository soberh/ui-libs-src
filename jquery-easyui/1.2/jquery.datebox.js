/**
 * datebox - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 calendar
 *   validatebox
 * 
 */
(function($){
	function init(target){
		var box = $(target);

		$(document).unbind('.datebox').bind('mousedown.datebox', function(){
			hide(target);
		});
		box.focus(function(){
			show(target);
		}).click(function(){
			show(target);
		});
		
		var calendar = $(
				'<div class="datebox-calendar">' +
					'<div class="datebox-calendar-inner">' +
						'<div></div>' +
					'</div>' +
					'<div class="datebox-button"></div>' +
				'</div>'
		).appendTo('body');
		
		calendar.find('div.datebox-calendar-inner>div').calendar({
			fit:true,
			border:false,
			onSelect:function(date){
				var opts = $.data(target, 'datebox').options;
				var v = opts.formatter(date);
				$(target).val(v);
				calendar.hide();
				opts.onSelect.call(target, date);
			}
		});
		
		calendar.hide().mousedown(function(){
			return false;
		});
		
		return calendar;
	}
	
	function buildButtons(target){
		var opts = $.data(target, 'datebox').options;
		var calendar = $.data(target, 'datebox').calendar;
		var button = calendar.find('div.datebox-button');
		button.empty();
		$('<a href="javascript:void(0)" class="datebox-current"></a>').html(opts.currentText).appendTo(button);
		$('<a href="javascript:void(0)" class="datebox-close"></a>').html(opts.closeText).appendTo(button);
		button.find('.datebox-current,.datebox-close').hover(
			function(){$(this).addClass('datebox-button-hover');},
			function(){$(this).removeClass('datebox-button-hover');}
		);
		button.find('.datebox-current').click(function(){
			calendar.find('div.datebox-calendar-inner>div').calendar({
				year:new Date().getFullYear(),
				month:new Date().getMonth()+1,
				current:new Date()
			});
		});
		button.find('.datebox-close').click(function(){
			calendar.hide();
		});
	}
	
	function show(target){
		var opts = $.data(target, 'datebox').options;
		var calendar = $.data(target, 'datebox').calendar;
		calendar.css({
			display:'block',
			left:$(target).offset().left,
			top:$(target).offset().top+$(target).outerHeight()
		});
		var current = opts.parser($(target).val());
		calendar.find('div.datebox-calendar-inner>div').calendar({
			year:current.getFullYear(),
			month:current.getMonth()+1,
			current:current
		});
		if ($.fn.window){
			calendar.css('z-index', $.fn.window.defaults.zIndex++);
		}
	}
	
	function hide(target){
		var calendar = $.data(target, 'datebox').calendar;
		calendar.hide();
	}
	
	function validate(target){
		if ($.fn.validatebox){
			var opts = $.data(target, 'datebox').options;
			$(target).validatebox(opts);
		}
	}
	
	$.fn.datebox = function(options){
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'datebox');
			if (state){
				$.extend(state.options, options);
			} else {
				var calendar = init(this);
				var t = $(this);
				$.data(this, 'datebox', {
					options:$.extend({}, $.fn.datebox.defaults, {
						required: (t.attr('required') ? (t.attr('required') == 'true' || t.attr('required') == true) : undefined),
						missingMessage: (t.attr('missingMessage') || undefined)
					}, options),
					calendar:calendar
				});
			}
			
			buildButtons(this);
			validate(this);
		});
	};
	
	$.fn.datebox.defaults = {
		currentText:'Today',
		closeText:'Close',
		
		required: false,
		missingMessage: 'This field is required.',
		
		formatter:function(date){
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			var d = date.getDate();
			return m+'/'+d+'/'+y;
//			return y+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
		},
		parser:function(s){
			var t = Date.parse(s);
			if (!isNaN(t)){
				return new Date(t);
			} else {
				return new Date();
			}
		},
		
		onSelect:function(date){}
	};
})(jQuery);