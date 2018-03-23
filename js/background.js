
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


const socket=io.connect('http://192.168.1.31:3000');
var clientVersion;
$.getJSON('manifest.json',function(data){
     clientVersion=data.version;
});

socket.on('sendTask', function (data) {
    var words = data.data;
    var planid=data.planid;
    console.log("接收到任务，每5s扫描一次");
    //检查查词工作页面是否打开
    setInterval(function () {
        chrome.tabs.query({url:"*://sycm.taobao.com/**"},function (tabs) {
            if(tabs.length<=0){
                socket.emit('logOut',planid,function (data) {
                    console.log("页面关闭")
                });
            }
        });
    },5000);
    chrome.tabs.query({url:"*://sycm.taobao.com/**"},function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id,{'data':words,'planid':planid,'action':'doTask'}, function(response) {
            if(typeof response !='undefined'){
                alert(response.result);
            }else{
                alert("response为空=>"+response);
            }
        });
    });

})
//监听完成任务时的事件
chrome.extension.onMessage.addListener(function(request){
    if(request.action=='finishedTask') {
        socket.emit('ResponseTaskData',request.data ,request.planid, function (data) {
            console.log("任务完成")
        });
    }

    if(request.action=='getVersionInfo') {
        console.log("收到权限信息："+request.data)
        if(request.data.hasPermission){
            socket.emit('login',clientVersion,request.data, function (data) {
                console.log("发送版本号和到期日期")
            });
        }else {
            return;
        }
    }

    if(request.action=='logOut') {
            socket.emit('logOut','', function (data) {
                console.log("用户退出:"+data);
            });
    }
});


socket.on('connect', function (data) {
    console.log('connected %s', socket.id);
});

socket.on('disconnect', function () {
    console.log('disconnected %s', socket.id);
});

socket.on('login',function () {
    socket.emit('login',clientVersion , function (data) {
        console.log('login %s', clientVersion);
    });
});

socket.emit('finished', function (data) {
    if (data) {
        console.log('task finished');
    } else {
    }
});

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
    }
});


