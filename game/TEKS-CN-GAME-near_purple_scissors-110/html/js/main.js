/* global $,jQuery,setTimeout,setInterval,clearInterval,AudioPlayer:false */
var PEPPER = PEPPER || {};
var pepper_onStart = {};


PEPPER.contents = (function ($) {
    var START = 'touchstart',
        END = 'touchend';
    var currentScean = "intro";
    var mode;
//    var queNum = 1; //第〇問


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
            $("#quit").css("background-image", "url(images/quit_on.png)");
            $.raiseALMemoryEvent("Iinari/quit", "");
            AudioPlayer.play('08_click.ogg');
        }
    };



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
            $("#start").css("background-image", "url(images/start_on.png)");
            AudioPlayer.play('08_click.ogg');

            //モード設定は済み
            $.raiseALMemoryEvent("Iinari/intro/start", mode);
        }
    };
    //normalボタン押下時
    var normal = function () {
        if ($._data($("#normal_btn").get(0)).events) {
            allBtnOff();
            $("#normal_btn").css("background-image", "url(images/normal_btn_on.png)");
            AudioPlayer.play('08_click.ogg');
            //モード設定
            mode = "normal";
            $.raiseALMemoryEvent("Iinari/intro/start", mode);

        }
    };

    //hardボタン押下時
    var hard = function () {
        if ($._data($("#hard_btn").get(0)).events) {
            allBtnOff();
            $("#hard_btn").css("background-image", "url(images/hard_btn_on.png)");
            AudioPlayer.play('08_click.ogg');

            //モード設定
            mode = "hard";
            $.raiseALMemoryEvent("Iinari/intro/start", mode);

        }
    };

    //hardボタンロック押下時
    var hard_lock = function () {
        if ($._data($("#hard_lock_btn").get(0)).events) {
            $("#hard_lock_btn").off();
            $("#cover").show();
            $("#hard_lock_btn").css("background-image", "url(images/key_btn_on.png)");
            AudioPlayer.play('08_click.ogg');
            setTimeout(function () {
                $("#hard_pop").show();
                $.raiseALMemoryEvent("Iinari/intro/hardLock", "");
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
            AudioPlayer.play('08_click.ogg');
            setTimeout(function () {
                $("#hard_pop").hide();
                //ボタンリセット
                $("#hard_lock_btn").css("background-image", "url(images/key_btn_off.png)");
                $("#close_hard_pop").css("background-image", "url(images//hard_pop/close_btn_off.png)");
                $("#close_hard_pop").off();
                $("#close_hard_pop").on(START, closeHardPop);
                $("#hard_lock_btn").off();
                $("#hard_lock_btn").on(START, hard_lock);
                $("#cover").hide();
                $.raiseALMemoryEvent("Iinari/intro/hardLockClose", "");
            }, 1000);
        }
    };

    //ハードロックスターの個数表示
    var hardStar = function (num) {
        $("#star1").hide();
        $("#star2").hide();
        $("#star3").hide();
        $("#star4").hide();
        $("#star5").hide();

        if (num >= 1) {
            $("#star1").show();
        }
        if (num >= 2) {
            $("#star2").show();
        }
        if (num >= 3) {
            $("#star3").show();
        }
        if (num >= 4) {
            $("#star4").show();
        }
        if (num >= 5) {
            $("#star5").show();
        }
    };


    //スタートボタン制御変数受け取り
    var startup_status, mode_status;
    var startupStatus = function () {
        //ALMemoryからbefore_state, nonceを取得
        $.getService("ALMemory", function (memory) {
            memory.getData('Iinari/startupStatus').then(function (data1) {
                startup_status = data1;
                memory.getData('Iinari/modeStatus').then(function (data2) {
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
                    memory.getData('Iinari/userId').then(function (data3) {
                        console.log(data3);
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
        $("#setumei").css("background-image", "url(images/setumei_off.png)");
        $("#setumei").show();
        $("#setumei").on(START, setumei);

        $('#ranking_off').off();
        $("#ranking_on").show();
        $("#ranking_off").show();
        $('#ranking_off').on(START, dialogStartRanking);

        //説明キャンセルからの戻りで必須
        if (startup_status === "free") {
            $("#quit").show();
        } else {
            $("#quit").hide();
        }

        //例題を非表示&リセット
        reidaiHide();

        //他ボタン表示制御+帯表示
        introButtonController();
    };


    //説明を聞くボタン押下時
    var setumei = function () {
        if ($._data($("#setumei").get(0)).events) {
            $("#setumei").off();
            $("#setumei").css("background-image", "url(images/setumei_on.png)");

            //他ボタン非表示
            $("#ranking_on").hide();
            $("#ranking_off").hide();
            $("#normal_btn").hide();
            $("#start").hide();
            $("#hard_lock_btn").hide();
            $("#hard_btn").hide();
            $("#quit").hide();

            $.raiseALMemoryEvent("Iinari/intro/setumei", "");
            AudioPlayer.play('08_click.ogg');
        }
    };

    //説明がスタートした時に説明キャンセルボタンを表示
    var setumeiStart = function () {
        $("#setumei").hide();
        $("#setumei").off();

        $("#setumeiCancel").css("background-image", "url(images/setumeiCancel_off.png)");
        $("#setumeiCancel").show();
        $("#setumeiCancel").on(START, setumeiCancel);
    };

    //説明キャンセルボタン押下時
    var setumeiCancel = function () {
        $("#setumeiCancel").off();
        $("#setumeiCancel").css("background-image", "url(images/setumeiCancel_on.png)");
        $.raiseALMemoryEvent("Iinari/intro/setumeiCancel", "");
        AudioPlayer.play('08_click.ogg');
    };


    ///異常終了系（タイムアウト、顔認識できないとか
    var abend = function () {
        //終了ボタンを押下にしてカバー表示して終了する
        $("#quit").css("background-image", "url(images/quit_on.png)");
        $("#cover").show();
    };


    ///例題系//////////////////////////////////////////////////////////////
    //例題の表示
    var reidaiShow1 = function () {
        $("#reidai").show();
    };

    var reidaiShow2 = function () {
        $("#ex-hand").show();
    };

    var reidaiShow3 = function () {
        var url = $("#ex-btn-goo").css("background-image").replace("_off.png", "_on_ex.png");
        $("#ex-btn-goo").css("background-image", url);
        $("#ex-hand-answer").show();
     };

    //例題を非表示
    var reidaiHide = function () {
        $("#reidai").hide();
        setTimeout(function () {
            reidaiReset();
        }, 500);
    };


    //例題のリセット
    var reidaiReset = function () {
        var url = $("#ex-btn-goo").css("background-image").replace("_on_ex.png", "_off.png");
        $("#ex-btn-goo").css("background-image", url);
        $("#ex-hand").hide();
        $("#ex-hand-answer").hide();
    };



    ///game系//////////////////////////////////////////////////////////////



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
        AudioPlayer.play('08_click.ogg');
        $.raiseALMemoryEvent("Iinari/changeRanking", "start");
    };



    var showRanking = function (data) {
        $('#ranking_off').off();

        //ボタン押下状態に
        $("#ranking_off").css("visibility", "hidden");
        $("#ranking_on").css("visibility", "visible");

        //データを表示
        console.log(data[0]);
        console.log(data[1]);
        var ranking = $.parseJSON(data[0] || "null");
        var user_best = $.parseJSON(data[1] || "null");
        console.log(ranking);
        //ランキング 指定された難易度を表示する
        if (ranking[ranking_select_flag]["1st"] == "") {
            $("#ranking_" + ranking_select_flag).css('background-image', 'url(images/ranking/none_bg.png)');
        } else {
            for (var key1 in ranking[ranking_select_flag]) {
                //1位データがない場合はデータなし画像を表示

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
                    if (key == "name") {
                        console.log(typeof showData[key]);
                        console.log(showData[key]);

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
//                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(showData[key] + "/5");
                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(showData[key]);
                    }
                    //クリア時間
//                    if (key == "clear-time") {
//                        $("#" + key + "_" + key1 + "_" + ranking_select_flag).html(showData[key]);
//                    }

                    //表示する
                    $("#" + ranking_select_flag + "_" + key1).css("visibility", "visible");
                }

                //自己ベストを表示
                if (user_best[ranking_select_flag] != "") {
                    $("#new_record_" + ranking_select_flag).css("background-image", 'url("images/ranking/result_plate_2.png")');
//                    $("#record_question_" + ranking_select_flag).html(user_best[ranking_select_flag]["clear-count"] + "/5");
                    $("#record_question_" + ranking_select_flag).html(user_best[ranking_select_flag]["clear-count"]);
//                    $("#record_second_" + ranking_select_flag).html(user_best[ranking_select_flag]["clear-time"]);
                    $("#record_rank2_" + ranking_select_flag).html('<img src="images/ranking/' + user_best[ranking_select_flag]["rank"] + '_middle.png">');
                } else {
                    $("#new_record_" + ranking_select_flag).css("background-image", 'url("images/ranking/result_plate_2.png")');
                    $("#record_question_" + ranking_select_flag).html("-");
//                    $("#record_second_" + ranking_select_flag).html("-");
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
        ranking_select_flag = "normal";
        AudioPlayer.play('08_click.ogg');
        $("#ranking_normal_btn_on").css("visibility", "visible");
        $("#ranking_normal_btn_off").css("visibility", "hidden");
        $("#ranking_hard_btn_on").css("visibility", "hidden");
        $("#ranking_hard_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("Iinari/changeRanking", ranking_select_flag);
    });

    //ランキング ハードへボタン
    $("#ranking_hard_btn_off").on(START, function () {
        ranking_select_flag = "hard";
        AudioPlayer.play('08_click.ogg');
        $("#ranking_hard_btn_on").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "hidden");
        $("#ranking_normal_btn_on").css("visibility", "hidden");
        $("#ranking_normal_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("Iinari/changeRanking", ranking_select_flag);
    });

    //ランキング終了ボタンノーマル
    $("#rank_end_off_normal").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_normal").css("visibility", "visible");
        $("#rank_end_off_normal").css("visibility", "hidden");
        AudioPlayer.play('08_click.ogg');
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("Iinari/rankingEnd", "");
        }, 1000);
    });

    //ランキング終了ボタンハード
    $("#rank_end_off_hard").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_hard").css("visibility", "visible");
        $("#rank_end_off_hard").css("visibility", "hidden");
        AudioPlayer.play('08_click.ogg');
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("Iinari/rankingEnd", "");
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



    //終了ポップアップを表示
    var answerEnd = function () {
        $("#timeup").hide();
        $("#end").show();
    };


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
        $.raiseALMemoryEvent("preloadOK", "");
    };


    var _self = {
        init: function () {

            pepper_onStart = function () {
                $.subscribeToALMemoryEvent("changeScean", changeScean);
                $.subscribeToALMemoryEvent("preload", preload);

                $.subscribeToALMemoryEvent("Iinari/abend", abend);


                $.subscribeToALMemoryEvent("Iinari/intro/dialogStart", start);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogNormal", normal);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogHard", hard);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogSetumei", setumei);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogQuit", quit);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogRanking", dialogStartRanking);
                $.subscribeToALMemoryEvent("Iinari/intro/dialogHardLock", hard_lock);

                $.subscribeToALMemoryEvent("Iinari/intro/reidai/reidaiShow1", reidaiShow1);
                $.subscribeToALMemoryEvent("Iinari/intro/reidai/reidaiShow2", reidaiShow2);
                $.subscribeToALMemoryEvent("Iinari/intro/reidai/reidaiShow3", reidaiShow3);
                $.subscribeToALMemoryEvent("Iinari/intro/reidai/reidaiHide", reidaiHide);

                $.subscribeToALMemoryEvent("Iinari/intro/setumeiView", setumeiView);
                $.subscribeToALMemoryEvent("Iinari/intro/setumeiStart", setumeiStart);

                $.subscribeToALMemoryEvent("Iinari/game/answerEnd", answerEnd);


                $.subscribeToALMemoryEvent("Iinari/startupStatus", startupStatus);

                $.subscribeToALMemoryEvent("Iinari/showRanking", showRanking);

                // game系

                // ランダム配置クラス生成（Show Hands内で呼び出し）
                function shuffle(array) {
                  var n = array.length, t, i;

                  while (n) {
                    i = Math.floor(Math.random() * n--);
                    t = array[n];
                    array[n] = array[i];
                    array[i] = t;
                  }

                  return array;
                }

                // カウントダウン処理 //
                function startTimeout(count) {
                    cnt = count;
                    $("#countdown").text(cnt);
                    timeoutTimer = setInterval(function () {
                        if (cnt >= 1) {
                            cnt--;
                        }
                        $("#countdown").text(cnt);
                        if (cnt <= 0) {
                            //-1インターバルで0秒以下になった時
                            cnt = 0;
                            clearInterval(timeoutTimer);
                            $.raiseALMemoryEvent("Iinari/Timer/TimeupFlg", "1");
                            
                            $('#end').show();
                            setTimeout(function(){
                                AudioPlayer.play("12_whistle_end.ogg");
                            },500);
                            
                            return;
                            
                        } else if (cnt >= 6) {
                        
                            AudioPlayer.play("02_count_default.ogg");
                            
                            // 20秒以下なら秒数オレンジ
                            if (cnt <= 20) {
                                $("#countdown").css("color", "#ee7d04");
                            }
                            
                        } else {
                            AudioPlayer.play("03_count_last.ogg");
                            $("#countdown").css("color", "#f21a1a");
                        }
                    }, 1000);
                }

                // Change View (「いいなりじゃんけんスタート！」の非表示→第１問・残り秒数の表示）
                $.subscribeToALMemoryEvent("Iinari/ImageChange/ChangeView", function (data) {
                    qct = "第" + data + "問";
                    $('#starting-game').hide();

                    $('#question-no').show();
                    $('#countdown').show();
                    $('#game-filter').hide();
                });

                // Start Timer (カウントダウン開始）
                $.subscribeToALMemoryEvent("Iinari/ImageChange/StartTimer", function (data) {
                
                    startTimeout(data);
                });
                            
                // Show No-Aiko(あいこダメよ表示のON/OFF）
                $.subscribeToALMemoryEvent("Iinari/ImageChange/ShowNoAiko", function (data) {
                    // 親DIV handの見え隠れタイミングの準拠を前提に、no-aikoは難易度Hardなら常に表示可能にする
                    $('#no-aiko').show();
                });
                
                // Hide Hands
                $.subscribeToALMemoryEvent("Iinari/ImageChange/HideHand", function (data) {
                
                    $('#hand').hide();
                    $('#circle').hide();
                    
                    $('#wrong').hide();
                    $('#batsu').hide();
                    $('[id^=none]').hide();

                    // 回答用ボタンの初期化
                    var url = $('#btn-goo').css('background-image').replace('_on.png', '_off.png');
                    $('#btn-goo').css('background-image', url);
                    var url = $('#btn-choki').css('background-image').replace('_on.png', '_off.png');
                    $('#btn-choki').css('background-image', url);
                    var url = $('#btn-par').css('background-image').replace('_on.png', '_off.png');
                    $('#btn-par').css('background-image', url);

                    // 正解クラスの初期化
                    $('[id^=btn]').removeClass('correct');

                    // ランダム配置用クラスの初期化
                    $('[id^=grp]').removeClass('pos-1');
                    $('[id^=grp]').removeClass('pos-2');
                    $('[id^=grp]').removeClass('pos-3');
                    
                    qct = "第" + data + "問";
                    $('#question-no').text(qct);

                });

                // Show Hands
                $.subscribeToALMemoryEvent("Iinari/ImageChange/ShowHand", function (data) {

                    
                    // ボタン配置クラスのシャッフル
                    var pos_array = ['pos-1', 'pos-2', 'pos-3'];
                    shuffle(pos_array);
                    
                    // ボタン配置クラス設定
                    $('#grp-goo').addClass(pos_array[0]);
                    $('#grp-choki').addClass(pos_array[1]);
                    $('#grp-par').addClass(pos_array[2]);
                    
                    // 正解クラスの設定
                    if(data == 1){
                        $('#btn-goo').addClass('correct');
                    
                    }else if(data == 2){
                        $('#btn-choki').addClass('correct');
                    
                    }else if(data == 3){
                        $('#btn-par').addClass('correct');
                    }

                    $('#minus-5').hide();
                    $('#hand').show();

                    setTimeout(function(){
                        $('[id^=btn-disabled]').hide();
                    },800);

                });

                
                // QuestionNo
                $.subscribeToALMemoryEvent("Iinari/QuestionNo", function (data) {
                
                    qct = "第" + data + "問";
                    $('#question-no').text(qct);

                });
                
                // グー・チョキ・パーの回答用ボタン押下時
                // グー
                $('#btn-goo').on({
                    'touchstart': function () {
                        if(event.touches.length == 1){
                            $('[id^=btn-disabled]').show();
                                                    
//                            $(this).addClass('touchstarted');
                            var url = $(this).css('background-image').replace('_off.png', '_on.png');
                            $(this).css('background-image', url);
                            $('#none-choki').show();
                            $('#none-par').show();

            //                AudioPlayer.play('08_click.ogg');
                            
                            if($(this).hasClass('correct')){

                                $('#circle').show();
                                AudioPlayer.play('04_atari.ogg');

                            }else{
                                //-5すると0秒以下になる時
                                if (cnt <= 6) {
                                    cnt = 0;
                                    $.raiseALMemoryEvent("Iinari/Timer/TimeupFlg", "1");
                                }else{
                                    cnt = cnt - 5;
                                }
                                $("#countdown").text(cnt);
                                
                                $('#wrong').show();
                                $('#batsu').show();
                                $('#minus-5').show();
                                AudioPlayer.play('05_hazure.ogg');
                            }
                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 1);
                        }
                    },
                    'touchend': function () {
//                        if($(this).hasClass('touchstarted')){
//                            $(this).removeClass('touchstarted');
//                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 1);
//                        }
                    }
                });
                
                // チョキ
                $('#btn-choki').on({
                    'touchstart': function () {
                        if(event.touches.length == 1){
                            $('[id^=btn-disabled]').show();

//                            $(this).addClass('touchstarted');
                            var url = $(this).css('background-image').replace('_off.png', '_on.png');
                            $(this).css('background-image', url);
                            $('#none-goo').show();
                            $('#none-par').show();

            //                AudioPlayer.play('08_click.ogg');

                            if($(this).hasClass('correct')){

                                $('#circle').show();
                                AudioPlayer.play('04_atari.ogg');

                            }else{
                                //-5すると0秒以下になる時
                                if (cnt <= 6) {
                                    cnt = 0;
                                    $.raiseALMemoryEvent("Iinari/Timer/TimeupFlg", "1");
                                }else{
                                    cnt = cnt - 5;
                                }
                                $("#countdown").text(cnt);
                               
                                $('#wrong').show();
                                $('#batsu').show();
                                $('#minus-5').show();
                                AudioPlayer.play('05_hazure.ogg');
                            }
                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 2);
                        }
                    },
                    'touchend': function () {
//                        if($(this).hasClass('touchstarted')){
//                            $(this).removeClass('touchstarted');
//                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 2);
//                        }
                    }
                });
                // パー
                $('#btn-par').on({
                    'touchstart': function () {

                        if(event.touches.length == 1){
                            $('[id^=btn-disabled]').show();

//                            $(this).addClass('touchstarted');
                            var url = $(this).css('background-image').replace('_off.png', '_on.png');
                            $(this).css('background-image', url);
                            $('#none-goo').show();
                            $('#none-choki').show();

            //                AudioPlayer.play('08_click.ogg');

                            if($(this).hasClass('correct')){

                                $('#circle').show();
                                AudioPlayer.play('04_atari.ogg');

                            }else{
                                //-5すると0秒以下になる時
                                if (cnt <= 6) {
                                    cnt = 0;
                                    $.raiseALMemoryEvent("Iinari/Timer/TimeupFlg", "1");
                                }else{
                                    cnt = cnt - 5;
                                }
                                $("#countdown").text(cnt);
                                
                                $('#wrong').show();
                                $('#batsu').show();
                                $('#minus-5').show();
                                AudioPlayer.play('05_hazure.ogg');
                            }
                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 3);
                        }
                    },
                    'touchend': function () {
//                        if($(this).hasClass('touchstarted')){
//                            $(this).removeClass('touchstarted');
//                            $.raiseALMemoryEvent("Iinari/ImageChange/BtnAnswer", 3);
//                        }
                    }
                });

                // Game系ここまで //
                
                //init系
                startupStatus();
                //必須の画像のみ
                var introImages = ["title.png", "quit_off.png", "quit_on.png", "title/hard_line.png"];
                $.preload(introImages);
                setTimeout(function () {
                    changeScean("intro");
                    $.raiseALMemoryEvent("startYApp", "OK");
                }, 300);

            };
        }
    };
    return _self;
})(jQuery);
$(PEPPER.contents.init);
