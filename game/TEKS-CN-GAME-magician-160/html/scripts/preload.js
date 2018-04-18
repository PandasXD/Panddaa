$(function() {
  var delay = 0;
  function preLoadImage(imgUrl){
    imgUrl = imgUrl.toString();
    delay = 300;
    setTimeout(function(){
      var thisId = imgUrl.replace(".png","");
      thisId = thisId.replace(".jpg","");
      thisId = thisId.replace(".gif","");
      $(".preload-area").append("<div id="+thisId+" class='preload-imgs'><img src='images/"+imgUrl+"'/></div>");
    },delay);
  };

  $.subscribeToALMemoryEvent("startPreload", function(data){
    var datas = data.split(",");
    for(var i=0;i<datas.length;i++){
      preLoadImage(datas[i]);
    };
    $(".page").css("position", "static");
  });

});