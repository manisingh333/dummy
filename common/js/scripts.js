/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );

/*! Magnific Popup - v0.9.9 - 2014-09-06
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2014 Dmitry Semenov; */
;(function($) {

/*>>core*/
/**
 * 
 * Magnific Popup Core JS file
 * 
 */


/**
 * Private static constants
 */
var CLOSE_EVENT = 'Close',
	BEFORE_CLOSE_EVENT = 'BeforeClose',
	AFTER_CLOSE_EVENT = 'AfterClose',
	BEFORE_APPEND_EVENT = 'BeforeAppend',
	MARKUP_PARSE_EVENT = 'MarkupParse',
	OPEN_EVENT = 'Open',
	CHANGE_EVENT = 'Change',
	NS = 'mfp',
	EVENT_NS = '.' + NS,
	READY_CLASS = 'mfp-ready',
	REMOVING_CLASS = 'mfp-removing',
	PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


/**
 * Private vars 
 */
var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
	MagnificPopup = function(){},
	_isJQ = !!(window.jQuery),
	_prevStatus,
	_window = $(window),
	_body,
	_document,
	_prevContentType,
	_wrapClasses,
	_currPopupType;


/**
 * Private functions
 */
var _mfpOn = function(name, f) {
		mfp.ev.on(NS + name + EVENT_NS, f);
	},
	_getEl = function(className, appendTo, html, raw) {
		var el = document.createElement('div');
		el.className = 'mfp-'+className;
		if(html) {
			el.innerHTML = html;
		}
		if(!raw) {
			el = $(el);
			if(appendTo) {
				el.appendTo(appendTo);
			}
		} else if(appendTo) {
			appendTo.appendChild(el);
		}
		return el;
	},
	_mfpTrigger = function(e, data) {
		mfp.ev.triggerHandler(NS + e, data);

		if(mfp.st.callbacks) {
			// converts "mfpEventName" to "eventName" callback and triggers it if it's present
			e = e.charAt(0).toLowerCase() + e.slice(1);
			if(mfp.st.callbacks[e]) {
				mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
			}
		}
	},
	_getCloseBtn = function(type) {
		if(type !== _currPopupType || !mfp.currTemplate.closeBtn) {
			mfp.currTemplate.closeBtn = $( mfp.st.closeMarkup.replace('%title%', mfp.st.tClose ) );
			_currPopupType = type;
		}
		return mfp.currTemplate.closeBtn;
	},
	// Initialize Magnific Popup only when called at least once
	_checkInstance = function() {
		if(!$.magnificPopup.instance) {
			mfp = new MagnificPopup();
			mfp.init();
			$.magnificPopup.instance = mfp;
		}
	},
	// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
	supportsTransitions = function() {
		var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
			v = ['ms','O','Moz','Webkit']; // 'v' for vendor

		if( s['transition'] !== undefined ) {
			return true; 
		}
			
		while( v.length ) {
			if( v.pop() + 'Transition' in s ) {
				return true;
			}
		}
				
		return false;
	};



/**
 * Public functions
 */
MagnificPopup.prototype = {

	constructor: MagnificPopup,

	/**
	 * Initializes Magnific Popup plugin. 
	 * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
	 */
	init: function() {
		var appVersion = navigator.appVersion;
		mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1; 
		mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
		mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
		mfp.isAndroid = (/android/gi).test(appVersion);
		mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
		mfp.supportsTransition = supportsTransitions();

		// We disable fixed positioned lightbox on devices that don't handle it nicely.
		// If you know a better way of detecting this - let me know.
		mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
		_document = $(document);

		mfp.popupsCache = {};
	},

	/**
	 * Opens popup
	 * @param  data [description]
	 */
	open: function(data) {

		if(!_body) {
			_body = $(document.body);
		}

		var i;

		if(data.isObj === false) { 
			// convert jQuery collection to array to avoid conflicts later
			mfp.items = data.items.toArray();

			mfp.index = 0;
			var items = data.items,
				item;
			for(i = 0; i < items.length; i++) {
				item = items[i];
				if(item.parsed) {
					item = item.el[0];
				}
				if(item === data.el[0]) {
					mfp.index = i;
					break;
				}
			}
		} else {
			mfp.items = $.isArray(data.items) ? data.items : [data.items];
			mfp.index = data.index || 0;
		}

		// if popup is already opened - we just update the content
		if(mfp.isOpen) {
			mfp.updateItemHTML();
			return;
		}
		
		mfp.types = []; 
		_wrapClasses = '';
		if(data.mainEl && data.mainEl.length) {
			mfp.ev = data.mainEl.eq(0);
		} else {
			mfp.ev = _document;
		}

		if(data.key) {
			if(!mfp.popupsCache[data.key]) {
				mfp.popupsCache[data.key] = {};
			}
			mfp.currTemplate = mfp.popupsCache[data.key];
		} else {
			mfp.currTemplate = {};
		}



		mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data ); 
		mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

		if(mfp.st.modal) {
			mfp.st.closeOnContentClick = false;
			mfp.st.closeOnBgClick = false;
			mfp.st.showCloseBtn = false;
			mfp.st.enableEscapeKey = false;
		}
		

		// Building markup
		// main containers are created only once
		if(!mfp.bgOverlay) {

			// Dark overlay
			mfp.bgOverlay = _getEl('bg').on('click'+EVENT_NS, function() {
				mfp.close();
			});

			mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click'+EVENT_NS, function(e) {
				if(mfp._checkIfClose(e.target)) {
					mfp.close();
				}
			});

			mfp.container = _getEl('container', mfp.wrap);
		}

		mfp.contentContainer = _getEl('content');
		if(mfp.st.preloader) {
			mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
		}


		// Initializing modules
		var modules = $.magnificPopup.modules;
		for(i = 0; i < modules.length; i++) {
			var n = modules[i];
			n = n.charAt(0).toUpperCase() + n.slice(1);
			mfp['init'+n].call(mfp);
		}
		_mfpTrigger('BeforeOpen');


		if(mfp.st.showCloseBtn) {
			// Close button
			if(!mfp.st.closeBtnInside) {
				mfp.wrap.append( _getCloseBtn() );
			} else {
				_mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
					values.close_replaceWith = _getCloseBtn(item.type);
				});
				_wrapClasses += ' mfp-close-btn-in';
			}
		}

		if(mfp.st.alignTop) {
			_wrapClasses += ' mfp-align-top';
		}

	

		if(mfp.fixedContentPos) {
			mfp.wrap.css({
				overflow: mfp.st.overflowY,
				overflowX: 'hidden',
				overflowY: mfp.st.overflowY
			});
		} else {
			mfp.wrap.css({ 
				top: _window.scrollTop(),
				position: 'absolute'
			});
		}
		if( mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) ) {
			mfp.bgOverlay.css({
				height: _document.height(),
				position: 'absolute'
			});
		}

		

		if(mfp.st.enableEscapeKey) {
			// Close on ESC key
			_document.on('keyup' + EVENT_NS, function(e) {
				if(e.keyCode === 27) {
					mfp.close();
				}
			});
		}

		_window.on('resize' + EVENT_NS, function() {
			mfp.updateSize();
		});


		if(!mfp.st.closeOnContentClick) {
			_wrapClasses += ' mfp-auto-cursor';
		}
		
		if(_wrapClasses)
			mfp.wrap.addClass(_wrapClasses);


		// this triggers recalculation of layout, so we get it once to not to trigger twice
		var windowHeight = mfp.wH = _window.height();

		
		var windowStyles = {};

		if( mfp.fixedContentPos ) {
            if(mfp._hasScrollBar(windowHeight)){
                var s = mfp._getScrollbarSize();
                if(s) {
                    windowStyles.marginRight = s;
                }
            }
        }

		if(mfp.fixedContentPos) {
			if(!mfp.isIE7) {
				windowStyles.overflow = 'hidden';
			} else {
				// ie7 double-scroll bug
				$('body, html').css('overflow', 'hidden');
			}
		}

		
		
		var classesToadd = mfp.st.mainClass;
		if(mfp.isIE7) {
			classesToadd += ' mfp-ie7';
		}
		if(classesToadd) {
			mfp._addClassToMFP( classesToadd );
		}

		// add content
		mfp.updateItemHTML();

		_mfpTrigger('BuildControls');

		// remove scrollbar, add margin e.t.c
		$('html').css(windowStyles);
		
		// add everything to DOM
		mfp.bgOverlay.add(mfp.wrap).prependTo( mfp.st.prependTo || _body );

		// Save last focused element
		mfp._lastFocusedEl = document.activeElement;
		
		// Wait for next cycle to allow CSS transition
		setTimeout(function() {
			
			if(mfp.content) {
				mfp._addClassToMFP(READY_CLASS);
				mfp._setFocus();
			} else {
				// if content is not defined (not loaded e.t.c) we add class only for BG
				mfp.bgOverlay.addClass(READY_CLASS);
			}
			
			// Trap the focus in popup
			_document.on('focusin' + EVENT_NS, mfp._onFocusIn);

		}, 16);

		mfp.isOpen = true;
		mfp.updateSize(windowHeight);
		_mfpTrigger(OPEN_EVENT);

		return data;
	},

	/**
	 * Closes the popup
	 */
	close: function() {
		if(!mfp.isOpen) return;
		_mfpTrigger(BEFORE_CLOSE_EVENT);

		mfp.isOpen = false;
		// for CSS3 animation
		if(mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition )  {
			mfp._addClassToMFP(REMOVING_CLASS);
			setTimeout(function() {
				mfp._close();
			}, mfp.st.removalDelay);
		} else {
			mfp._close();
		}
	},

	/**
	 * Helper for close() function
	 */
	_close: function() {
		_mfpTrigger(CLOSE_EVENT);

		var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

		mfp.bgOverlay.detach();
		mfp.wrap.detach();
		mfp.container.empty();

		if(mfp.st.mainClass) {
			classesToRemove += mfp.st.mainClass + ' ';
		}

		mfp._removeClassFromMFP(classesToRemove);

		if(mfp.fixedContentPos) {
			var windowStyles = {marginRight: ''};
			if(mfp.isIE7) {
				$('body, html').css('overflow', '');
			} else {
				windowStyles.overflow = '';
			}
			$('html').css(windowStyles);
		}
		
		_document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
		mfp.ev.off(EVENT_NS);

		// clean up DOM elements that aren't removed
		mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
		mfp.bgOverlay.attr('class', 'mfp-bg');
		mfp.container.attr('class', 'mfp-container');

		// remove close button from target element
		if(mfp.st.showCloseBtn &&
		(!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
			if(mfp.currTemplate.closeBtn)
				mfp.currTemplate.closeBtn.detach();
		}


		if(mfp._lastFocusedEl) {
			$(mfp._lastFocusedEl).focus(); // put tab focus back
		}
		mfp.currItem = null;	
		mfp.content = null;
		mfp.currTemplate = null;
		mfp.prevHeight = 0;

		_mfpTrigger(AFTER_CLOSE_EVENT);
	},
	
	updateSize: function(winHeight) {

		if(mfp.isIOS) {
			// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
			var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
			var height = window.innerHeight * zoomLevel;
			mfp.wrap.css('height', height);
			mfp.wH = height;
		} else {
			mfp.wH = winHeight || _window.height();
		}
		// Fixes #84: popup incorrectly positioned with position:relative on body
		if(!mfp.fixedContentPos) {
			mfp.wrap.css('height', mfp.wH);
		}

		_mfpTrigger('Resize');

	},

	/**
	 * Set content of popup based on current index
	 */
	updateItemHTML: function() {
		var item = mfp.items[mfp.index];

		// Detach and perform modifications
		mfp.contentContainer.detach();

		if(mfp.content)
			mfp.content.detach();

		if(!item.parsed) {
			item = mfp.parseEl( mfp.index );
		}

		var type = item.type;	

		_mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
		// BeforeChange event works like so:
		// _mfpOn('BeforeChange', function(e, prevType, newType) { });
		
		mfp.currItem = item;

		

		

		if(!mfp.currTemplate[type]) {
			var markup = mfp.st[type] ? mfp.st[type].markup : false;

			// allows to modify markup
			_mfpTrigger('FirstMarkupParse', markup);

			if(markup) {
				mfp.currTemplate[type] = $(markup);
			} else {
				// if there is no markup found we just define that template is parsed
				mfp.currTemplate[type] = true;
			}
		}

		if(_prevContentType && _prevContentType !== item.type) {
			mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
		}
		
		var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
		mfp.appendContent(newContent, type);

		item.preloaded = true;

		_mfpTrigger(CHANGE_EVENT, item);
		_prevContentType = item.type;
		
		// Append container back after its content changed
		mfp.container.prepend(mfp.contentContainer);

		_mfpTrigger('AfterChange');
	},


	/**
	 * Set HTML content of popup
	 */
	appendContent: function(newContent, type) {
		mfp.content = newContent;
		
		if(newContent) {
			if(mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
				mfp.currTemplate[type] === true) {
				// if there is no markup, we just append close button element inside
				if(!mfp.content.find('.mfp-close').length) {
					mfp.content.append(_getCloseBtn());
				}
			} else {
				mfp.content = newContent;
			}
		} else {
			mfp.content = '';
		}

		_mfpTrigger(BEFORE_APPEND_EVENT);
		mfp.container.addClass('mfp-'+type+'-holder');

		mfp.contentContainer.append(mfp.content);
	},



	
	/**
	 * Creates Magnific Popup data object based on given data
	 * @param  {int} index Index of item to parse
	 */
	parseEl: function(index) {
		var item = mfp.items[index],
			type;

		if(item.tagName) {
			item = { el: $(item) };
		} else {
			type = item.type;
			item = { data: item, src: item.src };
		}

		if(item.el) {
			var types = mfp.types;

			// check for 'mfp-TYPE' class
			for(var i = 0; i < types.length; i++) {
				if( item.el.hasClass('mfp-'+types[i]) ) {
					type = types[i];
					break;
				}
			}

			item.src = item.el.attr('data-mfp-src');
			if(!item.src) {
				item.src = item.el.attr('href');
			}
		}

		item.type = type || mfp.st.type || 'inline';
		item.index = index;
		item.parsed = true;
		mfp.items[index] = item;
		_mfpTrigger('ElementParse', item);

		return mfp.items[index];
	},


	/**
	 * Initializes single popup or a group of popups
	 */
	addGroup: function(el, options) {
		var eHandler = function(e) {
			e.mfpEl = this;
			mfp._openClick(e, el, options);
		};

		if(!options) {
			options = {};
		} 

		var eName = 'click.magnificPopup';
		options.mainEl = el;
		
		if(options.items) {
			options.isObj = true;
			el.off(eName).on(eName, eHandler);
		} else {
			options.isObj = false;
			if(options.delegate) {
				el.off(eName).on(eName, options.delegate , eHandler);
			} else {
				options.items = el;
				el.off(eName).on(eName, eHandler);
			}
		}
	},
	_openClick: function(e, el, options) {
		var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


		if(!midClick && ( e.which === 2 || e.ctrlKey || e.metaKey ) ) {
			return;
		}

		var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

		if(disableOn) {
			if($.isFunction(disableOn)) {
				if( !disableOn.call(mfp) ) {
					return true;
				}
			} else { // else it's number
				if( _window.width() < disableOn ) {
					return true;
				}
			}
		}
		
		if(e.type) {
			e.preventDefault();

			// This will prevent popup from closing if element is inside and popup is already opened
			if(mfp.isOpen) {
				e.stopPropagation();
			}
		}
			

		options.el = $(e.mfpEl);
		if(options.delegate) {
			options.items = el.find(options.delegate);
		}
		mfp.open(options);
	},


	/**
	 * Updates text on preloader
	 */
	updateStatus: function(status, text) {

		if(mfp.preloader) {
			if(_prevStatus !== status) {
				mfp.container.removeClass('mfp-s-'+_prevStatus);
			}

			if(!text && status === 'loading') {
				text = mfp.st.tLoading;
			}

			var data = {
				status: status,
				text: text
			};
			// allows to modify status
			_mfpTrigger('UpdateStatus', data);

			status = data.status;
			text = data.text;

			mfp.preloader.html(text);

			mfp.preloader.find('a').on('click', function(e) {
				e.stopImmediatePropagation();
			});

			mfp.container.addClass('mfp-s-'+status);
			_prevStatus = status;
		}
	},


	/*
		"Private" helpers that aren't private at all
	 */
	// Check to close popup or not
	// "target" is an element that was clicked
	_checkIfClose: function(target) {

		if($(target).hasClass(PREVENT_CLOSE_CLASS)) {
			return;
		}

		var closeOnContent = mfp.st.closeOnContentClick;
		var closeOnBg = mfp.st.closeOnBgClick;

		if(closeOnContent && closeOnBg) {
			return true;
		} else {

			// We close the popup if click is on close button or on preloader. Or if there is no content.
			if(!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0]) ) {
				return true;
			}

			// if click is outside the content
			if(  (target !== mfp.content[0] && !$.contains(mfp.content[0], target))  ) {
				if(closeOnBg) {
					// last check, if the clicked element is in DOM, (in case it's removed onclick)
					if( $.contains(document, target) ) {
						return true;
					}
				}
			} else if(closeOnContent) {
				return true;
			}

		}
		return false;
	},
	_addClassToMFP: function(cName) {
		mfp.bgOverlay.addClass(cName);
		mfp.wrap.addClass(cName);
	},
	_removeClassFromMFP: function(cName) {
		this.bgOverlay.removeClass(cName);
		mfp.wrap.removeClass(cName);
	},
	_hasScrollBar: function(winHeight) {
		return (  (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()) );
	},
	_setFocus: function() {
		(mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
	},
	_onFocusIn: function(e) {
		if( e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target) ) {
			mfp._setFocus();
			return false;
		}
	},
	_parseMarkup: function(template, values, item) {
		var arr;
		if(item.data) {
			values = $.extend(item.data, values);
		}
		_mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item] );

		$.each(values, function(key, value) {
			if(value === undefined || value === false) {
				return true;
			}
			arr = key.split('_');
			if(arr.length > 1) {
				var el = template.find(EVENT_NS + '-'+arr[0]);

				if(el.length > 0) {
					var attr = arr[1];
					if(attr === 'replaceWith') {
						if(el[0] !== value[0]) {
							el.replaceWith(value);
						}
					} else if(attr === 'img') {
						if(el.is('img')) {
							el.attr('src', value);
						} else {
							el.replaceWith( '<img src="'+value+'" class="' + el.attr('class') + '" />' );
						}
					} else {
						el.attr(arr[1], value);
					}
				}

			} else {
				template.find(EVENT_NS + '-'+key).html(value);
			}
		});
	},

	_getScrollbarSize: function() {
		// thx David
		if(mfp.scrollbarSize === undefined) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(scrollDiv);
			mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
		}
		return mfp.scrollbarSize;
	}

}; /* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup = {
	instance: null,
	proto: MagnificPopup.prototype,
	modules: [],

	open: function(options, index) {
		_checkInstance();	

		if(!options) {
			options = {};
		} else {
			options = $.extend(true, {}, options);
		}
			

		options.isObj = true;
		options.index = index || 0;
		return this.instance.open(options);
	},

	close: function() {
		return $.magnificPopup.instance && $.magnificPopup.instance.close();
	},

	registerModule: function(name, module) {
		if(module.options) {
			$.magnificPopup.defaults[name] = module.options;
		}
		$.extend(this.proto, module.proto);			
		this.modules.push(name);
	},

	defaults: {   

		// Info about options is in docs:
		// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options
		
		disableOn: 0,	

		key: null,

		midClick: false,

		mainClass: '',

		preloader: true,

		focus: '', // CSS selector of input to focus after popup is opened
		
		closeOnContentClick: false,

		closeOnBgClick: true,

		closeBtnInside: true, 

		showCloseBtn: true,

		enableEscapeKey: true,

		modal: false,

		alignTop: false,
	
		removalDelay: 0,

		prependTo: null,
		
		fixedContentPos: 'auto', 
	
		fixedBgPos: 'auto',

		overflowY: 'auto',

		closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',

		tClose: 'Close (Esc)',

		tLoading: 'Loading...'

	}
};



$.fn.magnificPopup = function(options) {
	_checkInstance();

	var jqEl = $(this);

	// We call some API method of first param is a string
	if (typeof options === "string" ) {

		if(options === 'open') {
			var items,
				itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
				index = parseInt(arguments[1], 10) || 0;

			if(itemOpts.items) {
				items = itemOpts.items[index];
			} else {
				items = jqEl;
				if(itemOpts.delegate) {
					items = items.find(itemOpts.delegate);
				}
				items = items.eq( index );
			}
			mfp._openClick({mfpEl:items}, jqEl, itemOpts);
		} else {
			if(mfp.isOpen)
				mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
		}

	} else {
		// clone options obj
		options = $.extend(true, {}, options);
		
		/*
		 * As Zepto doesn't support .data() method for objects 
		 * and it works only in normal browsers
		 * we assign "options" object directly to the DOM element. FTW!
		 */
		if(_isJQ) {
			jqEl.data('magnificPopup', options);
		} else {
			jqEl[0].magnificPopup = options;
		}

		mfp.addGroup(jqEl, options);

	}
	return jqEl;
};


//Quick benchmark
/*
var start = performance.now(),
	i,
	rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


/*>>core*/

/*>>inline*/

var INLINE_NS = 'inline',
	_hiddenClass,
	_inlinePlaceholder, 
	_lastInlineElement,
	_putInlineElementsBack = function() {
		if(_lastInlineElement) {
			_inlinePlaceholder.after( _lastInlineElement.addClass(_hiddenClass) ).detach();
			_lastInlineElement = null;
		}
	};

