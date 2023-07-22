import "./blob";
// import "./window";
import "./button";
import "./win2";

$(document).ready(function () {
  // Simulate some loading time (you can adjust the time as needed)
  setTimeout(function () {
    // Hide the loader and show the main content with a fade-in effect
    $("#loader").css("opacity", "0");
    $("#main-content").removeClass("hidden").css("opacity", "1");
    $("#app").removeClass("hidden").css("opacity", "1");
  }, 3000); // 3 seconds (adjust the duration to suit your needs)
  setTimeout(function () {
    $("#loader").css("z-index", "-1");
  }, 2000);
  // $("#loader").css("z-index", "-1");
});
