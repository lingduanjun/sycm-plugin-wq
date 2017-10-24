var CONTANTS = {
    STATUS_INIT:'init',
    STATUS_SEND:'send',
    STATUS_SUCCESS:'succ',
    STATUS_ERROR_NETWORK:'error_network',
    STATUS_ERROR_RESP:'error_resp'
};

var main = {
    init: function () {
        if (matchUrl("mq/words/search_words.htm")) {
            //是否进入到登录界面
            console.log("登录成功，插件初始化....");
            //初始化顶部工具条
            // $("<p>自动查词插件V0.1</p><button id='flag_btn'></button>是否自动运行<p id='jobstart_status'></p><button id='test_btn'></button>").insertBefore($("#mainTable"));


            $("<div id='tool_form'><p>自动查词插件V0.1</p><p>终端：<select id=\"device\">\n" +
                "            <option value=\"0\" >所有</option>\n" +
                "            <option value=\"1\" >PC</option>\n" +
                "            <option value=\"2\" >无线</option>\n" +
                "        </select></p>" +
                "<p>关键词列表：" +
                "<textarea  cols=\"50\" rows=\"10\"  id=\"keywords\"></textarea></p>" +
                "<p><input id='gogogo' type=\"submit\" value=\"提交\"></p></div>" +
                "<div id='tool_res'><p><div id='res'><table><thead><tr><td>关键词</td><td>搜索人气</td><td>在线商品数</td><td>点击热度</td><td>支付转化率</td></tr></thead><tbody></tbody></table></div></p></div>")
                .insertBefore($("#container"));


            $("#gogogo").click(main.gogogo);
            //setTimeout(main.startJob, 1000);
        }
    },

    // search:function(token,keyword,device){
    //
    //     var url = "https://sycm.taobao.com/mq/searchword/relatedWord.json" ;
    //         // "?dateRange=" +
    //         // date+"%7C"+date+"&dateType=recent1&device="+device+"&keyword=" + URLEncoder.encode(keyword, "utf-8")
    //         // + "&token="+token+"&_="+System.currentTimeMillis();
    //     var  date=$.datepicker.formatDate('yyyy-MM-dd',new Date());
    //     var params={
    //         dateRange:date+"|"+date,
    //         dateType:"recent1",
    //         device:device,
    //         keyword:keyword,
    //         token:token,
    //         _:new Date().getTime()
    //     }
    //
    //     ajaxTemplate(url,params,function(){
    //
    //     },null,function(){
    //
    //     },null);
    // },

    gogogo:function(){

        var device=$("#device").val();
        var keywords=$("#keywords").val();

        if(keywords==null||!keywords){
            alert("必须填写关键词");
            return;
        }

        // $("#gogogo").attr("disabled",true);
        document.getElementById("gogogo").disabled=true;
        $("#gogogo").val("查询中....")
        try {

            var token="";
            var cc=document.querySelector('meta[name="microdata"]').getAttribute('content');
            var ccs=cc.split(";");
            for(var i=0;i<ccs.length;i++){
                var ci=ccs[i];
                ci=ci.split("=");
                var ck=ci[0];
                var cv=ci[1];
                if(ck=="legalityToken"){
                    token=cv;
                }
            }

            if(!token ||token.length<=0){
                alert("无法获取token");
                return false;
            }

            $("#res tbody").html("");

            var tpl = "<tr><td>$keyword</td><td>$suv</td><td>$onlineGoodsCnt</td><td>$clickHot</td><td>$payConvRate</td></tr>";

            var ajaxs=[];
            var ks = keywords.split("\n");
            var yestoday=new Date(new Date().getTime()-24*3600*1000);
            for (var i = 0; i < ks.length; i++) {
                var keyword = ks[i];
                keyword = keyword.trim();

                var  date=getDateFormatStr(yestoday);
                var params={
                    dateRange:date+"|"+date,
                    dateType:"recent1",
                    device:device,
                    keyword:keyword,
                    token:token,
                    _:new Date().getTime()
                }

                ajaxs.push( Promise.resolve(new Promise(function (resolve, reject){
                    chrome.runtime.sendMessage({
                        method: 'GET',
                        action: 'ajax',
                        url: 'https://sycm.taobao.com/mq/searchword/relatedWord.json',
                        data: params
                    },function (data) {
                        resolve(data);
                    });
                })));


            }

            Promise.each(ajaxs,function(data, num, jqXHR){
                var k=ks[num]
                var json=null;
                if(data&&data["content"]&&data["content"]["data"]){
                    var d=data["content"]["data"];
                    for(var i=0;i<d.length;i++){
                        var di=d[i];
                        if(di["keyword"]==k){
                            json=di;
                            break;
                        }
                    }
                }
                if (!json) {
                    json = {keyword: k, suv: "", onlineGoodsCnt: "", clickHot: "", payConvRate: ""}
                }

                var tr = tpl;
                for (var key in json) {
                    tr = tr.replace("$" + key, json[key]);
                }
                $("#res tbody").append(tr);

                console.log(json);
            }).then(function(){
                console.log('完成');
                $("#gogogo").val("查询完成")
                //alert("查完！");
            });


        }finally {
            // $("#gogogo").attr("disabled", false);
            document.getElementById("gogogo").disabled=false;
        }
    }

};


