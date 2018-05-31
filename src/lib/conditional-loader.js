define(function(require) {

  var pubsub = require('pubsub');
  var conditioner = require('conditioner');
  var string = require('lib/string');
  var chrome = require('lib/chrome');
  var isRetina = require('lib/os').retina();

  var test_conditioner = require('ui/social-profiles');
  console.log('test');
  console.log(test_conditioner);

    conditioner.addPlugin({

        // converts module aliases to paths
        moduleSetName: (function (name) {
            return '/src/ui/' + name + ".js";
        }),

        moduleGetConstructor: (function (module) {
            return module.default;
        }),

        // setup AMD require
        moduleImport: function(name) {
          console.log(name);
          var promise = new Promise(function (resolve) {
              require([name],function (module) {
                resolve(module);
              });
          });
          console.log(promise);
          return promise;
        }

    });

  var updateResponsiveImages = function(context) {
    $('.rimg').each(function() {
      var $el = $(this);
      var oldSrc = $el.data('src');
      var data = $el.data();
      var capitalisedContext = string.capitaliseFirstLetter(context);
      var imageUrl;
      if (isRetina) {
        imageUrl = data['in' + capitalisedContext + 'HighresSrc'] || data['in' + capitalisedContext + 'Src'] || data.inBaseHighresSrc || data.inBaseSrc;
      } else {
        imageUrl = data['in' + capitalisedContext + 'Src'] || data.inBaseSrc;
      }

      if (data.remote) {
        var $remoteEl = $el.closest(data.remote);
        if ($remoteEl.length) {
          $el = $remoteEl;
          if ($el.closest('.skin-product-card').length) {
            var $tmpEl = $el;
            var position = $el.get(0).className.match(/skin-kv[^\s]*/g);
            $tmpEl.css('background-image', '');
            $el = $el.find('.product-card .card-top');

            if (position && position.length) {
              $.each(position, function(i) {
                $el.addClass(position[i]);
                $tmpEl.removeClass(position[i]);
              });
            }
          }
        }
      }

      // If source is the same like before, do an early return
      if (oldSrc === imageUrl) {
        return;
      }

      if ($el.prop('tagName').toLowerCase() === 'img') {
        $el.attr('src', imageUrl);
      } else {
        $el.css('background-image', 'url(' + imageUrl +')');
      }

      $el.data('src', imageUrl);
      $el.trigger('updateResponsiveImage');
    });
  };

  var update = function() {
    updateResponsiveImages(chrome.viewport.current());
      console.log(conditioner);
      //conditioner.init();
      conditioner.hydrate(document.documentElement);
  };

  pubsub.subscribe('app.viewportchange', function(msg, data) {
    updateResponsiveImages(data.to);
  });

  pubsub.subscribe('app.domchange', function() {
    update();
  });

  // init
    console.log('test1');
  update();
    console.log('test2');

  return {
    update: update
  };

});
