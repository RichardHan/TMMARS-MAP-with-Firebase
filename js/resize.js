var windowX=0;
var windowY=0;
var currentScale=1;
var minScale=1
var maxScale=3;
var scaleIncrement=.5;
var moveIncrement=100;
var containerW = $("#container").width();
var containerH = $("#container").height();

$(window).resize(function() {
  console.log("window.resize");
  $("#map").css("width", $(window).width());
  $("#map").css("height", $(window).width()*400/1000.0);
  containerW = $("#container").width();
  containerH = $("#container").height();
  map.layoutHTMLElements();
});
$(document).ready(function() {
  $("#map").css("width", $(window).width());
  $("#map").css("height", $(window).width()*400/1000.0);
  containerW = $("#container").width();
  containerH = $("#container").height();
  map.init();
});