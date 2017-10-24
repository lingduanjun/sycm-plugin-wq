
if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}

function get_url(cookie) {
    var prefix = cookie.secure ? "https://" : "http://";
    if (cookie.domain.charAt(0) == ".")
        prefix += "www";

    return prefix + cookie.domain + cookie.path;
}

function get_suffix(url) {
    var cookiestr = '';
    var domain = url.replace('http://', '').replace('https://').split('/')[0];
    var segs = domain.split('.');
    if(segs.length < 2) {
        return null;
    }

    var suffix = '.' + [segs[segs.length-2], segs[segs.length-1]].join('.');
    return suffix;
}

function get_domain(url){
    var domain = url.replace('http://', '').replace('https://').split('/')[0];
    return domain;
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "ajax") {
        $.ajax({
            url: request.url,
            type: request.method,
            data: request.data,
            success: function(responseText){
                callback(responseText);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                //if required, do some error handling
                callback();
            }
        });

        return true; // prevents the callback from being called too early on return
    }
});

