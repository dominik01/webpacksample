define(function() {

  var StringFunctions = {
    /**
     * Capitalize first letter
     * @param  {String} str String to modify
     * @return {String}     Capitalized string
     */
    capitaliseFirstLetter: function(str) {
      return String(str).charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Camelize a string
     * @param  {String} str
     * @return {Strgin}
     */
    camelize: function(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      }).replace(/[[\W_]+/g, '');
    },

    /**
     * Modifies Name for safe usage in id or class attribute
     * @returns {String} Sanitizes Name
     */
    sanitize: function(name, prefix) {
      name = String(name).toLowerCase().replace(/[\?\!]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9_]+/g, '-');
      return prefix ? prefix + '-' + name : name;
    },

    /**
     * Replaces a string with parameters
     * @param  {String, [String n]} format String to replace and replacements
     * @return {String} Formatted string
     * @example `.format("{0} is dead, but {1} is alive! {1} owns the world!", "Java", "JavaScript")`
     */
    format: function(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : '';
      });
    },

    /**
     * Returns html to use in selects
     * @param  {Array} options Array containing options
     * @return {String}        Options as html
     */
    getOptionsHtml: function(options) {
      var html = '';
      $.each(options, function(i, option) {
        var selected = (option.preferred || option.selected) ? ' selected="selected"' : '';
        html += '<option value="' + option.id + '"' + selected + '>' + option.name + '</option>';
      });
      return html;
    },

    /**
     * A JavaScript equivalent of PHP’s nl2br
     * @param  {String}  str      String to transform
     * @param  {Boolean} is_xhtml
     * @return {String}           Replaced string
     */
    nl2br: function(str, is_xhtml) {
      var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

  };

  return StringFunctions;
});
