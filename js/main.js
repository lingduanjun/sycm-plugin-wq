var CONTANTS = {
    STATUS_INIT:'init',
    STATUS_SEND:'send',
    STATUS_SUCCESS:'succ',
    STATUS_ERROR_NETWORK:'error_network',
    STATUS_ERROR_RESP:'error_resp'
};

var main = {
    init: function () {
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
        var params={
            modules:'sycm-bzb-new',
            step:'prepare',
            token:token,
            _:new Date().getTime()
        }

        $.ajax({
            url:"https://sycm.taobao.com/custom/common/permission.json",
            type:"GET",
            timeout:30000,
            data:params,
            dataType:"json",
            success:function (data) {
                var data=data.data[0];
               // var hasPermission=data.hasPermission;
               // var  endDate=data.endDate;
                //发送版本信息
                chrome.extension.sendMessage({'action':'getVersionInfo','data':data},function(response){
                });
            },
            error:function (data) {
                console.log("获取版本信息出错");
            }
        })
    },
    search:function(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,whenDone){
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
            //匹配之后的数据
            console.log("匹配数据："+JSON.stringify(result));
            //所有的数据
            console.log("所有数据："+ JSON.stringify(relatedDataArr));
            //完成之后通知
           // var string = "This is my compression test.";
           // var compressed = LZString.compress(result);
            var data={
                planId:planId,
                matchedData:result,
                relatedDataArr:relatedDataArr
            }
            chrome.extension.sendMessage({'action':'finishedTask','data':data,'planid':planId},function(response){
                console.log("任务完成");
            });
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
            return this.search(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,whenDone);
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
            if((keywordsAll==null||!keywordsAll)&&doSome==''){//只有查词的时候处理方式
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
                var delay=1000;
                setTimeout(function(){
                    _this.search(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,whenDone);
                },delay);
                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }else if(doSome=='noRoot'){//处理没有匹配上的关联词
                var json=null;
                if(data&&data["content"]&&data["content"]["data"]){
                    var d=data["content"]["data"];
                    for(var i=0;i<d.length;i++){
                        var di=d[i];
                        if(di["keyword"]==keyword){
                            json=di;
                            var oj = new Object();
                            oj.keyword=json.keyword;
                            oj.suv=json.suv;
                            oj.onlineGoodsCnt=json.onlineGoodsCnt;
                            oj.clickHot=json.clickHot;
                            oj.payConvRate=json.payConvRate;
                            oj.rootWord='';
                            resultArr.push(oj);
                            break;
                        }
                    }
                    if(!json){
                        var oj = new Object();
                        oj.rootWord='';
                        oj.keyword=keyword;
                        oj.suv="";
                        oj.onlineGoodsCnt="";
                        oj.clickHot="";
                        oj.payConvRate="";
                        resultArr.push(oj);
                    }
                }
                var delay=1000;
                setTimeout(function(){
                    _this.search(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,whenDone);
                },delay);

                console.log("关键词："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
            }else {//同时查关联词时的处理方式
                if(data&&data["content"]&&data["content"]["data"]){
                    var d=data["content"]["data"];//返回的相关词数组
                    if(d !== undefined && d.length != 0){
                        var wordData = {
                            rootWord:keyword,
                            relatedData:d
                        }
                        console.log(JSON.stringify(wordData));
                        relatedDataArr.push(wordData);
                    }
                }
                for (var i=0;i<keywordsAll.length;i++) {
                    var json=null;
                    for(var j=0;j<d.length;j++){
                        var di=d[j];
                        if(di["keyword"]==keywordsAll[i]){
                            json=di;
                            json.rootWord=keyword;
                            keywordsAll.splice(i, 1);//匹配之后就删除
                            i = i-1;
                            var oj=new Object();
                            oj.rootWord=keyword;
                            oj.keyword=json.keyword;
                            oj.suv=json.suv;
                            oj.onlineGoodsCnt=json.onlineGoodsCnt;
                            oj.clickHot=json.clickHot;
                            oj.payConvRate=json.payConvRate;
                            resultArr.push(oj);
                            break;
                        }
                    }
                }
                //把词根列表中匹配到的词根也删除
                for (var i=0;i<keywords.length;i++) {
                    for(var j=0;j<d.length;j++){
                        var di=d[j];
                        if(di["keyword"]==keywords[i]){
                            keywords.splice(i, 1);//匹配之后就删除
                            i = i-1;
                            break;
                        }
                    }
                }
                console.log(resultArr);
                console.log("去掉匹配之后的词根相关词："+keywords);
                console.log("去掉匹配之后的相关词："+keywordsAll);
                var delay=1000;
                setTimeout(function(){
                    _this.search(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,whenDone);
                },delay);
                console.log("关键词词根："+keyword+" 完成，等待 "+delay+"ms 继续查询下一个词");
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
    },
    gogogo:function(keywords,keywordsAll,planId){
        var device=0;
        var keywords=keywords;
        var keywordsAll=[].concat(keywordsAll);
        var tempArr=[];
        if(keywords==null||!keywords){
            alert("必须填写关键词词根");
            return;
        }
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
        if(keywordsAll!=null&&keywordsAll){
            tempArr=[].concat(keywordsAll);
        }
         //定义一个对象数组,用来存放匹配的结果对象
         var resultArr=[];
        //定义一个对象数组,用来存放词根和其相关词的数据
         var relatedDataArr=[];
        var doSome='';
        this.search(planId,token,keywords,keywordsAll,resultArr,relatedDataArr,doSome,tempArr,device,function(keywords){
            console.log('完成');
        })
    }

}








