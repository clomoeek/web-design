// '로그인' 버튼 클릭 시 실행되는 함수입니다.
function login() {

  // HTML에서 id가 "password"인 요소(입력 필드)의 값을 가져옵니다.
  const password = document.getElementById("password").value;

  // HTML에서 id가 "error-message"인 요소(오류 메시지를 표시할 p 태그)를 가져옵니다.
  const errorMessage = document.getElementById("error-message");

  // 실제 비밀번호를 설정합니다. 이 값과 입력된 비밀번호를 비교합니다.
  const correctPassword = "1234";

  // 입력된 비밀번호와 실제 비밀번호가 일치하는지 확인합니다.
  if (password === correctPassword) {

    // 비밀번호가 맞으면, 세션 스토리지에 "isLoggedIn"이라는 키와 "true"라는 값을 저장합니다.
    // 세션 스토리지는 브라우저가 켜져 있는 동안에만 데이터를 저장합니다.
    sessionStorage.setItem("isLoggedIn", "true");

    // 로그인이 성공했으므로 mainpage.html로 페이지를 이동시킵니다.
    window.location.href = "mainpage.html";

  } else {

    // 비밀번호가 틀렸으면, 오류 메시지를 표시하는 p 태그의 내용을 변경합니다.
    errorMessage.textContent = "비밀번호가 틀렸습니다.";

  }
}

// '로그아웃' 시 실행될 수 있는 함수입니다. (현재 HTML에는 로그아웃 버튼이 없습니다)
function logout() {

  // 세션 스토리지에서 "isLoggedIn" 키를 제거하여 로그인 상태를 해제합니다.
  sessionStorage.removeItem("isLoggedIn");

  // 로그인 페이지(index.html)로 페이지를 이동시킵니다.
  window.location.href = "index.html";
  
}
