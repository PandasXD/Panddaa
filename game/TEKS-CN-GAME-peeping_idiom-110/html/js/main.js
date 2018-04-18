//var
var PEPPER = PEPPER || {};
var pepper_onStart = {};

var time = 20;
var timer;

//問題カウント
var hint_timer;
var num = 0;
var before_cnt = 0;
var question_num = 1;


var string = "";
var arr_str = [];
var str_cnt = 0;
var arr_area = [];
var sf_anime = [];
var arr_pos_top = [];
var arr_pos_left = [];
var before_str_cnt = 0;


var def_arr_area = [1, 2, 3, 4, 5, 6, 7, 8, 10];//9は終了ボタンが入るので対象外
var font_size = [200,180,160,140,120];
var arr_anime = ["translate","rotate","flash","rotateLeft","rotateRight","normal","spin","weight"];

//ボタンフラグ
var title_btn_flag = false;
var start_flag = false;
var descript_flag = false;
var descript_stop_flag = false;
var ex_stop_flag = false;
var select_difficulty_flag = false;

var file_name = "hide";


//得点
var score = 20;
var s_score = 0;
var tmp_his_time = 0;
var his_time = 0;


//ランキングデータを保存
var rankingdata = "";
var ranking_flag = false;
var ranking_select_flag = "normal";
var mode = "";
var app_status = "";