$.magnificPopup.registerModule(INLINE_NS, {
	options: {
		hiddenClass: 'hide', // will be appended with `mfp-` prefix
		markup: '',
		tNotFound: 'Content not found'
	},
	proto: {

		initInline: function() {
			mfp.types.push(INLINE_NS);

			_mfpOn(CLOSE_EVENT+'.'+INLINE_NS, function() {
				_putInlineElementsBack();
			});
		},

		getInline: function(item, template) {

			_putInlineElementsBack();

			if(item.src) {
				var inlineSt = mfp.st.inline,
					el = $(item.src);

				if(el.length) {

					// If target element has parent - we replace it with placeholder and put it back after popup is closed
					var parent = el[0].parentNode;
					if(parent && parent.tagName) {
						if(!_inlinePlaceholder) {
							_hiddenClass = inlineSt.hiddenClass;
							_inlinePlaceholder = _getEl(_hiddenClass);
							_hiddenClass = 'mfp-'+_hiddenClass;
						}
						// replace target inline element with placeholder
						_lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
					}

					mfp.updateStatus('ready');
				} else {
					mfp.updateStatus('error', inlineSt.tNotFound);
					el = $('<div>');
				}

				item.inlineElement = el;
				return el;
			}

			mfp.updateStatus('ready');
			mfp._parseMarkup(template, {}, item);
			return template;
		}
	}
});

/*>>inline*/

/*>>ajax*/
var AJAX_NS = 'ajax',
	_ajaxCur,
	_removeAjaxCursor = function() {
		if(_ajaxCur) {
			_body.removeClass(_ajaxCur);
		}
	},
	_destroyAjaxRequest = function() {
		_removeAjaxCursor();
		if(mfp.req) {
			mfp.req.abort();
		}
	};

$.magnificPopup.registerModule(AJAX_NS, {

	options: {
		settings: null,
		cursor: 'mfp-ajax-cur',
		tError: '<a href="%url%">The content</a> could not be loaded.'
	},

	proto: {
		initAjax: function() {
			mfp.types.push(AJAX_NS);
			_ajaxCur = mfp.st.ajax.cursor;

			_mfpOn(CLOSE_EVENT+'.'+AJAX_NS, _destroyAjaxRequest);
			_mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
		},
		getAjax: function(item) {

			if(_ajaxCur)
				_body.addClass(_ajaxCur);

			mfp.updateStatus('loading');

			var opts = $.extend({
				url: item.src,
				success: function(data, textStatus, jqXHR) {
					var temp = {
						data:data,
						xhr:jqXHR
					};

					_mfpTrigger('ParseAjax', temp);

					mfp.appendContent( $(temp.data), AJAX_NS );

					item.finished = true;

					_removeAjaxCursor();

					mfp._setFocus();

					setTimeout(function() {
						mfp.wrap.addClass(READY_CLASS);
					}, 16);

					mfp.updateStatus('ready');

					_mfpTrigger('AjaxContentAdded');
				},
				error: function() {
					_removeAjaxCursor();
					item.finished = item.loadError = true;
					mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
				}
			}, mfp.st.ajax.settings);

			mfp.req = $.ajax(opts);

			return '';
		}
	}
});





	

/*>>ajax*/

/*>>image*/
var _imgInterval,
	_getTitle = function(item) {
		if(item.data && item.data.title !== undefined) 
			return item.data.title;

		var src = mfp.st.image.titleSrc;

		if(src) {
			if($.isFunction(src)) {
				return src.call(mfp, item);
			} else if(item.el) {
				return item.el.attr(src) || '';
			}
		}
		return '';
	};

$.magnificPopup.registerModule('image', {

	options: {
		markup: '<div class="mfp-figure">'+
					'<div class="mfp-close"></div>'+
					'<figure>'+
						'<div class="mfp-img"></div>'+
						'<figcaption>'+
							'<div class="mfp-bottom-bar">'+
								'<div class="mfp-title"></div>'+
								'<div class="mfp-counter"></div>'+
							'</div>'+
						'</figcaption>'+
					'</figure>'+
				'</div>',
		cursor: 'mfp-zoom-out-cur',
		titleSrc: 'title', 
		verticalFit: true,
		tError: '<a href="%url%">The image</a> could not be loaded.'
	},

	proto: {
		initImage: function() {
			var imgSt = mfp.st.image,
				ns = '.image';

			mfp.types.push('image');

			_mfpOn(OPEN_EVENT+ns, function() {
				if(mfp.currItem.type === 'image' && imgSt.cursor) {
					_body.addClass(imgSt.cursor);
				}
			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(imgSt.cursor) {
					_body.removeClass(imgSt.cursor);
				}
				_window.off('resize' + EVENT_NS);
			});

			_mfpOn('Resize'+ns, mfp.resizeImage);
			if(mfp.isLowIE) {
				_mfpOn('AfterChange', mfp.resizeImage);
			}
		},
		resizeImage: function() {
			var item = mfp.currItem;
			if(!item || !item.img) return;

			if(mfp.st.image.verticalFit) {
				var decr = 0;
				// fix box-sizing in ie7/8
				if(mfp.isLowIE) {
					decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'),10);
				}
				item.img.css('max-height', mfp.wH-decr);
			}
		},
		_onImageHasSize: function(item) {
			if(item.img) {
				
				item.hasSize = true;

				if(_imgInterval) {
					clearInterval(_imgInterval);
				}
				
				item.isCheckingImgSize = false;

				_mfpTrigger('ImageHasSize', item);

				if(item.imgHidden) {
					if(mfp.content)
						mfp.content.removeClass('mfp-loading');
					
					item.imgHidden = false;
				}

			}
		},

		/**
		 * Function that loops until the image has size to display elements that rely on it asap
		 */
		findImageSize: function(item) {

			var counter = 0,
				img = item.img[0],
				mfpSetInterval = function(delay) {

					if(_imgInterval) {
						clearInterval(_imgInterval);
					}
					// decelerating interval that checks for size of an image
					_imgInterval = setInterval(function() {
						if(img.naturalWidth > 0) {
							mfp._onImageHasSize(item);
							return;
						}

						if(counter > 200) {
							clearInterval(_imgInterval);
						}

						counter++;
						if(counter === 3) {
							mfpSetInterval(10);
						} else if(counter === 40) {
							mfpSetInterval(50);
						} else if(counter === 100) {
							mfpSetInterval(500);
						}
					}, delay);
				};

			mfpSetInterval(1);
		},

		getImage: function(item, template) {

			var guard = 0,

				// image load complete handler
				onLoadComplete = function() {
					if(item) {
						if (item.img[0].complete) {
							item.img.off('.mfploader');
							
							if(item === mfp.currItem){
								mfp._onImageHasSize(item);

								mfp.updateStatus('ready');
							}

							item.hasSize = true;
							item.loaded = true;

							_mfpTrigger('ImageLoadComplete');
							
						}
						else {
							// if image complete check fails 200 times (20 sec), we assume that there was an error.
							guard++;
							if(guard < 200) {
								setTimeout(onLoadComplete,100);
							} else {
								onLoadError();
							}
						}
					}
				},

				// image error handler
				onLoadError = function() {
					if(item) {
						item.img.off('.mfploader');
						if(item === mfp.currItem){
							mfp._onImageHasSize(item);
							mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
						}

						item.hasSize = true;
						item.loaded = true;
						item.loadError = true;
					}
				},
				imgSt = mfp.st.image;


			var el = template.find('.mfp-img');
			if(el.length) {
				var img = document.createElement('img');
				img.className = 'mfp-img';
				item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
				img.src = item.src;

				// without clone() "error" event is not firing when IMG is replaced by new IMG
				// TODO: find a way to avoid such cloning
				if(el.is('img')) {
					item.img = item.img.clone();
				}

				img = item.img[0];
				if(img.naturalWidth > 0) {
					item.hasSize = true;
				} else if(!img.width) {										
					item.hasSize = false;
				}
			}

			mfp._parseMarkup(template, {
				title: _getTitle(item),
				img_replaceWith: item.img
			}, item);

			mfp.resizeImage();

			if(item.hasSize) {
				if(_imgInterval) clearInterval(_imgInterval);

				if(item.loadError) {
					template.addClass('mfp-loading');
					mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
				} else {
					template.removeClass('mfp-loading');
					mfp.updateStatus('ready');
				}
				return template;
			}

			mfp.updateStatus('loading');
			item.loading = true;

			if(!item.hasSize) {
				item.imgHidden = true;
				template.addClass('mfp-loading');
				mfp.findImageSize(item);
			} 

			return template;
		}
	}
});



/*>>image*/

/*>>zoom*/
var hasMozTransform,
	getHasMozTransform = function() {
		if(hasMozTransform === undefined) {
			hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
		}
		return hasMozTransform;		
	};

$.magnificPopup.registerModule('zoom', {

	options: {
		enabled: false,
		easing: 'ease-in-out',
		duration: 300,
		opener: function(element) {
			return element.is('img') ? element : element.find('img');
		}
	},

	proto: {

		initZoom: function() {
			var zoomSt = mfp.st.zoom,
				ns = '.zoom',
				image;
				
			if(!zoomSt.enabled || !mfp.supportsTransition) {
				return;
			}

			var duration = zoomSt.duration,
				getElToAnimate = function(image) {
					var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
						transition = 'all '+(zoomSt.duration/1000)+'s ' + zoomSt.easing,
						cssObj = {
							position: 'fixed',
							zIndex: 9999,
							left: 0,
							top: 0,
							'-webkit-backface-visibility': 'hidden'
						},
						t = 'transition';

					cssObj['-webkit-'+t] = cssObj['-moz-'+t] = cssObj['-o-'+t] = cssObj[t] = transition;

					newImg.css(cssObj);
					return newImg;
				},
				showMainContent = function() {
					mfp.content.css('visibility', 'visible');
				},
				openTimeout,
				animatedImg;

			_mfpOn('BuildControls'+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);
					mfp.content.css('visibility', 'hidden');

					// Basically, all code below does is clones existing image, puts in on top of the current one and animated it
					
					image = mfp._getItemToZoom();

					if(!image) {
						showMainContent();
						return;
					}

					animatedImg = getElToAnimate(image); 
					
					animatedImg.css( mfp._getOffset() );

					mfp.wrap.append(animatedImg);

					openTimeout = setTimeout(function() {
						animatedImg.css( mfp._getOffset( true ) );
						openTimeout = setTimeout(function() {

							showMainContent();

							setTimeout(function() {
								animatedImg.remove();
								image = animatedImg = null;
								_mfpTrigger('ZoomAnimationEnded');
							}, 16); // avoid blink when switching images 

						}, duration); // this timeout equals animation duration

					}, 16); // by adding this timeout we avoid short glitch at the beginning of animation


					// Lots of timeouts...
				}
			});
			_mfpOn(BEFORE_CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);

					mfp.st.removalDelay = duration;

					if(!image) {
						image = mfp._getItemToZoom();
						if(!image) {
							return;
						}
						animatedImg = getElToAnimate(image);
					}
					
					
					animatedImg.css( mfp._getOffset(true) );
					mfp.wrap.append(animatedImg);
					mfp.content.css('visibility', 'hidden');
					
					setTimeout(function() {
						animatedImg.css( mfp._getOffset() );
					}, 16);
				}

			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {
					showMainContent();
					if(animatedImg) {
						animatedImg.remove();
					}
					image = null;
				}	
			});
		},

		_allowZoom: function() {
			return mfp.currItem.type === 'image';
		},

		_getItemToZoom: function() {
			if(mfp.currItem.hasSize) {
				return mfp.currItem.img;
			} else {
				return false;
			}
		},

		// Get element postion relative to viewport
		_getOffset: function(isLarge) {
			var el;
			if(isLarge) {
				el = mfp.currItem.img;
			} else {
				el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
			}

			var offset = el.offset();
			var paddingTop = parseInt(el.css('padding-top'),10);
			var paddingBottom = parseInt(el.css('padding-bottom'),10);
			offset.top -= ( $(window).scrollTop() - paddingTop );


			/*
			
			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

			 */
			var obj = {
				width: el.width(),
				// fix Zepto height+padding issue
				height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
			};

			// I hate to do this, but there is no another option
			if( getHasMozTransform() ) {
				obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
			} else {
				obj.left = offset.left;
				obj.top = offset.top;
			}
			return obj;
		}

	}
});



/*>>zoom*/

/*>>iframe*/

var IFRAME_NS = 'iframe',
	_emptyPage = '//about:blank',
	
	_fixIframeBugs = function(isShowing) {
		if(mfp.currTemplate[IFRAME_NS]) {
			var el = mfp.currTemplate[IFRAME_NS].find('iframe');
			if(el.length) { 
				// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
				if(!isShowing) {
					el[0].src = _emptyPage;
				}

				// IE8 black screen bug fix
				if(mfp.isIE8) {
					el.css('display', isShowing ? 'block' : 'none');
				}
			}
		}
	};

$.magnificPopup.registerModule(IFRAME_NS, {

	options: {
		markup: '<div class="mfp-iframe-scaler">'+
					'<div class="mfp-close"></div>'+
					'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
				'</div>',

		srcAction: 'iframe_src',

		// we don't care and support only one default type of URL by default
		patterns: {
			youtube: {
				index: 'youtube.com', 
				id: 'v=', 
				src: '//www.youtube.com/embed/%id%?autoplay=1'
			},
			vimeo: {
				index: 'vimeo.com/',
				id: '/',
				src: '//player.vimeo.com/video/%id%?autoplay=1'
			},
			gmaps: {
				index: '//maps.google.',
				src: '%id%&output=embed'
			}
		}
	},

	proto: {
		initIframe: function() {
			mfp.types.push(IFRAME_NS);

			_mfpOn('BeforeChange', function(e, prevType, newType) {
				if(prevType !== newType) {
					if(prevType === IFRAME_NS) {
						_fixIframeBugs(); // iframe if removed
					} else if(newType === IFRAME_NS) {
						_fixIframeBugs(true); // iframe is showing
					} 
				}// else {
					// iframe source is switched, don't do anything
				//}
			});

			_mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
				_fixIframeBugs();
			});
		},

		getIframe: function(item, template) {
			var embedSrc = item.src;
			var iframeSt = mfp.st.iframe;
				
			$.each(iframeSt.patterns, function() {
				if(embedSrc.indexOf( this.index ) > -1) {
					if(this.id) {
						if(typeof this.id === 'string') {
							embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length, embedSrc.length);
						} else {
							embedSrc = this.id.call( this, embedSrc );
						}
					}
					embedSrc = this.src.replace('%id%', embedSrc );
					return false; // break;
				}
			});
			
			var dataObj = {};
			if(iframeSt.srcAction) {
				dataObj[iframeSt.srcAction] = embedSrc;
			}
			mfp._parseMarkup(template, dataObj, item);

			mfp.updateStatus('ready');

			return template;
		}
	}
});



/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId = function(index) {
		var numSlides = mfp.items.length;
		if(index > numSlides - 1) {
			return index - numSlides;
		} else  if(index < 0) {
			return numSlides + index;
		}
		return index;
	},
	_replaceCurrTotal = function(text, curr, total) {
		return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
	};

$.magnificPopup.registerModule('gallery', {

	options: {
		enabled: false,
		arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
		preload: [0,2],
		navigateByImgClick: true,
		arrows: true,

		tPrev: 'Previous (Left arrow key)',
		tNext: 'Next (Right arrow key)',
		tCounter: '%curr% of %total%'
	},

	proto: {
		initGallery: function() {

			var gSt = mfp.st.gallery,
				ns = '.mfp-gallery',
				supportsFastClick = Boolean($.fn.mfpFastClick);

			mfp.direction = true; // true - next, false - prev
			
			if(!gSt || !gSt.enabled ) return false;

			_wrapClasses += ' mfp-gallery';

			_mfpOn(OPEN_EVENT+ns, function() {

				if(gSt.navigateByImgClick) {
					mfp.wrap.on('click'+ns, '.mfp-img', function() {
						if(mfp.items.length > 1) {
							mfp.next();
							return false;
						}
					});
				}

				_document.on('keydown'+ns, function(e) {
					if (e.keyCode === 37) {
						mfp.prev();
					} else if (e.keyCode === 39) {
						mfp.next();
					}
				});
			});

			_mfpOn('UpdateStatus'+ns, function(e, data) {
				if(data.text) {
					data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
				}
			});

			_mfpOn(MARKUP_PARSE_EVENT+ns, function(e, element, values, item) {
				var l = mfp.items.length;
				values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
			});

			_mfpOn('BuildControls' + ns, function() {
				if(mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
					var markup = gSt.arrowMarkup,
						arrowLeft = mfp.arrowLeft = $( markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left') ).addClass(PREVENT_CLOSE_CLASS),			
						arrowRight = mfp.arrowRight = $( markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right') ).addClass(PREVENT_CLOSE_CLASS);

					var eName = supportsFastClick ? 'mfpFastClick' : 'click';
					arrowLeft[eName](function() {
						mfp.prev();
					});			
					arrowRight[eName](function() {
						mfp.next();
					});	

					// Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
					if(mfp.isIE7) {
						_getEl('b', arrowLeft[0], false, true);
						_getEl('a', arrowLeft[0], false, true);
						_getEl('b', arrowRight[0], false, true);
						_getEl('a', arrowRight[0], false, true);
					}

					mfp.container.append(arrowLeft.add(arrowRight));
				}
			});

			_mfpOn(CHANGE_EVENT+ns, function() {
				if(mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

				mfp._preloadTimeout = setTimeout(function() {
					mfp.preloadNearbyImages();
					mfp._preloadTimeout = null;
				}, 16);		
			});


			_mfpOn(CLOSE_EVENT+ns, function() {
				_document.off(ns);
				mfp.wrap.off('click'+ns);
			
				if(mfp.arrowLeft && supportsFastClick) {
					mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
				}
				mfp.arrowRight = mfp.arrowLeft = null;
			});

		}, 
		next: function() {
			mfp.direction = true;
			mfp.index = _getLoopedId(mfp.index + 1);
			mfp.updateItemHTML();
		},
		prev: function() {
			mfp.direction = false;
			mfp.index = _getLoopedId(mfp.index - 1);
			mfp.updateItemHTML();
		},
		goTo: function(newIndex) {
			mfp.direction = (newIndex >= mfp.index);
			mfp.index = newIndex;
			mfp.updateItemHTML();
		},
		preloadNearbyImages: function() {
			var p = mfp.st.gallery.preload,
				preloadBefore = Math.min(p[0], mfp.items.length),
				preloadAfter = Math.min(p[1], mfp.items.length),
				i;

			for(i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
				mfp._preloadItem(mfp.index+i);
			}
			for(i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
				mfp._preloadItem(mfp.index-i);
			}
		},
		_preloadItem: function(index) {
			index = _getLoopedId(index);

			if(mfp.items[index].preloaded) {
				return;
			}

			var item = mfp.items[index];
			if(!item.parsed) {
				item = mfp.parseEl( index );
			}

			_mfpTrigger('LazyLoad', item);

			if(item.type === 'image') {
				item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
					item.hasSize = true;
				}).on('error.mfploader', function() {
					item.hasSize = true;
					item.loadError = true;
					_mfpTrigger('LazyLoadError', item);
				}).attr('src', item.src);
			}


			item.preloaded = true;
		}
	}
});

/*
Touch Support that might be implemented some day

addSwipeGesture: function() {
	var startX,
		moved,
		multipleTouches;

		return;

	var namespace = '.mfp',
		addEventNames = function(pref, down, move, up, cancel) {
			mfp._tStart = pref + down + namespace;
			mfp._tMove = pref + move + namespace;
			mfp._tEnd = pref + up + namespace;
			mfp._tCancel = pref + cancel + namespace;
		};

	if(window.navigator.msPointerEnabled) {
		addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
	} else if('ontouchstart' in window) {
		addEventNames('touch', 'start', 'move', 'end', 'cancel');
	} else {
		return;
	}
	_window.on(mfp._tStart, function(e) {
		var oE = e.originalEvent;
		multipleTouches = moved = false;
		startX = oE.pageX || oE.changedTouches[0].pageX;
	}).on(mfp._tMove, function(e) {
		if(e.originalEvent.touches.length > 1) {
			multipleTouches = e.originalEvent.touches.length;
		} else {
			//e.preventDefault();
			moved = true;
		}
	}).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
		if(moved && !multipleTouches) {
			var oE = e.originalEvent,
				diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

			if(diff > 20) {
				mfp.next();
			} else if(diff < -20) {
				mfp.prev();
			}
		}
	});
},
*/


/*>>gallery*/

/*>>retina*/

var RETINA_NS = 'retina';

$.magnificPopup.registerModule(RETINA_NS, {
	options: {
		replaceSrc: function(item) {
			return item.src.replace(/\.\w+$/, function(m) { return '@2x' + m; });
		},
		ratio: 1 // Function or number.  Set to 1 to disable.
	},
	proto: {
		initRetina: function() {
			if(window.devicePixelRatio > 1) {

				var st = mfp.st.retina,
					ratio = st.ratio;

				ratio = !isNaN(ratio) ? ratio : ratio();

				if(ratio > 1) {
					_mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
						item.img.css({
							'max-width': item.img[0].naturalWidth / ratio,
							'width': '100%'
						});
					});
					_mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
						item.src = st.replaceSrc(item, ratio);
					});
				}
			}

		}
	}
});

/*>>retina*/

/*>>fastclick*/
/**
 * FastClick event implementation. (removes 300ms delay on touch devices)
 * Based on https://developers.google.com/mobile/articles/fast_buttons
 *
 * You may use it outside the Magnific Popup by calling just:
 *
 * $('.your-el').mfpFastClick(function() {
 *     console.log('Clicked!');
 * });
 *
 * To unbind:
 * $('.your-el').destroyMfpFastClick();
 * 
 * 
 * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
 * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
 * 
 */

