/* global $,jQuery,setTimeout,setInterval,clearInterval,AudioPlayer:false */
var PEPPER = PEPPER || {};
var pepper_onStart = {};

PEPPER.contents = (function ($) {
    var START = 'touchstart',
        END = 'touchend';
    var currentScean = "intro";
    var mode;
    var queNum = 1; //第〇問

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
            $.raiseALMemoryEvent("OnePair/quit", "");
            AudioPlayer.play("click.ogg");
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
            AudioPlayer.play("click.ogg");

            //モード設定は済み
            $.raiseALMemoryEvent("OnePair/intro/start", mode);
        }
    };
    //normalボタン押下時
    var normal = function () {
        if ($._data($("#normal_btn").get(0)).events) {
            allBtnOff();
            $("#normal_btn").css("background-image", "url(images/normal_btn_on.png)");
            AudioPlayer.play("click.ogg");
            //モード設定
            mode = "normal";
            $.raiseALMemoryEvent("OnePair/intro/start", mode);

        }
    };

    //hardボタン押下時
    var hard = function () {
        if ($._data($("#hard_btn").get(0)).events) {
            allBtnOff();
            $("#hard_btn").css("background-image", "url(images/hard_btn_on.png)");
            AudioPlayer.play("click.ogg");

            //モード設定
            mode = "hard";
            $.raiseALMemoryEvent("OnePair/intro/start", mode);

        }
    };

    //hardボタンロック押下時
    var hard_lock = function () {
        if ($._data($("#hard_lock_btn").get(0)).events) {
            $("#hard_lock_btn").off();
            $("#cover").show();
            $("#hard_lock_btn").css("background-image", "url(images/key_btn_on.png)");
            AudioPlayer.play("click.ogg");
            setTimeout(function () {
                $("#hard_pop").show();
                $.raiseALMemoryEvent("OnePair/intro/hardLock", "");
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
                $("#hard_lock_btn").css("background-image", "url(images/key_btn_off.png)");
                $("#close_hard_pop").css("background-image", "url(images//hard_pop/close_btn_off.png)");
                $("#close_hard_pop").off();
                $("#close_hard_pop").on(START, closeHardPop);
                $("#hard_lock_btn").off();
                $("#hard_lock_btn").on(START, hard_lock);
                $("#cover").hide();
                $.raiseALMemoryEvent("OnePair/intro/hardLockClose", "");
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
            memory.getData('OnePair/startupStatus').then(function (data1) {
                startup_status = data1;
                memory.getData('OnePair/modeStatus').then(function (data2) {
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
                    memory.getData('OnePair/userId').then(function (data3) {
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

            $.raiseALMemoryEvent("OnePair/intro/setumei", "");
            AudioPlayer.play("click.ogg");
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
        $.raiseALMemoryEvent("OnePair/intro/setumeiCancel", "");
        AudioPlayer.play("click.ogg");
    };


    ///異常終了系（タイムアウト、顔認識できないとか
    var abend = function () {
        //終了ボタンを押下にしてカバー表示して終了する
        $("#quit").css("background-image", "url(images/quit_on.png)");
        $("#cover").show();
    };


    ///例題系//////////////////////////////////////////////////////////////
    //例題の表示
    var reidaiShow = function () {
        $("#reidai").show();
    };

    //例題を非表示
    var reidaiHide = function () {
        $("#reidai").hide();
        setTimeout(function () {
            reidaiReset();
        }, 500);
    };


    //例題の左上を赤色に
    var reidaiLeftRed = function () {
        $("#atari1").addClass("reidaiRed");
    };

    //例題の右下を赤色に
    var reidaiRightRed = function () {
        $("#atari2").addClass("reidaiRed");
    };

    //例題の右下を赤色に
    var reidaiActive = function () {
        $("#atari1").addClass("active");
        $("#atari2").addClass("active");
    };


    //例題のリセット
    var reidaiReset = function () {
        $("#atari1").removeClass("reidaiRed");
        $("#atari2").removeClass("reidaiRed");
        $("#atari1").removeClass("active");
        $("#atari2").removeClass("active");
        $("#reidai_jisan1").hide();
        $("#reidai_jisan2").hide();
    };


    ///game系//////////////////////////////////////////////////////////////

    var queslist = [
		["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
		//["ａ","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
		["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"],
		["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"],
		["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png", "08.png", "09.png", "10.png", "11.png", "12.png", "13.png", "14.png", "15.png", "16.png", "17.png", "18.png", "19.png", "20.png", "21.png", "22.png", "23.png", "24.png", "25.png", "26.png", "27.png", "28.png", "29.png", "30.png", "31.png", "32.png", "33.png", "34.png", "35.png", "36.png"]
	];

    /* listのシャッフル */
    function shuffle(array) {
        var n = array.length,
            t, i;
        while (n) {
            i = Math.floor(Math.random() * n--);
            t = array[n];
            array[n] = array[i];
            array[i] = t;
        }
        return array;
    }

    
    /* 出題処理 */
    var answer;
    var queslen;
    var imageFlag = false;
    var quesgenre = [0, 1, 2, 3, 4];
    shuffle(quesgenre);

    var genrenum;
    var genrelist = ["map/", "niko/"];
    var levellist = {
        4: "normal",
        6: "hard"
    };


    function setQestion(level) { //level: 4 or 6
        //イメージフラグ初期化
        imageFlag = false;
        //タイマーの色初期化
        $("#timer p").css("color", "#ee7d04");
        //背景赤とカバーを初期化
        $("#cover").hide();
        $("#game").css("background-image", "url(images/game_bg.png)");
        $("#correct").hide();
        //第〇問set
        $("#count span").html(queNum);
        queNum++;

        queslen = level * level;

        //0:A  1:あ  2:ア  3::map  4:nico
        var quesnum = quesgenre.pop();

        //画像の場合、値を調整
        if (quesnum >= 3) {
            genrenum = quesnum - 3;
            quesnum = 3;
            imageFlag = true;
        }

        var quesall = shuffle(queslist[quesnum]);
        var question = quesall.slice(0, (queslen - 1));
        var correctnum = Math.floor(Math.random() * queslen - 1);
        if (correctnum == -1) {
            correctnum = 0;
        }
        answer = question[correctnum];
        question.push(question[correctnum]);

        var data = shuffle(question);
        var count = 0;
        if (!imageFlag) {
            for (var i = 0; i < level; i++) {
                for (var j = 0; j < level; j++) {
                    $(".list" + i + "> .ans" + j).html("<p>" + data[count] + "</p>");
                    if (answer == data[count]) {
                        $(".list" + i + "> .ans" + j + " p").addClass("answer");
                    }
                    count++;
                }
            }
        } else {
            for (var i = 0; i < level; i++) {
                for (var j = 0; j < level; j++) {
                    $(".list" + i + "> .ans" + j).html('<img class="' + levellist[level] + '" src="images/question/' + genrelist[genrenum] + data[count] + '"/>');
                    if (answer == data[count]) {
                        $(".list" + i + "> .ans" + j + " img").addClass("answer");
                    }
                    count++;
                }
            }
        }
    }

    /* 要素押下処理 */
    var timeoutTimer;
    var td_on = function () {
        //$(this).off();
        var thisState = this;
        var ptag = $(thisState).context.lastChild;
        AudioPlayer.play("click.ogg");

        /* あたり判定 */
        if ($(ptag).text() == answer || String(ptag.src).indexOf(answer) != -1) {
            $("td").off();
            clearInterval(timeoutTimer);
            $("#correct").show();
            $.raiseALMemoryEvent("OnePair/game/atari", cnt);
        } else {
            //はずれ判定
            //背景青く
            $("#cover").show();
            $("#minus5").show();
            $("#game").css("background-image", "url(images/incorrectanswer.png)");
            $(thisState).append('<img id="hazure" src="images/hazure.png">');
            AudioPlayer.play("hazure.ogg");
            //はずれ-5秒
            if (cnt - 5 > 0) {
                cnt = cnt - 5;
                //-5秒で5以下になったら赤色に
                if (cnt <= 5) {
                    $("#timer p").css("color", "#f21a1a");
                }
                $("#timer p").text(cnt);

                //背景青 + ×を消す
                setTimeout(function () {
                    $("#cover").hide();
                    $("#minus5").hide();
                    $("#hazure").remove();
                    $("#game").css("background-image", "url(images/game_bg.png)");
                }, 500);
            } else {
                //-5秒で0秒以下になった時
                clearInterval(timeoutTimer);
                $("td").off();
                cnt = 0;
                $("#timer p").text(cnt);
                //背景青 + ×を消す
                setTimeout(function () {
                    $("#timeup").show();
                    $("#cover").hide();
                    $("#minus5").hide();
                    $("#hazure").remove();
                    $("#game").css("background-image", "url(images/game_bg.png)");
                    $.raiseALMemoryEvent("OnePair/game/timeout", "");
                }, 500);
            }
        }
    };


    var cnt = 20;
    /* カウントダウン処理 */
    function startTimeout(count) {
        cnt = count;
        $("#timer p").text(cnt);
        timeoutTimer = setInterval(function () {
            cnt--;
            $("#timer p").text(cnt);
            if (cnt === 0) {
                //-1インターバルで0秒になった時
                $("td").off();
                clearInterval(timeoutTimer);
                $("#timeup").show();
                $.raiseALMemoryEvent("OnePair/game/timeout", "");
                return;
            } else if (cnt > 5) {
                AudioPlayer.play("count_default.ogg");
                $("#timer p").css("color", "#ee7d04");
            } else {
                AudioPlayer.play("count_last.ogg");
                $("#timer p").css("color", "#f21a1a");
            }
        }, 1000);
    }


    //あたり表示
    var showAtari = function () {
        $("#timeup").hide();
        $("p.answer, img.answer").addClass("active");
    };

    //ゲームスタート or 再スタート。5回しか実行できない
    function gameRestart() {
        if (mode === "normal") {
            setQestion(4);
            $("#normal").css("display", "inline-table");
        } else {
            setQestion(6);
            $("#hard").css("display", "inline-table");
        }

        $("#game td").on(START, td_on);
        startTimeout(20);
    }


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
        $.raiseALMemoryEvent("OnePair/changeRanking", "start");
    };



    var showRanking = function (data) {
        $('#ranking_off').off();

        //ボタン押下状態に
        $("#ranking_off").css("visibility", "hidden");
        $("#ranking_on").css("visibility", "visible");

        //データを表示
        var ranking = $.parseJSON(data[0] || "null");
        var user_best = $.parseJSON(data[1] || "null");
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
        ranking_select_flag = "normal";
        AudioPlayer.play("click.ogg");
        $("#ranking_normal_btn_on").css("visibility", "visible");
        $("#ranking_normal_btn_off").css("visibility", "hidden");
        $("#ranking_hard_btn_on").css("visibility", "hidden");
        $("#ranking_hard_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("OnePair/changeRanking", ranking_select_flag);
    });

    //ランキング ハードへボタン
    $("#ranking_hard_btn_off").on(START, function () {
        ranking_select_flag = "hard";
        AudioPlayer.play("click.ogg");
        $("#ranking_hard_btn_on").css("visibility", "visible");
        $("#ranking_hard_btn_off").css("visibility", "hidden");
        $("#ranking_normal_btn_on").css("visibility", "hidden");
        $("#ranking_normal_btn_off").css("visibility", "visible");
        $.raiseALMemoryEvent("OnePair/changeRanking", ranking_select_flag);
    });

    //ランキング終了ボタンノーマル
    $("#rank_end_off_normal").on(START, function () {
        $("#cover").show();
        $("#rank_end_on_normal").css("visibility", "visible");
        $("#rank_end_off_normal").css("visibility", "hidden");
        AudioPlayer.play("click.ogg");
        setTimeout(function () {
            rank_view_reset();
            $.raiseALMemoryEvent("OnePair/rankingEnd", "");
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
            $.raiseALMemoryEvent("OnePair/rankingEnd", "");
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

                $.subscribeToALMemoryEvent("OnePair/abend", abend);

                $.subscribeToALMemoryEvent("OnePair/intro/dialogStart", start);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogNormal", normal);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogHard", hard);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogSetumei", setumei);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogQuit", quit);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogRanking", dialogStartRanking);
                $.subscribeToALMemoryEvent("OnePair/intro/dialogHardLock", hard_lock);

                $.subscribeToALMemoryEvent("OnePair/intro/reidai/reidaiShow", reidaiShow);
                $.subscribeToALMemoryEvent("OnePair/intro/reidai/reidaiHide", reidaiHide);
                $.subscribeToALMemoryEvent("OnePair/intro/reidai/reidaiLeftRed", reidaiLeftRed);
                $.subscribeToALMemoryEvent("OnePair/intro/reidai/reidaiRightRed", reidaiRightRed);
                $.subscribeToALMemoryEvent("OnePair/intro/reidai/reidaiActive", reidaiActive);

                $.subscribeToALMemoryEvent("OnePair/intro/setumeiView", setumeiView);
                $.subscribeToALMemoryEvent("OnePair/intro/setumeiStart", setumeiStart);

                $.subscribeToALMemoryEvent("OnePair/game/gameRestart", gameRestart);
                $.subscribeToALMemoryEvent("OnePair/game/showAtari", showAtari);
                $.subscribeToALMemoryEvent("OnePair/game/answerEnd", answerEnd);

                $.subscribeToALMemoryEvent("OnePair/startupStatus", startupStatus);

                $.subscribeToALMemoryEvent("OnePair/showRanking", showRanking);

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