PEPPER.contents = (function ($) {
    var START = 'touchstart',
        END = 'touchend';

    var currentScean = "title";

    ////////////////////共通処理
    var changeScean = function (data) {
        if (data == "title") {
            ex_stop_flag = false;
        }
        $("section").hide();
        $("#" + data).show();

        currentScean = data;
    }
  
    /*タイトル画面のアプリ終了ボタン*/
    $('#title_end_off').on(START,function(){
        titleAppEnd();
    });
    var titleAppEnd = function(data){
        if(title_btn_flag){return;}
        title_btn_flag = true;
        start_flag = true;
        descript_flag = true;
        ex_stop_flag = true;
        ranking_flag = true;
        select_difficulty_flag = true;
        //ボタン押下状態に
        $("#title_end_off").css("visibility", "hidden");
        $("#title_end_on").css("visibility", "visible");

        if(data != "timeout"){
            AudioPlayer.play("click.ogg");            
        }
        $.raiseALMemoryEvent("RestorePhrase/EndApp", "");        
    } 

    /*タイトル画面 説明を聞くボタン*/
    $('#description_off').on(START,function(){
        startDiscript();
    });
    
    var startDiscript = function(){
        if(descript_flag){return;}
        ranking_flag = true;
        descript_flag = true;
        start_flag = true;
        select_difficulty_flag = true;
        title_btn_flag = true;
        
        //ボタン押下状態に
        $("#description_off").css("visibility", "hidden");
        $("#description_on").css("visibility", "visible");
        
        //他のタイトル画面に表示されているすべてのボタンを非表示
        $("#ranking_off").css("visibility", "hidden");
        $("#ranking_on").css("visibility", "hidden");
        $("#normal_off").css("visibility", "hidden");
        $("#hard_off").css("visibility", "hidden");
        $("#key_off").css("visibility", "hidden");
        $("#start_off").css("visibility", "hidden");
        $("#title_end_off").css("visibility", "hidden");

        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/description1", "start");

        setTimeout(function(){
            $("#title_stop_off").css("visibility", "visible");            
            $("#ex_stop_off").css("visibility", "visible");            
            $("#description_on").css("visibility", "hidden");
            descript_flag = false;
        },4000);        
    }
    
   /*タイトル画面 説明をやめるボタン*/
    $('#title_stop_off').on(START,function(){
        resetExample();
        stopDiscript();
    });
    
    var stopDiscript = function(){
        if(descript_stop_flag){return;}
        descript_stop_flag = true;
        ranking_flag = false;
        descript_flag = false;
        start_flag = false;
        select_difficulty_flag = false;
        title_btn_flag = false;
        //ボタン押下状態に
        $("#title_stop_off").css("visibility", "hidden");
        $("#title_stop_on").css("visibility", "visible");            
        $("#ex_stop_off").css("visibility", "hidden");   
        
        //他のタイトル画面に表示されているすべてのボタンを表示

        if(mode == "normal"){ //おすすめから来た場合のノーマル
            $("#title_end_off").css("visibility", "hidden");
        }else if(mode == "hard"){ //おすすめから来た場合のハード
            $("#hard_line").css("visibility", "visible");
            $("#title_end_off").css("visibility", "hidden");
        }

        AudioPlayer.play("click.ogg");
        setTimeout(function(){
            $("#title_stop_on").css("visibility", "hidden");
            $("#description_off").css("visibility", "visible");
            descript_stop_flag = false;
        },500);
        $.raiseALMemoryEvent("RestorePhrase/descripStop", "end");        
    }
    

      /*解説画面のアプリ終了ボタン*/
    $('#ex_app_end_off').on(START,function(){
        if(title_btn_flag){return;}
        title_btn_flag = true;
        //ボタン押下状態に
        $("#ex_app_end_off").css("visibility", "hidden");
        $("#ex_app_end_on").css("visibility", "visible");
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/EndApp", "");
    });
    
    /*解説画面 解説をやめるボタン*/
    $('#ex_stop_off').on(START,function(){
        if(ex_stop_flag){return;}
        ex_stop_flag = true;
        //ボタン押下状態に
        $("#ex_stop_off").css("visibility", "hidden");
        $("#ex_stop_on").css("visibility", "visible");            
        $("#title_stop_off").css("visibility", "visible");            
        $("#title_stop_on").css("visibility", "hidden");    
        $("#title_end_off").css("visibility", "visible");

        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/descripStop", "end");
    });
  
    /*ランキング*/
    $('#ranking_off').on(START,function(){
        if(ranking_flag){return;}
        ranking_flag = true;
        descript_flag = true;
        start_flag = true;
        select_difficulty_flag = true;
        title_btn_flag = true;
        //ボタン押下状態に
        $("#ranking_on").css("visibility", "visible");
        $("#ranking_off").css("visibility", "hidden");
        $("#rank_end_off_normal").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "visible");
        setTimeout(function(){
            $.raiseALMemoryEvent("RestorePhrase/startRanking", "start");
        },500);

    });
    var dialogStartRanking = function(){
        if(ranking_flag){return;}
        ranking_flag = true;
        descript_flag = true;
        start_flag = true;
        select_difficulty_flag = true;
        title_btn_flag = true;
        ranking_flag = true;
        //ボタン押下状態に
        $("#ranking_on").css("visibility", "visible");
        $("#ranking_off").css("visibility", "hidden");
        $("#rank_end_off_normal").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "visible");
        setTimeout(function(){
            $.raiseALMemoryEvent("RestorePhrase/startRanking", "start");
        },500);
    }
    
    var showRanking = function(data){
        ranking =  $.parseJSON(data[0]||"null");
        user_best =  $.parseJSON(data[1]||"null");
        //ランキング 指定された難易度を表示する
        if(ranking[ranking_select_flag]["1st"] == ""){
            $("#ranking_"+ranking_select_flag).css('background-image', 'url(images/ranking/none_bg.png)');
        }else{
            for(var key1 in ranking[ranking_select_flag]){
                //1位データがない場合はデータなし画像を表示

                showData = ranking[ranking_select_flag][key1];
                for(var key in showData){
                    //○位とランク
                    if(key == "rank"){
                        $("#rank_"+key1+"_"+ranking_select_flag).html(showData[key][0]);  
                        $("#rank2_"+key1+"_"+ranking_select_flag).html('<img src="images/ranking/'+showData[key][1]+'_small.png">');  
                    }
                    //アイコン
                    if (key == "icon") {
                        if (showData[key] == "") { //データがない場合は小アプリにある画像を表示
                            $("#" + key + "_" + key1 + "_" + ranking_select_flag).html("<img class='img_cycle' src='images/ranking/bul.png'>");
                        } else {
                            //データがあるとき
                            $("#" + key + "_" + key1 + "_" + ranking_select_flag).html("<img class='img_cycle'>");
                            var img = $("#" + key + "_" + key1 + "_" + ranking_select_flag + " .img_cycle");
                            img.off();
                            img.on("error", function () {
                                //画像がないとき代替画像
                                $(this).attr("src", "images/ranking/bul.png");
                            });
                            img.attr("src", showData[key]);
                        }
                    }
                    //名前
                    if(key == "name"){                        
                        //5文字以上は丸める。(例：しんのすけ→しんのす...)
                        name = showData[key];
                        if (countLength(showData[key]) > 10) {
                            name = showData[key].substr( 0, 4 ) ;
                            name = name + '…';
                        }

                        $("#"+key+"_"+key1+"_"+ranking_select_flag).html(name);                      
                    }
                    //クリア問題数
                    if(key == "clear-count"){
                        $("#"+key+"_"+key1+"_"+ranking_select_flag).html(showData[key]+"/5");                    
                    }
                    //クリア時間
                    if(key == "clear-time"){
                        $("#"+key+"_"+key1+"_"+ranking_select_flag).html(showData[key]);                    
                    }
                    
                    //表示する
                    $("#"+ranking_select_flag+"_"+key1).css("visibility", "visible");
                }

                //自己ベストを表示
                if(user_best[ranking_select_flag] != ""){
                    $("#new_record_"+ranking_select_flag).css("background-image", 'url("images/ranking/result_plate.png")');
                    $("#record_question_"+ranking_select_flag).html(user_best[ranking_select_flag]["clear-count"]+"/5");
                    $("#record_second_"+ranking_select_flag).html(user_best[ranking_select_flag]["clear-time"]);
                    $("#record_rank2_"+ranking_select_flag).html('<img src="images/ranking/'+user_best[ranking_select_flag]["rank"]+'_middle.png">');                
                }else{
                    $("#new_record_"+ranking_select_flag).css("background-image", 'url("images/ranking/result_plate.png")');
                    $("#record_question_"+ranking_select_flag).html("-");
                    $("#record_second_"+ranking_select_flag).html("-");
                    $("#record_rank2_"+ranking_select_flag).html('-');                
                }

             }
         }       
        
        $("#ranking_"+ranking_select_flag).show();
        if(ranking_select_flag == "normal"){
            $("#ranking_hard").hide();
        }else{
            $("#ranking_normal").hide();            
        }
        $("#title").hide();
    }
    
        //文字列のbyte数
    function countLength(str) {
        var r = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
            // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
            if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
                r += 1;
            } else {
                r += 2;
            }
        }
        return r;
    }

    $('#rank_end_off').on(START,function(){
        $("#ranking_on").css("visibility", "visible");
        $("#ranking_off").css("visibility", "hidden");
        ranking_flag = false;
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/backFromRanking", "");
        
    });
    
    $("#close_off").on(START,function(){
        $("#close_on").css("visibility","visible");
        $("#close_off").css("visibility","hidden");
        AudioPlayer.play("click.ogg");
        
        ranking_flag = false;
        descript_flag = false;
        title_btn_flag = false;
        select_difficulty_flag = false;
        
        setTimeout(function(){
            $("#close_on").css("visibility","hidden");
            $("#pop"+release_data).css("visibility","hidden");
            $.raiseALMemoryEvent("RestorePhrase/closeOff", "");
        },500);
    });
    
    $("#key_off").on(START,function(){
        $.raiseALMemoryEvent("RestorePhrase/keyOff", "");
    });
    
    var showGameCount = function(data){
        if(select_difficulty_flag){return;}
        select_difficulty_flag = true;
        ranking_flag = true;
        descript_flag = true;
        title_btn_flag = true;

        release_data = data;
        $("#key_on").css("visibility","visible");
        $("#key_off").css("visibility","hidden");
        AudioPlayer.play("click.ogg");
        setTimeout(function(){
            $("#close_off").css("visibility","visible");
            $("#key_off").css("visibility","visible");
            $("#key_on").css("visibility","hidden");
            $("#pop"+release_data).css("visibility","visible"); 
        },500);
    }

    /*タイトルボタンを初回か否かで出しわけ 初回*/
    var TitleBtn = function(data){
        $("#description_on").css("visibility", "hidden");
        $("#description_off").css("visibility", "visible");
        if(mode == "normal"){ //おすすめから来た場合のノーマル
            $("#start_off").css("visibility", "visible");
            $("#title_end_off").css("visibility", "hidden");
        }else if(mode == "hard"){ //おすすめから来た場合のハード
            $("#start_off").css("visibility", "visible");
            $("#hard_line").css("visibility", "visible");            
            $("#title_end_off").css("visibility", "hidden");
        }else{
            $("#title_end_off").css("visibility", "visible");
            $("#normal_off").css("visibility", "visible");
            if(mode == "free-normal"){
                $("#key_off").css("visibility", "visible");            
            }else{
                $("#hard_off").css("visibility", "visible");
            }            
        }
        
        $("#title_stop_off").css("visibility", "hidden");
        
        $("#ranking_off").css("visibility", "visible");
        $("#rank_end_off").css("visibility", "visible");
        start_flag = false;
        select_difficulty_flag = false;
        ranking_flag = false;
        descript_flag = false;
        title_btn_flag = false;

        $("#title").show();
        $("#example").hide();
        $("#ranking_normal").hide();
        $("#ranking_hard").hide();
        ex_stop_flag = false;
    }
    
    $('#normal_off').on(START,function(){
        normalGame();
    });
    $('#hard_off').on(START,function(){
        hardGame();
    });
    $('#start_off').on(START,function(){
        startGame();
    });
    
    var startGame = function(){ //おすすめの時
        if(select_difficulty_flag){return;}
        select_difficulty_flag = true;
        ranking_flag = true;
        descript_flag = true;
        title_btn_flag = true;
        //ボタン押下状態に
        touch_difficulty = mode;
        $("#start_off").css("visibility", "hidden");
        $("#start_on").css("visibility", "visible");            
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/GameStart", touch_difficulty);
    }
    var normalGame = function(){
        if(select_difficulty_flag){return;}
        select_difficulty_flag = true;
        ranking_flag = true;
        descript_flag = true;
        title_btn_flag = true;
        //ボタン押下状態に
        touch_difficulty = "normal";
        $("#normal_off").css("visibility", "hidden");
        $("#normal_on").css("visibility", "visible");            
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/GameStart", "normal");        
    }
    var hardGame = function(){
        if(select_difficulty_flag){return;}
        select_difficulty_flag = true;
        ranking_flag = true;
        descript_flag = true;
        title_btn_flag = true;
        //ボタン押下状態に
        touch_difficulty = "hard";
        $("#hard_off").css("visibility", "hidden");
        $("#hard_on").css("visibility", "visible");            
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/GameStart", "hard");        
    }

    //タイトル画面からのランキングと発話した場合の対応
    $("#ranking_hard_btn_off").on(START,function(){
        ranking_flag = false;
        ranking_select_flag = "hard";
        $("#ranking_hard_btn_on").css("visibility","visible");
        $("#ranking_hard_btn_off").css("visibility","hidden");
        setTimeout(function(){
            $.raiseALMemoryEvent("RestorePhrase/changeRanking", ranking_select_flag);
            $("#ranking_normal_btn_on").css("visibility","hidden");
            $("#ranking_normal_btn_off").css("visibility","visible");            
        },500);
        AudioPlayer.play("click.ogg");
    });
    
    $("#ranking_normal_btn_off").on(START,function(){
        ranking_flag = false;
        ranking_select_flag = "normal";
        $("#ranking_normal_btn_on").css("visibility","visible");
        $("#ranking_normal_btn_off").css("visibility","hidden");
        setTimeout(function(){
            $.raiseALMemoryEvent("RestorePhrase/changeRanking", ranking_select_flag);
            $("#ranking_hard_btn_on").css("visibility","hidden");
            $("#ranking_hard_btn_off").css("visibility","visible");
        },500);
        AudioPlayer.play("click.ogg");
    });
    
    $('#rank_end_off_normal').on(START,function(){
        ranking_flag = false;
        descript_flag = false;
        start_flag = false;
        select_difficulty_flag = false;
        title_btn_flag = false;

        $("#rank_end_on_normal").css("visibility", "visible");
        $("#rank_end_off_normal").css("visibility", "hidden");
        ranking_flag = false;
        ranking_select_flag = "normal";
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/backFromRanking", "");
        
    });
    $('#rank_end_off_hard').on(START,function(){
        ranking_flag = false;
        descript_flag = false;
        start_flag = false;
        select_difficulty_flag = false;
        title_btn_flag = false;

        $("#rank_end_on_hard").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "hidden");
        ranking_flag = false;
        ranking_select_flag = "normal";
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("RestorePhrase/backFromRanking", "");
        
    });

    
    
    /*例題を表示*/
    var Example = function(data){
        if(data > 0){ //初回
            $("#ex_stop_off").css("visibility", "visible");
            $("#ex_stop_on").css("visibility", "hidden");            
        }
        
        cnt = 0;
        hint_timer = setInterval(function(){
            cnt = cnt + 2;
            if(cnt > 9){
                clearInterval(hint_timer);
                $("img.ex_clip").hide();
                return;
            }

            $("img.ex_clip").attr("src","./images/main/hide/normal_"+cnt+".png");

        },2000);

        $("#example").show();
        setTimeout(function(){
            $("#title").hide();
        },1000);
    }
    
    /*例題の答えアニメーション*/
    var exAnswer = function(){
        for(var i = 1; i < 6; i++){
            $("#ex_area"+i).removeClass("anime_ex_5_"+i);
            $("#ex_area"+i).addClass("ex_corr5_"+i);
       }
    }

    /*例題の答えアニメーションをリセット*/    
    var resetExample = function(){
        $("#moji").html("");
        $("img.ex_clip").show();
        $(".ex_clip").attr("src","./images/main/hide/normal_1.png");
    }
 
    
    
    
    var resetView = function(){
        //html内のclassや文字をリセットする。
        $("#question_num").html("");
        $("#moji").html("");
        question_num = question_num + 1;
        $(".clip").attr("src","./images/main/hide/no_hide.png");
        $("img.clip").show();
        $("#counter").css("color","#ee7d04");
    }

 
    var setQuestion = function(data){
        
        $("#question_num").html("第"+question_num+"問");
        $("#counter").html("20");
        
        if(data.length == 2){
            //2文字の場合
            $("#moji").css("font-size","400");
            $("#moji").css("top","300px");
            file_name = "normal_";
        }else{
            //3文字の場合
            $("#moji").css("font-size","200");
            $("#moji").css("top","300px");            
            file_name = "hard_";
        }
        setTimeout(function(){
            $("#moji").html(data);
            $("#game").show();
            $("#title").hide();
        },500);
    }

    var StartHide = function(data){
        
        cnt = 1;
        $("img.clip").attr("src","./images/main/hide/"+file_name+"1.png");
        hint_timer = setInterval(function(){
            cnt = cnt + 1;
            if(cnt > 9){
                clearInterval(hint_timer);
                $("img.clip").hide();
                return;
            }

            $("img.clip").attr("src","./images/main/hide/"+file_name+cnt+".png");

        },2900);

    }
    
    //配列をシャッフルする
    function shuffle(arr) {
        var i, j, tmp, length;

        for (length = arr.length, i = length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }

        return arr;
    }
  
    var timerStart = function (data) {
        time = 20;
        score = 20;
        data = time;
        timer = setInterval(function () {
            time--;
            $("#counter").html(time);
            if(time <= 5){
                AudioPlayer.play("count_last.ogg");
                $("#counter").css("color","#f03737");                                
            }else{
                AudioPlayer.play("count.ogg");
            }

            //得点の計算
            if(time < 20 && score > 1){
                score--;
            }
            
            
            if (time <= 0) {
                score = 0;
                timerStop();
                his_time = his_time + 20;
                $.raiseALMemoryEvent("RestorePhrase/timeup", "");
            }
        }, 1000);
    }
    var showAnswerTimeup = function(){
        $("img.clip").hide();   
    }

    var showAnswer = function(){
        correctImage();
        $("img.clip").hide();   
    }

    //配列をランダムにする
    function random(array, num) {
        var a = array;
        var t = [];
        var r = [];
        var l = a.length;
        var n = num < l ? num : l;
        while (n-- > 0) {
            var i = Math.random() * l | 0;
            r[n] = t[i] || a[i];
            --l;
            t[i] = t[l] || a[l];
        }
        return r;
    }


    var correctImage = function(data){
        tmp_his_time = 20 - time;
        his_time = his_time + tmp_his_time;

        $("#correct").css("visibility","visible");
        
        setTimeout(function(){
            $("#correct").css("visibility","hidden");
        },2000);
    }

    var hideAnswer = function(){
        $("#ques_text").css("opacity","0");
    }
    
    var timerStop = function () {
        clearInterval(hint_timer);
        clearInterval(timer);
    }

    var timerReset = function () {
        clearInterval(timer);
        time = 20;
        $("#counter").html(time);
        $("#debugValue").html("0");
        $("#arow").css("transform", "rotate(0deg)");
        $("#result").hide();
    }

    var timeupImage = function(){
        $("#timeup").css("visibility","visible");
    }
    

    var returnTitle = function(){
        descript_stop_flag = false;
        $("#title").show();
        $("#example").hide();
    }

    var sendHisTime = function(data){
        $.raiseALMemoryEvent("RestorePhrase/getHisTime", his_time);
    }

    var finishImage = function(){
        $("#finish").css("visibility","visible");
    }
    
    var timeupImageHide = function(){
        $("#timeup").css("visibility", "hidden");
    }
    var getClearTIme = function(){
        $.raiseALMemoryEvent("RestorePhrase/clearTime", time);        
    }
    var ImageHazure = function(){
        $("#uncrrect").css("visibility","visible");
        setTimeout(function(){
            $("#uncrrect").css("visibility","hidden");
        }, 1000);
    }
    $.preload = function (images) {
        if (images === undefined) {
            return;
        }
        $.each(images, function (i, e) {
            $("<img>").attr("src", "images/" + e);
        });
    };
    //pythonからのプリロードイベントから
    var preload = function (data) {
        $.preload(data);
    };

    
    var _self = {
        init: function () {

            pepper_onStart = function () {
                $.subscribeToALMemoryEvent("changeScean", changeScean);

                $.subscribeToALMemoryEvent("RestorePhrase/sendQuestion", setQuestion);
                $.subscribeToALMemoryEvent("RestorePhrase/timerStart", timerStart);
                $.subscribeToALMemoryEvent("RestorePhrase/correctImage", correctImage);
                $.subscribeToALMemoryEvent("RestorePhrase/showAnswer", showAnswer);
                $.subscribeToALMemoryEvent("RestorePhrase/showAnswerTimeup", showAnswerTimeup);
                $.subscribeToALMemoryEvent("RestorePhrase/resetView", resetView);
                $.subscribeToALMemoryEvent("RestorePhrase/returnTitle", returnTitle);
                $.subscribeToALMemoryEvent("RestorePhrase/hideAnswer", hideAnswer);
                $.subscribeToALMemoryEvent("RestorePhrase/exAnswer", exAnswer);
                $.subscribeToALMemoryEvent("RestorePhrase/resetExample", resetExample);
                $.subscribeToALMemoryEvent("RestorePhrase/sendHisTime", sendHisTime);
                $.subscribeToALMemoryEvent("RestorePhrase/StartHide", StartHide);

                $.subscribeToALMemoryEvent("RestorePhrase/showRanking", showRanking);
                $.subscribeToALMemoryEvent("RestorePhrase/timeupImage", timeupImage);
                $.subscribeToALMemoryEvent("RestorePhrase/finishImage", finishImage);
                $.subscribeToALMemoryEvent("RestorePhrase/timeupImageHide", timeupImageHide);
                
                $.subscribeToALMemoryEvent("RestorePhrase/TitleBtn", TitleBtn);
                $.subscribeToALMemoryEvent("RestorePhrase/Example", Example);
                $.subscribeToALMemoryEvent("RestorePhrase/ImageHazure", ImageHazure);

                $.subscribeToALMemoryEvent("RestorePhrase/timerStop", timerStop);
                
                //ダイアログからの起動
                $.subscribeToALMemoryEvent("RestorePhrase/selectGameStart", startGame);
                $.subscribeToALMemoryEvent("RestorePhrase/selectGameNormal", normalGame);
                $.subscribeToALMemoryEvent("RestorePhrase/selectGameHard", hardGame);
                $.subscribeToALMemoryEvent("RestorePhrase/selectDiscript", startDiscript);
                $.subscribeToALMemoryEvent("RestorePhrase/selectAppEnd", titleAppEnd);
                $.subscribeToALMemoryEvent("RestorePhrase/selectRanking", dialogStartRanking);
                //鍵付きボタン押下
                $.subscribeToALMemoryEvent("RestorePhrase/showGameCount", showGameCount);
                $.subscribeToALMemoryEvent("RestorePhrase/getClearTIme", getClearTIme);

                //必須の画像のみ
                var Images = ["title/title_bg.png", 
                                "title/end_btn_off.png", 
                                "title/hard_line.png", 
                                "ranking/none_bg.png", 
                                "ranking/bg.png"];
                preload(Images);

                $.getService("ALMemory", function(memory) {
                    memory.getData("RestorePhrase/GameStatus").then(function( data ) {
                        mode = data;
                        $("body").append('<p id="demo">preload</p>');
                        $("body").append('<p id="demo2">preload</p>');
                        if(mode == "normal"){ //おすすめから来た場合のノーマル
                            $('#title_end_off').css("visibility", "hidden");
                        }else if(mode == "hard"){ //おすすめから来た場合のハード
                            $("#hard_line").css("visibility", "visible");            
                            $('#title_end_off').css("visibility", "hidden");
                        }else{
                            $('#title_end_off').css("visibility", "visible"); 
                        }

                    });
                });
                
                
                $.raiseALMemoryEvent("startYApp", "OK");

            }
        }
    }
    return _self;
})(jQuery);
$(PEPPER.contents.init);