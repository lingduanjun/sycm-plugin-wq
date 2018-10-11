var CONTANTS = {
    STATUS_INIT:'init',
    STATUS_SEND:'send',
    STATUS_SUCCESS:'succ',
    STATUS_ERROR_NETWORK:'error_network',
    STATUS_ERROR_RESP:'error_resp'
};

var main = {
    init: function () {
        if (matchUrl("mc/mq/search_analyze")) {
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
                .insertAfter($(".ebase-metaDecorator__root"));
            $("#gogogo").click(function(){
                main.gogogo();
            });
        }
    },

    search:function(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,whenDone){
        var _this=this;
        if(keywords.length<=0&&keywordsAll.length>0){
            doSome='noRoot';
            keywords=keywordsAll;
            keywordsAll=[];
        }
        if(keywords.length<=0&&tempArr.length>0){
            //得到的结果和关联关键词数组比较进行排序，得到排序之后的新数组
            var result=[];
            for (var i=0;i<tempArr.length;i++) {
                for(var j=0;j<resultArr.length;j++){
                    var di=resultArr[j];
                    if(di["keyword"]==tempArr[i]){
                        result.push(di);
                        break;
                    }
                }
            }
            console.log("tempArr:"+tempArr);
            console.log("resultArr:"+resultArr);
            console.log("result:"+result);
            //处理结果显示到页面上
            var str;
            for(var key in result){
                str += "<tr><td>"+result[key].rootWord+"</td><td>"+result[key].keyword+"</td><td>"+result[key].seIpvUvHits+"</td><td>"+result[key].onlineGoodsCnt+"</td><td>"+result[key].clickHot+"</td><td>"+result[key].payConvRate+"</td></tr>";
            };
            $("#resChaci").hide();
            $("#res").show();
            $("#res tbody").append(str);
            tempArr=[];//为了不影响只查词的功能
            return whenDone.call(this,keywords);
        }
        if(keywords.length<=0){
            return whenDone.call(this,keywords);
        }
        var keyword=keywords.shift();
        var yestoday=new Date(new Date().getTime()-24*3600*1000);
        keyword = keyword.trim();
        if(!keyword ||keyword.length<=0){
            return this.search(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,whenDone);
        }

        var  date=getDateFormatStr(yestoday);
        var params={
            dateRange:date+"|"+date,
            dateType:"day",
            device:device,
            keyword:keyword,
           // token:token,
            _:new Date().getTime()
        }

        var process=function(data, textStatus){
            if((keywordsAll==null||!keywordsAll)&&doSome==''){//只有查词的时候处理方式
                var json=null;
                if(data){
                    var d=data.data;
                    if(Array.isArray(d)){
                        for(var i=0;i<d.length;i++){
                            var di=d[i];
                            if(di["keyword"]==keyword){
                                json=di;
                                break;
                            }
                        }
                    }

                }
                if (!json) {
                    json = {keyword: keyword, seIpvUvHits: "", onlineGoodsCnt: "", clickHot: "", payConvRate: ""}
                }

                var tpl = "<tr><td>$keyword</td><td>$seIpvUvHits</td><td>$onlineGoodsCnt</td><td>$clickHot</td><td>$payConvRate</td></tr>";

                var tr = tpl;
                for (var key in json) {
                    tr = tr.replace("$" + key, json[key]);
                }
                $("#res").hide();
                $("#resChaci").show();
                $("#resChaci tbody").append(tr);
                var delay=1000+Math.floor( Math.random()*3000)
                setTimeout(function(){
                    _this.search(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,whenDone);
                },delay);

                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }else if(doSome=='noRoot'){//处理没有匹配上的关联词
                var json=null;
                if(data){
                    var d=data.data;
                    if(Array.isArray(d)){
                        for(var i=0;i<d.length;i++){
                            var di=d[i];
                            if(di["keyword"]==keyword){
                                json=di;
                                var oj = new Object();
                                oj.keyword=json.keyword;
                                oj.seIpvUvHits=json.seIpvUvHits;
                                oj.onlineGoodsCnt=json.onlineGoodsCnt;
                                oj.clickHot=json.clickHot;
                                oj.payConvRate=json.payConvRate;
                                oj.rootWord='';
                                resultArr.push(oj);
                                break;
                            }
                        }
                    }

                    if(!json){
                        var oj = new Object();
                        oj.rootWord='';
                        oj.keyword=keyword;
                        oj.seIpvUvHits="";
                        oj.onlineGoodsCnt="";
                        oj.clickHot="";
                        oj.payConvRate="";
                        resultArr.push(oj);
                    }
                }
                var delay=1000+Math.floor( Math.random()*3000)
                setTimeout(function(){
                    _this.search(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,whenDone);
                },delay);

                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }else {
                //同时查关联词时的处理方式
                var backArr=[];
                if(data){
                    var d=data.data;
                    if (d !== undefined && d.length != 0) {
                        for(var i=0;i<d.length;i++){
                            var di=d[i];
                            backArr.push(di["keyword"]);
                        }
                        console.log("设定的相关词："+keywordsAll);
                        console.log("获取的相关词："+backArr);
                        for (var i=0;i<keywordsAll.length;i++) {
                            var json=null;
                            for(var j=0;j<d.length;j++){
                                var di=d[j];
                                var rr=di["keyword"];
                                if(di["keyword"]==keywordsAll[i]){
                                    json=di;
                                    json.rootWord=keyword;
                                    keywordsAll.splice(i, 1);//匹配之后就删除
                                    i = i-1;
                                    var oj=new Object();
                                    oj.rootWord=keyword;
                                    oj.keyword=json.keyword;
                                    oj.seIpvUvHits=json.seIpvUvHits;
                                    oj.onlineGoodsCnt=json.onlineGoodsCnt;
                                    oj.clickHot=json.clickHot;
                                    oj.payConvRate=json.payConvRate;
                                    resultArr.push(oj);
                                    console.log(resultArr);
                                    break;
                                }
                            }
                        }
                        var delay=1000+Math.floor( Math.random()*3000)
                        setTimeout(function(){
                            _this.search(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,whenDone);
                        },delay);
                        console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
                    }else {
                        for (var i = 0; i < keywordsAll.length; i++) {
                            if (keyword == keywordsAll[i]) {
                                keywordsAll.splice(i, 1);//匹配之后就删除
                                i = i - 1;
                            }
                        }
                        //把词根列表中匹配到的词根也删除
                        for (var i = 0; i < keywords.length; i++) {
                            if (keyword == keywords[i]) {
                                keywords.splice(i, 1);//匹配之后就删除
                                i = i - 1;
                                break;
                            }
                        }
                        var delay = 1000;
                        setTimeout(function () {
                            _this.search(token, keywords, keywordsAll, resultArr, doSome, tempArr, device, whenDone);
                        }, delay);
                        console.log("关键词词根没结果的：" + keyword + " 完成，等待 " + delay + "ms 继续查询下一个词");
                    }

                }else {
                    for (var i = 0; i < keywordsAll.length; i++) {
                        if (keyword == keywordsAll[i]) {
                            keywordsAll.splice(i, 1);//匹配之后就删除
                            i = i - 1;
                        }
                    }
                    //把词根列表中匹配到的词根也删除
                    for (var i = 0; i < keywords.length; i++) {
                        if (keyword == keywords[i]) {
                            keywords.splice(i, 1);//匹配之后就删除
                            i = i - 1;
                            break;
                        }
                    }
                    var delay = 1000;
                    setTimeout(function () {
                        _this.search(token, keywords, keywordsAll, resultArr, doSome, tempArr, device, whenDone);
                    }, delay);
                    console.log("出錯的关键词：" + keyword + " 完成，等待 " + delay + "ms 继续查询下一个词");
                }

            }
        }

        $.ajax({
            url:"https://sycm.taobao.com/mc/searchword/relatedWord.json",
            type:"GET",
            timeout:30000,
            data:params,
            dataType:"json",
            success:process,
            error:process
        })
    },
    gogogo:function(){
        var device=$("#device").val();
        var keywords=$("#keywords").val();//词根
        var keywordsAll=$("#keywordsAll").val();//关键词列表
        var tempArr=[];
        if(keywords==null||!keywords){
            alert("必须填写关键词词根");
            return;
        }
        document.getElementById("gogogo").disabled=true;
        $("#gogogo").val("查询中....")
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
            // if(!token ||token.length<=0){
            //     alert("无法获取token");
            //     return false;
            // }
            $("#resChaci tbody").html("");
            $("#res tbody").html("");
            keywords=keywords.split("\n");
            if(keywordsAll!=null&&keywordsAll){
                keywordsAll=keywordsAll.split("\n");
                tempArr=[].concat(keywordsAll);
            }
             //定义一个对象数组,用来存放结果对象
             var resultArr=[];
            var doSome='';
            this.search(token,keywords,keywordsAll,resultArr,doSome,tempArr,device,function(keywords){
                console.log('完成');
                $("#gogogo").val("查询完成")
                document.getElementById("gogogo").disabled=false;
            })
    }

};


