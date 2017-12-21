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


            $("<div id='tool_form'><p>自动查词插件V0.2</p><p>终端：<select id=\"device\">\n" +
                "            <option value=\"0\" >所有</option>\n" +
                "            <option value=\"1\" >PC</option>\n" +
                "            <option value=\"2\" >无线</option>\n" +
                "        </select></p>" +
                "<p>关键词词根：" +
                "<textarea  cols=\"50\" rows=\"10\"  id=\"keywords\"></textarea></p>" +
                "<p>关键词清单：" +
                "<textarea  cols=\"50\" rows=\"10\"  id=\"keywordsAll\"></textarea></p>" +
                "<p><input id='gogogo' type=\"submit\" value=\"提交\"></p></div>" +
                "<div id='tool_res'><p><div id='res' style='display: none'><table><thead><tr><td>关键词词根</td><td>关键词相关词</td><td>搜索人气</td><td>在线商品数</td><td>点击热度</td><td>支付转化率</td></tr></thead><tbody></tbody></table></div></p>" +
                "<p><div id='resChaci' style='display: none'><table><thead><tr><td>关键词</td><td>搜索人气</td><td>在线商品数</td><td>点击热度</td><td>支付转化率</td></tr></thead><tbody></tbody></table></div></p></div>")
                .insertBefore($("#container"));
            $("#gogogo").click(function(){
                main.gogogo();
            });
            //setTimeout(main.startJob, 1000);
        }
    },

    search:function(token,keywords,keywordsAll,device,whenDone){
        var _this=this;
        if(keywords.length<=0){
            if(keywordsAll.length>0){ //没匹配上任何关键词的相关词处理
                console.log(keywordsAll);
                for( var i=0;i<keywordsAll.length;i++){
                    var tr = "<tr><td>$keyRoot</td><td>$relatedWord</td><td>$suv</td><td>$onlineGoodsCnt</td><td>$clickHot</td><td>$payConvRate</td></tr>";
                    var json = {keyRoot:"",relatedWord: keywordsAll[i], suv: "", onlineGoodsCnt: "", clickHot: "", payConvRate: ""}
                    for (var key in json) {
                        tr = tr.replace("$" + key, json[key]);
                    }
                    tr = tr.replace("$keyRoot", keyword);
                    $("#resChaci").hide();
                    $("#res").show();
                    $("#res tbody").append(tr);
                }
            }
            return whenDone.call(this,keywords);
        }
        var keyword=keywords.shift();
        var yestoday=new Date(new Date().getTime()-24*3600*1000);
        keyword = keyword.trim();
        if(!keyword ||keyword.length<=0){
            return this.search(token,keywords,keywordsAll,device,whenDone);
        }

        var  date=getDateFormatStr(yestoday);
        var params={
            dateRange:date+"|"+date,
            dateType:"recent1",
            device:device,
            keyword:keyword,
            token:token,
            _:new Date().getTime()
        }

        var process=function(data, textStatus){
            if(keywordsAll==null||!keywordsAll){
                var json=null;
                if(data&&data["content"]&&data["content"]["data"]){
                    var d=data["content"]["data"];
                    for(var i=0;i<d.length;i++){
                        var di=d[i];
                        if(di["keyword"]==keyword){
                            json=di;
                            break;
                        }
                    }
                }
                if (!json) {
                    json = {keyword: keyword, suv: "", onlineGoodsCnt: "", clickHot: "", payConvRate: ""}
                }

                var tpl = "<tr><td>$keyword</td><td>$suv</td><td>$onlineGoodsCnt</td><td>$clickHot</td><td>$payConvRate</td></tr>";

                var tr = tpl;
                for (var key in json) {
                    tr = tr.replace("$" + key, json[key]);
                }
                $("#res").hide();
                $("#resChaci").show();
                $("#resChaci tbody").append(tr);
                var delay=1000+Math.floor( Math.random()*3000)
                setTimeout(function(){
                    _this.search(token,keywords,keywordsAll,device,whenDone);
                },delay);

                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }else {
                var backArr=[];
                if(data&&data["content"]&&data["content"]["data"]){
                    var d=data["content"]["data"];
                    for(var i=0;i<d.length;i++){
                        var di=d[i];
                        backArr.push(di["keyword"]);
                    }
                }
                console.log("设定的相关词："+keywordsAll);
                console.log("获取的相关词："+backArr);
                for (var i=0;i<keywordsAll.length;i++) {
                    var json=null;
                    var tr = "<tr><td>$keyRoot</td><td>$relatedWord</td><td>$suv</td><td>$onlineGoodsCnt</td><td>$clickHot</td><td>$payConvRate</td></tr>";
                    tr=tr.replace("$relatedWord", keywordsAll[i]);
                    for(var j=0;j<d.length;j++){
                        var di=d[j];
                        var rr=di["keyword"];
                        if(di["keyword"]==keywordsAll[i]){
                            json=di;
                            keywordsAll.splice(i, 1);//匹配之后就删除
                            i = i-1;
                            console.log(keywordsAll);
                            break;
                        }
                    }
                    if(json){
                        for (var key in json) {
                            tr = tr.replace("$" + key, json[key]);
                        }
                        tr = tr.replace("$keyRoot", keyword);
                        $("#resChaci").hide();
                        $("#res").show();
                        $("#res tbody").append(tr);
                    }
                }
                var delay=1000+Math.floor( Math.random()*3000)
                setTimeout(function(){
                    _this.search(token,keywords,keywordsAll,device,whenDone);
                },delay);
                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }

        }

        $.ajax({
            url:"https://sycm.taobao.com/mq/searchword/relatedWord.json",
            type:"GET",
            timeout:30000,
            data:params,
            dataType:"json",
            success:process,
            error:process
        })

        // chrome.runtime.sendMessage({
        //     method: 'GET',
        //     action: 'ajax',
        //     url: 'https://sycm.taobao.com/mq/searchword/relatedWord.json',
        //     data: params
        // },function (data) {
        //
        //
        //
        // });

    },
    gogogo:function(){
        var device=$("#device").val();
        var keywords=$("#keywords").val();//词根
        var keywordsAll=$("#keywordsAll").val();//关键词列表
        if(keywords==null||!keywords){
            alert("必须填写关键词词根");
            return;
        }
       /* if(keywordsAll==null||!keywordsAll){
            alert("必须填写关键词清单");
            return;
        }*/
        // $("#gogogo").attr("disabled",true);
        document.getElementById("gogogo").disabled=true;
        $("#gogogo").val("查询中....")
        // try {
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
            $("#resChaci tbody").html("");
            $("#res tbody").html("");
            keywords=keywords.split("\n");
            if(keywordsAll!=null&&keywordsAll){
                keywordsAll=keywordsAll.split("\n");
            }
            this.search(token,keywords,keywordsAll,device,function(keywords){
                console.log('完成');
                $("#gogogo").val("查询完成")
                document.getElementById("gogogo").disabled=false;
            })
            // var ajaxs=[];
            // var ks = keywords.split("\n");
            // var yestoday=new Date(new Date().getTime()-24*3600*1000);
            // for (var i = 0; i < ks.length; i++) {
            //     var keyword = ks[i];
            //     keyword = keyword.trim();
            //
            //     var  date=getDateFormatStr(yestoday);
            //     var params={
            //         dateRange:date+"|"+date,
            //         dateType:"recent1",
            //         device:device,
            //         keyword:keyword,
            //         token:token,
            //         _:new Date().getTime()
            //     }
            //
            //     ajaxs.push( Promise.resolve(new Promise(function (resolve, reject){
            //         chrome.runtime.sendMessage({
            //             method: 'GET',
            //             action: 'ajax',
            //             url: 'https://sycm.taobao.com/mq/searchword/relatedWord.json',
            //             data: params
            //         },function (data) {
            //             resolve(data);
            //         });
            //     })));
            // }
            //
            // Promise.each(ajaxs,function(data, num, jqXHR){
            //     var k=ks[num]
            //     var json=null;
            //     if(data&&data["content"]&&data["content"]["data"]){
            //         var d=data["content"]["data"];
            //         for(var i=0;i<d.length;i++){
            //             var di=d[i];
            //             if(di["keyword"]==k){
            //                 json=di;
            //                 break;
            //             }
            //         }
            //     }
            //     if (!json) {
            //         json = {keyword: k, suv: "", onlineGoodsCnt: "", clickHot: "", payConvRate: ""}
            //     }
            //
            //     var tr = tpl;
            //     for (var key in json) {
            //         tr = tr.replace("$" + key, json[key]);
            //     }
            //     $("#res tbody").append(tr);
            //
            //     console.log(json);
            // }).then(function(){
            //     console.log('完成');
            //     $("#gogogo").val("查询完成")
            //     //alert("查完！");
            // });


        // }finally {
        //     // $("#gogogo").attr("disabled", false);
        //     document.getElementById("gogogo").disabled=false;
        // }
    }

};


