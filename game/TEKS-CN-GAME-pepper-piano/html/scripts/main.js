$(function () {
	//画面きりかえ
	//*
 	$.subscribeToALMemoryEvent("showPiano", function (data) {
    	$("#piano").show();
	});
  	$.subscribeToALMemoryEvent("hidePiano", function (data) {
    	$("#piano").hide();
  	});
 	$.subscribeToALMemoryEvent("showTitle", function (data) {
    	$("#title").show();
	});
  	$.subscribeToALMemoryEvent("hideTitle", function (data) {
    	$("#title").hide();
  	});

  	//エンドボタン
	$("#end_btn").on("touchstart", function(){
		$.raiseALMemoryEvent("pianoEnd",0);
	})
	//*/
	var isTouch = ('ontouchstart' in window);
	var geoms = new Array();
	var old_key = "";
	var new_keys = [];
	var keys = [];
	initGeometry();

	// $("#page").on("touchstart",function(e) {
	// 	$.raiseALMemoryEvent("pianoStartTrack",isTouch);
	// });
	// $("#page").on("touchmove",onMoveHandler);
	$("#piano").on("touchstart",onTouchDownHandler);
	$("#piano").on("touchend",onTouchUpHandler);
	$("#piano").on("touchmove",onTouchMoveHandler);

	$("#white_kye_all").on("touchstart",function(e){
		e.preventDefault();
	});
	$("#black_kye_all").on("touchstart",function(e){
		e.preventDefault();
	});

	timer = setInterval(update, 30);

	/*
	 * 鍵盤の座標を初期化する
	 */
	function initGeometry() {
		var blacks = $("#black_kye_all div");
		var whites = $("#white_kye_all div");
		for (var i = blacks.length - 1; i >= 0; i--) {
			var g = new KeyGeometry($(blacks[i]));
			geoms.push(g);
		};
		for (var i = whites.length - 1; i >= 0; i--) {
			var g = new KeyGeometry($(whites[i]));
			geoms.push(g);
		};
	}

	/*
	 * 追跡開始
	 */
	function onTouchDownHandler(e) {
		// debug("onTouchDownHandler : "+e.type);
		// e.preventDefault();
		process(e);
		// $.raiseALMemoryEvent("pianoStartTrack",0);
	}
	/*
	 * 追跡終了
	 */
	function onTouchUpHandler(e) {
		// debug("onTouchUpHandler : "+e.type);
		// e.preventDefault();
		process(e);
		// $("#page").off("touchmove",onTouchMoveHandler);
		// $.raiseALMemoryEvent("pianoStopTrack",0);
	}
	/*
	 * ドラッグ
	 */
	function onTouchMoveHandler(e) {
		// debug("onTouchMoveHandler : "+e.type);
		// e.preventDefault();
		process(e);
	}


	/*
	 * 鍵盤を検出
	 */
	 function process(e) {
		// debug(e.type+" : "+$(e.target).parent().attr("id"));
		var touches = getTouches(e);
		var new_keys = [];	//現在押されている鍵盤
		for (var i = touches.length - 1; i >= 0; i--) {
			var o = touches[i];
			var id = getKey(o.x, o.y);
			if(id != "") {
				if($.inArray(id, keys) == -1 && e.type != "touchend") {
				 	dispatchTouch(id);
				}
				new_keys.push(id);
			}
		};
		keys = new_keys;
	 }

	 function update() {

		resetKeys();
		setKeys(keys);
	 }

	 function debug(text) {
	 	return;
		$("#debugger").html(text+"<br />"+$("#debugger").html());
	 }


	/*
	 * 押されている座標の配列を取得
	 */
	function getTouches(e) {
		var touches = [];
		if(isTouch) {
			for (var i = e.originalEvent.touches.length - 1; i >= 0; i--) {
				var o = {x:e.originalEvent.touches[i].pageX,y:e.originalEvent.touches[i].pageY};
				touches.push(o);
			};
		}else{
			touches.push({x:e.pageX,y:e.pageY});
		}
		return touches;
	}
	/*
	 * ペッパー側にイベントを送る
	 */
	function dispatchTouch(id) {
		var index = $("#"+id).index();
		if(id.indexOf("white") != -1) {
			$.raiseALMemoryEvent("playSound0",index);
		}else if(id.indexOf("black") != -1){
			$.raiseALMemoryEvent("playSound1",index);
		}
	}
	/*
	 * 表示をリセット
	 */
	function resetKeys() {
		$("img.def").css("display", "block");
	}
	/*
	 * 表示をセット
	 */
	function setKeys(arr) {
		for (var i = 0; i < arr.length; i++) {
			var id = arr[i];
			$("#"+id+" img.def").css("display", "none");
		};
	}
	/*
	 * タッチしている鍵盤のIDを返す
	 */
	function getKey(x, y) {
		var str = "";
		for (var i = 0; i < geoms.length; i++) {
			var g = geoms[i];
			if(g.isInclude(x, y)) {
				str = g.name;
				break;
			}
		};
		return str;
	}
});




var KeyGeometry = (function() {
  /*
   * constructor
   * dom:jQueryオブジェクト
   */
  var KeyGeometry = function(dom) {
  	this.dom = dom;
  	this.name = dom.attr('id');
    this.x = dom.position().left;
    this.y = dom.position().top;
    this.w = dom.width();
    this.h = dom.height();
  };
  var p = KeyGeometry.prototype;
  /*
   * 点(_x,_y)を内包するかどうか
   */
  p.isInclude = function(_x, _y) {
  	var b =  _x >= this.x;
  	b = b && ( _x <= this.x + this.w );
  	b = b && ( _y >= this.y );
  	b = b && ( _y <= this.y + this.h );
  	return b;
  }
  return KeyGeometry;
})();