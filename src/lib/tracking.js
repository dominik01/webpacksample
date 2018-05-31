define(function(require) {
    var pubsub = require('pubsub');
    console.log(pubsub);
    var cookie = require('cookie');
    console.log(cookie);
    var instance = null;
    var getInstance = function() {
        if (instance === null) {
            instance = new Tracking();
            instance.init();
        }
        return instance;
    };

    var Tracking = function() {
        var that = this;

        function _addEventLabelToByButtons() {
            $('[data-btn-buy]').each(function() {
                var $this = $(this);
                if ($this.parents('#navigation').length) {
                    $this.attr('data-event-label', 'Main menu');
                } else if ($this.parents('.product-listing').length) {
                    $this.attr('data-event-label', 'All products page');
                } else if ($this.parents('.compare-table, .comparable').length) {
                    $this.attr('data-event-label', 'Product page (comparison)');
                } else if ($this.parents('.product-card, .product-card-dep').length) {
                    $this.attr('data-event-label', 'Product page (top-right)');
                } else if ($this.parents('#sneaky').length) {
                    $this.attr('data-event-label', 'Product page (floating Buy Now)');
                }
            });
        }

        that.init = function() {
            if (typeof window.dataLayer !== 'undefined' && typeof window.google_tag_manager !== 'undefined') {
                pubsub.subscribe('app.init', _addEventLabelToByButtons);
                pubsub.subscribe('app.domchange', _addEventLabelToByButtons);
            }
        };
    };

    pubsub.subscribe('window.load', function() {
        $(window).trigger('CustomFormEvent-PageLoad');
    });

    return getInstance();
});
