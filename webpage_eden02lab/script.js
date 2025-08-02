// JAVASCRIPT - SCRIPT

document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navLinks = document.querySelectorAll('nav ul li a');
    const companyLogo = document.querySelector('.company-logo');


    // --- 햄버거 메뉴 관련 코드 추가 ---
    // 햄버거 메뉴 버튼과 nav 메뉴 요소를 선택합니다.
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('nav');

    // 햄버거 버튼 클릭 이벤트를 추가합니다.
    hamburgerBtn.addEventListener('click', () => {
        // hamburgerBtn과 navMenu에 'open' 클래스를 토글합니다.
        // 이 클래스를 통해 CSS에서 메뉴의 가시성을 제어합니다.
        hamburgerBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // FUNCTION - LOAD PAGE
    async function loadPage(sectionId) {
        
        // 모든 nav 링크에서 'active' 클래스 제거
        navLinks.forEach(link => link.classList.remove('active'));

        // 현재 섹션에 해당하는 nav 링크에 'active' 클래스 추가
        const activeLink = document.querySelector(`nav ul li a[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }


        // --- 페이지 로드 후 메뉴 닫기 로직 추가 ---
        // 모바일 환경에서 페이지를 로드하면 메뉴가 자동으로 닫히도록 합니다.
        if (hamburgerBtn.classList.contains('open')) {
            hamburgerBtn.classList.remove('open');
            navMenu.classList.remove('open');
        }

        // CALL HTML FILES
        try {
            const response = await fetch(`pages/${sectionId}.html`);
            if (!response.ok) {
                // 파일이 없거나 오류 발생 시 홈 페이지 로드 또는 오류 메시지 표시
                console.error(`Error loading page: ${sectionId}.html`, response.statusText);
                appContent.innerHTML = `
                    <section class="container">
                        <h2 style="color:red;">Unable to load the page.</h2>
                        <p>The page you requested (${sectionId})could not be found, please try again.</p>
                        <button class="back-button" data-section="home">Return to Home</button>
                    </section>
                `;
                 // 오류 발생 시 홈으로 돌아가기 버튼에 이벤트 리스너 연결
                const errorBackButton = appContent.querySelector('.back-button');
                if (errorBackButton) {
                    errorBackButton.addEventListener('click', (event) => {
                        loadPage(event.target.dataset.section);
                    });
                }
                return;
            }
            const htmlContent = await response.text();
            appContent.innerHTML = htmlContent;
            window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 스크롤


            // HOME - BUTTON - LEARN MORE
            if (sectionId === 'home') {
                const scrollToAboutBtn = document.getElementById('scrollToAboutBtn');
                if (scrollToAboutBtn) {
                    scrollToAboutBtn.addEventListener('click', () => {
                        loadPage('overview');
                    });
                }
            }

            // RESEARCH AREA - BUTTON - VIEW DETAILS
            if (sectionId === 'researchArea') {
                document.querySelectorAll('.brand-detail-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const brandId = event.target.dataset.brandId;
                        loadPage(brandId);
                    });
                });
            }

            // RESEARCH AREA - BUTTON - BACK TO RESEARCH AREA
            if (sectionId.startsWith('researchArea_') && sectionId.length > 5) {
                 const backButton = appContent.querySelector('.back-button'); // appContent 내에서 찾기
                 if (backButton) {
                    backButton.addEventListener('click', (event) => {
                        const targetSection = event.target.dataset.section;
                        loadPage(targetSection);
                    });
                 }
            }


            // CASE STUDIES - CARD EXPAND
            if (sectionId === 'caseStudies') {
                document.querySelectorAll('.result-item-card').forEach(card => {
                    card.addEventListener('click', () => {
                        card.classList.toggle('expanded');
                    });
                });
            }


        } catch (error) {
            console.error('Failed to load page:', error);
            appContent.innerHTML = `
                <section class="container">
                    <h2 style="color:red;">Unable to load the page.</h2>
                    <p>Please check your network connection or try again later.</p>
                    <button class="back-button" data-section="home">Return to Home</button>
                </section>
            `;

            // BUTTON - ERROR - BACK TO HOME
            const errorBackButton = appContent.querySelector('.back-button');
            if (errorBackButton) {
                errorBackButton.addEventListener('click', (event) => {
                    loadPage(event.target.dataset.section);
                });
            }
        }
    }

    // HEADER - CLICK - MENU
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // 기본 링크 동작 방지
            const sectionId = event.target.dataset.section;
            loadPage(sectionId);
            // URL 해시 업데이트 (뒤로가기/앞으로가기 버튼 동작을 위해)
            window.history.pushState(null, '', `#${sectionId}`);
        });
    });

    // HEADER - CLICK - EDEN02 LAB LOGO
    companyLogo.addEventListener('click', (event) => {
        event.preventDefault();
        loadPage('home');
        window.history.pushState(null, '', '#home');
    });

    // BROWSER - BUTTON - BACK/FORWARD
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash.substring(1); // '#' 제거
        if (hash) {
            loadPage(hash);
        } else {
            loadPage('home'); // 해시가 없으면 기본적으로 home
        }
    });

    // 초기 페이지 로드 (URL 해시가 있으면 해당 페이지, 없으면 Home)
    const initialSection = window.location.hash.substring(1);
    loadPage(initialSection || 'home'); // 초기 로드 시 해시가 없으면 'home'
});