(function() {
	var ghostClickDelay = 1000,
		supportsTouch = 'ontouchstart' in window,
		unbindTouchMove = function() {
			_window.off('touchmove'+ns+' touchend'+ns);
		},
		eName = 'mfpFastClick',
		ns = '.'+eName;


	// As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
	$.fn.mfpFastClick = function(callback) {

		return $(this).each(function() {

			var elem = $(this),
				lock;

			if( supportsTouch ) {

				var timeout,
					startX,
					startY,
					pointerMoved,
					point,
					numPointers;

				elem.on('touchstart' + ns, function(e) {
					pointerMoved = false;
					numPointers = 1;

					point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
					startX = point.clientX;
					startY = point.clientY;

					_window.on('touchmove'+ns, function(e) {
						point = e.originalEvent ? e.originalEvent.touches : e.touches;
						numPointers = point.length;
						point = point[0];
						if (Math.abs(point.clientX - startX) > 10 ||
							Math.abs(point.clientY - startY) > 10) {
							pointerMoved = true;
							unbindTouchMove();
						}
					}).on('touchend'+ns, function(e) {
						unbindTouchMove();
						if(pointerMoved || numPointers > 1) {
							return;
						}
						lock = true;
						e.preventDefault();
						clearTimeout(timeout);
						timeout = setTimeout(function() {
							lock = false;
						}, ghostClickDelay);
						callback();
					});
				});

			}

			elem.on('click' + ns, function() {
				if(!lock) {
					callback();
				}
			});
		});
	};

	$.fn.destroyMfpFastClick = function() {
		$(this).off('touchstart' + ns + ' click' + ns);
		if(supportsTouch) _window.off('touchmove'+ns+' touchend'+ns);
	};
})();

/*>>fastclick*/
 _checkInstance(); })(window.jQuery || window.Zepto);
/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.3',

    Modernizr = {},

    enableClasses = true,

    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  = document.createElement('input')  ,

    smile = ':)',

    toString = {}.toString,

    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, 


    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
                body = document.body,
                fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
                      while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
          (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
                fakeBody.style.background = '';
                fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
        if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },



    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

            var isSupported = eventName in element;

        if ( !isSupported ) {
                if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

                    if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),


    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { 
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }

    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }

    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

            if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

            } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };



    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };


    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };



    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    tests['rgba'] = function() {
        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
            setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
                setCss('background:url(https://),url(https://),red url(https://)');

            return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };



    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
                setCssAll('opacity:.55');

                    return (/^0.55$/).test(mStyle.opacity);
    };


    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
                       (str1 + '-webkit- '.split(' ').join(str2 + str1) +
                       prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

                        if ( ret && 'webkitPerspective' in docElement.style ) {

                      injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };



    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https:///")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };

    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };
    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

            try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                            bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                                                    bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };


    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    function webforms() {
                                            Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
                                  attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
                            Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                                                    if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                                        bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                                                                                  (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                                                                                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                                        bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        }
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    Modernizr.input || webforms();


     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; 
     };


    setCss('');
    modElem = inputElem = null;

    ;(function(window, document) {
                var version = '3.7.0';

            var options = window.html5 || {};

            var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

            var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

            var supportsHtml5Styles;

            var expando = '_html5shiv';

            var expanID = 0;

            var expandoData = {};

            var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
                    supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
                        (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
                    supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

            function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

            function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

            function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

            function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

                                                    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

            function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

            function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
                    if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                                                                                getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

            function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                                                                'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                                                                    'mark{background:#FF0;color:#000}' +
                                                                                    'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

            var html5 = {

                'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

                'version': version,

                'shivCSS': (options.shivCSS !== false),

                'supportsUnknownElements': supportsUnknownElements,

                'shivMethods': (options.shivMethods !== false),

                'type': 'default',

                'shivDocument': shivDocument,

                createElement: createElement,

                createDocumentFragment: createDocumentFragment
        };

            window.html5 = html5;

            shivDocument(document);

    }(this, document));

    Modernizr._version      = version;

    Modernizr._prefixes     = prefixes;
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;


    Modernizr.hasEvent      = isEventSupported;

    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };

    Modernizr.testAllProps  = testPropsAll;


    Modernizr.testStyles    = injectElementWithStyles;
    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
            return testPropsAll(prop, obj, elem);
      }
    };


    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                                                    (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);
/*yepnope1.5.4|WTFPL*/
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("index.html").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);
Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0));};
;
/* MediaMatch v.2.0.2 - Testing css media queries in Javascript. Authors & copyright (c) 2013: WebLinc, David Knight. */

