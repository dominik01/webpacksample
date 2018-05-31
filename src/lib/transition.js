define(function() {
  function transitionEnd() {

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    };

    var transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
    if (transEndEventName) {
      return {end:transEndEventName};
    } else {
      return false;
    }
  }

  $.support.transition = transitionEnd();

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('crossTransitionEnd', function () { called = true; });
    var callback = function() {
      if (!called) {
        $($el).trigger('crossTransitionEnd');
      }
    };
    setTimeout(callback, duration);
    return this;
  };

  if (!$.support.transition) {
    return;
  }

  $.event.special.crossTransitionEnd = {
    bindType: $.support.transition.end,
    delegateType: $.support.transition.end,
    handle: function (e) {
      if ($(e.target).is(this)) {
        return e.handleObj.handler.apply(this, arguments);
      }
    }
  };

});
