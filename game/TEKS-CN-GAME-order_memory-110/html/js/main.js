/* global $,jQuery,setTimeout,setInterval,clearInterval,AudioPlayer:false */
var PEPPER = PEPPER || {};
var pepper_onStart = {};


PEPPER.contents = (function ($) {
    var START = 'touchstart',
        END = 'touchend';
    var currentScean = "intro";
    var mode;


    ////////////////////共通処理
    var changeScean = function (data) {
        $("section").hide();
        $("#" + data).show();

        currentScean = data;
    };

    var quit = function () {
        if ($._data($("#quit").get(0)).events) {
            $("#quit").off();
            $("#cover").show();
            $("#quit").css("background-image", "url(images/title/quit_on.png)");
            $.raiseALMemoryEvent("DrBrain/OrderMemory/quit", "");
            AudioPlayer.play("click.ogg");
        }
    };
    $("#quit").on(START, quit);


    //////////////////タイトルのボタン絡み
    //次に進むときに全ボタンをOFF
    var allBtnOff = function () {
        //説明ボタン系OFFに
        $("#setumei").off();
        $("#setumeiCancel").off();
        $("#ranking_on").off();
        $("#ranking_off").off();
        $("#start").off();
        $("#normal_btn").off();
        $("#hard_btn").off();
        $("#hard_lock_btn").off();
        $("#quit").off();
    };

    //startボタン押下時
    var start = function () {
        if ($._data($("#start").get(0)).events) {
            allBtnOff();
            $("#start").css("background-image", "url(images/title/start_on.png)");
            AudioPlayer.play("click.ogg");

            //モード設定は済み
            $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/start", mode);
        }
    };
    //normalボタン押下時
    var normal = function () {
        if ($._data($("#normal_btn").get(0)).events) {
            allBtnOff();
            $("#normal_btn").css("background-image", "url(images/title/normal_btn_on.png)");
            AudioPlayer.play("click.ogg");
            //モード設定
            mode = "normal";
            $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/start", mode);

        }
    };

    //hardボタン押下時
    var hard = function () {
        if ($._data($("#hard_btn").get(0)).events) {
            allBtnOff();
            $("#hard_btn").css("background-image", "url(images/title/hard_btn_on.png)");
            AudioPlayer.play("click.ogg");

            //モード設定
            mode = "hard";
            $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/start", mode);

        }
    };

    //hardボタンロック押下時
    var hard_lock = function () {
        if ($._data($("#hard_lock_btn").get(0)).events) {
            $("#hard_lock_btn").off();
            $("#cover").show();
            $("#hard_lock_btn").css("background-image", "url(images/title/key_btn_on.png)");
            AudioPlayer.play("click.ogg");
            setTimeout(function () {
                $("#hard_pop").show();
                $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/hardLock", "");
                $("#cover").hide();
            }, 1000);
        }
    };

    //ハードロック画面のクローズ押下
    var closeHardPop = function () {
        if ($._data($("#close_hard_pop").get(0)).events) {
            $("#close_hard_pop").off();
            $("#cover").show();
            $("#close_hard_pop").css("background-image", "url(images/hard_pop/close_btn_on.png)");
            AudioPlayer.play("click.ogg");
            setTimeout(function () {
                $("#hard_pop").hide();
                //ボタンリセット
                $("#hard_lock_btn").css("background-image", "url(images/title/key_btn_off.png)");
                $("#close_hard_pop").css("background-image", "url(images/hard_pop/close_btn_off.png)");
                $("#close_hard_pop").off();
                $("#close_hard_pop").on(START, closeHardPop);
                $("#hard_lock_btn").off();
                $("#hard_lock_btn").on(START, hard_lock);
                $("#cover").hide();
                $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/hardLockClose", "");
            }, 1000);
        }
    };

    //ハードロックスターの個数表示
    var hardStar = function (num) {
        
        if (num >= 0){
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_0.png)");
        }
        if (num >= 1) {
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_1.png)");
        }
        if (num >= 2) {
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_2.png)");
        }
        if (num >= 3) {
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_3.png)");
        }
        if (num >= 4) {
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_4.png)");
        }
        
    };
    
        //スタートボタン制御変数受け取り
    var startup_status, mode_status;
    var startupStatus = function () {
        //ALMemoryからbefore_state, nonceを取得
        $.getService("ALMemory", function (memory) {
            memory.getData('DrBrain/OrderMemory/startupStatus').then(function (data1) {
                startup_status = data1;
                memory.getData('DrBrain/OrderMemory/modeStatus').then(function (data2) {
                    mode_status = data2;
                    hardStar(mode_status);
                    if (startup_status === "free") {
                        //フリー（ふつう・むずかしい）のとき終了ボタンを表示
                        $("#quit").show();
                        $("#quit").on(START, quit);
                    } else {
                        mode = startup_status;
                        if (mode === "hard"){
                            $("#" + mode + "_line").show();
                        }
                    }

                    //ゲストの時、むずかしいロックの背景差し替え
                    memory.getData('DrBrain/OrderMemory/userId').then(function (data3) {
                        //console.log(data3);
                        if (data3 == -1) {
                            $("#hard_pop").css("background-image", "url(images/hard_pop/xx_guest_difficulty_popup.png)");
                            $(".star_common").hide();
                        }
                    });
                });
            });
        });
    };



    //イントロのボタン表示制御
    var introButtonController = function () {
        if (startup_status !== "free") {
            //フリー以外のとき(今日のトレーニング)
            $("#start").off();
            $("#start").show();
            $("#start").on(START, start);
            if (startup_status !== "free"){
                $("#quit").hide();
            }
        } else {
            //フリーの時　難易度解放確認
            if (mode_status < 5) {
                //ハード押せない
                $("#normal_btn").off();
                $("#normal_btn").show();
                $("#normal_btn").on(START, normal);

                $("#hard_lock_btn").off();
                $("#hard_lock_btn").show();
                $("#hard_lock_btn").on(START, hard_lock);

                $("#close_hard_pop").off();
                $("#close_hard_pop").on(START, closeHardPop);

            } else {
                //ハードおせる
                $("#normal_btn").off();
                $("#normal_btn").show();
                $("#normal_btn").on(START, normal);

                $("#hard_btn").off();
                $("#hard_btn").show();
                $("#hard_btn").on(START, hard);
            }
        }
    };





    //説明ボタン/スタートボタン/ランキングボタンの表示
    var setumeiView = function () {
        $("#setumeiCancel").off();
        $("#setumeiCancel").hide();
        $("#setumei").css("background-image", "url(images/title/setumei_off.png)");
        $("#setumei").show();
        $("#setumei").on(START, setumei);

        $('#ranking_off').off();
        $("#ranking_on").show();
        $("#ranking_off").show();
        $('#ranking_off').on(START, dialogStartRanking);

        //説明キャンセルからの戻りで必須
        $("#quit").show();

        //例題を非表示&リセット
        hideExample();

        //他ボタン表示制御+帯表示
        introButtonController();
    };


    //説明を聞くボタン押下時
    var setumei = function () {
        if ($._data($("#setumei").get(0)).events) {
            $("#setumei").off();
            $("#setumei").css("background-image", "url(images/title/setumei_on.png)");

            //他ボタン非表示
            $("#ranking_on").hide();
            $("#ranking_off").hide();
            $("#normal_btn").hide();
            $("#start").hide();
            $("#hard_lock_btn").hide();
            $("#hard_btn").hide();
            $("#quit").hide();

            $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/setumei", "");
            AudioPlayer.play("click.ogg");
        }
    };

    //説明がスタートした時に説明キャンセルボタンを表示
    var setumeiStart = function () {
        $("#setumei").hide();
        $("#setumei").off();

        $("#setumeiCancel").css("background-image", "url(images/title/setumeiCancel_off.png)");
        $("#setumeiCancel").show();
        $("#setumeiCancel").on(START, setumeiCancel);
    };

    //説明キャンセルボタン押下時
    var setumeiCancel = function () {
        $("#setumeiCancel").off();
        $("#setumeiCancel").css("background-image", "url(images/title/setumeiCancel_on.png)");
        $.raiseALMemoryEvent("DrBrain/OrderMemory/intro/setumeiCancel", "");
        AudioPlayer.play("click.ogg");
    };


    ///異常終了系（タイムアウト、顔認識できないとか
    var abend = function () {
        //終了ボタンを押下にしてカバー表示して終了する
        $("#quit").css("background-image", "url(images/title/quit_on.png)");
        $("#cover").show();
    };




    //////ランキング////////////////////////////////////////////////////////////

    //ランキングデータを保存
    var ranking_select_flag = "normal";

    //文字列のbyte数
    function countLength(str) {
        var r = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
            // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
            if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
                r += 1;
            } else {
                r += 2;
            }
        }
        return r;
    }

    var dialogStartRanking = function () {
        $("#cover").show();
        AudioPlayer.play("click.ogg");
        $.raiseALMemoryEvent("DrBrain/OrderMemory/changeRanking", "start");
    };
    
    var showRanking = function (data) {
        $('#ranking_off').off();

        //ボタン押下状態に
        $("#ranking_off").css("visibility", "hidden");
        $("#ranking_on").css("visibility", "visible");

        //データを表示
        //console.log(data[0]);
        //console.log(data[1]);
        var ranking = $.parseJSON(data[0] || "null");
        var user_best = $.parseJSON(data[1] || "null");
        //console.log(ranking);
        //ランキング 指定された難易度を表示する
        if (ranking[ranking_select_flag]["1st"] == "") {
            //1位データがない場合はデータなし画像を表示
            $("#ranking_" + ranking_select_flag).css('background-image', 'url("images/ranking/none_bg.png")');
        } else {
            for (var key1 in ranking[ranking_select_flag]) {

                var showData = ranking[ranking_select_flag][key1];
                for (var key in showData) {
                    //○位とランク
                    if (key == "rank") {
                        $("#rank_" + key1 + "_" + ranking_select_flag).html(showData[key][0]);
                        $("#rank2_" + key1 + "_" + ranking_select_flag).html('<img src="images/ranking/' + showData[key][1] + '_small.png">');
                    }
                    //アイコン
                    if (key == "icon") {
                        if (showData[key] == "") { //データがない場合は小アプリにある画像を表示
                            $("#" + key + "_" + key1 + "_" + ranking_select_flag).html("<img class='img_cycle' src='images/ranking/user_icon_none.png'>");
                        } else {
                            //データがあるとき
                            $("#" + key + "_" + key1 + "_" + ranking_select_flag).html("<img class='img_cycle'>");
                            var img = $("#" + key + "_" + key1 + "_" + ranking_select_flag + " .img_cycle");
                            img.off();
                            img.on("error", function () {
                                //画像がないとき代替画像
                                $(this).attr("src", "images/ranking/user_icon_none.png");
                            });
                            img.attr("src", showData[key]);
                        }
                    }
                    //名前
                    if (key == "name") {
                        //console.log(typeof showData[key]);
                        //console.log(showData[key]);

                        //5文字以上は丸める。(例：しんのすけ→しんのす...)
                        var name = showData[key];
                        if (countLength(showData[key]) > 10) {
                            name = showData[key].substr(0, 4);
                            name = name + '…';
                        }

                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(name);
                    }
                    //クリア問題数
                    if (key == "clear-count") {
                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(showData[key] + "/5");
                    }
                    //クリア時間
                    if (key == "clear-time") {
                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(showData[key]);
                    }

                    //表示する
                    $("#" + ranking_select_flag + "_" + key1).css("visibility", "visible");
                }

                //自己ベストを表示
                if (user_best[ranking_select_flag] != "") {
                    $("#new_record_" + ranking_select_flag).css("background-image", 'url("images/ranking/result_plate.png")');
                    $("#record_question_" + ranking_select_flag).html(user_best[ranking_select_flag]["clear-count"] + "/5");
                    $("#record_second_" + ranking_select_flag).html(user_best[ranking_select_flag]["clear-time"]);
                    $("#record_rank2_" + ranking_select_flag).html('<img src="images/ranking/' + user_best[ranking_select_flag]["rank"] + '_middle.png">');
                } else {
                    $("#new_record_" + ranking_select_flag).css("background-image", 'url("images/ranking/result_plate.png")');
                    $("#record_question_" + ranking_select_flag).html("-");
                    $("#record_second_" + ranking_select_flag).html("-");
                    $("#record_rank2_" + ranking_select_flag).html('-');
                }

            }
        }

        //0.4s後に画面切り替え
        setTimeout(function () {
            $("#ranking_" + ranking_select_flag).show();
            if (ranking_select_flag == "normal") {
                $("#ranking_hard").hide();
            } else {
                $("#ranking_normal").hide();
            }
            $("#ranking_off").css("visibility", "visible");
            $("#ranking_on").css("visibility", "hidden");
            $("#cover").hide();
        }, 400);
    };




    //ランキング ノーマルへボタン
    $("#ranking_normal_btn_off").on(START, function () {
        $("#cover").show();
        ranking_select_flag = "normal";
        AudioPlayer.play("click.ogg");
        $("#ranking_normal_btn_on").css("visibility", "visible");
        $("#ranking_normal_btn_off").css("visibility", "hidden");
        $("#ranking_hard_btn_on").css("visibility", "hidden");
        $("#ranking_hard_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("DrBrain/OrderMemory/changeRanking", ranking_select_flag);
    });

    //ランキング ハードへボタン
    $("#ranking_hard_btn_off").on(START, function () {
        $("#cover").show();
        ranking_select_flag = "hard";
        AudioPlayer.play("click.ogg");
        $("#ranking_hard_btn_on").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "hidden");
        $("#ranking_normal_btn_on").css("visibility", "hidden");
        $("#ranking_normal_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("DrBrain/OrderMemory/changeRanking", ranking_select_flag);
    });

    //ランキング終了ボタンノーマル
    $("#rank_end_off_normal").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_normal").css("visibility", "visible");
        $("#rank_end_off_normal").css("visibility", "hidden");
        AudioPlayer.play("click.ogg");
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("DrBrain/OrderMemory/rankingEnd", "");
        }, 1000);
    });

    //ランキング終了ボタンハード
    $("#rank_end_off_hard").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_hard").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "hidden");
        AudioPlayer.play("click.ogg");
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("DrBrain/OrderMemory/rankingEnd", "");
        }, 1000);
    });

    var rank_view_reset = function () {
        ranking_select_flag = "normal";
        $("#ranking_normal").hide();
        $("#ranking_hard").hide();

        $("#rank_end_off_normal").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "visible");
        $("#ranking_normal_btn_off").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "visible");

        $("#rank_end_on_normal").css("visibility", "hidden");
        $("#rank_end_on_hard").css("visibility", "hidden");
        $("#ranking_normal_btn_on").css("visibility", "hidden");
        $("#ranking_hard_btn_on").css("visibility", "hidden");


        $('#ranking_off').off();
        $('#ranking_off').on(START, dialogStartRanking);
        $("#cover").hide();
    };


    //////ランキングEND///////////////////////////////////////////////////////////

    //プリロード
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
        //console.log(data);
        $.preload(data);
        $("#kakugoDummy").show();
        $("#rodinDummy").show();
        $("#rodinDBDummy").show();
        $.raiseALMemoryEvent("DrBrain/OrderMemory/preloadOK", "");
    };

    //Game            
    var time = 10;
    var timer;
    var clearCount = 0; //For calculate score
    var useTime = 0;  //For calculate score
    var questionNumber = 0;
    
    var justifiedFlag = 0,    //0 is not justified, 1 is justified
        timerRunningFlag = 0; //0 is not running, 1 is running

    var switchButtonOn = function (btn) {
        
        var url = $(btn).css('background-image').replace('_off.png', '_on.png');
        $(btn).css('background-image', url);
    };
    
    var switchButtonOff = function (btn) {
        
        var url = $(btn).css('background-image').replace('_on.png', '_off.png');
        $(btn).css('background-image', url);
    };
    
    var removeFilter = function (){
        
        $('#cover').hide();
    };
    
    var showFilter = function (){
        
        $('#cover').show();
    };
    

    var showMask = function (btn) {
        
        var btnObj = $(btn);
        
        $('#mask').css({
                        'top':btnObj.css('top'),
                        'left':btnObj.css('left'),
                        'visibility':'visible'
                        });
    };
        
    var pressButton = function(data){
        
        
        $('#' + data).children().css('top','95px');
        switchButtonOn('#' + data);
        showMask('#' + data);
        $('#cover').show();
        AudioPlayer.play('click.ogg');
    };
    
        // 画面切り替え
    var sceneChange = function (data) {
        
        $('section').hide();
        $('#cover').hide();
        $('#mask').css('visibility', 'hidden');
        $(data).show();
        
    };
    
    var showQuestionBackground = function () {
        $('.question-title').text('出題中');
        $('#description-number').css('visibility', 'hidden');
        sceneChange('#show-description-section');
    }
    
    
    var showDescription = function (data) {
        
        $('#cover').hide();
        $('#mask').css('visibility', 'hidden');
        $('#description-number').css('visibility', 'visible');
        $('#description-number').text(data);
        if (questionNumber > 1) {
            //after play
            $('.question-title').text('確認');
        } else {
            //before play
            $('.question-title').text('出題中');
        }
        sceneChange('#show-description-section');
    };
    
    var showAlternation = function(data){
        
        $('#mask').css('background-image','url("./images/2_choices_btn_mask.png")');
        $('#mask').css('width','450px');
        $('#mask').css('height','230px');
        $('.txt-alternation-btn').css('top', '90px');        
        switchButtonOff('#btn-yes');
        switchButtonOff('#btn-no');
        if (questionNumber > 1){
            
            // after play
            $('#correct-circle').hide();
            $('#incorrect-cross').hide();
            $('#game-end').hide();
            $('#timeup').hide();
            $('.question-title').text('确认');
            $('#alternation-text').text('你还想按顺序听一次嘛？');
        } else {
            
            // before play
            $('.question-title').text('确认');
            $('#alternation-text').text('你还想再听一次嘛？?');     
        }
        
        sceneChange('#alternation');

    };
    
    var options = [];
    var optionsTxt = [];
    var prepareOptionButtons = function(data){
        var dataLength = data.length;   
        
        for(var i = 0 ; i < 8 ; i++){
            
            options[i] = $('#option-'+(i+1));
            optionsTxt[i] = $('#txt-option-'+(i+1));
        }
        
        if(dataLength === 7){
            
            $('.option').css({
                                'background-image':'url("./images/6_choices_btn_off.png")',
                                'width':'360px',
                                'height':'230px',
                                'font-size':'50px'
                            });
            
            $('.txt-option').css('width','360px');
            
             $('#mask').css({
                                'background-image':'url("./images/6_choices_btn_mask.png")',
                                'width':'360px',
                                'height':'230px'
                            });
            
            $('#question-text').text(data[6]);
            for (i = 0; i < 6; i++) { 
                optionsTxt[i].html(data[i]).css('top','90px');;
            }
            options[0].css({'left':'80px', 'top':'256px'});
            options[1].css({'left':'460px', 'top':'256px'});
            options[2].css({'left':'840px', 'top':'256px'});
            
            options[3].css({'left':'80px', 'top':'498px'});
            options[4].css({'left':'460px', 'top':'498px'});
            options[5].css({'left':'840px', 'top':'498px'});
            options[6].css('display','none');
            options[7].css('display','none');
            
        } else if(dataLength === 9){
            
            
            
            $('.option').css({
                                'background-image':'url("./images/8_choices_btn_off.png")',
                                'width':'265px',
                                'height':'230px',
                                'font-size':'38px'
                            });
            $('.txt-option').css('width','265px');
            
            $('#mask').css({
                                'background-image':'url("./images/8_choices_btn_mask.png")',
                                'width':'265px',
                                'height':'230px'
                            });
            $('#question-text').text(data[8]);
            for (i = 0; i < 8; i++) { 
                optionsTxt[i].html(data[i]).css('top','90px');;
            }
            
            $(options[0]).css({'left':'80px', 'top':'256px'});
            $(options[1]).css({'left':'365px', 'top':'256px'});
            $(options[2]).css({'left':'650px', 'top':'256px'});
            $(options[3]).css({'left':'935px', 'top':'256px'});
    
            $(options[4]).css({'left':'80px', 'top':'498px'});
            $(options[5]).css({'left':'365px', 'top':'498px'});
            $(options[6]).css({'left':'650px', 'top':'498px'});
            $(options[7]).css({'left':'935px', 'top':'498px'});
        }
        
        
    };
    
    var showOptions = function(data){
        
        //sceneChange('#check-answer');  
		
		$('section').hide();
        $('#cover').show();
        $('#mask').css('visibility', 'hidden');
        $('#check-answer').show();
    };
	
	var removeCover = function(){
		$('#cover').hide();
	};
    
    var setQuestion = function () {
        
        justifiedFlag = 0;
        time = 10;
        
        $('.counter').css("color", "#ee7d04");   
        $('#correct-circle').hide();
        $('#incorrect-cross').hide();
        $('#timeup').hide();
        $('.counter').html('10');
        questionNumber = questionNumber + 1;
        $('.question-title').text('第' + questionNumber.toString() + '問');
        $('#check-answer').css('background-image',
                                       'url("./images/contents/question_bg.png")');
        sceneChange('#set-question');
        
    };
    
    var timerStart = function (data) {
        
        time = 10;
        score = 10;
        
        if(timerRunningFlag === 1){
            timerStop();
        }
        
        if ( justifiedFlag === 0 ) {
            
            timerRunningFlag = 1;
            time = 9;
            AudioPlayer.play('count_default.ogg');
            
            $(".counter").html(time);
            
            timer = setInterval(function () {

                time--;
                
                $(".counter").html(time);
                
                if (time > 5) {
                    $(".counter").css("color","#ee7d04");
                    AudioPlayer.play('count_default.ogg');
                }
                
                if (time <= 5 && time > 0) {
                    AudioPlayer.play('count_last.ogg');
                    $(".counter").css("color","#f21a1a"); 
                }

                if (time <= 0) {
                    
                    
                    AudioPlayer.play('count_last.ogg');
                    $.raiseALMemoryEvent("DrBrain/OrderMemory/TimeUp", "");
                    timerStop();
                    time = 0;
                }
            }, 1000); 

        }
        
    };
    
    var timerStop = function () {
        if (timerRunningFlag === 1){
            clearInterval(timer);
            timerRunningFlag = 0;
        }
    };
    
    //正しい答え表示
    var showCorrect = function (data) {
        justifiedFlag = 1;
        clearInterval(timer);
        timerRunningFlag = 0;
        clearCount += 1;
        useTime += (10 - time);   
        $('#correct-circle').show();
    };
    
    var showIncorrect = function (data) {
        $('#check-answer').css('background-image',
                                       'url("./images/contents/incorrectanswer_bg.png")');
        $('#incorrect-cross').show();
        justifiedFlag = 1;
        clearInterval(timer);
        timerRunningFlag = 0;
    };
    
    var showTimeup = function (){
        $('#timeup').show();
    }
    
    //正解文言用
    var getTime = function () {
        
        $.raiseALMemoryEvent("DrBrain/OrderMemory/SendTime", time);
    };
    
    //終了帯表示
    var showEnd = function (data) {
        $('#mask').css("visibility", "hidden");
        $('#game-end').show();
        $('#timeup').hide();
    };
    
    var getScore = function () {
        
        $.raiseALMemoryEvent("DrBrain/OrderMemory/SendScore", [clearCount, useTime]);
    };
    
    var hideExample = function () {
        
        $('#example-number').css("visibility", "hidden");
        $('#example-question-text').css("visibility", "hidden");
        $('#example-options').css("visibility", "hidden");
        $('#example-mask').css("visibility", "hidden");
        $('#example-correct-circle').css("visibility", "hidden");
        $("#example").hide();
    };
    
    var showExample = function(data){
        
        if (data[0]==0){
            $('#example-number').text(data[1]).css("visibility", "visible");
            $('#example-options').css("visibility", "hidden");
            
        }else if (data[0]==1){
            var url = $('#example-option-2').css('background-image').replace('_on.png', '_off.png');
            $('#example-option-2').css('background-image', url).children().css('top','90px');
            $('#example-question-text').css("visibility", "visible");
            $('#example-number').css("visibility", "hidden");
            $('#example-mask').css("visibility", "hidden");
            $('#example-options').css("visibility", "visible");
            if (data[1] == 1){
                
                var url = $('#example-option-2').css('background-image').replace('_off.png', '_on.png');
                $('#example-option-2').css('background-image', url).children().css('top','95px');
                $('#example-mask').css("visibility", "visible");
                $('#example-correct-circle').css("visibility", "visible");
            }
        }
        
        $("#example").show();
        
    };
    

    $('.option').on({
        
        'touchstart': function () { 
            
            if(event.touches.length === 1){
                $(this).children().css('top','95px');
				$('#cover').show();
                showMask(this);
                switchButtonOn(this);
                $(this).addClass('touchstarted');
                //AudioPlayer.play('click.ogg');
            }                
        },
        
        'touchend': function () {
            
            if($(this).hasClass('touchstarted')){
                $(this).removeClass('touchstarted'); 
				$.raiseALMemoryEvent("DrBrain/OrderMemory/Option", $(this).attr('id'));
            }
        }
    }); 
    $('#btn-yes').on({
        
        'touchstart': function () {   
            
            if(event.touches.length == 1){
            
                $(this).children().css('top','95px');
                $('#cover').show();
                $(this).addClass('touchstarted');
                switchButtonOn(this);
                showMask(this);
                AudioPlayer.play('click.ogg');
            }
        },
        
        'touchend': function () {
            
            if($(this).hasClass('touchstarted')){
                $(this).removeClass('touchstarted');
                setTimeout(function(){
                    $.raiseALMemoryEvent("DrBrain/OrderMemory/Button/Yes", 1);
                }, 500);
            }
        }
    });  
    
    $('#btn-no').on({
        
        'touchstart': function () { 
            
            if(event.touches.length == 1){
                $(this).children().css('top','95px');
                $('#cover').show();
                $(this).addClass('touchstarted');
                switchButtonOn(this);
                showMask(this);
                AudioPlayer.play('click.ogg');
                }                
        },
        
        'touchend': function () {
            
            if($(this).hasClass('touchstarted')){
                $(this).removeClass('touchstarted');
                setTimeout(function(){
                    $.raiseALMemoryEvent("DrBrain/OrderMemory/Button/No", 1);
                }, 500); 
            }
        }
    });
    
    var _self = {
        init: function () {

            pepper_onStart = function () {
                $.subscribeToALMemoryEvent("changeScean", changeScean);
                $.subscribeToALMemoryEvent("preload", preload);
				
				$.subscribeToALMemoryEvent("DrBrain/OrderMemory/RemoveCover", removeCover);

                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/abend", abend);


                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogStart", start);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogNormal", normal);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogHard", hard);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogSetumei", setumei);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogQuit", quit);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogRanking", dialogStartRanking);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/dialogHardLock", hard_lock);

                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/setumeiView", setumeiView);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/intro/setumeiStart", setumeiStart);

                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/startupStatus", startupStatus);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/showRanking", showRanking);
                
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowQuestionBackground", showQuestionBackground);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/SetQuestion", setQuestion);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/TimerStart", timerStart);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/TimerStop", timerStop);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowExample", showExample);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowDescription", showDescription);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowAlternation", showAlternation);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowOptions", showOptions);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowCorrect", showCorrect);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowIncorrect", showIncorrect);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowTimeup", showTimeup);
                
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/GetScore", getScore);
                
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/PressButton", pressButton);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/GetTime", getTime);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/PrepareOptionButtons", prepareOptionButtons);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/ShowEnd", showEnd);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/HideExample", hideExample);
                $.subscribeToALMemoryEvent("DrBrain/OrderMemory/abend", abend);
                
                
                //init系
                startupStatus();
                //必須の画像のみ
                var introImages = ["title.png", "title/quit_off.png", "title/quit_on.png", "title/hard_line.png"];
                $.preload(introImages);
                setTimeout(function () {
                    changeScean("intro");
                    $.raiseALMemoryEvent("DrBrain/OrderMemory/startYApp", "OK");
                }, 300);

            };
        }
    };
    return _self;
})(jQuery);
$(PEPPER.contents.init);
