// injected into the webview as a user script
jQuery.noConflict();

jQuery(document).on('click', 'input[type="file"]', function () {
    alert('To upload media, drag and drop the file into the WhatsApp Web window.');
});

this.Notification = function (title, options) {
    convertImgToDataURLviaCanvas(options.icon, function(base64Img){
        webkit.messageHandlers.notification.postMessage([title, options.body, options.tag, base64Img]);
    });
};

this.Notification.permission = 'granted';
this.Notification.requestPermission = function (callback) {
    callback('granted');
};

var styleAdditions = document.createElement('style');
styleAdditions.textContent = 'div.pane-list-user { opacity:0; } \
div.pane-list-user > div.avatar { width: 0px; height: 0px; } \
div.app-wrapper::before { opacity: 0; } \
div.drawer-title { left:60px; bottom:17px; } \
div.chat.media-chat > div.chat-avatar { opacity: 0;} \
div.app.three, div.app.two { top: 0px; width: 100%; height: 100%; } \
.drawer-container-left { width: 100%; } \
@media screen and (max-width:1024px) { \
    .pane-list { width: 100%; } \
    .drawer-container-mid, .drawer-container-right, .pane-chat, .pane-intro, .pane-info, .drawer-container-panel { width: 62%; } \
} \
@media screen and (min-width:1024px) and (max-width:1199px) { \
    .pane-list, .pane-info, .drawer-container-panel { width: 30%; } \
    .drawer-container-mid, .drawer-container-right, .pane-chat, .pane-intro { width: 70%; } \
    .three .drawer-container-mid, .three .drawer-container-right, .three .pane-chat, .three .pane-intro { width: 40%; } \
} \
@media screen and (min-width:1200px) { \
    .pane-list, .pane-info, .drawer-container-panel { width: 359px; } \
    .drawer-container-mid, .drawer-container-right, .pane-chat, .pane-intro { width: calc(100% - 359px); } \
    .three .drawer-container-mid, .three .drawer-container-right, .three .pane-chat, .three .pane-intro { width: calc(100% - 718px); } \
}\
@media screen and (min-width:1320px) {\
    .pane-list, .pane-info, .drawer-container-panel { width: 388px; } \
    .drawer-container-mid, .drawer-container-right, .pane-chat, .pane-intro { width: calc(100% - 388px); } \
    .three .drawer-container-mid, .three .drawer-container-right, .three .pane-chat, .three .pane-intro { width: calc(100% - 718px); } \
}\
.image-thumb-lores { -webkit-transform: translate3d(0,0,0); } \
.avatar-image { -webkit-transform: translate3d(0,0,0); } \
.drawer-header-small { background-color: #00bfa5; color: #fff; height: 108px; -webkit-box-orient: vertical; -webkit-box-direction: normal; -webkit-flex-direction: column; -ms-flex-direction: column; flex-direction: column; -webkit-box-pack: end; -webkit-justify-content: flex-end; -ms-flex-pack: end; justify-content: flex-end; padding: 0 20px 12px; -webkit-box-align: inherit; -webkit-align-items: inherit; -ms-flex-align: inherit; align-items: inherit; } \
.drawer-header-small .drawer-title { -webkit-box-flex: 0; -webkit-flex: none; -ms-flex: none; flex: none; }\
';
document.documentElement.appendChild(styleAdditions);

function convertImgToDataURLviaCanvas(url, callback, outputFormat){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}


function activateSearchField() {
    document.querySelector('input.input-search').focus();
}

function dispatch(target, eventType, char) {
    var evt = document.createEvent("TextEvent");
    evt.initTextEvent(eventType, true, true, window, char, 0, "en-US");
    target.focus();
    target.dispatchEvent(evt);
}


function triggerClick() {
    var event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });
    document.querySelector(".icon.btn-icon.icon-send").dispatchEvent(event);
}

function updateEmoji() {
	emoji(document.querySelector('div.input'));
}

function newConversation() {
    document.querySelector('button.icon-chat').click();
    document.querySelector('input.input-search').focus();

    var header = document.querySelector('div.drawer-title');
    header.style.left = '0px';
    header.style.bottom = '12px';
}

var CHAT_ITEM_HEIGHT;

