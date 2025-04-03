


let folderStructure = {}; // JSON 데이터 저장 변수
let allFiles = []; // 모든 파일 정보 저장

const fileListElement = document.getElementById('file-list');
const fileContentElement = document.getElementById('file-content');

// JSON 파일 로드
async function loadFolderStructure() {
    try {
        const response = await fetch('folderStructure.json');
        folderStructure = await response.json();
        createFolderStructure(); // 데이터 로드 후 트리 생성
        await preloadAllFiles(); // 모든 파일 미리 로드

        // home.md 자동 로드
        const homeFile = allFiles.find(file => file.name === 'home.md');
        if (homeFile) {
            loadFileContent(homeFile.path, homeFile.name);
        }
    } catch (error) {
        console.error('폴더 구조 로드 실패:', error);
    }
}

// 폴더와 파일 목록을 트리 형태로 생성
function createFolderStructure() {
    fileListElement.innerHTML = ''; // 기존 목록 초기화
    allFiles = []; // 기존 파일 목록 초기화

    for (let folder in folderStructure) {
        const folderItem = document.createElement('li');
        folderItem.classList.add('folder-item');

        // 폴더 이름
        const folderName = document.createElement('span');
        folderName.classList.add('folder-name');
        folderName.textContent = folder;

        // 폴더 열기/닫기 버튼
        const folderToggleBtn = document.createElement('button');
        folderToggleBtn.textContent = '+';
        folderToggleBtn.classList.add('folder-toggle');
        
        const fileList = document.createElement('ul');
        fileList.style.display = 'none';

        for (let file in folderStructure[folder]) {
            const fileItem = document.createElement('li');
            fileItem.textContent = file.replace('.md', '');  
            fileItem.classList.add('file');

            fileItem.onclick = () => loadFileContent(folderStructure[folder][file], file);
            fileList.appendChild(fileItem);

            // 파일 정보 저장
            allFiles.push({
                name: file,
                path: folderStructure[folder][file],
                content: null
            });
        }

        // 폴더 토글 기능
        folderToggleBtn.onclick = () => {
            const isVisible = fileList.style.display === 'block';
            fileList.style.display = isVisible ? 'none' : 'block';
            folderToggleBtn.textContent = isVisible ? '+' : '↑';
        };

        folderItem.appendChild(folderName);
        folderItem.appendChild(folderToggleBtn);
        folderItem.appendChild(fileList);
        fileListElement.appendChild(folderItem);
    }
}

// 모든 파일을 미리 로드하여 content 채우기
async function preloadAllFiles() {
    const filePromises = allFiles.map(async (file) => {
        try {
            const response = await fetch(file.path);
            const text = await response.text();
//            file.content = text.toLowerCase(); // 소문자로 변환하여 저장
            file.content = marked.parse(text); // 소문자로 변환하여 저장
        } catch (error) {
            console.error(`파일 로드 실패: ${file.path}`, error);
        }
    });

    await Promise.all(filePromises);
    console.log("모든 파일 로드 완료!");
}


// MD 파일 내용을 로드하고 HTML로 변환 후 표시
//function loadFileContent(filePath, fileName) {
//    const fileData = allFiles.find(file => file.path === filePath);
//    if (fileData.content) {
//        displayFileContent(fileData.content);
//        return;
//    }
//
//    fetch(filePath)
//        .then(response => response.text())
//       .then(text => {
//            fileData.content = marked.parse(text); // 마크다운 변환
//            displayFileContent(fileData.content);
//        })
//        .catch(error => console.error('파일 로드 실패:', error));
//}

function loadFileContent(filePath, fileName) {
    const fileData = allFiles.find(file => file.path === filePath);
    if (fileData.content) {
        displayFileContent(fileData.content); // 이미 변환된 HTML 사용
        return;
    }

    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            const htmlContent = marked.parse(text);
            fileData.content = htmlContent; // 변환된 HTML 저장
            displayFileContent(htmlContent);
        })
        .catch(error => console.error('파일 로드 실패:', error));
}



// 파일 내용 HTML로 표시 + 내부 링크 핸들링
function displayFileContent(content) {
//    fileContentElement.innerHTML = content; // HTML 삽입
    fileContentElement.innerHTML = marked.parse(content); // HTML 삽입

    const links = fileContentElement.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (href && href.endsWith('.md')) {
                event.preventDefault(); // 기본 이동 방지

                const matchedFile = allFiles.find(file => file.name === href);
                if (matchedFile) {
                    loadFileContent(matchedFile.path, matchedFile.name);
                }
            }
        });
    });
}


// 검색 기능
async function searchFiles() {
    const searchText = document.getElementById('search-input').value.toLowerCase();

    if (searchText === '') {
        updateFileList(allFiles, true);
        return;
    }

    // 파일이 미리 로드되지 않았다면 로드 후 검색 실행
    const unloadedFiles = allFiles.filter(file => file.content === null);
    if (unloadedFiles.length > 0) {
        await preloadAllFiles();
    }

    // 검색어 포함된 파일 찾기
    const matchingFiles = allFiles.filter(file => file.content.includes(searchText));
    updateFileList(matchingFiles, false);
}

