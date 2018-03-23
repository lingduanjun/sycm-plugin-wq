var background = chrome.extension.connect();


background.onMessage.addListener(function(msg) {
    if(msg.cb && !msg.content.itemId){
        var cb = eval(msg.cb);
        cb(msg.content);    
    }else{
        var cb = eval(msg.cb);
        cb(msg.content.data,msg.content.itemId);
    }
});
function startPlugin() {
    console.log("插件启动!!!!!!!!!!");
}

chrome.extension.onMessage.addListener(
    function(request,sender, sendResponse) {
         if(request.action=='doTask'){
               main.gogogo(request.data,request.data,request.planid)
               sendResponse({result: "请稍等，任务进行中。。"})
         }
    }
);



$(function(){
    startPlugin();
    main.init();
    $('div[data-spm=userTopBar]>a').on("click", function(){
        alert("退出");
        chrome.extension.sendMessage({'action':'logOut'},function(response){
            console.log("用户退出");
        });
    });

});