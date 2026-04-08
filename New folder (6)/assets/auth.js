(function studentLogin(window, document) {
  "use strict";

  var platform = window.NQVod;

  if (!platform) {
    return;
  }

  var form = document.getElementById("studentLoginForm");
  var emailInput = document.getElementById("studentEmail");
  var passwordInput = document.getElementById("studentPassword");
  var message = document.getElementById("studentLoginMessage");

  if (!form || !emailInput || !passwordInput || !message) {
    return;
  }

  form.addEventListener("submit", function onSubmit(event) {
    event.preventDefault();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
      message.textContent = "Enter both email and password to continue.";
      return;
    }

    window.sessionStorage.setItem("nq-vod-student-auth", "true");
    window.sessionStorage.setItem("nq-vod-student-email", email);
    window.location.href = "../../index.html#student-hub";
  });
})(window, document);