window.matchMedia || (window.matchMedia = function (win) {
    'use strict';

    // Internal globals
    var _doc        = win.document,
        _viewport   = _doc.documentElement,
        _queries    = [],
        _queryID    = 0,
        _type       = '',
        _features   = {},
                    // only screen
                    // only screen and
                    // not screen
                    // not screen and
                    // screen
                    // screen and
        _typeExpr   = /\s*(only|not)?\s*(screen|print|[a-z\-]+)\s*(and)?\s*/i,
                    // (-vendor-min-width: 300px)
                    // (min-width: 300px)
                    // (width: 300px)
                    // (width)
                    // (orientation: portrait|landscape)
        _mediaExpr  = /^\s*\(\s*(-[a-z]+-)?(min-|max-)?([a-z\-]+)\s*(:?\s*([0-9]+(\.[0-9]+)?|portrait|landscape)(px|em|dppx|dpcm|rem|%|in|cm|mm|ex|pt|pc|\/([0-9]+(\.[0-9]+)?))?)?\s*\)\s*$/,
        _timer      = 0,

        // Helper methods

        /*
            _matches
         */
        _matches = function (media) {
            // screen and (min-width: 400px), screen and (max-width: 500px)
            var mql         = (media.indexOf(',') !== -1 && media.split(',')) || [media],
                mqIndex     = mql.length - 1,
                mqLength    = mqIndex,
                mq          = null,

                // not screen, screen
                negateType      = null,
                negateTypeFound = '',
                negateTypeIndex = 0,
                negate          = false,
                type            = '',

                // (min-width: 400px), (min-width)
                exprListStr = '',
                exprList    = null,
                exprIndex   = 0,
                exprLength  = 0,
                expr        = null,

                prefix      = '',
                length      = '',
                unit        = '',
                value       = '',
                feature     = '',

                match       = false;

            if (media === '') {
                return true;
            }

            do {
                mq          = mql[mqLength - mqIndex];
                negate      = false;
                negateType  = mq.match(_typeExpr);

                if (negateType) {
                    negateTypeFound = negateType[0];
                    negateTypeIndex = negateType.index;
                }

                if (!negateType || ((mq.substring(0, negateTypeIndex).indexOf('(') === -1) && (negateTypeIndex || (!negateType[3] && negateTypeFound !== negateType.input)))) {
                    match = false;
                    continue;
                }

                exprListStr = mq;

                negate = negateType[1] === 'not';

                if (!negateTypeIndex) {
                    type        =  negateType[2];
                    exprListStr = mq.substring(negateTypeFound.length);
                }

                // Test media type
                // Test type against this device or if 'all' or empty ''
                match       = type === _type || type === 'all' || type === '';

                exprList    = (exprListStr.indexOf(' and ') !== -1 && exprListStr.split(' and ')) || [exprListStr];
                exprIndex   = exprList.length - 1;
                exprLength  = exprIndex;

                if (match && exprIndex >= 0 && exprListStr !== '') {
                    do {
                        expr = exprList[exprIndex].match(_mediaExpr);

                        if (!expr || !_features[expr[3]]) {
                            match = false;
                            break;
                        }

                        prefix  = expr[2];
                        length  = expr[5];
                        value   = length;
                        unit    = expr[7];
                        feature = _features[expr[3]];

                        // Convert unit types
                        if (unit) {
                            if (unit === 'px') {
                                // If unit is px
                                value = Number(length);
                            } else if (unit === 'em' || unit === 'rem') {
                                // Convert relative length unit to pixels
                                // Assumed base font size is 16px
                                value = 16 * length;
                            } else if (expr[8]) {
                                // Convert aspect ratio to decimal
                                value = (length / expr[8]).toFixed(2);
                            } else if (unit === 'dppx') {
                                // Convert resolution dppx unit to pixels
                                value = length * 96;
                            } else if (unit === 'dpcm') {
                                // Convert resolution dpcm unit to pixels
                                value = length * 0.3937;
                            } else {
                                // default
                                value = Number(length);
                            }
                        }

                        // Test for prefix min or max
                        // Test value against feature
                        if (prefix === 'min-' && value) {
                            match = feature >= value;
                        } else if (prefix === 'max-' && value) {
                            match = feature <= value;
                        } else if (value) {
                            match = feature === value;
                        } else {
                            match = !!feature;
                        }

                        // If 'match' is false, break loop
                        // Continue main loop through query list
                        if (!match) {
                            break;
                        }
                    } while (exprIndex--);
                }

                // If match is true, break loop
                // Once matched, no need to check other queries
                if (match) {
                    break;
                }
            } while (mqIndex--);

            return negate ? !match : match;
        },

        /*
            _setFeature
         */
        _setFeature = function () {
            // Sets properties of '_features' that change on resize and/or orientation.
            var w   = win.innerWidth || _viewport.clientWidth,
                h   = win.innerHeight || _viewport.clientHeight,
                dw  = win.screen.width,
                dh  = win.screen.height,
                c   = win.screen.colorDepth,
                x   = win.devicePixelRatio;

            _features.width                     = w;
            _features.height                    = h;
            _features['aspect-ratio']           = (w / h).toFixed(2);
            _features['device-width']           = dw;
            _features['device-height']          = dh;
            _features['device-aspect-ratio']    = (dw / dh).toFixed(2);
            _features.color                     = c;
            _features['color-index']            = Math.pow(2, c);
            _features.orientation               = (h >= w ? 'portrait' : 'landscape');
            _features.resolution                = (x && x * 96) || win.screen.deviceXDPI || 96;
            _features['device-pixel-ratio']     = x || 1;
        },

        /*
            _watch
         */
        _watch = function () {
            clearTimeout(_timer);

            _timer = setTimeout(function () {
                var query   = null,
                    qIndex  = _queryID - 1,
                    qLength = qIndex,
                    match   = false;

                if (qIndex >= 0) {
                    _setFeature();

                    do {
                        query = _queries[qLength - qIndex];

                        if (query) {
                            match = _matches(query.mql.media);

                            if ((match && !query.mql.matches) || (!match && query.mql.matches)) {
                                query.mql.matches = match;

                                if (query.listeners) {
                                    for (var i = 0, il = query.listeners.length; i < il; i++) {
                                        if (query.listeners[i]) {
                                            query.listeners[i].call(win, query.mql);
                                        }
                                    }
                                }
                            }
                        }
                    } while(qIndex--);
                }

                
            }, 10);
        },

        /*
            _init
         */
        _init = function () {
            var head        = _doc.getElementsByTagName('head')[0],
                style       = _doc.createElement('style'),
                info        = null,
                typeList    = ['screen', 'print', 'speech', 'projection', 'handheld', 'tv', 'braille', 'embossed', 'tty'],
                typeIndex   = 0,
                typeLength  = typeList.length,
                cssText     = '#mediamatchjs { position: relative; z-index: 0; }',
                eventPrefix = '',
                addEvent    = win.addEventListener || (eventPrefix = 'on') && win.attachEvent;

            style.type  = 'text/css';
            style.id    = 'mediamatchjs';

            head.appendChild(style);

            // Must be placed after style is inserted into the DOM for IE
            info = (win.getComputedStyle && win.getComputedStyle(style)) || style.currentStyle;

            // Create media blocks to test for media type
            for ( ; typeIndex < typeLength; typeIndex++) {
                cssText += '@media ' + typeList[typeIndex] + ' { #mediamatchjs { position: relative; z-index: ' + typeIndex + ' } }';
            }

            // Add rules to style element
            if (style.styleSheet) {
                style.styleSheet.cssText = cssText;
            } else {
                style.textContent = cssText;
            }

            // Get media type
            _type = typeList[(info.zIndex * 1) || 0];

            head.removeChild(style);

            _setFeature();

            // Set up listeners
            addEvent(eventPrefix + 'resize', _watch);
            addEvent(eventPrefix + 'orientationchange', _watch);
        };

    _init();

    /*
        A list of parsed media queries, ex. screen and (max-width: 400px), screen and (max-width: 800px)
    */
    return function (media) {
        var id  = _queryID,
            mql = {
                matches         : false,
                media           : media,
                addListener     : function addListener(listener) {
                    _queries[id].listeners || (_queries[id].listeners = []);
                    listener && _queries[id].listeners.push(listener);
                },
                removeListener  : function removeListener(listener) {
                    var query   = _queries[id],
                        i       = 0,
                        il      = 0;

                    if (!query) {
                        return;
                    }

                    il = query.listeners.length;

                    for ( ; i < il; i++) {
                        if (query.listeners[i] === listener) {
                            query.listeners.splice(i, 1);
                        }
                    }
                }
            };

        if (media === '') {
            mql.matches = true;
            return mql;
        }

        mql.matches = _matches(media);

        _queryID = _queries.push({
            mql         : mql,
            listeners   : null
        });

        return mql;
    };
}(window));
// Owl Carousel 2 plugin (https://github.com/OwlFonk/OwlCarousel2)
!function(a,b,c,d){function e(b,c){this.settings=null,this.options=a.extend({},e.Defaults,c),this.$element=a(b),this.drag=a.extend({},m),this.state=a.extend({},n),this.e=a.extend({},o),this._plugins={},this._supress={},this._current=null,this._speed=null,this._coordinates=[],this._breakpoint=null,this._width=null,this._items=[],this._clones=[],this._mergers=[],this._invalidated={},this._pipe=[],a.each(e.Plugins,a.proxy(function(a,b){this._plugins[a[0].toLowerCase()+a.slice(1)]=new b(this)},this)),a.each(e.Pipe,a.proxy(function(b,c){this._pipe.push({filter:c.filter,run:a.proxy(c.run,this)})},this)),this.setup(),this.initialize()}function f(a){if(a.touches!==d)return{x:a.touches[0].pageX,y:a.touches[0].pageY};if(a.touches===d){if(a.pageX!==d)return{x:a.pageX,y:a.pageY};if(a.pageX===d)return{x:a.clientX,y:a.clientY}}}function g(a){var b,d,e=c.createElement("div"),f=a;for(b in f)if(d=f[b],"undefined"!=typeof e.style[d])return e=null,[d,b];return[!1]}function h(){return g(["transition","WebkitTransition","MozTransition","OTransition"])[1]}function i(){return g(["transform","WebkitTransform","MozTransform","OTransform","msTransform"])[0]}function j(){return g(["perspective","webkitPerspective","MozPerspective","OPerspective","MsPerspective"])[0]}function k(){return"ontouchstart"in b||!!navigator.msMaxTouchPoints}function l(){return b.navigator.msPointerEnabled}var m,n,o;m={start:0,startX:0,startY:0,current:0,currentX:0,currentY:0,offsetX:0,offsetY:0,distance:null,startTime:0,endTime:0,updatedX:0,targetEl:null},n={isTouch:!1,isScrolling:!1,isSwiping:!1,direction:!1,inMotion:!1},o={_onDragStart:null,_onDragMove:null,_onDragEnd:null,_transitionEnd:null,_resizer:null,_responsiveCall:null,_goToLoop:null,_checkVisibile:null},e.Defaults={items:3,loop:!1,center:!1,mouseDrag:!0,touchDrag:!0,pullDrag:!0,freeDrag:!1,margin:0,stagePadding:0,merge:!1,mergeFit:!0,autoWidth:!1,startPosition:0,rtl:!1,smartSpeed:250,fluidSpeed:!1,dragEndSpeed:!1,responsive:{},responsiveRefreshRate:200,responsiveBaseElement:b,responsiveClass:!1,fallbackEasing:"swing",info:!1,nestedItemSelector:!1,itemElement:"div",stageElement:"div",themeClass:"owl-theme",baseClass:"owl-carousel",itemClass:"owl-item",centerClass:"center",activeClass:"active"},e.Width={Default:"default",Inner:"inner",Outer:"outer"},e.Plugins={},e.Pipe=[{filter:["width","items","settings"],run:function(a){a.current=this._items&&this._items[this.relative(this._current)]}},{filter:["items","settings"],run:function(){var a=this._clones,b=this.$stage.children(".cloned");(b.length!==a.length||!this.settings.loop&&a.length>0)&&(this.$stage.children(".cloned").remove(),this._clones=[])}},{filter:["items","settings"],run:function(){var a,b,c=this._clones,d=this._items,e=this.settings.loop?c.length-Math.max(2*this.settings.items,4):0;for(a=0,b=Math.abs(e/2);b>a;a++)e>0?(this.$stage.children().eq(d.length+c.length-1).remove(),c.pop(),this.$stage.children().eq(0).remove(),c.pop()):(c.push(c.length/2),this.$stage.append(d[c[c.length-1]].clone().addClass("cloned")),c.push(d.length-1-(c.length-1)/2),this.$stage.prepend(d[c[c.length-1]].clone().addClass("cloned")))}},{filter:["width","items","settings"],run:function(){var a,b,c,d=this.settings.rtl?1:-1,e=(this.width()/this.settings.items).toFixed(3),f=0;for(this._coordinates=[],b=0,c=this._clones.length+this._items.length;c>b;b++)a=this._mergers[this.relative(b)],a=this.settings.mergeFit&&Math.min(a,this.settings.items)||a,f+=(this.settings.autoWidth?this._items[this.relative(b)].width()+this.settings.margin:e*a)*d,this._coordinates.push(f)}},{filter:["width","items","settings"],run:function(){var b,c,d=(this.width()/this.settings.items).toFixed(3),e={width:Math.abs(this._coordinates[this._coordinates.length-1])+2*this.settings.stagePadding,"padding-left":this.settings.stagePadding||"","padding-right":this.settings.stagePadding||""};if(this.$stage.css(e),e={width:this.settings.autoWidth?"auto":d-this.settings.margin},e[this.settings.rtl?"margin-left":"margin-right"]=this.settings.margin,!this.settings.autoWidth&&a.grep(this._mergers,function(a){return a>1}).length>0)for(b=0,c=this._coordinates.length;c>b;b++)e.width=Math.abs(this._coordinates[b])-Math.abs(this._coordinates[b-1]||0)-this.settings.margin,this.$stage.children().eq(b).css(e);else this.$stage.children().css(e)}},{filter:["width","items","settings"],run:function(a){a.current&&this.reset(this.$stage.children().index(a.current))}},{filter:["position"],run:function(){this.animate(this.coordinates(this._current))}},{filter:["width","position","items","settings"],run:function(){var a,b,c,d,e=this.settings.rtl?1:-1,f=2*this.settings.stagePadding,g=this.coordinates(this.current())+f,h=g+this.width()*e,i=[];for(c=0,d=this._coordinates.length;d>c;c++)a=this._coordinates[c-1]||0,b=Math.abs(this._coordinates[c])+f*e,(this.op(a,"<=",g)&&this.op(a,">",h)||this.op(b,"<",g)&&this.op(b,">",h))&&i.push(c);this.$stage.children("."+this.settings.activeClass).removeClass(this.settings.activeClass),this.$stage.children(":eq("+i.join("), :eq(")+")").addClass(this.settings.activeClass),this.settings.center&&(this.$stage.children("."+this.settings.centerClass).removeClass(this.settings.centerClass),this.$stage.children().eq(this.current()).addClass(this.settings.centerClass))}}],e.prototype.initialize=function(){if(this.trigger("initialize"),this.$element.addClass(this.settings.baseClass).addClass(this.settings.themeClass).toggleClass("owl-rtl",this.settings.rtl),this.browserSupport(),this.settings.autoWidth&&this.state.imagesLoaded!==!0){var b,c,e;if(b=this.$element.find("img"),c=this.settings.nestedItemSelector?"."+this.settings.nestedItemSelector:d,e=this.$element.children(c).width(),b.length&&0>=e)return this.preloadAutoWidthImages(b),!1}this.$element.addClass("owl-loading"),this.$stage=a("<"+this.settings.stageElement+' class="owl-stage"/>').wrap('<div class="owl-stage-outer">'),this.$element.append(this.$stage.parent()),this.replace(this.$element.children().not(this.$stage.parent())),this._width=this.$element.width(),this.refresh(),this.$element.removeClass("owl-loading").addClass("owl-loaded"),this.eventsCall(),this.internalEvents(),this.addTriggerableEvents(),this.trigger("initialized")},e.prototype.setup=function(){var b=this.viewport(),c=this.options.responsive,d=-1,e=null;c?(a.each(c,function(a){b>=a&&a>d&&(d=Number(a))}),e=a.extend({},this.options,c[d]),delete e.responsive,e.responsiveClass&&this.$element.attr("class",function(a,b){return b.replace(/\b owl-responsive-\S+/g,"")}).addClass("owl-responsive-"+d)):e=a.extend({},this.options),(null===this.settings||this._breakpoint!==d)&&(this.trigger("change",{property:{name:"settings",value:e}}),this._breakpoint=d,this.settings=e,this.invalidate("settings"),this.trigger("changed",{property:{name:"settings",value:this.settings}}))},e.prototype.optionsLogic=function(){this.$element.toggleClass("owl-center",this.settings.center),this.settings.loop&&this._items.length<this.settings.items&&(this.settings.loop=!1),this.settings.autoWidth&&(this.settings.stagePadding=!1,this.settings.merge=!1)},e.prototype.prepare=function(b){var c=this.trigger("prepare",{content:b});return c.data||(c.data=a("<"+this.settings.itemElement+"/>").addClass(this.settings.itemClass).append(b)),this.trigger("prepared",{content:c.data}),c.data},e.prototype.update=function(){for(var b=0,c=this._pipe.length,d=a.proxy(function(a){return this[a]},this._invalidated),e={};c>b;)(this._invalidated.all||a.grep(this._pipe[b].filter,d).length>0)&&this._pipe[b].run(e),b++;this._invalidated={}},e.prototype.width=function(a){switch(a=a||e.Width.Default){case e.Width.Inner:case e.Width.Outer:return this._width;default:return this._width-2*this.settings.stagePadding+this.settings.margin}},e.prototype.refresh=function(){if(0===this._items.length)return!1;(new Date).getTime();this.trigger("refresh"),this.setup(),this.optionsLogic(),this.$stage.addClass("owl-refresh"),this.update(),this.$stage.removeClass("owl-refresh"),this.state.orientation=b.orientation,this.watchVisibility(),this.trigger("refreshed")},e.prototype.eventsCall=function(){this.e._onDragStart=a.proxy(function(a){this.onDragStart(a)},this),this.e._onDragMove=a.proxy(function(a){this.onDragMove(a)},this),this.e._onDragEnd=a.proxy(function(a){this.onDragEnd(a)},this),this.e._onResize=a.proxy(function(a){this.onResize(a)},this),this.e._transitionEnd=a.proxy(function(a){this.transitionEnd(a)},this),this.e._preventClick=a.proxy(function(a){this.preventClick(a)},this)},e.prototype.onThrottledResize=function(){b.clearTimeout(this.resizeTimer),this.resizeTimer=b.setTimeout(this.e._onResize,this.settings.responsiveRefreshRate)},e.prototype.onResize=function(){return this._items.length?this._width===this.$element.width()?!1:this.trigger("resize").isDefaultPrevented()?!1:(this._width=this.$element.width(),this.invalidate("width"),this.refresh(),void this.trigger("resized")):!1},e.prototype.eventsRouter=function(a){var b=a.type;"mousedown"===b||"touchstart"===b?this.onDragStart(a):"mousemove"===b||"touchmove"===b?this.onDragMove(a):"mouseup"===b||"touchend"===b?this.onDragEnd(a):"touchcancel"===b&&this.onDragEnd(a)},e.prototype.internalEvents=function(){var c=(k(),l());this.settings.mouseDrag?(this.$stage.on("mousedown",a.proxy(function(a){this.eventsRouter(a)},this)),this.$stage.on("dragstart",function(){return!1}),this.$stage.get(0).onselectstart=function(){return!1}):this.$element.addClass("owl-text-select-on"),this.settings.touchDrag&&!c&&this.$stage.on("touchstart touchcancel",a.proxy(function(a){this.eventsRouter(a)},this)),this.transitionEndVendor&&this.on(this.$stage.get(0),this.transitionEndVendor,this.e._transitionEnd,!1),this.settings.responsive!==!1&&this.on(b,"resize",a.proxy(this.onThrottledResize,this))},e.prototype.onDragStart=function(d){var e,g,h,i;if(e=d.originalEvent||d||b.event,3===e.which||this.state.isTouch)return!1;if("mousedown"===e.type&&this.$stage.addClass("owl-grab"),this.trigger("drag"),this.drag.startTime=(new Date).getTime(),this.speed(0),this.state.isTouch=!0,this.state.isScrolling=!1,this.state.isSwiping=!1,this.drag.distance=0,g=f(e).x,h=f(e).y,this.drag.offsetX=this.$stage.position().left,this.drag.offsetY=this.$stage.position().top,this.settings.rtl&&(this.drag.offsetX=this.$stage.position().left+this.$stage.width()-this.width()+this.settings.margin),this.state.inMotion&&this.support3d)i=this.getTransformProperty(),this.drag.offsetX=i,this.animate(i),this.state.inMotion=!0;else if(this.state.inMotion&&!this.support3d)return this.state.inMotion=!1,!1;this.drag.startX=g-this.drag.offsetX,this.drag.startY=h-this.drag.offsetY,this.drag.start=g-this.drag.startX,this.drag.targetEl=e.target||e.srcElement,this.drag.updatedX=this.drag.start,("IMG"===this.drag.targetEl.tagName||"A"===this.drag.targetEl.tagName)&&(this.drag.targetEl.draggable=!1),a(c).on("mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents",a.proxy(function(a){this.eventsRouter(a)},this))},e.prototype.onDragMove=function(a){var c,e,g,h,i,j;this.state.isTouch&&(this.state.isScrolling||(c=a.originalEvent||a||b.event,e=f(c).x,g=f(c).y,this.drag.currentX=e-this.drag.startX,this.drag.currentY=g-this.drag.startY,this.drag.distance=this.drag.currentX-this.drag.offsetX,this.drag.distance<0?this.state.direction=this.settings.rtl?"right":"left":this.drag.distance>0&&(this.state.direction=this.settings.rtl?"left":"right"),this.settings.loop?this.op(this.drag.currentX,">",this.coordinates(this.minimum()))&&"right"===this.state.direction?this.drag.currentX-=(this.settings.center&&this.coordinates(0))-this.coordinates(this._items.length):this.op(this.drag.currentX,"<",this.coordinates(this.maximum()))&&"left"===this.state.direction&&(this.drag.currentX+=(this.settings.center&&this.coordinates(0))-this.coordinates(this._items.length)):(h=this.coordinates(this.settings.rtl?this.maximum():this.minimum()),i=this.coordinates(this.settings.rtl?this.minimum():this.maximum()),j=this.settings.pullDrag?this.drag.distance/5:0,this.drag.currentX=Math.max(Math.min(this.drag.currentX,h+j),i+j)),(this.drag.distance>8||this.drag.distance<-8)&&(c.preventDefault!==d?c.preventDefault():c.returnValue=!1,this.state.isSwiping=!0),this.drag.updatedX=this.drag.currentX,(this.drag.currentY>16||this.drag.currentY<-16)&&this.state.isSwiping===!1&&(this.state.isScrolling=!0,this.drag.updatedX=this.drag.start),this.animate(this.drag.updatedX)))},e.prototype.onDragEnd=function(b){var d,e,f;if(this.state.isTouch){if("mouseup"===b.type&&this.$stage.removeClass("owl-grab"),this.trigger("dragged"),this.drag.targetEl.removeAttribute("draggable"),this.state.isTouch=!1,this.state.isScrolling=!1,this.state.isSwiping=!1,0===this.drag.distance&&this.state.inMotion!==!0)return this.state.inMotion=!1,!1;this.drag.endTime=(new Date).getTime(),d=this.drag.endTime-this.drag.startTime,e=Math.abs(this.drag.distance),(e>3||d>300)&&this.removeClick(this.drag.targetEl),f=this.closest(this.drag.updatedX),this.speed(this.settings.dragEndSpeed||this.settings.smartSpeed),this.current(f),this.invalidate("position"),this.update(),this.settings.pullDrag||this.drag.updatedX!==this.coordinates(f)||this.transitionEnd(),this.drag.distance=0,a(c).off(".owl.dragEvents")}},e.prototype.removeClick=function(c){this.drag.targetEl=c,a(c).on("click.preventClick",this.e._preventClick),b.setTimeout(function(){a(c).off("click.preventClick")},300)},e.prototype.preventClick=function(b){b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation&&b.stopPropagation(),a(b.target).off("click.preventClick")},e.prototype.getTransformProperty=function(){var a,c;return a=b.getComputedStyle(this.$stage.get(0),null).getPropertyValue(this.vendorName+"transform"),a=a.replace(/matrix(3d)?\(|\)/g,"").split(","),c=16===a.length,c!==!0?a[4]:a[12]},e.prototype.closest=function(b){var c=-1,d=30,e=this.width(),f=this.coordinates();return this.settings.freeDrag||a.each(f,a.proxy(function(a,g){return b>g-d&&g+d>b?c=a:this.op(b,"<",g)&&this.op(b,">",f[a+1]||g-e)&&(c="left"===this.state.direction?a+1:a),-1===c},this)),this.settings.loop||(this.op(b,">",f[this.minimum()])?c=b=this.minimum():this.op(b,"<",f[this.maximum()])&&(c=b=this.maximum())),c},e.prototype.animate=function(b){this.trigger("translate"),this.state.inMotion=this.speed()>0,this.support3d?this.$stage.css({transform:"translate3d("+b+"px,0px, 0px)",transition:this.speed()/1e3+"s"}):this.state.isTouch?this.$stage.css({left:b+"px"}):this.$stage.animate({left:b},this.speed()/1e3,this.settings.fallbackEasing,a.proxy(function(){this.state.inMotion&&this.transitionEnd()},this))},e.prototype.current=function(a){if(a===d)return this._current;if(0===this._items.length)return d;if(a=this.normalize(a),this._current!==a){var b=this.trigger("change",{property:{name:"position",value:a}});b.data!==d&&(a=this.normalize(b.data)),this._current=a,this.invalidate("position"),this.trigger("changed",{property:{name:"position",value:this._current}})}return this._current},e.prototype.invalidate=function(a){this._invalidated[a]=!0},e.prototype.reset=function(a){a=this.normalize(a),a!==d&&(this._speed=0,this._current=a,this.suppress(["translate","translated"]),this.animate(this.coordinates(a)),this.release(["translate","translated"]))},e.prototype.normalize=function(b,c){var e=c?this._items.length:this._items.length+this._clones.length;return!a.isNumeric(b)||1>e?d:b=this._clones.length?(b%e+e)%e:Math.max(this.minimum(c),Math.min(this.maximum(c),b))},e.prototype.relative=function(a){return a=this.normalize(a),a-=this._clones.length/2,this.normalize(a,!0)},e.prototype.maximum=function(a){var b,c,d,e=0,f=this.settings;if(a)return this._items.length-1;if(!f.loop&&f.center)b=this._items.length-1;else if(f.loop||f.center)if(f.loop||f.center)b=this._items.length+f.items;else{if(!f.autoWidth&&!f.merge)throw"Can not detect maximum absolute position.";for(revert=f.rtl?1:-1,c=this.$stage.width()-this.$element.width();(d=this.coordinates(e))&&!(d*revert>=c);)b=++e}else b=this._items.length-f.items;return b},e.prototype.minimum=function(a){return a?0:this._clones.length/2},e.prototype.items=function(a){return a===d?this._items.slice():(a=this.normalize(a,!0),this._items[a])},e.prototype.mergers=function(a){return a===d?this._mergers.slice():(a=this.normalize(a,!0),this._mergers[a])},e.prototype.clones=function(b){var c=this._clones.length/2,e=c+this._items.length,f=function(a){return a%2===0?e+a/2:c-(a+1)/2};return b===d?a.map(this._clones,function(a,b){return f(b)}):a.map(this._clones,function(a,c){return a===b?f(c):null})},e.prototype.speed=function(a){return a!==d&&(this._speed=a),this._speed},e.prototype.coordinates=function(b){var c=null;return b===d?a.map(this._coordinates,a.proxy(function(a,b){return this.coordinates(b)},this)):(this.settings.center?(c=this._coordinates[b],c+=(this.width()-c+(this._coordinates[b-1]||0))/2*(this.settings.rtl?-1:1)):c=this._coordinates[b-1]||0,c)},e.prototype.duration=function(a,b,c){return Math.min(Math.max(Math.abs(b-a),1),6)*Math.abs(c||this.settings.smartSpeed)},e.prototype.to=function(c,d){if(this.settings.loop){var e=c-this.relative(this.current()),f=this.current(),g=this.current(),h=this.current()+e,i=0>g-h?!0:!1,j=this._clones.length+this._items.length;h<this.settings.items&&i===!1?(f=g+this._items.length,this.reset(f)):h>=j-this.settings.items&&i===!0&&(f=g-this._items.length,this.reset(f)),b.clearTimeout(this.e._goToLoop),this.e._goToLoop=b.setTimeout(a.proxy(function(){this.speed(this.duration(this.current(),f+e,d)),this.current(f+e),this.update()},this),30)}else this.speed(this.duration(this.current(),c,d)),this.current(c),this.update()},e.prototype.next=function(a){a=a||!1,this.to(this.relative(this.current())+1,a)},e.prototype.prev=function(a){a=a||!1,this.to(this.relative(this.current())-1,a)},e.prototype.transitionEnd=function(a){return a!==d&&(a.stopPropagation(),(a.target||a.srcElement||a.originalTarget)!==this.$stage.get(0))?!1:(this.state.inMotion=!1,void this.trigger("translated"))},e.prototype.viewport=function(){var d;if(this.options.responsiveBaseElement!==b)d=a(this.options.responsiveBaseElement).width();else if(b.innerWidth)d=b.innerWidth;else{if(!c.documentElement||!c.documentElement.clientWidth)throw"Can not detect viewport width.";d=c.documentElement.clientWidth}return d},e.prototype.replace=function(b){this.$stage.empty(),this._items=[],b&&(b=b instanceof jQuery?b:a(b)),this.settings.nestedItemSelector&&(b=b.find("."+this.settings.nestedItemSelector)),b.filter(function(){return 1===this.nodeType}).each(a.proxy(function(a,b){b=this.prepare(b),this.$stage.append(b),this._items.push(b),this._mergers.push(1*b.find("[data-merge]").andSelf("[data-merge]").attr("data-merge")||1)},this)),this.reset(a.isNumeric(this.settings.startPosition)?this.settings.startPosition:0),this.invalidate("items")},e.prototype.add=function(a,b){b=b===d?this._items.length:this.normalize(b,!0),this.trigger("add",{content:a,position:b}),0===this._items.length||b===this._items.length?(this.$stage.append(a),this._items.push(a),this._mergers.push(1*a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge")||1)):(this._items[b].before(a),this._items.splice(b,0,a),this._mergers.splice(b,0,1*a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge")||1)),this.invalidate("items"),this.trigger("added",{content:a,position:b})},e.prototype.remove=function(a){a=this.normalize(a,!0),a!==d&&(this.trigger("remove",{content:this._items[a],position:a}),this._items[a].remove(),this._items.splice(a,1),this._mergers.splice(a,1),this.invalidate("items"),this.trigger("removed",{content:null,position:a}))},e.prototype.addTriggerableEvents=function(){var b=a.proxy(function(b,c){return a.proxy(function(a){a.relatedTarget!==this&&(this.suppress([c]),b.apply(this,[].slice.call(arguments,1)),this.release([c]))},this)},this);a.each({next:this.next,prev:this.prev,to:this.to,destroy:this.destroy,refresh:this.refresh,replace:this.replace,add:this.add,remove:this.remove},a.proxy(function(a,c){this.$element.on(a+".owl.carousel",b(c,a+".owl.carousel"))},this))},e.prototype.watchVisibility=function(){function c(a){return a.offsetWidth>0&&a.offsetHeight>0}function d(){c(this.$element.get(0))&&(this.$element.removeClass("owl-hidden"),this.refresh(),b.clearInterval(this.e._checkVisibile))}c(this.$element.get(0))||(this.$element.addClass("owl-hidden"),b.clearInterval(this.e._checkVisibile),this.e._checkVisibile=b.setInterval(a.proxy(d,this),500))},e.prototype.preloadAutoWidthImages=function(b){var c,d,e,f;c=0,d=this,b.each(function(g,h){e=a(h),f=new Image,f.onload=function(){c++,e.attr("src",f.src),e.css("opacity",1),c>=b.length&&(d.state.imagesLoaded=!0,d.initialize())},f.src=e.attr("src")||e.attr("data-src")||e.attr("data-src-retina")})},e.prototype.destroy=function(){this.$element.hasClass(this.settings.themeClass)&&this.$element.removeClass(this.settings.themeClass),this.settings.responsive!==!1&&a(b).off("resize.owl.carousel"),this.transitionEndVendor&&this.off(this.$stage.get(0),this.transitionEndVendor,this.e._transitionEnd);for(var d in this._plugins)this._plugins[d].destroy();(this.settings.mouseDrag||this.settings.touchDrag)&&(this.$stage.off("mousedown touchstart touchcancel"),a(c).off(".owl.dragEvents"),this.$stage.get(0).onselectstart=function(){},this.$stage.off("dragstart",function(){return!1})),this.$element.off(".owl"),this.$stage.children(".cloned").remove(),this.e=null,this.$element.removeData("owlCarousel"),this.$stage.children().contents().unwrap(),this.$stage.children().unwrap(),this.$stage.unwrap()},e.prototype.op=function(a,b,c){var d=this.settings.rtl;switch(b){case"<":return d?a>c:c>a;case">":return d?c>a:a>c;case">=":return d?c>=a:a>=c;case"<=":return d?a>=c:c>=a}},e.prototype.on=function(a,b,c,d){a.addEventListener?a.addEventListener(b,c,d):a.attachEvent&&a.attachEvent("on"+b,c)},e.prototype.off=function(a,b,c,d){a.removeEventListener?a.removeEventListener(b,c,d):a.detachEvent&&a.detachEvent("on"+b,c)},e.prototype.trigger=function(b,c,d){var e={item:{count:this._items.length,index:this.current()}},f=a.camelCase(a.grep(["on",b,d],function(a){return a}).join("-").toLowerCase()),g=a.Event([b,"owl",d||"carousel"].join(".").toLowerCase(),a.extend({relatedTarget:this},e,c));return this._supress[b]||(a.each(this._plugins,function(a,b){b.onTrigger&&b.onTrigger(g)}),this.$element.trigger(g),this.settings&&"function"==typeof this.settings[f]&&this.settings[f].apply(this,g)),g},e.prototype.suppress=function(b){a.each(b,a.proxy(function(a,b){this._supress[b]=!0},this))},e.prototype.release=function(b){a.each(b,a.proxy(function(a,b){delete this._supress[b]},this))},e.prototype.browserSupport=function(){if(this.support3d=j(),this.support3d){this.transformVendor=i();var a=["transitionend","webkitTransitionEnd","transitionend","oTransitionEnd"];this.transitionEndVendor=a[h()],this.vendorName=this.transformVendor.replace(/Transform/i,""),this.vendorName=""!==this.vendorName?"-"+this.vendorName.toLowerCase()+"-":""}this.state.orientation=b.orientation},a.fn.owlCarousel=function(b){return this.each(function(){a(this).data("owlCarousel")||a(this).data("owlCarousel",new e(this,b))})},a.fn.owlCarousel.Constructor=e}(window.Zepto||window.jQuery,window,document),function(a,b){var c=function(b){this._core=b,this._loaded=[],this._handlers={"initialized.owl.carousel change.owl.carousel":a.proxy(function(b){if(b.namespace&&this._core.settings&&this._core.settings.lazyLoad&&(b.property&&"position"==b.property.name||"initialized"==b.type))for(var c=this._core.settings,d=c.center&&Math.ceil(c.items/2)||c.items,e=c.center&&-1*d||0,f=(b.property&&b.property.value||this._core.current())+e,g=this._core.clones().length,h=a.proxy(function(a,b){this.load(b)},this);e++<d;)this.load(g/2+this._core.relative(f)),g&&a.each(this._core.clones(this._core.relative(f++)),h)},this)},this._core.options=a.extend({},c.Defaults,this._core.options),this._core.$element.on(this._handlers)};c.Defaults={lazyLoad:!1},c.prototype.load=function(c){var d=this._core.$stage.children().eq(c),e=d&&d.find(".owl-lazy");!e||a.inArray(d.get(0),this._loaded)>-1||(e.each(a.proxy(function(c,d){var e,f=a(d),g=b.devicePixelRatio>1&&f.attr("data-src-retina")||f.attr("data-src");this._core.trigger("load",{element:f,url:g},"lazy"),f.is("img")?f.one("load.owl.lazy",a.proxy(function(){f.css("opacity",1),this._core.trigger("loaded",{element:f,url:g},"lazy")},this)).attr("src",g):(e=new Image,e.onload=a.proxy(function(){f.css({"background-image":"url("+g+")",opacity:"1"}),this._core.trigger("loaded",{element:f,url:g},"lazy")},this),e.src=g)},this)),this._loaded.push(d.get(0)))},c.prototype.destroy=function(){var a,b;for(a in this.handlers)this._core.$element.off(a,this.handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.Lazy=c}(window.Zepto||window.jQuery,window,document),function(a){var b=function(c){this._core=c,this._handlers={"initialized.owl.carousel":a.proxy(function(){this._core.settings.autoHeight&&this.update()},this),"changed.owl.carousel":a.proxy(function(a){this._core.settings.autoHeight&&"position"==a.property.name&&this.update()},this),"loaded.owl.lazy":a.proxy(function(a){this._core.settings.autoHeight&&a.element.closest("."+this._core.settings.itemClass)===this._core.$stage.children().eq(this._core.current())&&this.update()},this)},this._core.options=a.extend({},b.Defaults,this._core.options),this._core.$element.on(this._handlers)};b.Defaults={autoHeight:!1,autoHeightClass:"owl-height"},b.prototype.update=function(){this._core.$stage.parent().height(this._core.$stage.children().eq(this._core.current()).height()).addClass(this._core.settings.autoHeightClass)},b.prototype.destroy=function(){var a,b;for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.AutoHeight=b}(window.Zepto||window.jQuery,window,document),function(a,b,c){var d=function(b){this._core=b,this._videos={},this._playing=null,this._fullscreen=!1,this._handlers={"resize.owl.carousel":a.proxy(function(a){this._core.settings.video&&!this.isInFullScreen()&&a.preventDefault()},this),"refresh.owl.carousel changed.owl.carousel":a.proxy(function(){this._playing&&this.stop()},this),"prepared.owl.carousel":a.proxy(function(b){var c=a(b.content).find(".owl-video");c.length&&(c.css("display","none"),this.fetch(c,a(b.content)))},this)},this._core.options=a.extend({},d.Defaults,this._core.options),this._core.$element.on(this._handlers),this._core.$element.on("click.owl.video",".owl-video-play-icon",a.proxy(function(a){this.play(a)},this))};d.Defaults={video:!1,videoHeight:!1,videoWidth:!1},d.prototype.fetch=function(a,b){var c=a.attr("data-vimeo-id")?"vimeo":"youtube",d=a.attr("data-vimeo-id")||a.attr("data-youtube-id"),e=a.attr("data-width")||this._core.settings.videoWidth,f=a.attr("data-height")||this._core.settings.videoHeight,g=a.attr("href");if(!g)throw new Error("Missing video URL.");if(d=g.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/),d[3].indexOf("youtu")>-1)c="youtube";else{if(!(d[3].indexOf("vimeo")>-1))throw new Error("Video URL not supported.");c="vimeo"}d=d[6],this._videos[g]={type:c,id:d,width:e,height:f},b.attr("data-video",g),this.thumbnail(a,this._videos[g])},d.prototype.thumbnail=function(b,c){var d,e,f,g=c.width&&c.height?'style="width:'+c.width+"px;height:"+c.height+'px;"':"",h=b.find("img"),i="src",j="",k=this._core.settings,l=function(a){e='<div class="owl-video-play-icon"></div>',d=k.lazyLoad?'<div class="owl-video-tn '+j+'" '+i+'="'+a+'"></div>':'<div class="owl-video-tn" style="opacity:1;background-image:url('+a+')"></div>',b.after(d),b.after(e)};return b.wrap('<div class="owl-video-wrapper"'+g+"></div>"),this._core.settings.lazyLoad&&(i="data-src",j="owl-lazy"),h.length?(l(h.attr(i)),h.remove(),!1):void("youtube"===c.type?(f="http://img.youtube.com/vi/"+c.id+"/hqdefault.jpg",l(f)):"vimeo"===c.type&&a.ajax({type:"GET",url:"http://vimeo.com/api/v2/video/"+c.id+".json",jsonp:"callback",dataType:"jsonp",success:function(a){f=a[0].thumbnail_large,l(f)}}))},d.prototype.stop=function(){this._core.trigger("stop",null,"video"),this._playing.find(".owl-video-frame").remove(),this._playing.removeClass("owl-video-playing"),this._playing=null},d.prototype.play=function(b){this._core.trigger("play",null,"video"),this._playing&&this.stop();var c,d,e=a(b.target||b.srcElement),f=e.closest("."+this._core.settings.itemClass),g=this._videos[f.attr("data-video")],h=g.width||"100%",i=g.height||this._core.$stage.height();"youtube"===g.type?c='<iframe width="'+h+'" height="'+i+'" src="http://www.youtube.com/embed/'+g.id+"?autoplay=1&v="+g.id+'" frameborder="0" allowfullscreen></iframe>':"vimeo"===g.type&&(c='<iframe src="http://player.vimeo.com/video/'+g.id+'?autoplay=1" width="'+h+'" height="'+i+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'),f.addClass("owl-video-playing"),this._playing=f,d=a('<div style="height:'+i+"px; width:"+h+'px" class="owl-video-frame">'+c+"</div>"),e.after(d)},d.prototype.isInFullScreen=function(){var d=c.fullscreenElement||c.mozFullScreenElement||c.webkitFullscreenElement;return d&&a(d).parent().hasClass("owl-video-frame")&&(this._core.speed(0),this._fullscreen=!0),d&&this._fullscreen&&this._playing?!1:this._fullscreen?(this._fullscreen=!1,!1):this._playing&&this._core.state.orientation!==b.orientation?(this._core.state.orientation=b.orientation,!1):!0},d.prototype.destroy=function(){var a,b;this._core.$element.off("click.owl.video");for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.Video=d}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this.core=b,this.core.options=a.extend({},e.Defaults,this.core.options),this.swapping=!0,this.previous=d,this.next=d,this.handlers={"change.owl.carousel":a.proxy(function(a){"position"==a.property.name&&(this.previous=this.core.current(),this.next=a.property.value)},this),"drag.owl.carousel dragged.owl.carousel translated.owl.carousel":a.proxy(function(a){this.swapping="translated"==a.type},this),"translate.owl.carousel":a.proxy(function(){this.swapping&&(this.core.options.animateOut||this.core.options.animateIn)&&this.swap()},this)},this.core.$element.on(this.handlers)};e.Defaults={animateOut:!1,animateIn:!1},e.prototype.swap=function(){if(1===this.core.settings.items&&this.core.support3d){this.core.speed(0);var b,c=a.proxy(this.clear,this),d=this.core.$stage.children().eq(this.previous),e=this.core.$stage.children().eq(this.next),f=this.core.settings.animateIn,g=this.core.settings.animateOut;this.core.current()!==this.previous&&(g&&(b=this.core.coordinates(this.previous)-this.core.coordinates(this.next),d.css({left:b+"px"}).addClass("animated owl-animated-out").addClass(g).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",c)),f&&e.addClass("animated owl-animated-in").addClass(f).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",c))}},e.prototype.clear=function(b){a(b.target).css({left:""}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut),this.core.transitionEnd()},e.prototype.destroy=function(){var a,b;for(a in this.handlers)this.core.$element.off(a,this.handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.Animate=e}(window.Zepto||window.jQuery,window,document),function(a,b,c){var d=function(b){this.core=b,this.core.options=a.extend({},d.Defaults,this.core.options),this.handlers={"translated.owl.carousel refreshed.owl.carousel":a.proxy(function(){this.autoplay()
},this),"play.owl.autoplay":a.proxy(function(a,b,c){this.play(b,c)},this),"stop.owl.autoplay":a.proxy(function(){this.stop()},this),"mouseover.owl.autoplay":a.proxy(function(){this.core.settings.autoplayHoverPause&&this.pause()},this),"mouseleave.owl.autoplay":a.proxy(function(){this.core.settings.autoplayHoverPause&&this.autoplay()},this)},this.core.$element.on(this.handlers)};d.Defaults={autoplay:!1,autoplayTimeout:5e3,autoplayHoverPause:!1,autoplaySpeed:!1},d.prototype.autoplay=function(){this.core.settings.autoplay&&!this.core.state.videoPlay?(b.clearInterval(this.interval),this.interval=b.setInterval(a.proxy(function(){this.play()},this),this.core.settings.autoplayTimeout)):b.clearInterval(this.interval)},d.prototype.play=function(){return c.hidden===!0||this.core.state.isTouch||this.core.state.isScrolling||this.core.state.isSwiping||this.core.state.inMotion?void 0:this.core.settings.autoplay===!1?void b.clearInterval(this.interval):void this.core.next(this.core.settings.autoplaySpeed)},d.prototype.stop=function(){b.clearInterval(this.interval)},d.prototype.pause=function(){b.clearInterval(this.interval)},d.prototype.destroy=function(){var a,c;b.clearInterval(this.interval);for(a in this.handlers)this.core.$element.off(a,this.handlers[a]);for(c in Object.getOwnPropertyNames(this))"function"!=typeof this[c]&&(this[c]=null)},a.fn.owlCarousel.Constructor.Plugins.autoplay=d}(window.Zepto||window.jQuery,window,document),function(a){"use strict";var b=function(c){this._core=c,this._initialized=!1,this._pages=[],this._controls={},this._templates=[],this.$element=this._core.$element,this._overrides={next:this._core.next,prev:this._core.prev,to:this._core.to},this._handlers={"prepared.owl.carousel":a.proxy(function(b){this._core.settings.dotsData&&this._templates.push(a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))},this),"add.owl.carousel":a.proxy(function(b){this._core.settings.dotsData&&this._templates.splice(b.position,0,a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))},this),"remove.owl.carousel prepared.owl.carousel":a.proxy(function(a){this._core.settings.dotsData&&this._templates.splice(a.position,1)},this),"change.owl.carousel":a.proxy(function(a){if("position"==a.property.name&&!this._core.state.revert&&!this._core.settings.loop&&this._core.settings.navRewind){var b=this._core.current(),c=this._core.maximum(),d=this._core.minimum();a.data=a.property.value>c?b>=c?d:c:a.property.value<d?c:a.property.value}},this),"changed.owl.carousel":a.proxy(function(a){"position"==a.property.name&&this.draw()},this),"refreshed.owl.carousel":a.proxy(function(){this._initialized||(this.initialize(),this._initialized=!0),this._core.trigger("refresh",null,"navigation"),this.update(),this.draw(),this._core.trigger("refreshed",null,"navigation")},this)},this._core.options=a.extend({},b.Defaults,this._core.options),this.$element.on(this._handlers)};b.Defaults={nav:!1,navRewind:!0,navText:["prev","next"],navSpeed:!1,navElement:"div",navContainer:!1,navContainerClass:"owl-nav",navClass:["owl-prev","owl-next"],slideBy:1,dotClass:"owl-dot",dotsClass:"owl-dots",dots:!0,dotsEach:!1,dotData:!1,dotsSpeed:!1,dotsContainer:!1,controlsClass:"owl-controls"},b.prototype.initialize=function(){var b,c,d=this._core.settings;d.dotsData||(this._templates=[a("<div>").addClass(d.dotClass).append(a("<span>")).prop("outerHTML")]),d.navContainer&&d.dotsContainer||(this._controls.$container=a("<div>").addClass(d.controlsClass).appendTo(this.$element)),this._controls.$indicators=d.dotsContainer?a(d.dotsContainer):a("<div>").hide().addClass(d.dotsClass).appendTo(this._controls.$container),this._controls.$indicators.on("click","div",a.proxy(function(b){var c=a(b.target).parent().is(this._controls.$indicators)?a(b.target).index():a(b.target).parent().index();b.preventDefault(),this.to(c,d.dotsSpeed)},this)),b=d.navContainer?a(d.navContainer):a("<div>").addClass(d.navContainerClass).prependTo(this._controls.$container),this._controls.$next=a("<"+d.navElement+">"),this._controls.$previous=this._controls.$next.clone(),this._controls.$previous.addClass(d.navClass[0]).html(d.navText[0]).hide().prependTo(b).on("click",a.proxy(function(){this.prev(d.navSpeed)},this)),this._controls.$next.addClass(d.navClass[1]).html(d.navText[1]).hide().appendTo(b).on("click",a.proxy(function(){this.next(d.navSpeed)},this));for(c in this._overrides)this._core[c]=a.proxy(this[c],this)},b.prototype.destroy=function(){var a,b,c,d;for(a in this._handlers)this.$element.off(a,this._handlers[a]);for(b in this._controls)this._controls[b].remove();for(d in this.overides)this._core[d]=this._overrides[d];for(c in Object.getOwnPropertyNames(this))"function"!=typeof this[c]&&(this[c]=null)},b.prototype.update=function(){var a,b,c,d=this._core.settings,e=this._core.clones().length/2,f=e+this._core.items().length,g=d.center||d.autoWidth||d.dotData?1:d.dotsEach||d.items;if("page"!==d.slideBy&&(d.slideBy=Math.min(d.slideBy,d.items)),d.dots||"page"==d.slideBy)for(this._pages=[],a=e,b=0,c=0;f>a;a++)(b>=g||0===b)&&(this._pages.push({start:a-e,end:a-e+g-1}),b=0,++c),b+=this._core.mergers(this._core.relative(a))},b.prototype.draw=function(){var b,c,d="",e=this._core.settings,f=(this._core.$stage.children(),this._core.relative(this._core.current()));if(!e.nav||e.loop||e.navRewind||(this._controls.$previous.toggleClass("disabled",0>=f),this._controls.$next.toggleClass("disabled",f>=this._core.maximum())),this._controls.$previous.toggle(e.nav),this._controls.$next.toggle(e.nav),e.dots){if(b=this._pages.length-this._controls.$indicators.children().length,e.dotData&&0!==b){for(c=0;c<this._controls.$indicators.children().length;c++)d+=this._templates[this._core.relative(c)];this._controls.$indicators.html(d)}else b>0?(d=new Array(b+1).join(this._templates[0]),this._controls.$indicators.append(d)):0>b&&this._controls.$indicators.children().slice(b).remove();this._controls.$indicators.find(".active").removeClass("active"),this._controls.$indicators.children().eq(a.inArray(this.current(),this._pages)).addClass("active")}this._controls.$indicators.toggle(e.dots)},b.prototype.onTrigger=function(b){var c=this._core.settings;b.page={index:a.inArray(this.current(),this._pages),count:this._pages.length,size:c&&(c.center||c.autoWidth||c.dotData?1:c.dotsEach||c.items)}},b.prototype.current=function(){var b=this._core.relative(this._core.current());return a.grep(this._pages,function(a){return a.start<=b&&a.end>=b}).pop()},b.prototype.getPosition=function(b){var c,d,e=this._core.settings;return"page"==e.slideBy?(c=a.inArray(this.current(),this._pages),d=this._pages.length,b?++c:--c,c=this._pages[(c%d+d)%d].start):(c=this._core.relative(this._core.current()),d=this._core.items().length,b?c+=e.slideBy:c-=e.slideBy),c},b.prototype.next=function(b){a.proxy(this._overrides.to,this._core)(this.getPosition(!0),b)},b.prototype.prev=function(b){a.proxy(this._overrides.to,this._core)(this.getPosition(!1),b)},b.prototype.to=function(b,c,d){var e;d?a.proxy(this._overrides.to,this._core)(b,c):(e=this._pages.length,a.proxy(this._overrides.to,this._core)(this._pages[(b%e+e)%e].start,c))},a.fn.owlCarousel.Constructor.Plugins.Navigation=b}(window.Zepto||window.jQuery,window,document),function(a,b){"use strict";var c=function(d){this._core=d,this._hashes={},this.$element=this._core.$element,this._handlers={"initialized.owl.carousel":a.proxy(function(){"URLHash"==this._core.settings.startPosition&&a(b).trigger("hashchange.owl.navigation")},this),"prepared.owl.carousel":a.proxy(function(b){var c=a(b.content).find("[data-hash]").andSelf("[data-hash]").attr("data-hash");this._hashes[c]=b.content},this)},this._core.options=a.extend({},c.Defaults,this._core.options),this.$element.on(this._handlers),a(b).on("hashchange.owl.navigation",a.proxy(function(){var a=b.location.hash.substring(1),c=this._core.$stage.children(),d=this._hashes[a]&&c.index(this._hashes[a])||0;return a?void this._core.to(d,!1,!0):!1},this))};c.Defaults={URLhashListener:!1},c.prototype.destroy=function(){var c,d;a(b).off("hashchange.owl.navigation");for(c in this._handlers)this._core.$element.off(c,this._handlers[c]);for(d in Object.getOwnPropertyNames(this))"function"!=typeof this[d]&&(this[d]=null)},a.fn.owlCarousel.Constructor.Plugins.Hash=c}(window.Zepto||window.jQuery,window,document);
/*
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/



;(function(e,t,n,r){e.fn.doubleTapToGo=function(r){if(!("ontouchstart"in t)&&!navigator.msMaxTouchPoints&&!navigator.userAgent.toLowerCase().match(/windows phone os 7/i))return false;this.each(function(){var t=false;e(this).on("click",function(n){var r=e(this);if(r[0]!=t[0]){n.preventDefault();t=r}});e(n).on("click touchstart MSPointerDown",function(n){var r=true,i=e(n.target).parents();for(var s=0;s<i.length;s++)if(i[s]==t[0])r=false;if(r)t=false})});return this}})(jQuery,window,document);
/*!
 * enquire.js v2.1.0 - Awesome Media Queries in JavaScript
 * Copyright (c) 2013 Nick Williams - http://wicky.nillia.ms/enquire.js
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function(t,i,n){var e=i.matchMedia;"undefined"!=typeof module&&module.exports?module.exports=n(e):"function"==typeof define&&define.amd?define(function(){return i[t]=n(e)}):i[t]=n(e)})("enquire",this,function(t){"use strict";function i(t,i){var n,e=0,s=t.length;for(e;s>e&&(n=i(t[e],e),n!==!1);e++);}function n(t){return"[object Array]"===Object.prototype.toString.apply(t)}function e(t){return"function"==typeof t}function s(t){this.options=t,!t.deferSetup&&this.setup()}function o(i,n){this.query=i,this.isUnconditional=n,this.handlers=[],this.mql=t(i);var e=this;this.listener=function(t){e.mql=t,e.assess()},this.mql.addListener(this.listener)}function r(){if(!t)throw Error("matchMedia not present, legacy browsers require a polyfill");this.queries={},this.browserIsIncapable=!t("only all").matches}return s.prototype={setup:function(){this.options.setup&&this.options.setup(),this.initialised=!0},on:function(){!this.initialised&&this.setup(),this.options.match&&this.options.match()},off:function(){this.options.unmatch&&this.options.unmatch()},destroy:function(){this.options.destroy?this.options.destroy():this.off()},equals:function(t){return this.options===t||this.options.match===t}},o.prototype={addHandler:function(t){var i=new s(t);this.handlers.push(i),this.matches()&&i.on()},removeHandler:function(t){var n=this.handlers;i(n,function(i,e){return i.equals(t)?(i.destroy(),!n.splice(e,1)):void 0})},matches:function(){return this.mql.matches||this.isUnconditional},clear:function(){i(this.handlers,function(t){t.destroy()}),this.mql.removeListener(this.listener),this.handlers.length=0},assess:function(){var t=this.matches()?"on":"off";i(this.handlers,function(i){i[t]()})}},r.prototype={register:function(t,s,r){var h=this.queries,u=r&&this.browserIsIncapable;return h[t]||(h[t]=new o(t,u)),e(s)&&(s={match:s}),n(s)||(s=[s]),i(s,function(i){h[t].addHandler(i)}),this},unregister:function(t,i){var n=this.queries[t];return n&&(i?n.removeHandler(i):(n.clear(),delete this.queries[t])),this}},new r});
/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
//
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
//
// About: Release History
//
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
//
// Topic: Note for non-jQuery users
//
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
//
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.

  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),

    // Internal method reference.
    jq_throttle;

  // Method: jQuery.throttle
  //
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  //
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  //
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // >
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  //
  // Usage:
  //
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, throttled, function.

  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,

      // Keep track of the last time `callback` was executed.
      last_exec = 0;

    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }

    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;

      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };

      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };

      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }

      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );

      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();

      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        //
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        //
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };

    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }

    // Return the wrapper function.
    return wrapper;
  };

  // Method: jQuery.debounce
  //
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  //
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  //
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // >
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  //
  // Usage:
  //
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, debounced, function.

  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };

})(this);
// cookieControl version 6.2 (2015-05-19, R267, gerasimos)
// Copyright (c) 2015 Civic UK (http://www.civicuk.com/cookie-law/)
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(e,f){for(var b=(f||0),a=this.length;b<a;b++){if(this[b]===e){return b}}return -1}}if(!String.prototype.trim){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}}var CookieControl={VERSION:6,PROD_FREE:"cookiecontrol free",PROD_PAID:"cookiecontrol single-site",PROD_PAID_MULTISITE:"cookiecontrol multi-site",PROD_PAID_CUSTOM:"cookiecontrol custom",HOME_URL:"http://cookie-control.civiccomputing.com/",BROWSER_HELP:"http://cookie-control.civiccomputing.com/browser-settings",MODEL_INFO:"info",MODEL_IMPLICIT:"impl",MODEL_EXPLICIT:"expl",STYLE_TRIANGLE:"ccc-triangle",STYLE_SQUARE:"ccc-square",STYLE_DIAMOND:"ccc-diamond",STYLE_BAR:"ccc-bar",POS_LEFT:"ccc-left",POS_RIGHT:"ccc-right",POS_TOP:"ccc-top",POS_BOTTOM:"ccc-bottom",THEME_LIGHT:"ccc-light",THEME_DARK:"ccc-dark",MODEL_INFORMATION:this.MODEL_INFO,MODEL_INFORMATIONAL:this.MODEL_INFO,MODEL_IMPLIED:this.MODEL_IMPLICIT,options:{countries:"United Kingdom",style:this.STYLE_TRIANGLE,position:this.POS_LEFT,theme:this.THEME_LIGHT,cookieName:"civicCookieControl",cookieExpiry:90,blockedCookieExpiry:90,protectedCookies:[],cookiePath:"/",cookieDomain:"",onlyHideIfConsented:false,autoFadeSpeed:1000,initialFadeSpeed:750,clickFadeSpeed:200,expandSpeed:200,startOpen:false,autoHide:7000,autoDelete:true,domain:"",subdomains:true,css:"html #cccwr,html #cccwr *{border:0;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}#cccwr #ccc-hdricon,#cccwr .ccc-close,#cccwr #ccc-icon a,#cccwr #cctoggle,#cccwr.ccc-bar,#cccwr #ccc-icon button{background-image:url('//apikeys.civiccomputing.com/p/cc/6.2/ccc-icons.png')}#cccwr{z-index:10001}#cccwr *,#cccwr *:active{outline:0}div#cccwr div{font-size:11px;line-height:16px;font-family:sans-serif;margin:0;text-align:left}div#cccwr #ccc-icon{cursor:pointer;display:none;z-index:9999;bottom:0;left:0;position:fixed}#cccwr.ccc-right{left:auto;right:0}div#cccwr.ccc-diamond #ccc-icon{bottom:-3px;left:-3px}div#cccwr.ccc-diamond.ccc-right #ccc-icon{bottom:-3px;left:auto;right:-3px}div#cccwr.ccc-square #ccc-icon{bottom:-3px;left:6px}div#cccwr.ccc-square.ccc-right #ccc-icon{bottom:-3px;left:auto;right:-6px}div#ccc-icon a{border:0;height:70px;width:70px;background-color:transparent}div#ccc-icon a:hover{text-decoration:none}div#ccc-icon a span{visibility:hidden;text-decoration:none!important}div#ccc-icon a span:hover{text-decoration:none!important}.ccc-bar div#ccc-icon{display:none!important}#ccc-ias{display:none}.ccc-bar #ccc-ias{display:inline!important;position:relative!important;float:right!important;width:auto;height:auto;overflow:hidden;background:transparent;padding:12px 9px 8px 9px;text-indent:0;color:#000;font-size:14px;line-height:16px}#cccwr.ccc-bar.ccc-dark #ccc-ias{color:#f0942b}#cccwr.ccc-bar #ccc-ias:hover{text-decoration:underline}#ccc-ias2{display:block}.ccc-info #ccc-ias2,.ccc-bar #ccc-ias2{display:none}#ccc-icon a{display:block;background-position:0 0}.ccc-triangle.ccc-left #ccc-icon a{background-position:-70px 0}.ccc-triangle.ccc-right #ccc-icon a{background-position:-140px 0}.ccc-square #ccc-icon a{background-position:222px 0}div#cccwr.ccc-right #ccc-icon{left:auto;right:0}.ccc-widget{position:fixed;bottom:35px;left:70px;z-index:10001;display:none}div#cccwr.ccc-right .ccc-widget{left:auto;right:70px}.ccc-outer{background:#fff;border:1px solid #f0942b;border-radius:5px;-moz-border-radius:5px;-o-border-radius:5px;-webkit-border-radius:5px;box-shadow:0 0 5px rgba(0,0,0,0.3);color:#666;left:70px;width:200px;bottom:30px}.ccc-inner{position:relative;z-index:2;background:#fff;border-radius:5px;-moz-border-radius:5px;-o-border-radius:5px;-webkit-border-radius:5px}.ccc-bar .ccc-inner{background:transparent}.ccc-hdr{background-color:#f0942b;height:40px;border-radius:4px 4px 0 0;-moz-border-radius:4px 4px 0 0;-o-border-radius:4px 4px 0 0;-webkit-border-radius:4px 4px 0 0}.ccc-hdr span.ccc-title{display:none}.ccc-hdr span.ccc-title *{outline:0!important;margin:0!important;border:0!important;padding:0!important}.ccc-dark .ccc-hdr{background-color:#3e3e3e}.ccc-inner h2{color:#fff;font-size:1.3em;font-weight:bold;margin:0;padding:11px 9px 8px 44px}.ccc-c{margin:0;border:0;padding:0}.ccc-ci{padding:5px 10px 10px 10px;margin:0}#ccc-hdricon{background-repeat:no-repeat;background-position:-364px 8px;height:34px;left:0;position:absolute;text-indent:-999em;top:0;width:40px}.ccc-dark #ccc-hdricon{background-position:-313px 8px}#cccwr .ccc-close{background-color:transparent;background-repeat:no-repeat;background-position:-278px 2px;border:0;border-radius:3px;-moz-border-radius:3px;-o-border-radius:3px;-webkit-border-radius:3px;display:block;height:17px;width:17px;position:absolute;right:11px;top:11px;text-indent:-999em}#cccwr .ccc-close:hover{background-color:#000;background-color:rgba(0,0,0,0.15)}#cccwr.ccc-dark .ccc-close:hover{background-color:#f0942b}#cccwr .ccc-inner p{margin:5px 0 8px;padding:0}.ccc-inner ul{margin:8px 0;padding:0 0 0 12px}.ccc-inner a{color:#454545;text-decoration:none}.ccc-dark .ccc-inner a{color:#f0942b}.ccc-inner a:hover{text-decoration:underline}.ccc-inner .ccc-button{background-color:#666;border:1px solid #666;border-radius:3px;-moz-border-radius:3px;-o-border-radius:3px;-webkit-border-radius:3px;box-shadow:inset 0 0 2px #fff;color:#fff;display:block;font-size:1em;font-weight:bold;padding:3px;text-align:center;text-decoration:none;text-shadow:none}.ccc-inner .ccc-browser{background-color:#f0942b;border-color:#f0942b;width:100%}.ccc-expanded{display:none}.ccc-bar .ccc-expanded{display:block!important}.ccc-inner .ccc-ab{display:block;margin:0;position:relative;text-align:right;top:5px}.ccc-ab small{font-size:10px}#cccwr.ccc-left .ccc-outer,#cccwr.ccc-left .ccc-inner{border-radius:5px;-moz-border-radius:5px;-o-border-radius:5px;-webkit-border-radius:5px}#cccwr.ccc-left .ccc-expand{left:0;margin-left:0;right:auto}#cccwr.ccc-right .ccc-outer,#cccwr.ccc-right .ccc-inner{border-radius:5px 5px 0 5px;-moz-border-radius:5px 5px 0 5px;-o-border-radius:5px 5px 0 5px;-webkit-border-radius:5px 5px 0 5px}#cccwr.ccc-right .ccc-expand{left:auto;right:0}#cccwr.ccc-dark .ccc-outer{background-color:#3e3e3e;border-radius:5px;-moz-border-radius:5px;-o-border-radius:5px;-webkit-border-radius:5px;border-color:#000;color:#fff}#cccwr.ccc-dark.ccc-right .ccc-outer{border-radius:5px 5px 0 5px;-moz-border-radius:5px 5px 0 5px;-o-border-radius:5px 5px 0 5px;-webkit-border-radius:5px 5px 0 5px}#cccwr.ccc-dark .ccc-inner{background:transparent}#cccwr.ccc-dark .ccc-inner p{color:#fff}#cccwr.ccc-dark .ccc-inner h2{background-color:transparent;background-position:9px -54px;background-repeat:no-repeat}#cccwr.ccc-dark .ccc-c{padding-top:0}.ccc-dark #ccc-rmb{height:34px;z-index:10001}#cccwr.ccc-dark .ccc-expand{background:#3e3e3e;border:1px solid #000;border-top:0;color:#f0942b}#cccwr #ccc-cookies-switch{width:180px;height:30px;overflow:hidden;display:none}#cccwr .ccc-toggle-shadow{box-shadow:inset 1px 1px 5px 1px rgba(0,0,0,0.25);position:absolute;cursor:pointer}#cccwr.ccc-dark .ccc-toggle-shadow{box-shadow:inset 0 0 1px 1px rgba(0,0,0,0.25)}#cccwr .ccc-toggle-shadow,#cccwr #ccc-toggle,#cccwr .ccc-bt{width:180px;height:30px;border-radius:4px;-moz-border-radius:4px;-o-border-radius:4px;-webkit-border-radius:4px}#cccwr #ccc-toggle{overflow:hidden;box-shadow:inset 1px 1px 3px rgba(0,0,0,0.25);border-radius:4px;-moz-border-radius:4px;-o-border-radius:4px;-webkit-border-radius:4px;-moz-user-select:none;-webkit-user-select:none;-webkit-user-drag:none;white-space:nowrap}#cccwr #ccc-toggle div{width:365px;font-size:13px;line-height:28px;color:white}#cccwr.ccc-info.ccc-bar .ccc-toggle-shadow,#cccwr.ccc-info.ccc-bar #ccc-toggle{display:none!important}#cccwr #ccc-toggle a,#cccwr .ccc-bt{margin:0;border:0;padding:0;width:180px;height:30px;display:inline-block;color:#fff;text-align:center}#cccwr #ccc-toggle a:hover{text-decoration:none!important}#cccwr.ccc-bar .ccc-toggle-shadow,#cccwr.ccc-bar #ccc-toggle,#cccwr.ccc-bar .ccc-bt,#cccwr.ccc-bar #ccc-toggle a{width:263px}html #cccwr .ccc-bt{display:block;box-shadow:inset 1px 1px 5px 1px rgba(0,0,0,0.25);margin:1em 0;font-size:13px;line-height:28px}html #cccwr .ccc-bt:hover{text-decoration:none}#cccwr #ccc-toggle .ccc-1st{margin-right:5px}#cccwr .ccc-rd{background:#e6002e}#cccwr .ccc-or{background:#f0942b}#cccwr .ccc-gr{background:#4f8407}.cctoggle-on{background-position:100% 0!important}#cccwr #ccc-implicit-warning{display:none}#cccwr #ccc-explicit-checkbox{display:none}#cccwr .cctoggle-text-off{padding-left:20px}#cccwr .cctoggle-text-on{padding-left:70px}#cccwrpad{display:none}.ccc-bar.ccc-top #cccwrpad{border:0;margin:0;padding:0;display:none;height:50px}#cccwr.ccc-bar{position:fixed;display:none;height:50px;background-repeat:repeat-x;background-position:0 -210px;top:0;left:0;width:100%;border-bottom:solid 1px #888;box-shadow:0 -12px 10px 10px #000}#cccwr.ccc-bar.ccc-bottom{position:fixed;bottom:0;top:auto;border-bottom:0;border-top:solid 1px #888;box-shadow:0 12px 10px 10px #000;background-position:0 -310px}#cccwr.ccc-bar.ccc-dark{background-position:0 -260px;border-color:#000}.ccc-bar .ccc-outer{width:100%;background:transparent;border:0;box-shadow:none}#cccwr.ccc-dark.ccc-bar .ccc-outer{background:transparent}.ccc-bar .ccc-widget{position:relative;top:0;left:0}.ccc-bar.ccc-bottom .ccc-widget{top:inherit;bottom:inherit;padding:0 10px 4px 8px;height:auto}.ccc-bar .ccc-hdr{background:transparent;width:100%;overflow:hidden;padding:5px 10px 4px 8px;height:34px}html #cccwr.ccc-bar .ccc-hdr>*{position:relative!important;display:inline-block;float:left}.ccc-bar .ccc-hdr h2{color:#f0942b;display:inline;padding-left:5px}.ccc-bar #ccc-hdricon{background-position:-313px 8px}.ccc-bar .ccc-hdr span.ccc-title{display:inline;padding:11px 9px 8px 9px;font-size:14px}.ccc-bar.ccc-dark .ccc-title{color:#888}.ccc-bar .ccc-c{overflow:hidden;position:fixed;top:50px;right:0;width:337px}.ccc-bar .ccc-ci{display:block;visibility:hidden;position:relative;top:0;right:0;background:#fff;border:solid 1px #888;border-style:none none solid solid;overflow:hidden;width:263px;margin:0 0 7px auto!important;padding:12px 33px;box-shadow:12px -12px 10px 10px #000}.ccc-bar.ccc-dark .ccc-ci{background:#363636;border-color:#000;color:#fff}.ccc-bar.ccc-bottom .ccc-c{top:auto;bottom:50px}.ccc-bar.ccc-bottom .ccc-ci{border-style:solid none none solid;margin:7px 0 0 auto!important;box-shadow:12px 12px 10px 10px #000;padding-top:25px}.ccc-bar #ccc-icon{display:none!important}.ccc-bar .ccc-expand{display:none}#cccwr.ccc-bar .ccc-close{margin-top:-8px;float:right!important;background:#4f8407;width:auto;height:auto;text-indent:0;color:white;font-size:13px;line-height:13px;margin-left:20px;margin-right:20px;padding:11px 26px;border-radius:4px;-moz-border-radius:4px;-o-border-radius:4px;-webkit-border-radius:4px}#cccwr.ccc-bar .ccc-bt.ccc-fine{display:none}#cccwr.ccc-bar .ccc-close:hover{box-shadow:inset 1px 1px 5px 1px rgba(0,0,0,0.25);background:#3e3e3e;color:#f0942b}#cccwr.ccc-bar.ccc-dark .ccc-close:hover{box-shadow:inset 1px 1px 7px 0 rgba(0,0,0,0.25);background:#ddd;color:#000}@media only screen and (max-width:768px), and (max-device-width:768px){html #cccwr.ccc-bar .ccc-close{position:absolute!important;top:8px;right:1%;margin:0;width:30%;padding:11px 2.5%;text-align:center}html #cccwr.ccc-bar #ccc-ias{position:absolute!important;top:10px;right:37%;text-indent:-9999px;padding:0;width:32px;height:32px;background-image:url('//apikeys.civiccomputing.com/p/cc/6.2/ccc-icons.png');background-position:-400px 0}html .ccc-open #cccwr.ccc-bar #ccc-ias{background-image:url('//apikeys.civiccomputing.com/p/cc/6.2/ccc-icons.png');background-position:-400px -32px}html #cccwr.ccc-bar .ccc-title{display:none}div#cccwr div.ccc-c{overflow-y:scroll;height:210px;overflow-x:hidden}}@media only screen and (max-width:360px), and (max-device-width:360px){.ccc-bar div#cccw div.ccc-c{overflow-y:scroll;height:auto;max-height:400px;overflow-x:hidden}",html:'<div id="cccwr"><div id="ccc-state" class="ccc-pause"><div class="ccc-widget"><div class="ccc-outer"><div class="ccc-inner"><div class="ccc-hdr"><a id="ccc-hdricon" target="_blank" title="About Cookie Control" /><h2>Cookie Control</h2><span class="ccc-title" /><a href="#" class="ccc-close" /><a href="#" id="ccc-ias" /></div><div class="ccc-c"><div class="ccc-ci"><p class="ccc-intro" /><div class="ccc-expanded" /><div id="ccc-implicit-warning">(One cookie will be set to store your preference)</div><div id="ccc-explicit-checkbox"><input id="cchide-popup" type="checkbox" name="ccc-hide-popup" value="Y" title="Do not ask me again" /><label for="ccchide-popup">Do not ask me again <br /></label>(Ticking this sets a cookie to hide this popup if you then hit close. This will not store any personal information)</div><a class="ccc-ab" id="ccc-ias2" /><a class="ccc-ab" id="ccc-about" target="_blank" /></div></div></div></div><!-- Not used in CC 6: --><!-- <div id="ccc-rmb"><button class="ccc-expand" /></div> --></div><div id="ccc-icon"><a href="#"><span>Cookie Control</span></a></div></div></div><div id="cccwrpad" />',onReady:null,onCookiesAllowed:null,onCookiesNotAllowed:null,onAccept:null,onReject:null,consentModel:this.MODEL_INFO,t:{ias:"Information and Settings",title:"This site uses cookies to store information on your computer.",intro:"Some of these cookies are essential to make our site work and others help us to improve by giving us some insight into how the site is being used.",full:'<p>These cookies are set when you submit a form, login or interact with the site by doing something that goes beyond clicking some simple links.</p><p>We also use some non-essential cookies to anonymously track visitors or enhance your experience of this site. If you\'re not happy with this, we won\t set these cookies but some nice features on the site may be unavailable.</p><p>To control third party cookies, you can also <a class="ccc-settings">adjust your browser settings</a>.</p><a class="ccc-bt ccc-gr ccc-settings">Browser settings</a>',on:"Turn cookies on",off:"Turn cookies off",bs:"Browser settings",rm:"Read more",rl:"Read less",ab:"About this tool",c:"I'm fine with this"}},isFP:function(){if(typeof civicLicense!=="object"){return true}return civicLicense.product.toLowerCase()===this.PROD_FREE},cookieLawApplies:function(){if(this.countryHasCookieLaw()){return true}return false},maySendCookies:function(){if(!this.cookieLawApplies()){return true}if(this.options.consentModel===this.MODEL_INFO){return true}if(this.consented()===true){return true}if(this.getState("consented",undefined)===undefined&&this.options.consentModel===this.MODEL_IMPLICIT&&!this.getDNT()){return true}return false},consented:function(){return this.getState("consented",false)==="yes"},hidden:function(){return this.getState("hidden",false)==="yes"},closed:function(){return this.getState("open",false)==="no"},reset:function(){this.delCookie(this.options.cookieName)},init:function(a){a.t=jQuery.extend(this.options.t,a.t);this.options=jQuery.extend(this.options,a);if(!this.sanityCheck()){return}this.workarounds();this.initPersistentState();this.initWidget();this.setModel(this.options.consentModel);if(!this.options.cookieDomain){this.options.cookieDomain=document.location.hostname}this.resetOnUpdatedPolicy();this.setPolicyVersion();this.options.protectedCookies.push(this.options.cookieName);this.scheduleAutohide();jQuery("#ccc-state").click(function(){CookieControl.disableAutohide();CookieControl.stopAutohide()});this.readyEvent();if(this.maySendCookies()){jQuery("#ccc-state, body").addClass("ccc-consented");this.cookiesAllowedEvent()}else{jQuery("#ccc-state, body").addClass("ccc-blocked");if(this.options.autoDelete){this.delAllCookies()}this.cookiesNotAllowedEvent()}},sanityCheck:function(){if(!civicLicense.valid){alert("Civic Cookie Control: "+civicLicense.error);return false}var b=[];jQuery.each("ias title intro full on off bs rm rl".split(" "),function(e,f){if(f.trim()==""){b.push("Text option CookieControl.options."+e+" may not be empty.")}});var a=[this.STYLE_TRIANGLE,this.STYLE_SQUARE,this.STYLE_DIAMOND,this.STYLE_BAR];if(a.indexOf(this.options.style)<0){b.push('Style must be one of STYLE_TRIANGLE, STYLE_SQUARE, STYLE_DIAMOND or STYLE_BAR, not "'+this.options.style+'".')}if(this.options.style==this.STYLE_BAR){if(this.options.position!==this.POS_TOP&&this.options.position!==this.POS_BOTTOM){b.push('Position must be POS_TOP or POS_BOTTOM, not "'+this.options.position+'".')}}else{if(this.options.position!==this.POS_LEFT&&this.options.position!==this.POS_RIGHT){b.push('Position must be POS_LEFT or POS_RIGHT, not "'+this.options.position+'".')}}if(this.options.theme!==this.THEME_LIGHT&&this.options.theme!==this.THEME_DARK){b.push('Theme must be THEME_LIGHT or THEME_DARK, not "'+this.options.position+'".')}if(b.length){alert("Civic Cookie Control: "+b.join("\n"));return false}return true},initWidget:function(){if(!this.cookieLawApplies()){return}if(this.getCookie(this.options.iconStatusCookieName)==="no"){return}this.initShowCookieWidget()},initShowCookieWidget:function(){var f=this.consented();if(jQuery("#cccwr .ccc-outer").length){return}jQuery("head").append('<style type="text/css">'+this.options.css+"</style>");jQuery("body").prepend(this.options.html);var b=jQuery("#cccwr");var a=b.find("#ccc-icon");var e=b.find("#ccc-state");b.find(".ccc-title").html(this.options.t.title);b.find(".ccc-intro").html(this.options.t.title+" "+this.options.t.intro);b.find(".ccc-expanded").html(this.options.t.full);b.find("#ccc-about").html(this.options.t.ab);b.find(".ccc-close").html(this.options.t.c);b.find("#ccc-ias, #ccc-ias2").text(this.options.t.ias);b.find("#ccc-about, #cccwr #ccc-hdricon").attr({href:this.HOME_URL,target:"_blank"});b.find("a.ccc-settings").attr({href:this.BROWSER_HELP,target:"_blank"});this.setPosition(this.options.position);this.setStyle(this.options.style);this.setTheme(this.options.theme);e.addClass(f?"ccc-go ccc-cookies-allowed":"ccc-pause ccc-cookies-blocked");b.find("a").attr("rel","nofollow");this.initSlider(b);this.initIAS(b);this.initEventHandlers(b,a);if(!this.hidden()){this.initialDisplay()}},initSlider:function(f){if(this.options.consentModel==this.MODEL_IMPLICIT){jQuery("#cccwr .ccc-expanded").append('<span class="ccc-toggle-shadow"/><div id="ccc-toggle"><div/></div>').after('<a class="ccc-bt ccc-gr ccc-fine" href="#">'+this.options.t.c+"</a>")}else{jQuery("#cccwr .ccc-expanded").after('<span class="ccc-toggle-shadow"/><div id="ccc-toggle"><div/></div>')}var g=this.getCookie(this.options.cookieName);var a=f.find(".ccc-toggle-shadow");var e=f.find("#ccc-toggle > div");var b=a.width();f.find("#ccc-toggle *").click(function(h){h.preventDefault();jQuery("#cccwr .ccc-toggle-shadow").click()});if(this.options.consentModel==this.MODEL_INFO){e.html('<a href="#" class="ccc-gr">'+this.options.t.ias+'</a><a href="#" class="ccc-or">'+this.options.t.rl+"</a>");a.click(function(i){var h=jQuery(i.target);if(h.hasClass("toggled")){h.removeClass("toggled");jQuery("#ccc-toggle div").stop(true).animate({"margin-left":0},200)}else{h.addClass("toggled");jQuery("#ccc-toggle div").stop(true).animate({"margin-left":-(b+5)},200)}return CookieControl.handleExpand(i)})}else{if(this.options.consentModel==this.MODEL_EXPLICIT){e.html('<a href="#" class="ccc-rd">'+this.options.t.off+'</a><a href="#" class="ccc-gr">'+this.options.t.on+"</a>");if(!this.maySendCookies()){f.find(".ccc-toggle-shadow").addClass("toggled");jQuery("#ccc-toggle div").css("margin-left",-(b+5))}a.click(function(i){var h=jQuery(i.target);if(h.hasClass("toggled")){h.removeClass("toggled");CookieControl.setConsent(true);jQuery("#ccc-toggle div").stop(true).animate({"margin-left":0},200,function(){CookieControl.closeAndHide(CookieControl.options.autoFadeSpeed)})}else{h.addClass("toggled");CookieControl.setConsent(false);jQuery("#ccc-toggle div").stop(true).animate({"margin-left":-(b+5)},200)}return false})}else{if(this.options.consentModel==this.MODEL_IMPLICIT){e.html('<a href="#" class="ccc-gr">'+this.options.t.off+'</a><a href="#" class="ccc-rd">'+this.options.t.on+"</a>");if(!this.maySendCookies()){f.find(".ccc-toggle-shadow").addClass("toggled");jQuery("#ccc-toggle div").css("margin-left",-(b+5))}a.click(function(i){var h=jQuery(i.target);if(h.hasClass("toggled")){h.removeClass("toggled");CookieControl.setConsent(true);jQuery("#ccc-toggle div").stop(true).animate({"margin-left":0},200)}else{h.addClass("toggled");CookieControl.setConsent(false);jQuery("#ccc-toggle div").stop(true).animate({"margin-left":-(b+5)},200)}return false})}}}e.find("a:first-child").addClass("ccc-1st");this._initDone=true},initIAS:function(a){if(this.options.consentModel!=this.MODEL_INFO){a.find("#ccc-ias2").attr("href","#").text(this.options.t.ias).click(function(b){if(CookieControl.handleExpand(b)){jQuery(b.target).text(CookieControl.options.t.rl)}else{jQuery(b.target).text(CookieControl.options.t.ias)}b.preventDefault();return false})}},initEventHandlers:function(b,a){a.click(function(e){e.preventDefault();return CookieControl.handleCookieIcon(e)});b.find("#cchide-popup").click(function(e){e.preventDefault();return CookieControl.handleHidePopup(e)});b.find("#ccc-ias").click(function(e){e.preventDefault();return CookieControl.handleBarIAS(e)});b.find(".ccc-fine").click(function(e){e.preventDefault();return CookieControl.handleClose(e)});b.find(".ccc-close").click(function(e){e.preventDefault();return CookieControl.handleXButton(e)});b.find(".ccc-expand").text(this.options.t.rm).click(function(e){e.preventDefault();return CookieControl.handleExpand(e)});b.find(".ccc-widget").mouseover(function(){CookieControl.stopAutohide();if(!CookieControl.getCookie(CookieControl.options.cookieName)&&CookieControl.options.consentModel!=this.MODEL_EXPLICIT){CookieControl.setCookie(CookieControl.options.cookieName,"no");CookieControl.cookiesNotAllowedEvent()}}).mouseout(function(){CookieControl.scheduleAutohide()})},workarounds:function(){if(this.options.shape){this.options.style=this.options.shape;delete this.options.shape}if(this.options.style.indexOf("ccc-")!==0){this.options.style="ccc-"+this.options.style}if(this.options.theme.indexOf("ccc-")!==0){this.options.theme="ccc-"+this.options.theme}if(this.options.position.indexOf("ccc-")!==0){this.options.position="ccc-"+this.options.position}this.options.policyVersion=this.options.policyVersion||this.options.policyDate||"";if(typeof String.prototype.trim!=="function"){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}}},initPersistentState:function(){if(this.state){return}var a=this.getCookie(this.options.cookieName);if(!a||a.indexOf(":")<0){this.state={}}else{this.state=this.decodeCookie(a)}},policyUpdated:function(){return decodeURI(this.getState("pv",""))!=this.options.policyVersion||decodeURI(this.getState("cm",""))!=this.options.consentModel},setPolicyVersion:function(){this.setState("pv",this.options.policyVersion);this.setState("cm",this.options.consentModel)},resetOnUpdatedPolicy:function(){if(!this.policyUpdated()){return}this.reset()},setModel:function(a){if(this._setModel){alert("Civic Cookie Control: the consent model can only be set once.");return}this._setModel=a;jQuery("#cccwr, #ccc-icon, body").addClass("ccc-"+a)},setTheme:function(a){this.options.theme=a;return jQuery("#cccwr, #ccc-icon, body").removeClass([this.THEME_LIGHT,this.THEME_DARK].join(" ")).addClass(a)},setStyle:function(a){if(a===this.STYLE_BAR){if(this.isFP()){alert("Cookie Control: STYLE_BAR is not available in the free version of Cookie Control.");return}jQuery("#cccwr .ccc-ci").removeClass("ccc-vis").css("height","auto").css("visibility","hidden");jQuery("#cccwr .ccc-c").hide()}else{jQuery("#cccwr .ccc-ci").removeClass("ccc-vis").css("height","auto").css("visibility","visible")}this.options.style=a;return jQuery("#cccwr, #ccc-icon, body").removeClass([this.STYLE_TRIANGLE,this.STYLE_SQUARE,this.STYLE_DIAMOND,this.STYLE_BAR].join(" ").replace("."," ")).addClass(a)},setPosition:function(a){this.options.position=a;return jQuery("#cccwr, #ccc-icon, body").removeClass([this.POS_LEFT,this.POS_RIGHT,this.POS_TOP,this.POS_BOTTOM].join(" ")).addClass(a)},initialDisplay:function(){var b=jQuery("#cccwr #ccc-icon");if(this._displayed===true){b.show();return}this._displayed=true;if(this.options.style==this.STYLE_BAR){if(this.options.position==this.POS_TOP){jQuery("#cccwr, #cccwrpad, #cccwr .ccc-widget").css("display","block");jQuery("#cccwr").css("top","-50px").css("opacity",0).animate({top:"+=50",opacity:1},this.options.initialFadeSpeed,function(){jQuery("#cccwr").css("top","")});jQuery("#cccwrpad").css("height",0).animate({height:"+=50"},this.options.initialFadeSpeed,function(){jQuery("#cccwrpad").css("height","");if(CookieControl.shouldOpen()){CookieControl.popUpWithAutohide()}})}else{jQuery("#cccwr, #cccwrpad, #cccwr .ccc-widget").css("display","block");jQuery("#cccwr").css("bottom","-60px").css("opacity",0).animate({bottom:"+=60",opacity:1},this.options.initialFadeSpeed,function(){jQuery("#cccwr").css("bottom","");if(CookieControl.shouldOpen()){CookieControl.popUpWithAutohide()}})}}else{if(this.shouldOpen()){var a=jQuery("#cccwr .ccc-widget");a.css("opacity","0").css("display","block").css("visibility","visible");if(this.options.position==this.POS_LEFT){var e=a.position().left;a.css("left","0px");b.css("opacity",0).show().animate({opacity:1},this.options.initialFadeSpeed);a.animate({opacity:1,left:e},this.options.initialFadeSpeed,function(){a.css("left","");CookieControl.highlight(100)})}else{var e=a.position().left;a.css("left",jQuery(window).width()+"px");b.css("opacity",0).show().animate({opacity:1},this.options.initialFadeSpeed);a.animate({opacity:1,left:e},this.options.initialFadeSpeed,function(){a.css("left","");CookieControl.highlight(100)})}}else{b.css("opacity","0").show().animate({opacity:1},this.options.initialFadeSpeed)}}},popUp:function(a){if(this._initDone){this.initialDisplay()}this.stopAutohide();if(this.options.style===this.STYLE_BAR){this._barRollShow(jQuery("#cccwr .ccc-ci").stop(true,true))}else{if(a==0){return jQuery("#cccwr .ccc-widget").stop(true,true).show()}return jQuery("#cccwr .ccc-widget").stop(true,true).fadeIn(this.options.clickFadeSpeed)}jQuery("#ccc-ias, #ccc-ias2").text(this.options.t.rl);this.setState("open",true);this.highlight(this.options.initialFadeSpeed+1000)},popDown:function(a){this.stopAutohide();if(this.options.style===this.STYLE_BAR){this._barRollHide(jQuery("#cccwr .ccc-ci").stop(true,true))}else{jQuery("#cccwr .ccc-widget").stop(true,true).fadeOut(a)}jQuery("#ccc-ias, #ccc-ias2").text(this.options.t.ias);this.setState("open",false)},_barRollShow:function(b,a){if(b.hasClass("ccc-vis")){this.fire(a);return false}b.parent(".ccc-c").show();if(!this._iasHeight){this._iasHeight=b.height()}b.height(0).css("visibility","visible").animate({height:this._iasHeight},this.options.clickFadeSpeed,function(){b.addClass("ccc-vis");CookieControl.fire(a)});return false},_barRollHide:function(b,a){if(!b.hasClass("ccc-vis")){this.fire(a);return false}this._iasHeight=b.height();b.animate({height:0},this.options.clickFadeSpeed,function(){b.removeClass("ccc-vis").css("visibility","hidden");CookieControl.fire(a);b.parent(".ccc-c").hide()});return false},highlight:function(a){var b=CookieControl._hl;if(!b){this._hl=1;setTimeout(function(){CookieControl._hli=setInterval(function(){var e=jQuery(".ccc-blocked #ccc-toggle a");var f=CookieControl._hl++;if(f===5){e.css("background-color","");clearInterval(CookieControl._hli)}else{e.css("background-color",f&1?"#e6002e":"#4f8407")}},150)},a)}},_closeWidget:function(f,e){var a=jQuery("body");if(a.hasClass("ccc-bar")){if(a.hasClass("ccc-top")){this._barRollHide(jQuery("#cccwr .ccc-ci").stop(true,true),function(){var b=CookieControl;jQuery("#cccwr").animate({top:"-=60"},f);jQuery("#cccwrpad").animate({height:0},f,function(){jQuery("#cccwr, #ccwrpad").hide().addClass("ccc-hidden")})})}else{if(a.hasClass("ccc-bottom")){this._barRollHide(jQuery("#cccwr .ccc-ci").stop(true,true),function(){var b=CookieControl;jQuery("#cccwr").animate({bottom:"-=60"},f,function(){jQuery("#cccwr, #ccwrpad").hide().addClass("ccc-hidden")})})}else{jQuery("#cccwr .ccc-widget").stop(true,true).fadeOut(f);this.stopAutohide()}}}else{jQuery("#ccc-icon, #cccwr .ccc-widget").fadeOut(f)}if(e){this.setState("hidden",true)}},close:function(a){this._closeWidget(a,false)},closeAndHide:function(a){this._closeWidget(a,true)},popUpWithAutohide:function(a){this.popUp(a);this.scheduleAutohide()},disableAutohide:function(){this.stopAutohide();this.options.autoHide=-Math.abs(this.options.autoHide)},enableAutohide:function(){this.options.autoHide=Math.abs(this.options.autoHide);this.scheduleAutohide()},stopAutohide:function(){if(this._to){window.clearTimeout(this._to);delete this._to}},scheduleAutohide:function(){if(this.options.autoHide>0){this.stopAutohide();this._to=setTimeout(function(){CookieControl.popDown(CookieControl.options.autoFadeSpeed)},this.options.autoHide)}},hideEntireWidget:function(){jQuery("#cccwr").fadeOut(CookieControl.options.fadeInSpeed);this.stopAutohide()},countryHasCookieLaw:function(){if(this.options.countries&&typeof civicLicense=="object"&&typeof civicLicense.geo=="object"&&civicLicense.geo.country){var b=civicLicense.geo.country;var a=civicLicense.geo.countryName;if(typeof(this.options.countries)==="string"){this.options.countries=this.options.countries.split(/\s*,\s*/)}return jQuery.inArray(b,this.options.countries)>=0||jQuery.inArray(a,this.options.countries)>=0}return true},countryConsentModel:function(){if(this.options.countries&&typeof civicLicense=="object"&&typeof civicLicense.geo=="object"&&civicLicense.geo.cookieLaw){var a=civicLicense.geo.cookieLaw;if(a=="explicit"){return this.MODEL_EXPLICIT}if(a=="implicit"){return this.MODEL_IMPLICIT}}return false},checkShowIconState:function(){var a=CookieControl;if(jQuery(".ccc-widget input[name=showicon]:checked").val()==="N"){this.setCookie(a.options.iconStatusCookieName,"no");return true}else{this.setCookie(a.options.iconStatusCookieName,"yes");return false}},setCookie:function(f,g,e){var b;e=e||{};if("expiry" in e){if(typeof e.expiry==="number"){b=new Date(new Date().getTime()+(e.expiry*86400)*1000).toGMTString()}else{if(typeof e.expiry==="string"){b=e.expiry}else{if(typeof e.expiry==="object"&&("toGMTString" in e.expiry)){b=e.expiry.toGMTString()}}}}else{b=new Date(new Date().getTime()+86400000*720).toGMTString()}var i="";if(this.options.subdomains!=true||("domain" in e)){i=";domain="+(e.domain||this.options.cookieDomain)}var a=[];if(typeof g==="object"){jQuery.each(g,function(j,k){a.push('"'+encodeURIComponent(j)+'":"'+encodeURIComponent(k)+'"')});a="{"+a.join(",")+"}"}else{a=g}var h=f+"="+escape(a)+";expires="+b+";path="+this.options.cookiePath+i;document.cookie=h},hasCookie:function(a){return document.cookie.match(new RegExp("(^|;s*)"+a+"s*="))!==null},getCookie:function(a){var b=false;jQuery.each(document.cookie.split(/\s*;\s*/),function(f,g){var e=g.split(/\s*=\s*/);if(e[0].replace(/^\s+|\s+$/g,"")===a){b=unescape(e[1]);return false}});if(typeof b==="undefined"){b=false}return b},decodeCookie:function(b){try{return jQuery.parseJSON(b)}catch(a){return{}}},getAllCookies:function(){var a={};if(!document.cookie.trim()){return a}jQuery.each(document.cookie.split(/\s*;\s*/),function(e,f){var b=f.split(/\s*=\s*/);if(b){a[b[0]]=unescape(b[1])}});return a},delCookie:function(a){var b=this.options.cookieDomain.split(".");document.cookie=a+"=;expires=Thu, 01-Jan-1970 00:00:01 GMT;";document.cookie=a+"=;path="+this.options.cookiePath+";expires=Thu, 01-Jan-1970 00:00:01 GMT;";while(b.length){d=b.join(".");document.cookie=a+"=;path="+this.options.cookiePath+";expires=Thu, 01-Jan-1970 00:00:01 GMT;domain="+d;document.cookie=a+"=;path="+this.options.cookiePath+";expires=Thu, 01-Jan-1970 00:00:01 GMT;domain=."+d;if(!this.options.subdomains){break}b.shift()}document.cookie=a+"=;path="+this.options.cookiePath+";expires=Thu, 01-Jan-1970 00:00:01 GMT;"},delAllCookies:function(a){if(typeof a==="undefined"){a=this.options.protectedCookies}jQuery.each(this.getAllCookies(),function(e,b){if(jQuery.inArray(e,a)<0){CookieControl.delCookie(e)}})},setState:function(a,e){if(!this.state){this.initPersistentState()}if(typeof e==="boolean"){if(e=="true"||e=="on"||e=="1"||e=="yes"){e=true}else{if(e=="false"||e=="off"||e=="0"||e=="no"){e=false}}this.state[a]=e?"yes":"no"}else{this.state[a]=e}var b=this.maySendCookies()?this.options.cookieExpiry:this.options.blockedCookieExpiry;this.options.cookieExpiry;this.setCookie(this.options.cookieName,this.state,{expiry:b});if(typeof e==="boolean"){jQuery("#ccc-state, body").toggleClass("ccc-"+a,e)}},getState:function(a,b){if(!this.state){this.initPersistentState()}return this.state[a]===undefined?b:this.state[a]},shouldOpen:function(){if(this.getState("explicitly")==="yes"){return false}return this.options.startOpen&&!this.closed()},setConsent:function(a){CookieControl.setState("consented",a);CookieControl.setState("explicitly",true);jQuery("#ccc-state, body").toggleClass("ccc-cookies-blocked",!a);if(a){CookieControl.acceptEvent()}else{CookieControl.rejectEvent();if(this.options.autoDelete){this.delAllCookies()}}},getDNT:function(){return(navigator.doNotTrack=="yes"||navigator.doNotTrack=="1"||navigator.msDoNotTrack=="1")},fire:function(a){return typeof(a)=="function"?a(CookieControl):false},acceptEvent:function(a){this.fire(this.options.onAccept);return a},rejectEvent:function(a){this.fire(this.options.onReject);return a},readyEvent:function(a){this.fire(this.options.onReady);return a},cookiesNotAllowedEvent:function(a){this.fire(this.options.onCookiesNotAllowed);return a},cookiesAllowedEvent:function(a){this.fire(this.options.onCookiesAllowed);return a},handleCookieIcon:function(a){jQuery("#cccwr .ccc-ci").css("visibility","visible");jQuery("#cccwr .ccc-widget").stop(true,true).fadeToggle(CookieControl.options.clickFadeSpeed);this.setState("open",this.closed());this.stopAutohide();this.disableAutohide()},handleXButton:function(a){if(this.options.onlyHideIfConsented){if(this.options.style==this.STYLE_BAR){this.close(CookieControl.options.clickFadeSpeed);return false}return this.handleCookieIcon(a)}return this.handleClose(a)},handleHidePopup:function(b){var a=jQuery(b.target).attr("checked");if(a==true||a=="checked"){this.setCookie("ccNoPopup","no");jQuery("#cccwr .ccc-widget").fadeOut(this.options.clickFadeSpeed);this.stopAutohide()}else{c.setCookie("ccNoPopup","",true)}},handleBarIAS:function(a){var b=jQuery("#cccwr .ccc-ci").stop(true,true);this.stopAutohide();if(!b.hasClass("ccc-vis")){return this.popUp()}return this.popDown()},handleClose:function(a){this.closeAndHide(CookieControl.options.clickFadeSpeed);return false},handleExpand:function(b){var a=jQuery(this.target);if(jQuery(".ccc-expanded").css("display")==="none"){jQuery(".ccc-expanded").slideDown(this.options.expandSpeed,function(){if(a){a.text(CookieControl.options.t.rl)}CookieControl.disableAutohide()});return true}else{jQuery(".ccc-expanded").slideUp(this.options.expandSpeed,function(){if(a){a.text(CookieControl.options.t.rm)}});CookieControl.enableAutohide()}return false}};var civicLicense={};function cookieControl(b){if(typeof(b)==="undefined"||typeof(b.apiKey)==="undefined"){alert("Cookie Control: please provide an options object with a valid API Key and product name.");return -1}b.product=b.product||"CookieControl Free";b.pollPeriod=b.pollPeriod||25;b.pollIncrement=b.pollIncrement||1.25;b.jQueryUrl=b.jQueryUrl||"//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";if([CookieControl.PROD_FREE,CookieControl.PROD_PAID,CookieControl.PROD_PAID_MULTISITE,CookieControl.PROD_PAID_CUSTOM].indexOf(b.product.toLowerCase())<0){alert("Cookie Control: Sorry, the product name '"+b.product+"' is not recognised.\nPlease ensure you have used one of the CookieControl.PROD_x values.");return -1}if(typeof(jQuery)=="undefined"||parseInt(jQuery.fn.jquery.replace(/\./g,""))<144){if(document.getElementsByTagName("head")>0){var a=document.createElement("script");a.type="text/javascript";a.src=b.jQueryUrl;document.getElementsByTagName("head")[0].appendChild(a)}else{document.write('<script type="text/javascript" src="'+b.jQueryUrl+'"><\/script>')}}if(document.getElementsByTagName("body")>0){var a=document.createElement("script");a.type="text/javascript";a.src="//apikeys.civiccomputing.com/c/v?d="+encodeURIComponent(document.location.hostname)+"&p="+encodeURIComponent(b.product)+"&v="+CookieControl.VERSION+"&k="+encodeURIComponent(b.apiKey);document.getElementsByTagName("body")[0].appendChild(a)}else{document.write('<script type="text/javascript" src="//apikeys.civiccomputing.com/c/v?d='+encodeURIComponent(document.location.hostname)+"&p="+encodeURIComponent(b.product)+"&v="+CookieControl.VERSION+"&k="+encodeURIComponent(b.apiKey)+'"><\/script>')}_cookieControlPoll(b)}function _cookieControlPoll(a){if(typeof(jQuery)==="undefined"||typeof(civicLicense.valid)==="undefined"){setTimeout(function(){_cookieControlPoll(a)},a.pollPeriod);a.pollPeriod*=a.pollIncrement}else{jQuery(function(){CookieControl.init(a)})}};
/**
 * jQuery FocusPoint; version: 1.1.1
 * Author: http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 J. Menz; MIT License
 * @preserve
 */
