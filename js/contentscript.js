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

$(function(){
    startPlugin();
    main.init();

});