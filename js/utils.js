function ajaxTemplate(url, data, successCallback, successParams, failCallback, failParams){
    var ajaxTemplateName = $.ajax({
        type: "GET",
        /*dataType: "html",*/
        url: url,
        data: data,
        cache:false,
        success: function (data) {
            if(successCallback){
                successCallback(data,successParams);
            }
        },
        fail: function(){
            if(failCallback){
                failCallback(failParams);
            }
        }
    });
    return ajaxTemplateName;
}
/***************start日期工具*********************/
/**
** 格式化日期
**/
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function getDateFormatStr(date){
    return date.format('yyyy-MM-dd');
}
function addDate(date,n){
    var d=new Date(Date.parse(date.replace(/-/g,"/")));
    var time=d.getTime();
    var newTime=time+n*24*60*60*1000;
    return new Date(newTime).format("yyyy-MM-dd");
};


/***************end日期工具*********************/

//获取url中的参数
function getUrlParam(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r;
    if(url){
        var search = url.split("?")[1];
        if(search){
            r = search.match(reg);
        }
    }else{
        r = window.location.search.substr(1).match(reg); //匹配目标参数
    }
    if (r != null){
        return unescape(r[2]);
    }
    return null; //返回参数值
}
function matchUrl(match){
    return (window.location.href.indexOf(match)>=0);
}