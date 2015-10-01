var Readout = function(customAttribute) {
  var readoutNamespace  = customAttribute || 'data-readout-src'
    , readoutSelector   = '[' + readoutNamespace + ']';
  $(readoutSelector + ":not(:has(>" + readoutSelector + "))").each(function(i, el) {
    var readoutSrc = $(el).parents(readoutSelector).andSelf()
      .map(function(i, parent) {
        return parent.getAttribute(readoutNamespace);
      }).get()
      .reduce(function(result, readoutSrc) {
        return result + "/" + readoutSrc;
      });
    $.get(readoutSrc, function(data) {
      var html = (new showdown.Converter()).makeHtml(data);
      el.innerHTML = html;
    });
  });
}
