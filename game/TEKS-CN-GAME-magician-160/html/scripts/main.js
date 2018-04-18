$(function() {

  function scrollPosition(data){
    data = data.toString();
    var position = $("#"+data).position();
    $('body').scrollTop(position.top);
  };

  $.subscribeToALMemoryEvent("imageChange", function (data) {
    scrollPosition(data);
  });
  
});