;
(function($) {

  var defaults = {
    reCalcOnWindowResize: true,
    throttleDuration: 17 //ms - set to 0 to disable throttling
  };

  //Setup a container instance
  var setupContainer = function($el) {
    var imageSrc = $el.find('img').attr('src');
    $el.data('imageSrc', imageSrc);

    resolveImageSize(imageSrc, function(err, dim) {
      $el.data({
        imageW: dim.width,
        imageH: dim.height
      });
      adjustFocus($el);
    });
  };

  //Get the width and the height of an image
  //by creating a new temporary image
  var resolveImageSize = function(src, cb) {
    //Create a new image and set a
    //handler which listens to the first
    //call of the 'load' event.
    $('<img />').one('load', function() {
      //'this' references to the new
      //created image
      cb(null, {
        width: this.width,
        height: this.height
      });
    }).attr('src', src);
  };

  //Create a throttled version of a function
  var throttle = function(fn, ms) {
    var isRunning = false;
    return function() {
      var args = Array.prototype.slice.call(arguments, 0);
      if (isRunning) return false;
      isRunning = true;
      setTimeout(function() {
        isRunning = false;
        fn.apply(null, args);
      }, ms);
    };
  };

  //Calculate the new left/top values of an image
  var calcShift = function(conToImageRatio, containerSize, imageSize, focusSize, toMinus) {
    var containerCenter = Math.floor(containerSize / 2); //Container center in px
    var focusFactor = (focusSize + 1) / 2; //Focus point of resize image in px
    var scaledImage = Math.floor(imageSize / conToImageRatio); //Can't use width() as images may be display:none
    var focus =  Math.floor(focusFactor * scaledImage);
    if (toMinus) focus = scaledImage - focus;
    var focusOffset = focus - containerCenter; //Calculate difference between focus point and center
    var remainder = scaledImage - focus; //Reduce offset if necessary so image remains filled
    var containerRemainder = containerSize - containerCenter;
    if (remainder < containerRemainder) focusOffset -= containerRemainder - remainder;
    if (focusOffset < 0) focusOffset = 0;

    return (focusOffset * -100 / containerSize)  + '%';
  };

  //Re-adjust the focus
  var adjustFocus = function($el) {
    var imageW = $el.data('imageW');
    var imageH = $el.data('imageH');
    var imageSrc = $el.data('imageSrc');

    if (!imageW && !imageH && !imageSrc) {
      return setupContainer($el); //Setup the container first
    }

    var containerW = $el.width();
    var containerH = $el.height();
    var focusX = parseFloat($el.data('focusX'));
    var focusY = parseFloat($el.data('focusY'));
    var $image = $el.find('img').first();

    //Amount position will be shifted
    var hShift = 0;
    var vShift = 0;

    if (!(containerW > 0 && containerH > 0 && imageW > 0 && imageH > 0)) {
      return false; //Need dimensions to proceed
    }

    //Which is over by more?
    var wR = imageW / containerW;
    var hR = imageH / containerH;

    //Reset max-width and -height
    $image.css({
      'max-width': '',
      'max-height': ''
    });

    //Minimize image while still filling space
    if (imageW > containerW && imageH > containerH) {
      $image.css((wR > hR) ? 'max-height' : 'max-width', '100%');
    }

    if (wR > hR) {
      hShift = calcShift(hR, containerW, imageW, focusX);
    } else if (wR < hR) {
      vShift = calcShift(wR, containerH, imageH, focusY, true);
    }

    $image.css({
      top: vShift,
      left: hShift
    });
  };

  var $window = $(window);

  var focusPoint = function($el, settings) {
    var thrAdjustFocus = settings.throttleDuration ?
      throttle(function(){adjustFocus($el);}, settings.throttleDuration)
      : function(){adjustFocus($el);};//Only throttle when desired
    var isListening = false;

    adjustFocus($el); //Focus image in container

    //Expose a public API
    return {

      adjustFocus: function() {
        return adjustFocus($el);
      },

      windowOn: function() {
        if (isListening) return;
        //Recalculate each time the window is resized
        $window.on('resize', thrAdjustFocus);
        return isListening = true;
      },

      windowOff: function() {
        if (!isListening) return;
        //Stop listening to the resize event
        $window.off('resize', thrAdjustFocus);
        isListening = false;
        return true;
      }

    };
  };

  $.fn.focusPoint = function(optionsOrMethod) {
    //Shortcut to functions - if string passed assume method name and execute
    if (typeof optionsOrMethod === 'string') {
      return this.each(function() {
        var $el = $(this);
        $el.data('focusPoint')[optionsOrMethod]();
      });
    }
    //Otherwise assume options being passed and setup
    var settings = $.extend({}, defaults, optionsOrMethod);
    return this.each(function() {
      var $el = $(this);
      var fp = focusPoint($el, settings);
      //Stop the resize event of any previous attached
      //focusPoint instances
      if ($el.data('focusPoint')) $el.data('focusPoint').windowOff();
      $el.data('focusPoint', fp);
      if (settings.reCalcOnWindowResize) fp.windowOn();
    });

  };

  $.fn.adjustFocus = function() {
    //Deprecated v1.2
    return this.each(function() {
      adjustFocus($(this));
    });
  };

})(jQuery);

