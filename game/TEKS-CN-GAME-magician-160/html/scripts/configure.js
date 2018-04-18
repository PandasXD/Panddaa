$(function() {
  $("body").on("touchstart touchmove touchend",function(event){  
    event.preventDefault();
    event.stopPropagation();
  });

  $.raiseALMemoryEvent("startYApp","OK");
});