// 파일 목록 업데이트
function updateFileList(files, preserveHierarchy) {
    fileListElement.innerHTML = '';

    if (preserveHierarchy) {
        createFolderStructure();
    } else {
        files.forEach(file => {
            const folder = Object.keys(folderStructure).find(folderName =>
                folderStructure[folderName][file.name] === file.path
            );

            const folderItem = document.createElement('li');
            folderItem.classList.add('folder-item');

            const folderName = document.createElement('span');
            folderName.classList.add('folder-name');
            folderName.textContent = folder;

            const fileList = document.createElement('ul');

            const fileItem = document.createElement('li');
            fileItem.textContent = file.name.replace('.md', '');
            fileItem.classList.add('file');
            //fileItem.onclick = () => displayFileContent(file.content);
            fileItem.onclick = () => displayFileContent(marked.parse(file.content));
            fileList.appendChild(fileItem);

            folderItem.appendChild(folderName);
            folderItem.appendChild(fileList);
            fileListElement.appendChild(folderItem);
        });
    }
}


// 초기 실행
loadFolderStructure();




/*
let folderStructure = {}; // JSON 데이터 저장 변수
let allFiles = []; // 모든 파일 정보 저장

const fileListElement = document.getElementById('file-list');
const fileContentElement = document.getElementById('file-content');

// JSON 파일 로드
async function loadFolderStructure() {
    try {
        const response = await fetch('folderStructure.json');
        folderStructure = await response.json();
        createFolderStructure(); // 데이터 로드 후 트리 생성
        await preloadAllFiles(); // 모든 파일 미리 로드

        // home.md 자동 로드
        const homeFile = allFiles.find(file => file.name === 'home.md');
        if (homeFile) {
            loadFileContent(homeFile.path, homeFile.name);
        }
    } catch (error) {
        console.error('폴더 구조 로드 실패:', error);
    }
}

// 폴더와 파일 목록을 트리 형태로 생성
function createFolderStructure() {
    fileListElement.innerHTML = ''; // 기존 목록 초기화
    allFiles = []; // 기존 파일 목록 초기화

    for (let folder in folderStructure) {
        const folderItem = document.createElement('li');
        folderItem.classList.add('folder-item');

        // 폴더 이름
        const folderName = document.createElement('span');
        folderName.classList.add('folder-name');
        folderName.textContent = folder;

        // 폴더 열기/닫기 버튼
        const folderToggleBtn = document.createElement('button');
        folderToggleBtn.textContent = '+';
        folderToggleBtn.classList.add('folder-toggle');
        
        const fileList = document.createElement('ul');
        fileList.style.display = 'none';

        for (let file in folderStructure[folder]) {
            const fileItem = document.createElement('li');
            fileItem.textContent = file.replace('.md', '');  
            fileItem.classList.add('file');

            fileItem.onclick = () => loadFileContent(folderStructure[folder][file], file);
            fileList.appendChild(fileItem);

            // 파일 정보 저장
            allFiles.push({
                name: file,
                path: folderStructure[folder][file],
                content: null
            });
        }

        // 폴더 토글 기능
        folderToggleBtn.onclick = () => {
            const isVisible = fileList.style.display === 'block';
            fileList.style.display = isVisible ? 'none' : 'block';
            folderToggleBtn.textContent = isVisible ? '+' : '↑';
        };

        folderItem.appendChild(folderName);
        folderItem.appendChild(folderToggleBtn);
        folderItem.appendChild(fileList);
        fileListElement.appendChild(folderItem);
    }
}

// 모든 파일을 미리 로드하여 content 채우기
async function preloadAllFiles() {
    const filePromises = allFiles.map(async (file) => {
        try {
            const response = await fetch(file.path);
            const text = await response.text();
            file.content = marked.parse(text);
        } catch (error) {
            console.error(`파일 로드 실패: ${file.path}`, error);
        }
    });

    await Promise.all(filePromises);
    console.log("모든 파일 로드 완료!");
}

// MD 파일 내용을 로드하고 HTML로 변환 후 표시
function loadFileContent(filePath, fileName) {
    const fileData = allFiles.find(file => file.path === filePath);
    if (fileData.content) {
        displayFileContent(fileData.content); // 이미 변환된 HTML 사용
        return;
    }

    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            const htmlContent = marked.parse(text);
            fileData.content = htmlContent; // 변환된 HTML 저장
            displayFileContent(htmlContent);
        })
        .catch(error => console.error('파일 로드 실패:', error));
}

// 파일 내용 HTML로 표시 + 내부 링크 핸들링
function displayFileContent(content) {
    fileContentElement.innerHTML = content; // HTML 삽입

    const links = fileContentElement.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (href && href.endsWith('.md')) {
                event.preventDefault(); // 기본 이동 방지

                const matchedFile = allFiles.find(file => file.name === href);
                if (matchedFile) {
                    loadFileContent(matchedFile.path, matchedFile.name);
                }
            }
        });
    });
}

// 초기 실행
loadFolderStructure();
*/