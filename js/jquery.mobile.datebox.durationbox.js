/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notification.
 * https://github.com/jtsage/jquery-mobile-datebox
 */
 /* DurationBox Mode */

(function($) {
	$.extend( $.mobile.datebox.prototype.options, {
		themeButton: 'a',
		themeInput: 'e',
		useSetButton: true,
		durationSteppers: {'d': 1, 'h': 1, 'i': 1, 's': 1}
	});
	$.extend( $.mobile.datebox.prototype, {
		_durbox_valid: function (num) {
			if ( num.toString().search(/^[0-9]+$/) === 0 ) { return parseInt(num,10); }
			return 0;
		},
		_durbox_enter: function (item) {
			var w = this,
				t = w.initDate.getEpoch();
				
			w.d.intHTML.find('input').each( function() {
				switch ( $(this).parent().jqmData('field') ) {
					case 'd':
						t += (60*60*24) * w._durbox_valid($(this).val()); break;
					case 'h':
						t += (60*60) * w._durbox_valid($(this).val()); break;
					case 'i':
						t += (60) * w._durbox_valid($(this).val()); break;
					case 's':
						t += w._durbox_valid($(this).val()); break;
				}
			});
			w.theDate.setTime( t * 1000 );
			w.refresh();
		}
	});
	$.extend( $.mobile.datebox.prototype._build, {
		'durationbox': function () {
			var w = this,
				o = this.options, i, y, cDur = [0,0,0,0],
				ival = {'d': 60*60*24, 'h': 60*60, 'i': 60},
				uid = 'ui-datebox-',
				divBase = $("<div>", { "class":uid+'scontrols' }),
				divPlus = divBase.clone(),
				divIn = divBase.clone(),
				divMinus = divBase.clone(),
				inBase = $("<input type='"+w.inputType+"' />").addClass('ui-input-text ui-corner-all ui-shadow-inset ui-body-'+o.themeInput),
				butBase = $("<div><a href='#'></a></div>"),
				butPTheme = {theme: o.themeButton, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true},
				butMTheme = $.extend({}, butPTheme, {icon: 'minus', iconpos: 'top'});
			
			if ( typeof w.d.intHTML !== 'boolean' ) {
				w.d.intHTML.empty();
			}
			
			w.d.headerText = ((w._grabLabel() !== false)?w._grabLabel():w.__('titleDateDialogLabel'));
			w.d.intHTML = $('<span>');
			
			w.fldOrder = w.__('durationOrder');
			
			for(i=0; i<=w.fldOrder.length; i++) {
				switch (w.fldOrder[i]) {
					case 'd':
					case 'h':
					case 'i':
					case 's':
						y = $.inArray(w.fldOrder[i], ['d','h','i','s']);
						$('<div>', {'class': uid+'sinput'}).jqmData('field', w.fldOrder[i]).append(inBase.clone()).appendTo(divIn).prepend('<label>'+w.__('durationLabel')[y]+'</label>');
						w._makeEl(butBase, {'attr': {'field':w.fldOrder[i]}}).buttonMarkup(butPTheme).appendTo(divPlus);
						w._makeEl(butBase, {'attr': {'field':w.fldOrder[i]}}).buttonMarkup(butMTheme).appendTo(divMinus);
						break;
				}
			}
			
			i = w.theDate.getEpoch() - w.initDate.getEpoch();
			if ( i<0 ) { i = 0; w.theDate.setTime(w.initDate.getTime()); }
			w.lastDuration = i; // Let the number of seconds be sort of public.
			
			// DAYS 
			cDur[0] = parseInt( i / ival.d,10); i = i % ival.d;
			// HOURS 
			cDur[1] = parseInt( i / ival.h, 10); i = i % ival.h;
			// MINS AND SECS 
			cDur[2] = parseInt( i / ival.i, 10);
			cDur[3] = i % ival.i;
			
			divIn.find('input').each(function () {
				switch ( $(this).parent().jqmData('field') ) {
					case 'd':
						$(this).val(cDur[0]); break;
					case 'h':
						$(this).val(cDur[1]); break;
					case 'i':
						$(this).val(cDur[2]); break;
					case 's':
						$(this).val(cDur[3]); break;
				}
			});
			
			divPlus.appendTo(w.d.intHTML);
			divIn.appendTo(w.d.intHTML);
			divMinus.appendTo(w.d.intHTML);
			
			if ( o.useSetButton || o.useClearButton ) {
				y = $('<div>', {'class':uid+'controls'});
				
				if ( o.useSetButton ) {
					$('<a href="#">'+((o.mode==='datebox')?w.__('setDateButtonLabel'):w.__('setTimeButtonLabel'))+'</a>')
						.appendTo(y).buttonMarkup({theme: o.theme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
						.on(o.clickEvent, function(e) {
							e.preventDefault();
							w.d.input.trigger('datebox', {'method':'set', 'value':w._formatter(w.__fmt(),w.theDate), 'date':w.theDate});
							w.d.input.trigger('datebox', {'method':'close'});
						});
				}
				if ( o.useClearButton ) {
					$('<a href="#">'+w.__('clearButton')+'</a>')
						.appendTo(y).buttonMarkup({theme: o.theme, icon: 'delete', iconpos: 'left', corners:true, shadow:true})
						.on(o.clickEvent, function(e) {
							e.preventDefault();
							w.d.input.val('');
							w.d.input.trigger('datebox',{'method':'clear'});
							w.d.input.trigger('datebox',{'method':'close'});
						});
				}
				if ( o.useCollapsedBut ) {
					y.addClass('ui-datebox-collapse');
				}
				y.appendTo(w.d.intHTML);
			}
			
			
			divPlus.on(o.clickEvent, 'div', function(e) {
				e.preventDefault();
				w._offset($(this).jqmData('field'), o.durationSteppers[$(this).jqmData('field')]);
			});
			divMinus.on(o.clickEvent, 'div', function(e) {
				e.preventDefault();
				w._offset($(this).jqmData('field'), o.durationSteppers[$(this).jqmData('field')]*-1);
			});
			
			divIn.on('change', 'input', function() { w._durbox_enter($(this)); });
					
			if ( w.wheelExists ) { // Mousewheel operation, if plugin is loaded
				divIn.on('mousewheel', 'input', function(e,d) {
					e.preventDefault();
					w._offset($(this).parent().jqmData('field'), ((d<0)?-1:1)*o.durationSteppers[$(this).parent().jqmData('field')]);
				});
			}
			
			/*if ( o.swipeEnabled ) { // Drag and drop support
				divIn.delegate('input', self.START_DRAG, function(e) {
					if ( !self.dragMove ) {
						self.dragMove = true;
						self.dragTarget = $(this).jqmData('field');
						self.dragPos = 0;
						self.dragStart = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						self.dragEnd = false;
						e.stopPropagation();
					}
				});
			}*/
			
		}
	});
})( jQuery );
