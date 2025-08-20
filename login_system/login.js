// '로그인' 버튼 클릭 시 실행되는 함수입니다.
function login() {

  // HTML에서 ID가 "PASSWORD"인 요소(입력 필드)의 값을 가져옵니다.
  const password = document.getElementById("password").value;

  // HTML에서 ID가 "ERROR-MESSAGE"인 요소(오류 메시지를 표시할 P 태그)를 가져옵니다.
  const errorMessage = document.getElementById("error-message");

  // 실제 비밀번호를 설정합니다. 이 값과 입력된 비밀번호를 비교합니다.
  const correctPassword = "1234";

  // 입력된 비밀번호와 실제 비밀번호가 일치하는지 확인합니다.
  if (password === correctPassword) {

    // 비밀번호가 맞으면 SESSION STORAGE에 "ISLOGGEDIN"이라는 KEY와 "TRUE"라는 값을 저장합니다.
    // SESSION STORAGE는 브라우저가 열려 있는 동안에만 데이터를 저장합니다.
    sessionStorage.setItem("isLoggedIn", "true");

    // 로그인이 성공했으므로 MAINPAGE.HTML로 페이지를 이동시킵니다.
    window.location.href = "mainpage.html";

  } else {

    // 비밀번호가 틀리면 오류 메시지를 표시하는 P 태그의 내용을 변경합니다.
    errorMessage.textContent = "비밀번호가 틀렸습니다.";

  }
}

// '로그아웃' 시 실행될 수 있는 함수입니다. (현재 HTML에는 로그아웃 버튼이 없습니다)
function logout() {

  // SESSION STORAGE에서 "ISLOGGEDIN" KEY를 제거하여 로그아웃 처리합니다.
  sessionStorage.removeItem("isLoggedIn");

  // 로그인 페이지(INDEX.HTML)로 페이지를 이동시킵니다.
  window.location.href = "index.html";
  
}