if (typeof ImageLightbox === 'undefined') {
  var ImageLightbox = {};
}

ImageLightbox = {
  
  DOM: {
    $imageLightbox: null
  },

  init: function () {

    if($('.image-lightbox__link').length > 0) {
      ImageLightbox.DOM.$imageLightbox = $('.image-lightbox__link');

      ImageLightbox.DOM.$imageLightbox.magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: true,
        fixedContentPos: true,
        closeMarkup: '<a href="#" title="%title%" class="mfp-close"><i class="mfp-close-icn">&times;</i></a>', // Note: using custom close markup as a fix for iOS
        mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
        image: {
          verticalFit: true
        },
        zoom: {
          enabled: true,
          duration: 300 // don't foget to change the duration also in CSS
        }
      });
    }    
  }
};

if (typeof VideoPlayer === 'undefined') {
  var VideoPlayer = {};
}

VideoPlayer = {
  init: function() {

    $('.video-player__play').click(function(e) {
      e.preventDefault();
      VideoPlayer.loadVideo($(this));
    });
  },

  loadVideo: function(el) {
    var img = el.prev();
    var video = '<iframe width="' + img.width() + '" height="' + img.height() + '" frameborder="0" src="'+ el.attr('data-video') +'"></iframe>';
    el.parents('.video-player__inner').html(video);
  }
};

