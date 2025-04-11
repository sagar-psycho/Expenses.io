document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  const defaultUsername = localStorage.getItem("userUsername") || "admin";

  const defaultPassword = localStorage.getItem("userPassword") || "1234";

  if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const username = document.getElementById("username").value;
          const password = document.getElementById("password").value;

          if (username === defaultUsername && password === defaultPassword) {
              localStorage.setItem("isLoggedIn", "true");

              if (password === "1234") {
                  alert("Please change your password after login.");
                  localStorage.setItem("mustChangePassword", "true");
              }

              window.location.href = "main.html";
          } else {
              document.getElementById("loginError").textContent = "Invalid credentials!";
          }
      });
  }

  if (window.location.pathname.includes("main.html")) {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn !== "true") {
          window.location.href = "index.html";
      }
  }
});
