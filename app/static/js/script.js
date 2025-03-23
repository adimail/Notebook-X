document.addEventListener("DOMContentLoaded", function () {
  const flashContainer = document.getElementById("flash-message-container");
  if (flashContainer) {
    setTimeout(() => {
      flashContainer.style.transition = "opacity 0.5s ease-in-out";
      flashContainer.style.opacity = "0";
      setTimeout(() => {
        flashContainer.style.display = "none";
      }, 500);
    }, 3000);
  }
});
