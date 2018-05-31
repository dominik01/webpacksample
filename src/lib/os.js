define(function(require) {
  var _ = require('lodash');

  var USER_AGENT = navigator.userAgent.toLowerCase();
  var OSX_VERSION = /Mac OS X (\d+_\d+)/gi;
  var OS_MAP = {
    'windows nt 10'      : 'Windows 10',
    'windows nt 6.3'     : 'Windows 8.1',
    'windows nt 6.2'     : 'Windows 8',
    'windows nt 6.1'     : 'Windows 7',
    'windows nt 6.0'     : 'Windows Vista',
    'windows nt 5.2'     : 'Windows Server 2003/XP x64',
    'windows nt 5.1'     : 'Windows XP',
    'windows xp'         : 'Windows XP',
    'windows nt 5.0'     : 'Windows 2000',
    'windows me'         : 'Windows ME',
    'win98'              : 'Windows 98',
    'win95'              : 'Windows 95',
    'win16'              : 'Windows 3.11',
    'macintosh|mac os x' : 'OS X',
    'mac_powerpc'        : 'OS 9',
    'linux'              : 'Linux',
    'ubuntu'             : 'Ubuntu',
    'iphone'             : 'iPhone',
    'ipod'               : 'iPod',
    'ipad'               : 'iPad',
    'android'            : 'Android',
    'blackberry'         : 'BlackBerry',
    'webos'              : 'Mobile'
  };

  var type = 'Unknown';
  var language = String(navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
  var arch = (typeof Modernizr !== 'undefined' && Modernizr['64bit']) ? 64 : 32;
  var version = null;
  var retina = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));

  _.map(OS_MAP, function(os, regex) {
    var pattern = new RegExp(regex);
    if (pattern.test(USER_AGENT)) {
      type = os;
      return false;
    }
  });

  var typeAndArch = [type, '(' + arch + '-bit)'].join(' ');

  // adjust detexted data
  if (type === 'OS X') {
    var match = OSX_VERSION.exec(USER_AGENT);
    if (match) {
      version = match[1].split('_').join('.');
      typeAndArch = [type, version].join(' ');
    }
  }

  var OS = {

    language: function() {
      return language;
    },

    arch: function() {
      return arch;
    },

    type: function() {
      return type;
    },

    retina: function() {
      return retina;
    },

    toString: function() {
      return typeAndArch;
    }

  };

  return OS;
});
