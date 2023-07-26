$(document).ready(function () {
  $(".minimize").on("click", function () {
    minimize();
  });
  $(".maximize").on("click", function () {
    maximize();
  });
});

function minimize() {
  $("body").addClass("minimized");
}

function maximize() {
  $("body").removeClass("minimized");
}
