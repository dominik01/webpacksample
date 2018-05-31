define(function() {
    var youTubeIframeAPIReady = false;
    var dfd = $.Deferred();

    window.onYouTubeIframeAPIReady = function() {
        youTubeIframeAPIReady = true;
        dfd.resolve();
    };

    if (!youTubeIframeAPIReady) {
        $.getScript('https://www.youtube.com/iframe_api');
    } else {
        dfd.resolve();
    }

    return dfd.promise();
});
