function login() {
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
  
    const correctPassword = "1234"; // 원하는 비밀번호
  
    if (password === correctPassword) {
      sessionStorage.setItem("isLoggedIn", "true");
      window.location.href = "mainpage.html";
    } else {
      errorMessage.textContent = "비밀번호가 틀렸습니다.";
    }
  }

function logout() {
sessionStorage.removeItem("isLoggedIn");
window.location.href = "index.html";
}