if (typeof PromoVideo === 'undefined') {
  var PromoVideo = {};
}
 
PromoVideo = {

  vars: {
    currentPlayer: '',
    videoSrc: ''
  },

  DOM: {
    $playButton: null,
    $lightbox: null,
    $lightboxClose: null
  },

  init: function() {
    if($('.promo-box__play').length > 0) {
      PromoVideo.DOM.$playButton = $('.promo-box__play');
    }

    if($('.promo-box__lightbox').length > 0) {
      PromoVideo.DOM.$lightbox = $('.promo-box__lightbox');
    }

    if($('.promo-box__lightbox--close').length > 0) {
      PromoVideo.DOM.$lightboxClose = $('.promo-box__lightbox--close');
    }

    if(PromoVideo.DOM.$playButton !== null)
    {
      PromoVideo.DOM.$playButton.on('click', function(event) {
        PromoVideo.playVideo(event, $(this));
      });

      PromoVideo.DOM.$lightboxClose.on('click', PromoVideo.closeLightbox);
    }
  },

  playVideo: function(event, element) {
    event.preventDefault();

    var $targetLightbox = $(element.attr('href'));
    PromoVideo.vars.currentPlayer = $targetLightbox.find('.promo-box__player');

    // for desktop devices, play the video in a lightbox
    if(!PromoVideo.isTouchDevice()) {
      $targetLightbox.show();

      $(document).keyup(function(e) { 
        if (e.keyCode === 27) { // esc keycode
          PromoVideo.closeLightbox();
        }
      });

      // check if video is self-hosted
      if(PromoVideo.vars.currentPlayer.is('video')) {
        // start playing video
        PromoVideo.vars.currentPlayer[0].play();
      } else if (PromoVideo.vars.currentPlayer.is('iframe')) {
        PromoVideo.vars.videoSrc = PromoVideo.vars.currentPlayer.attr('src');
        // check for youtube
        if(PromoVideo.vars.videoSrc.indexOf('youtube') !== -1 && PromoVideo.vars.videoSrc.indexOf('autoplay') === -1) {
          PromoVideo.vars.currentPlayer.attr('src', PromoVideo.vars.videoSrc + '?autoplay=1'); // autoplay video
        } else if (PromoVideo.vars.currentPlayer.attr('src').indexOf('vimeo') !== -1 && PromoVideo.vars.videoSrc.indexOf('autoplay') === -1) { // check for vimeo
          PromoVideo.vars.currentPlayer.attr('src', PromoVideo.vars.videoSrc + '&autoplay=1'); // autoplay video
        }
      }
    } else {
        window.location.href = element.attr('data-mobile-video');
    }
  },

  isTouchDevice: function() {
    return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  },

  closeLightbox: function() {
    PromoVideo.DOM.$lightbox.hide(); 

    // stop video 
    if(PromoVideo.vars.currentPlayer.is('video')) {
      PromoVideo.vars.currentPlayer[0].pause();
      PromoVideo.vars.currentPlayer[0].currentTime = 0;
    }
    else if (PromoVideo.vars.currentPlayer.is('iframe')) {
      PromoVideo.vars.currentPlayer.attr('src', '');
      PromoVideo.vars.currentPlayer.attr('src', PromoVideo.vars.videoSrc);
    }
    return false;
  }
};

