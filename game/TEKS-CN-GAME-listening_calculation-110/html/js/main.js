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
            $.raiseALMemoryEvent("DrBrain/LtnCal/quit", "");
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
            $.raiseALMemoryEvent("DrBrain/LtnCal/intro/start", mode);
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
            $.raiseALMemoryEvent("DrBrain/LtnCal/intro/start", mode);

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
            $.raiseALMemoryEvent("DrBrain/LtnCal/intro/start", mode);

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
                $.raiseALMemoryEvent("DrBrain/LtnCal/intro/hardLock", "");
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
                $.raiseALMemoryEvent("DrBrain/LtnCal/intro/hardLockClose", "");
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
        if (num >= 5) {
            $("#hard_pop").css("background-image", "url(images/hard_pop/bg_star_5.png)");
        }
        
    };
    
        //スタートボタン制御変数受け取り
    var startup_status, mode_status;
    var startupStatus = function () {
        //ALMemoryからbefore_state, nonceを取得
        $.getService("ALMemory", function (memory) {
            memory.getData('DrBrain/LtnCal/startupStatus').then(function (data1) {
                startup_status = data1;
                memory.getData('DrBrain/LtnCal/modeStatus').then(function (data2) {
                    mode_status = data2;
                    hardStar(mode_status);
                    if (startup_status === "free") {
                        //フリー（ふつう・むずかしい）のとき終了ボタンを表示
                        $("#quit").show();
                        $("#quit").on(START, quit);
                    } else {
                        mode = startup_status;
                        if (mode === "hard") {
                            $("#" + mode + "_line").show();
                        }
                        
                    }

                    //ゲストの時、むずかしいロックの背景差し替え
                    memory.getData('DrBrain/LtnCal/userId').then(function (data3) {
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

            $.raiseALMemoryEvent("DrBrain/LtnCal/intro/setumei", "");
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
        $.raiseALMemoryEvent("DrBrain/LtnCal/intro/setumeiCancel", "");
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
        $.raiseALMemoryEvent("DrBrain/LtnCal/changeRanking", "start");
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
        $.raiseALMemoryEvent("DrBrain/LtnCal/changeRanking", ranking_select_flag);
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
        $.raiseALMemoryEvent("DrBrain/LtnCal/changeRanking", ranking_select_flag);
    });

    //ランキング終了ボタンノーマル
    $("#rank_end_off_normal").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_normal").css("visibility", "visible");
        $("#rank_end_off_normal").css("visibility", "hidden");
        AudioPlayer.play("click.ogg");
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("DrBrain/LtnCal/rankingEnd", "");
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
            $.raiseALMemoryEvent("DrBrain/LtnCal/rankingEnd", "");
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
        $.raiseALMemoryEvent("DrBrain/LtnCal/preloadOK", "");
    };


    //Game
    
    var NORMAL = 'normal',
        HARD = 'hard',
        TIMEUP = 1,
        NOT_TIMEUP = 0;
        
    var timer,
        time = 20,
        timerRunningFlag = 0, //0 is not running, 1 is running
        showCorrectFlag = 0,  //0 is not shown, 1 is shown
        clearCount = 0, //For calculate score
        useTime = 0,  //For calculate score
        questionNumber = 0,
        timeupFlag = NOT_TIMEUP,
        checkingCorrect = 0;
        
        

    /*事前要素取得*/
    var answer = $('#answer');
    var incorrectCross = $("#incorrect-cross");
    var btnLtnAgn = $('#btn-ltn-agn');
    var txtPrepareQuestion = $('#txt-prepare-question');
    var answerCheckSection = $('#answer-check-section');
    var questionTitle = $('.question-title');
    var correctCircle = $("#correct-circle");
    var txtQuestion = $('#txt-question');
    var counter = $(".counter");
    var timeup = $("#timeup");
    var gameEnd = $("#game-end");
    var txtAnswer = $("#txt-answer");
    
    var sceneChange = function (data) {
        
        $('section').hide();
        $('#cover').hide();
        $(data).show();
    };
        
    var switchButtonOn = function (btn) {
        
        var url = $(btn).css('background-image').replace('_off.png', '_on.png');
        $(btn).css('background-image', url);
    };
    
    var switchButtonOff = function (btn) {
        
        var $btnPressed = $(btn)
        var url = $btnPressed.css('background-image').replace('_on.png', '_off.png');
        $btnPressed.css('background-image', url);
    };
        
    var removeFilter = function () {
        
        $('#cover').hide();
    };
    
    var showFilter = function (){
        
        $('#cover').show();
    }
    /*Prepare and initial some value for next question*/
    
    var showQuestionBackground = function (){
        timeupFlag = NOT_TIMEUP;
        time = 20;
        showCorrectFlag = 0;
        questionNumber = questionNumber + 1;
        questionTitle.text('第' + questionNumber.toString() + '問');
        counter.css("color","#ee7d04").html("20");  
        answerCheckSection.css('background-image',
                                       'url("./images/contents/question_bg.png")');
        btnLtnAgn.css('background-image',
                                       'url("./images/contents/btn_play_again_off.png")');
        txtPrepareQuestion.css('visibility', 'hidden');
        incorrectCross.css('visibility', 'hidden');
        correctCircle.css('visibility', 'hidden');
        answer.css('visibility', 'hidden');
        btnLtnAgn.css('visibility', 'hidden');
        txtQuestion.css('visibility', 'hidden');
        txtAnswer.css('visibility', 'hidden');
        timeup.hide();
        sceneChange("#question-preparation-section");
        
    }
    
    var prepareQuestion = function() {
        
        btnLtnAgn.css('visibility', 'visible');
        txtPrepareQuestion.css('visibility', 'visible'); //出題中
        txtQuestion.css('visibility', 'visible');
        sceneChange("#question-preparation-section");
    };
        
    var resetCheckAnswer = function() {
        
        if (timerRunningFlag === 1){
            timerStop();
            timerRunningFlag = 0;
        }
        
        questionTitle.text('第' + questionNumber.toString() + '問');
        sceneChange("#answer-check-section");
        
    };
    
    /*もう一度聞くボターン表示ページ*/
    var checkAnswer = function() {
        
        if (timerRunningFlag === 1){
            timerStop();
            timerRunningFlag = 0;
        }
        
        questionTitle.text('第' + questionNumber.toString() + '問');
        switchButtonOff('#btn-ltn-agn');
        counter.css("color","#0e6773");
        counter.html("20");
        sceneChange("#answer-check-section");
        
    };
    
    /*不正解を表示してから、もう一度聞くボターンページ表示*/
    var showCheckAnswer = function() {
        if (timeupFlag === NOT_TIMEUP){
            
            
            answerCheckSection.css('background-image',
                                       'url("./images/contents/question_bg.png")');
            
            answer.css('visibility', 'hidden');
            incorrectCross.css('visibility', 'hidden');
            switchButtonOff('#btn-ltn-agn');
            btnLtnAgn.css('visibility', 'visible');
            txtQuestion.css('visibility', 'visible');
        }
        
    };
    
    //もう一度聞くボターン押せるようにする
    var enbleLtnAgnBtn = function() {
        if( time > 5 ){
                
                switchButtonOff('#btn-ltn-agn')
                $('#cover').hide();
            }
        
    };
    
    //正しい答え表示
    var showCorrect = function(data){
        
        showCorrectFlag = 1;
        clearInterval(timer);
        timerRunningFlag = 0;
        answerCheckSection.css('background-image',
                                       'url("./images/contents/question_bg.png")');
        
        timeup.hide();
        btnLtnAgn.css('visibility', 'hidden');
        txtQuestion.css('visibility', 'hidden');
        incorrectCross.css('visibility', 'hidden');
        if (timeupFlag === TIMEUP){
            correctCircle.css('visibility', 'hidden');
            txtAnswer.css('visibility', 'visible');
            
        }else if (timeupFlag === NOT_TIMEUP){
            correctCircle.css('visibility', 'visible');
            clearCount += 1;
            useTime += (20 - time);
        }
        
        answer.css('visibility', 'visible').html(data);
    };
    
    //不正解と×表示
    var showIncorrect = function (data) {

        btnLtnAgn.css('visibility', 'hidden');
        txtQuestion.css('visibility', 'hidden');
        
        answer.css('visibility', 'visible').html(data);
        setTimeout(function(){
            incorrectCross.css('visibility', 'visible');
            answerCheckSection.css('background-image',
                                       'url("./images/contents/incorrectanswer_bg.png")');
                }, 230);
        
        setTimeout(function(){
            AudioPlayer.play('04_hazure.ogg');
                }, 330);
    };
        
    var getScore = function () {
        
        $.raiseALMemoryEvent("DrBrain/LtnCal/SendScore", [clearCount, useTime]);
    };
    
    //正解文言用
    var getTime = function () {
        
        $.raiseALMemoryEvent("DrBrain/LtnCal/SendTime", time);
    };
    
    ////終了ポップアップを表示
    var showEnd = function (data) {
        timeup.hide();
        gameEnd.show();
    };
    
    var timerStart = function (data) {
        
        if(timerRunningFlag === 1){
            timerStop();
        }
        
        if(showCorrectFlag === 0){
            
            timerRunningFlag = 1;
            AudioPlayer.play('count_default.ogg');
            time = 19;
            counter.html("19");  
            
            timer = setInterval(function () {
                
                time--;

                if (time <= 20 && time >= 6) {
                    
                    counter.css("color","#ee7d04").html(time);;
                    AudioPlayer.play('count_default.ogg');
                } else if (time >= 0){
                    
                    btnLtnAgn.css('background-image',
                                       'url("./images/contents/btn_play_again_none.png")');
                    showFilter();
                    counter.css("color","#f21a1a").html(time);; 
                    AudioPlayer.play('count_last.ogg');
                }
                                
                if (time <= 0) {
                    
                    timeupFlag = TIMEUP;
                    timeup.show();
                    timerStop();
                    $.raiseALMemoryEvent("DrBrain/LtnCal/TimeUp", "");
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
    
    // もう一回ボタン押下時
    $('#btn-ltn-agn').on({
        
        'touchstart': function () {
            
            if(event.touches.length === 1){
                switchButtonOn(this);
                $('#cover').show();
                $(this).addClass('touchstarted');
                
            }
        },
        
        'touchend': function () {
            
            if($(this).hasClass('touchstarted')){
                $(this).removeClass('touchstarted');
                $.raiseALMemoryEvent("DrBrain/LtnCal/LtnAgnTouched", 1);
            }
        }
    });
    
    var showExample = function (data){
        
        if (data === "question"){
            
            $("#txt-prepare-question-example").css('visibility', 'visible');
            $("#txt-answer-example").css('visibility', 'hidden');
            $("#answer-example").css('visibility', 'hidden');
        }
        else if (data === "answer"){
            
            $("#txt-prepare-question-example").css('visibility', 'hidden');
            $("#txt-answer-example").css('visibility', 'visible');
            $("#answer-example").css('visibility', 'visible');
        }
        
        $("#example").show();
    };
    
    var hideExample = function (data){
        
        $("#example").hide();
    }
    
    var _self = {
        init: function () {

            pepper_onStart = function () {
                $.subscribeToALMemoryEvent("changeScean", changeScean);
                $.subscribeToALMemoryEvent("preload", preload);

                $.subscribeToALMemoryEvent("DrBrain/LtnCal/abend", abend);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogStart", start);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogNormal", normal);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogHard", hard);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogSetumei", setumei);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogQuit", quit);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogRanking", dialogStartRanking);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/dialogHardLock", hard_lock);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/setumeiView", setumeiView);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/intro/setumeiStart", setumeiStart);
                
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/startupStatus", startupStatus);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/showRanking", showRanking);
                
                //Game
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowQuestionBackground", showQuestionBackground);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ResetCheckAnswer", resetCheckAnswer);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/PrepareQuestion", prepareQuestion);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/EnbleLtnAgnBtn", enbleLtnAgnBtn);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/TimerStart", timerStart);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/TimerStop", timerStop);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowCorrect", showCorrect);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowIncorrect", showIncorrect);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/GetTime", getTime);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowCheckAnswer", showCheckAnswer);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowEnd", showEnd);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/GetScore", getScore);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/ShowExample", showExample);
                $.subscribeToALMemoryEvent("DrBrain/LtnCal/HideExample", hideExample);
                
                //init系
                startupStatus();
                //必須の画像のみ
                var introImages = ["title.png", "title/quit_off.png", "title/quit_on.png", "title/hard_line.png"];
                $.preload(introImages);
                setTimeout(function () {
                    changeScean("intro");
                    $.raiseALMemoryEvent("DrBrain/LtnCal/startYApp", "OK");
                }, 300);

            };
        }
    };
    return _self;
})(jQuery);
$(PEPPER.contents.init);
