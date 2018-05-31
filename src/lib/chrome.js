define(function(require) {
    require('lib/transition');
    var instance = null;
    var _ = require('lodash');
    var config = require('config');
    var pubsub = require('pubsub');

    var templateBaseUrl = window.templateBaseUrl || '';
    var viewports = config.viewports;
    var regions = config.regions;
    var currentViewport = null;
    var isAtTop = null;
    var isResizing = false;
    var isObsoleteHeader = false;
    var isObsolateBreadcrumb = false;
    var lastObsoleteScrollPosition = 0;
    var lastObsoleteScrollPosition2 = 0;


    var SCROLLPOSITION_TO_SET_STICKY = 100;
    var SCROLLPOSITION_OBSOLETE_THRESHOLD = 50;
    var SCROLLANIMATION_SPEED = 450;
    var HEADER_MAX_HEIGHT = 75;
    var SNEAKY_MAX_HEIGHT = 55;
    var CLASS_STATE_RESIZING = 'state-resizing';
    var CLASS_STATE_STICKY = 'state-sticky-header';
    var CLASS_STATE_OBSOLETE = 'state-obsolete-header';
    var CLASS_STATE_OBSOLATE_BREADCRUMB = 'state-obsolete-breadcrumb';

    config.scrollTop = 0;

    function getInstance() {
        if (instance === null) {
            instance = new Chrome();
        }

        return instance;
    }

    function normalizeViewportValue(value) {
        if (typeof(value) === 'string' && typeof viewports[value] === 'number') {
            value = viewports[value];
        }
        return parseInt(value);
    }

    function Chrome() {
        var chrome = this;

        function _checkForContextChange() {
            var oldViewport = currentViewport;

            for (var viewport in viewports) {
                if (viewport) {
                    var matches = chrome.viewport.gt(viewport);
                    if (matches) {
                        currentViewport = viewport;
                    } else {
                        break;
                    }
                }
            }

            if (currentViewport === null || regions.window.width() <= config.viewports.xxs) {
                currentViewport = 'xxs';
            }

            if (oldViewport !== currentViewport) {
                pubsub.publish('app.viewportchange', {
                    from: oldViewport,
                    to: currentViewport
                });
            }
        }

        function _checkForStickyHeader() {
            var newScrollPositionAtTop = (regions.window.scrollTop() <= SCROLLPOSITION_TO_SET_STICKY);

            /*  if (newScrollPositionAtTop !== isAtTop) {
                  isAtTop = newScrollPositionAtTop;
                  regions.header.off('crossTransitionEnd.navigation');

                  if (isAtTop) {
                      regions.html.removeClass('state-sneaky-shown');
                      pubsub.publish('app.header.sneaky', isAtTop);

                      regions.header.one('crossTransitionEnd.navigation', function() {
                          regions.html.removeClass(CLASS_STATE_STICKY);
                          pubsub.publish('app.header.sticky', isAtTop);
                      }).emulateTransitionEnd(500);
                  } else {
                      regions.html.addClass(CLASS_STATE_STICKY);
                      pubsub.publish('app.header.sticky', isAtTop);

                      regions.header.one('crossTransitionEnd.navigation', function() {
                          regions.html.addClass('state-sneaky-shown');
                          pubsub.publish('app.header.sneaky', isAtTop);
                      }).emulateTransitionEnd(500);
                  }
              }*/
        }

        function _checkForObsoleteHeader() {
            var scrollTop = config.scrollTop;
            var change = lastObsoleteScrollPosition - scrollTop;
            // hold back updates as long as the treshold isn't reached
            if (Math.abs(change) < SCROLLPOSITION_OBSOLETE_THRESHOLD) {
                return;
            }

            lastObsoleteScrollPosition = scrollTop;
            var willBeObsoleteHeader = (scrollTop > SCROLLPOSITION_TO_SET_STICKY && change <= SCROLLPOSITION_OBSOLETE_THRESHOLD);
            chrome.setHeaderObsolete(willBeObsoleteHeader);
        }

        function _checkForObsoleteBreadcrumb() {
            var scrollTop = config.scrollTop;
            var change = lastObsoleteScrollPosition2 - scrollTop;
            // hold back updates as long as the treshold isn't reached
            if (Math.abs(change) < SCROLLPOSITION_OBSOLETE_THRESHOLD) {
                return;
            }

            lastObsoleteScrollPosition2 = scrollTop;
            var willBeObsoleteBreadcrumb = (scrollTop > SCROLLPOSITION_TO_SET_STICKY && change <= SCROLLPOSITION_OBSOLETE_THRESHOLD);
            chrome.setBreadCrumbObsolete(willBeObsoleteBreadcrumb);
        }


        function _addSneakyContent() {
            var $content = $('.product-card [data-btn-buy]');

            if (!$content.length) {
                return;
            }

            pubsub.subscribe('app.scroll', function(msg, viewport) {
                var contentTop = $content.offset().top;

                if (viewport.scrollTop + 65 < contentTop) {
                  if (!regions.sneakyRight.hasClass('unnecessary')) {
                    regions.sneakyRight.addClass('unnecessary');
                  }
                } else {
                  if (regions.sneakyRight.hasClass('unnecessary')) {
                    regions.sneakyRight.removeClass('unnecessary');
                  }
                }
            });
        }

        function _addScrollToTop() {
            var $btnScrollToTop = $('.footer-scroll-to-top-wrapper button');
            $btnScrollToTop.on('click', function(ev) {
                ev.preventDefault();
                chrome.scrollTo(0, 0);
            });
        }

        function _addScrollToNext() {
            if (regions.hero.is('.without-scroll-to-next')) {
                return;
            }

            regions.hero.addClass('with-scroll-to-next');

            $('<button>', {
                'type': 'button',
                'class': 'scroll-to next-section',
                'html': '<i class="icon ficon-scroll-down"></i>'
            }).appendTo(regions.hero).on('click', function(ev) {
                ev.preventDefault();
                chrome.scrollTo(regions.sections.first());
            });
        }

        function _scrollToUrlHash() {
            var hashParam = window.location.hash.substring(1).replace(/[^a-zA-Z0-9-–_?=&]/g, '');

            if (!!hashParam && !_.startsWith(hashParam, '?') && hashParam !== 'reset') {
                var $hashElement = $('#' + hashParam + ', #content-' + hashParam).eq(0);

                if ($hashElement.parents('[data-module="ui/tabs"]').length) {
                    $hashElement = $hashElement.parents('[data-module="ui/tabs"]');
                }

                if ($hashElement.length > 0 && !chrome.viewport.isVisible($hashElement.offset().top, (config.regions.window.height() / 2))) {
                    chrome.scrollTo($hashElement, HEADER_MAX_HEIGHT + SNEAKY_MAX_HEIGHT);
                }
            }
        }

        function _addPrintLogo() {
            var logoUrl = templateBaseUrl + '/../img/svg/logo-print.svg';
            $('<div>', {
                'class': 'header-print visible-to-print',
                'html': '<div class="container"><img src="' + logoUrl + '" /></div>'
            }).prependTo(regions.body);
        }

        function _prepareNestedLists() {
            $('[class*="list"] li ul, [class*="list"] li ol').parent().addClass('nested-list-wrapper');
        }

        var _throttledResize = _.throttle(function() {
            if (!isResizing) {
                regions.html.addClass(CLASS_STATE_RESIZING);
                isResizing = true;
            }
            isResizing = true;
            config.scrollTop = regions.window.scrollTop();
            pubsub.publish('app.resize', {
                width: regions.window.width(),
                height: regions.window.height()
            });
            _checkForContextChange();
        }, 250);

        var _debouncedResize = _.debounce(function() {
            regions.html.removeClass(CLASS_STATE_RESIZING);
            isResizing = false;
        }, 250);

        _prepareNestedLists();
        _checkForContextChange();
        _checkForStickyHeader();
        _addSneakyContent();
        _addScrollToTop();
        _addScrollToNext();
        _addPrintLogo();

        pubsub.subscribe('app.hashchange', _scrollToUrlHash);

        regions.body.on('click.scrollTo', 'a[href*="#"]:not([href$="#"])', function(evt) {
            var node = evt.currentTarget;
            var hash = node.hash;
            var hostname = node.hostname;
            var pathname = node.pathname.replace(/(^\/?)/, '/'); // fix for missing leading slash

            if (hash !== 0 && location.hostname === hostname && location.pathname === pathname) {
                var $target = $(hash + ', #content-' + hash.slice(1)).eq(0);
                var isTab;
                $target = $target.length ? $target : $('[name=' + hash.slice(1) + ']');

                if ($target.parents('[data-module="ui/tabs"]').length) {
                    $target = $target.parents('[data-module="ui/tabs"]');
                    isTab = true;
                }

                if ($target.length && !chrome.viewport.isVisible($target.offset().top, (config.regions.window.height() / 2))) {
                    if (isTab) {
                        var $tab = $target.find('.nav-tabs [href="' + hash + '"]');
                        var index = parseInt($tab.attr('data-index'), 10);
                        var api = $target.find('.nav-tabs').data('tabs');
                        api.click(index);
                    }

                    chrome.scrollTo($target, HEADER_MAX_HEIGHT + SNEAKY_MAX_HEIGHT);
                }
            }
        });

        regions.window.on('load', _scrollToUrlHash);

        regions.window.on('resize.chrome', function() {
            _throttledResize();
            _debouncedResize();
        });

        regions.window.on('scroll.chrome', _.throttle(function() {
            config.scrollTop = regions.window.scrollTop();

            pubsub.publish('app.scroll', {
                scrollTop: config.scrollTop
            });

            _checkForStickyHeader();
            _checkForObsoleteBreadcrumb();

            if (chrome.viewport.lt('lg')) {
                _checkForObsoleteHeader();
            }
        }, 150));

        regions.window.on('hashchange.chrome', _.throttle(function() {
            pubsub.publish('app.hashchange', {
                hash: '' + window.location.hash.substring(1).replace(/[^a-zA-Z0-9-–_]/g, '')
            });
        }, 100));
    }

    Chrome.prototype.setHeaderObsolete = function(willBeObsoleteHeader) {
        willBeObsoleteHeader = !!willBeObsoleteHeader;
        if (willBeObsoleteHeader !== isObsoleteHeader) {
            isObsoleteHeader = willBeObsoleteHeader;
            regions.html.toggleClass(CLASS_STATE_OBSOLETE, isObsoleteHeader);
        }
    };

    Chrome.prototype.setBreadCrumbObsolete = function (willBeObsoleteBreadcrumb) {
        willBeObsoleteBreadcrumb = !!willBeObsoleteBreadcrumb;
        if (willBeObsoleteBreadcrumb !== isObsolateBreadcrumb) {
            isObsolateBreadcrumb = willBeObsoleteBreadcrumb;
            regions.sneaky.toggleClass(CLASS_STATE_OBSOLATE_BREADCRUMB, isObsolateBreadcrumb);
        }
    };

    Chrome.prototype.scrollTo = _.debounce(function(position, offset) {
        var scrollTop = 0;

        offset = typeof offset === 'number' ? offset : Math.min(regions.header.height(), HEADER_MAX_HEIGHT);

        if (this.viewport.gt('sm') && regions.sneaky.length) {
            offset = offset + SNEAKY_MAX_HEIGHT;
        }

        if (position === 'bottom') {
            scrollTop = regions.document.height();
        } else {
            if (typeof position === 'object' && position.jquery) {
                if (!position.length) {
                    return;
                }

                scrollTop = position.offset().top;
            } else {
                scrollTop = parseInt(position, 10);
            }
        }

        regions.html.add(regions.body).stop(true).animate({
            scrollTop: scrollTop - offset
        }, SCROLLANIMATION_SPEED);
    }, 100);

    Chrome.prototype.viewport = {
        isBetween: function(min, max) {
            var test = '(min-width: ' + normalizeViewportValue(min) + 'px) and (max-width: ' + normalizeViewportValue(max) + 'px)';
            return Modernizr.mq(test);
        },

        isVisible: function(offset, threshold) {
            threshold = threshold || 0;
            var offsetYTop = regions.window.scrollTop();
            var offsetYBottom = offsetYTop + regions.window.height();
            return (offset < (offsetYBottom - threshold) && offset > offsetYTop);
        },

        isBelow: function(offset, threshold) {
            threshold = threshold || 0;
            var offsetYTop = regions.window.scrollTop();
            return ((offset + threshold) < offsetYTop);
        },

        lt: function(value) {
            var test = '(max-width: ' + (normalizeViewportValue(value) - 1) + 'px)';
            return Modernizr.mq(test);
        },

        gt: function(value) {
            var test = '(min-width: ' + normalizeViewportValue(value) + 'px)';
            return Modernizr.mq(test);
        },

        current: function() {
            return currentViewport;
        }
    };

    return getInstance();
});