function offsetOfListItem($item) {
    return parseInt($item.css('transform')
        .split(',')
        .slice()
        .pop());
}

function indexOfListItem($item) {
    return offsetOfListItem($item) / CHAT_ITEM_HEIGHT;
}

function clickOnItemWithIndex(index, scrollToItem) {
    var $ = jQuery;
    var $infiniteListItems = $('.infinite-list-viewport .infinite-list-item');
    $.each($infiniteListItems, function () {
        var $this = $(this);
        if (indexOfListItem($this) === index) {
           var desiredItem = $this.get(0);
           var event = new MouseEvent('mousedown', { 'view': window, 'bubbles': true, 'cancelable': true });

           desiredItem.firstChild.firstChild.dispatchEvent(event);
           if (scrollToItem) {
                $scrollView = $('.pane-list-body');
                $desiredItem = $(desiredItem);

                // Check whether the desired item is not inside the viewport (below)
                if ($desiredItem.position().top + CHAT_ITEM_HEIGHT > $scrollView.scrollTop() + $scrollView.height()) {
                    var scrollPos = $desiredItem.position().top - $scrollView.height() + CHAT_ITEM_HEIGHT;
                    $scrollView.stop().animate({scrollTop: scrollPos}, 150);
                }
                // Check whether the desired item is not inside the viewport (above)
                else if ($desiredItem.position().top < $scrollView.scrollTop()) {
                    var scrollPos = $desiredItem.position().top;
                    $scrollView.stop().animate({scrollTop: scrollPos}, 150);
                }
            }
            return false;
        }
    });
}

function openChat(rawTag) {
    var $ = jQuery;
    var tag = rawTag.replace('.', '=1');
    
    var event = new MouseEvent('mousedown', { 'view': window, 'bubbles': true, 'cancelable': true });

    document.querySelector('div.chat[data-reactid*="' + tag + '"]').dispatchEvent(event);
}

function setActiveConversationAtIndex(index) {
    if (index < 1 || index > 9) {
        return;
    }
    // Scroll to top of the conversation list
    var conversationList = document.querySelector('div.pane-list-body');
    if (conversationList.scrollTop == 0) {
        clickOnItemWithIndex(index - 1, false);
    } else {
        new MutationObserver(function () {
            clickOnItemWithIndex(index - 1, false);
            this.disconnect();
        })
            .observe(conversationList, {
                attributes: true,
                childList: true,
                subtree: true
            });
    }
    conversationList.scrollTop = 0;
}

jQuery(function () {
	(function ($) {
		$(document).on('click', function(event) {
			var target = $(event.target);
            if (target.parents('div.infinite-list-item').length && !target.parents('.chat-meta').length &&
                !target.parents('div.infinite-list-viewport').length) {
                $('footer').find('div.input').focus();
            }
		});

		$(document).keyup(function (event) {
			if(event.currentTarget.activeElement.contentEditable) {
				if(event.which < 37 || event.which > 40) {
					updateEmoji();
				}
			}
		});
		
		$(document).keydown(function (event) {
			if (!CHAT_ITEM_HEIGHT) {
				CHAT_ITEM_HEIGHT = parseInt($($('.infinite-list-viewport .infinite-list-item')[0]).height());
			}
			
			var direction = null;
            switch (event.which) {
                case 38:
                    direction = 'UP';
                    break;
                case 40:
                    direction = 'DOWN';
                    break;
                default:
                    break;
            }
            var $input = $('.input');
            var isInputFieldEmpty = $input.contents().length === 0 ||
                $input.contents()[0].nodeName === 'BR';
            if (direction && isInputFieldEmpty) {
                event.preventDefault();
                var $selectedItem = null;
                var $infiniteListItems = $('.infinite-list-viewport .infinite-list-item');
                $.each($infiniteListItems, function () {
                    var $this = $(this);
                    if ($this.children('.chat').hasClass('active')) {
                        $selectedItem = $this;
                        return false;
                    }
                });
                if ($selectedItem) {
                    var selectedIndex = indexOfListItem($selectedItem);
                    var desiredIndex = direction === 'UP' ? Math.max(selectedIndex - 1, 0) : selectedIndex + 1;
                    clickOnItemWithIndex(desiredIndex, true);
                }
            }
        });
    })(jQuery);
});