PromoVideo.init();
/*
  The object name should be captialised
  and would usually be namespaced by
  the project/client name, e.g. intu.Pattern.
  Variable and function names should be 
  full words, using camel case with a 
  lowercase first letter.
*/
if (typeof HeaderBasic === 'undefined') {
  var HeaderBasic = {};
}

HeaderBasic = {
  /*
    Vars = variables
  */
  vars: {
    sampleVar: true
  },

  /*
    DOM contains cached DOM/jQuery 
    elements to be accessed later

    Element must be initialise as null 
    as it may not exist when this script 
    is run

    jQuery vars are prefixed with a $
  */
  DOM: {
    $searchButton:null,
    $searchField:null,

    $wrapper: null,
    $subNav: null,
  },

  /*
    Sub-objects for different resolutions
    if needed

    small: {
      create: function () { },

      destroy: function () { },

      events: { },

      helpers: { }
    },

    medium: { },

    large: { },
  */

  init: function () {
    /*
      Always check if the element to be manipulated 
      exists and cache it before doing anything else
    */
    // if($('.pattern-block__element').length > 0) {
    //   HeaderBasic.DOM.$element = $('.pattern-block__element');
    // }

    /*
      Attach the events
    */

    // var $searchButton = $('.header-basic__searchbox-button');
    // var $searchField = $('.header-basic__searchbox-field');    

    // $searchButton.on('click', HeaderBasic.events.searchButtonClick);

    // if($('.subNav__wrapper').length > 0) {
    //   // console.log('subNav init');
    //   HeaderBasic.DOM.$wrapper = $('.subNav__wrapper');
    //   HeaderBasic.DOM.$subNav = $('.subNav');
    //   HeaderBasic.DOM.$toggle = $('.breadcrumb__toggle');
    //   HeaderBasic.DOM.$window = $(window);

    //   HeaderBasic.helpers.createPlaceholder();
    //   HeaderBasic.helpers.updateSticky();

    //   HeaderBasic.DOM.$toggle.on('click', HeaderBasic.events.toggleClick);
    //   $(window).scroll($.throttle(20, HeaderBasic.events.onscroll));

    //   if(HeaderBasic.DOM.$wrapper.width() < 951) {
    //     HeaderBasic.helpers.updateSubNav(0);
    //     HeaderBasic.helpers.updateToggle();
    //   }
    // }
  },

  events: {
    searchButtonClick:function(e) {
      e.preventDefault();
      // HeaderBasic.DOM.$searchField.addClass("expanded");
      // $(".header-basic__searchbox-field").addClass("expanded");      

      var searchBoxWidth = $('.header-basic__searchbox-field').width();

      if(searchBoxWidth<100 && !$('.header-basic__searchbox-field').hasClass('expanded'))
      {
        e.preventDefault();
        $('.header-basic__searchbox-field').addClass('expanded');
        $('.header-basic__searchbox-field').prop('disabled',false);
      }
    }

  },

  helpers: {
    // updateSticky: function() {
    //   var scrollTop = HeaderBasic.DOM.$window.scrollTop(),
    //       hasClassStuck = HeaderBasic.DOM.$wrapper.hasClass('stuck');

    //   if(scrollTop > HeaderBasic.DOM.$placeholder.offset().top) {
    //     if(!hasClassStuck) {
    //       HeaderBasic.DOM.$wrapper.addClass('stuck');
    //       HeaderBasic.helpers.closeSubNav(150);
    //       HeaderBasic.helpers.closePlaceholder(0);
    //     }
    //   } else {
    //     if(hasClassStuck) {
    //         HeaderBasic.helpers.openPlaceholder(10, function() {
    //         HeaderBasic.DOM.$wrapper.removeClass('stuck');
    //         HeaderBasic.DOM.$placeholder.height('');
    //       });
    //       // SubNav.helpers.openSubNav(150);
    //     }
    //   }
    // },

    elementModifier: function(event) {
      /*
        Example element modifier toggle
      */
      if(HeaderBasic.DOM.$element[0].className.indexOf('--modifier') > -1) {
        HeaderBasic.DOM.$element[0].className = HeaderBasic.DOM.$element[0].className.replace('--modifier', '');
      } else {
        HeaderBasic.DOM.$element[0].className += '--modifier';
      }
    }
  }
};
/*
  The object name should be captialised
  and would usually be namespaced by
  the project/client name, e.g. intu.Pattern.
  Variable and function names should be 
  full words, using camel case with a 
  lowercase first letter.
*/
if (typeof SecondaryNav === 'undefined') {
  var SecondaryNav = {};
}

SecondaryNav = {
  /*
    Vars = variables
  */
  vars: {
    sampleVar: true
  },

  /*
    DOM contains cached DOM/jQuery 
    elements to be accessed later

    Element must be initialise as null 
    as it may not exist when this script 
    is run

    jQuery vars are prefixed with a $
  */
  DOM: {
    element: null,
    $element: null
  },

  /*
    Sub-objects for different resolutions
    if needed

    small: {
      create: function () { },

      destroy: function () { },

      events: { },

      helpers: { }
    },

    medium: { },

    large: { },
  */

  init: function () {
    /*
      Always check if the element to be manipulated 
      exists and cache it before doing anything else
    */
    if($('.pattern-block__element').length > 0) {
      SecondaryNav.DOM.$element = $('.pattern-block__element');
    }

    /*
      Attach the events
    */
    SecondaryNav.DOM.$element.on('click', SecondaryNav.events.patternClick);
  },

  events: {
    patternClick: function(event) {
      event.preventDefault();
    }
  },

  helpers: {
    elementModifier: function(event) {
      /*
        Example element modifier toggle
      */
      if(SecondaryNav.DOM.$element[0].className.indexOf('--modifier') > -1) {
        SecondaryNav.DOM.$element[0].className = SecondaryNav.DOM.$element[0].className.replace('--modifier', '');
      } else {
        SecondaryNav.DOM.$element[0].className += '--modifier';
      }
    }
  }
};
﻿if (typeof Social === 'undefined') {
  var Social = {};
}

Social = {
    init: function () {
        $('body').on('click', '.share-list-facebook', function () {

            var href = $(this).closest('.share-links').attr('data-url');

            FB.ui({
                method: 'share',
                href: href
            }, function (response) { });
            return false;
        });

        $('body').on('click', '.share-list-linkedin', function () {
            var width = 570,
                height = 520,
                left = parseInt((screen.availWidth / 2) - (width / 2)),
                top = parseInt((screen.availHeight / 2) - (height / 2));
            window.open(this.href, 'linkedin_window', 'location=no,height=' + height + ',width=' + width + ',left=' + left + ',top=' + top + ',scrollbars=no,status=no');
            return false;
        });


    }
};
if (typeof Tabs === 'undefined') {
  var Tabs = {};
}

Tabs = {

  DOM: {
    $tabs: null
  },

  init: function () {

    $('.tabs__tab-link').on('click', Tabs.events.tabClick);

    if(window.location.hash)
    {
      Tabs.helpers.anchorToTabContent();
    }
  },

  events: {
    tabClick: function(e) {
      e.preventDefault();
      var currentAttrValue = $(this).attr('href');

      // Show/Hide Tabs
      $('.tabs ' + currentAttrValue).show().siblings().hide();

      // Change/remove current tab to active
      $(this).parent('li').addClass('is-active').siblings().removeClass('is-active');
    }
  },

  helpers: {
    anchorToTabContent: function() {
      var anchorText = window.location.hash.split('#')[1];
      console.log('anchoring to', anchorText, ' from ', window.location.hash, $('a[name="' + anchorText + '"], *[id="' + anchorText + '"]'));
      var $tabsWithAnchorInside = $('a[name="' + anchorText + '"], *[id="' + anchorText + '"]').closest('.tabs__pane');
      if($tabsWithAnchorInside.length) {
        Tabs.helpers.toggleTab($tabsWithAnchorInside);
      }
    },

    toggleTab: function($tabPane) {
      var id = $tabPane.attr('id');
      $tabPane.show().siblings().hide(); 
      $('.tabs__tab').removeClass('is-active').find('a[href="#' + id + '"]').parent().addClass('is-active');
    }
  }
};
if (typeof TwitterFeed === 'undefined') {
  var TwitterFeed = {};
}

TwitterFeed.vars = {
  isMobileFirst: null,
  $tweetContainer: null
};

TwitterFeed.init = function() {
  //console.log('twitter feed init');
  TwitterFeed.vars.$tweetContainer = $('.load-tweets');
  if(TwitterFeed.vars.$tweetContainer.length)
  {
    TwitterFeed.vars.isMobileFirst = true;
  }
};

TwitterFeed.helpers = {
  LoadTweetsForDesktop: function() {
    //console.log('twitter feed desktop', TwitterFeed.vars.isMobileFirst, TwitterFeed.vars.$tweetContainer.is(':empty'));
    if(TwitterFeed.vars.isMobileFirst && TwitterFeed.vars.$tweetContainer.is(':empty'))
    {
      var params = {
        username : TwitterFeed.vars.$tweetContainer.attr('data-tweet-username'),
        numTweets : TwitterFeed.vars.$tweetContainer.attr('data-tweet-num'),
        replies : TwitterFeed.vars.$tweetContainer.attr('data-tweet-replies'),
        retweets : TwitterFeed.vars.$tweetContainer.attr('data-tweet-retweets')
      };

      $.ajax({
        url: '/umbraco/Api/Twitter/GetTweets',
        data: params
      })
      .done(function(data){
        //console.log(data);
        if(data.length)
        {
          var tweetHTML = '<ul class="twitter-feed">';
          for(var i in data)
          {
            if(data.hasOwnProperty(i))
            {
              tweetHTML += '<li>';
              if(data[i].Status.IsRetweet)
              {
                tweetHTML += '<p class="retweet"><a href="' + data[i].Status.User.PermalinkUrl + '">' + data[i].Status.User.Name + ' retweeted</a></p>';
              }
              tweetHTML += '<a href="' + data[i].Status.User.PermalinkUrl + '"><img src="' + data[i].Status.User.ProfileImageUrl + '" alt="' + data[i].Status.User.Name + '" class="twitter-name-logo" /></a>';
              tweetHTML += '<p class="twitter-name"><a href="' + data[i].Status.User.PermalinkUrl + '">' + data[i].Status.User.Name + '</a></p>';
              tweetHTML += '<p>' + data[i].Status.LinkifiedText + '<p>';
              tweetHTML += '<p class="sub-text"><a href="' + data[i].Status.PermalinkUrl + '" class="timestamp">' + data[i].CreatedAtFormatted + '</a></p>';
              tweetHTML += '</li>';
            }
          }
          tweetHTML += '</ul>';
          TwitterFeed.vars.$tweetContainer.append(tweetHTML);
        }
      });
    }
  }
};
if (typeof StickyNav === 'undefined') {
  StickyNav = {};
}

StickyNav = {
  vars: {
    trigger: 0,
    initialised: false,
  },

  DOM: {
    $header: null,
    $headerBottom: null
  },

  init: function () {

    if(!StickyNav.vars.initialised) {
      // Cache DOM
      StickyNav.DOM.$header = $('header');
      StickyNav.DOM.$headerInner = $('.header-inner');
      StickyNav.DOM.$headerBottom = $('.header-bottom');

      // Breakpoints
      enquire.register('(max-width: 859px)', {
        match: function() {
          // Fix header height
          StickyNav.helpers.resetHeaderHeight();
          // Set trigger
          StickyNav.helpers.setTrigger();

          // Events
          $(window).off('scroll.sticky');
        }
      })
      .register('(min-width: 860px)', {
        match: function() {
          // Fix header height
          StickyNav.helpers.resetHeaderHeight();
          // Set trigger
          StickyNav.helpers.setTrigger();

          // Events
          $(window).on('scroll.sticky', $.throttle(20, StickyNav.events.onScroll));
        }
      });

      StickyNav.vars.initialised = true;
    }
  },

  events: {
    onScroll: function(event) {
      if($(this).scrollTop() > StickyNav.vars.trigger) {
        StickyNav.helpers.stick();
      } else {
        StickyNav.helpers.unstick();
      }
    }
  },

  helpers: {
    resetHeaderHeight: function() {
      StickyNav.DOM.$headerInner.height('').height(StickyNav.DOM.$header.height());
    },

    setTrigger: function() {
      StickyNav.vars.trigger = StickyNav.DOM.$headerBottom.offset().top;
    },

    stick: function() {
      if(!StickyNav.DOM.$headerBottom.hasClass('sticky')) {
        StickyNav.DOM.$headerBottom.addClass('sticky');
      }
    },

    unstick: function() {
      if(StickyNav.DOM.$headerBottom.hasClass('sticky')) {
        StickyNav.DOM.$headerBottom.removeClass('sticky');
      }
    }
  }
};

if (typeof CookieBanner === 'undefined') {
  var CookieBanner = {};
}

CookieBanner.init = function() {
  this.DOM.$cookieBanner = $('.cookie-banner');
  this.DOM.$cookieBannerButton = this.DOM.$cookieBanner.find('.button-link-text');
  this.DOM.$cookieBannerButton.click(CookieBanner.Events.CookieBannerDismissClick);
  CookieBanner.Helpers.ShowCookieBanner();
};

CookieBanner.DOM = {
  $cookieBanner: null,
  $cookieBannerButton: null
};

CookieBanner.Events = {
  CookieBannerDismissClick: function(event) {
    event.preventDefault();
    CookieBanner.Helpers.CookieBannerDismiss();
  }
};

CookieBanner.Helpers = {
  CookieBannerDismiss: function() {
    localStorage.cookieBannerSeen = 'true';
    CookieBanner.DOM.$cookieBanner.slideUp(400);
  },

  ShowCookieBanner: function() {
    if(Modernizr.localstorage) {
      if(localStorage.cookieBannerSeen !== 'true')
      {
        CookieBanner.DOM.$cookieBanner.show();
      }
    }
  }

};



























if(typeof window.EMIShealth === 'undefined')
  window.EMIShealth = {};

window.EMIShealth.init = function() {
  TwitterFeed.init();
  window.EMIShealth.responsive.init();
  ImageLightbox.init();
  VideoPlayer.init();
  HeaderBasic.init();
  Tabs.init();
  StickyNav.init();
  Social.init();
  CookieBanner.init();
  $('.focuspoint').focusPoint();
};


window.EMIShealth.responsive = {

  init: function() {

    $('.searchbox-toggle').click(function(event) {
      $('.menu-toggle').removeClass('active');
      $('.menu__first-level').hide();
      $('.searchbox__first-level').toggle();
      $(this).toggleClass('active');      
    });

    $('.menu-toggle').click(function(event) {
      $('.searchbox-toggle').removeClass('active');
      $('.searchbox__first-level').hide();
      $('.menu__first-level').toggle();
      $(this).toggleClass('active');
    });

    $('.has-dropdown').click(function(event) {
      $(this).toggleClass('hover');      
    });

    enquire
    .register('screen and (min-width: 860px)', {
      setup : function() {
        // console.log('screen and (min-width: 800px) - SETUP');
        window.EMIShealth.responsive.DOM.imgCoverPolyfil();
        // window.EMIShealth.responsive.Helpers.stopLinkMainMenu();
      },

      match : function() {
        // Desktop stuff
        // console.log('screen and (min-width: 800px) - MATCH');
        window.EMIShealth.responsive.Helpers.moveSearchBarDesktop();
        // TwitterFeed.helpers.LoadTweetsForDesktop();
      },

      unmatch : function() {
        // Mobile stuff
        // console.log('screen and (min-width: 800px) - UNMATCH');
        window.EMIShealth.responsive.Helpers.stopLinkMainMenu();
        window.EMIShealth.responsive.Helpers.moveSearchBarMobile();        
      }
    })

    .register('screen and (max-width: 860px)', {
      match : function() {
        window.EMIShealth.responsive.Helpers.stopLinkMainMenu();
      },

      unmatch : function() {
        window.EMIShealth.responsive.Helpers.allowLinkMainMenu(); 
      }
    });
  },

  DOM : {    

    imgCoverPolyfil: function() {
      if(!Modernizr['object-fit'] && Modernizr.backgroundsize)
      {
        //console.log("imgCoverPolyfilPastIf");
        $('.case-study-image').each(function(){
          var $image = $(this).find('img');
          if($image.length)
          {
            $(this).addClass('image-cover-applied');
            $(this).attr('style','background-image:url(' + $image.attr('src') + ')');
            $image.hide();
          }
        });
      }
    }
  },

  Events: {

  },

  Helpers: {
    moveSearchBarMobile: function() {
      $('.searchbox').contents().appendTo('#search-box-mobile .dropdown-nav__first-level li');
      // console.log("moveColWithImageMobile");
    },

    moveSearchBarDesktop: function() {
      $('#search-box-mobile .dropdown-nav__first-level li').contents().appendTo('.searchbox');
      // console.log("moveColWithImageDesktop");
    },

    allowLinkMainMenu: function() {
      // console.log('allowLinkMainMenu');
      $('.has-dropdown > a').unbind('click');
    }, 

    stopLinkMainMenu: function() {
      // console.log('stopLinkMainMenu');
      $('.has-dropdown > a').click(function(event) {
        event.preventDefault(); 
      });
    }    
  }
};

$(document).ready(window.EMIShealth.init);
