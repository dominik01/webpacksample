define(function() {
  var config = {
    // share configuration
    share: {
      providers: [
        {
          id: 'facebook',
          name: 'Facebook',
          shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={0}',
          apiUrl: 'http://graph.facebook.com/?id={0}&callback=?',
          countKey: 'shares'
        },
        {
          id: 'twitter',
          name: 'Twitter',
          shareUrl: 'https://twitter.com/intent/tweet?url={0}&text={1}&via=ESET',
          apiUrl: 'http://cdn.api.twitter.com/1/urls/count.json?url={0}&callback=?',
          countKey: 'count'
        },
        {
          id: 'linkedin',
          name: 'LinkedIn',
          shareUrl: 'http://www.linkedin.com/shareArticle?mini=true&url={0}',
          apiUrl: 'http://www.linkedin.com/countserv/count/share?url={0}&callback=?',
          countKey: 'count'
        }
      ]
    },

    // Defined Viewports.
    // Please keep in sync with sass's $screen-xx variables
    viewports: {
      xxs: 320,
      xs: 480,
      sm: 768,
      md: 990,
      lg: 1200,
      xl: 1550
    },

    // Hot elements in dom gets referenced here
    regions: {
      window: $(window),
      document: $(document),
      html: $(document.documentElement),
      body: $('body'),
      header: $('#header'),
      footer: $('#footer'),
      content: $('#content'),
      sidebar: $('#sidebar'),
      hero: $('.hero'),
      sneaky: $('#sneaky'),
      sneakyLeft: $('#sneaky-left'),
      sneakyRight: $('#sneaky-right'),
      buttons: {
        menu: $('#link-menu'),
        search: $('#link-search'),
        language: $('.link-language'),
        cart: $('#link-cart'),
        totop: $('.scroll-to.top')
      },
      navigations: {
        main: $('.nav-main'),
        secondary: $('.nav-secondary'),
        sidebar: $('.nav-sidebar')
      },
      forms: {
        search: $('#search')
      },
      sections: $('.section').filter(function(i, element) {
        return $(element).closest('.hero').length === 0;
      })
    }
  };

    window.ParsleyConfig = {
      errorsContainer: function(elem) {
        return elem.$element.parents('.form-group');
      }
    };

  return config;
});
