// script.js

// 전역 상태 관리
let folderStructure = {};
let allFiles = []; 
let allLinks = [];

// DOM 요소 캐싱
const fileListElement = document.getElementById('file-list');
const fileContentElement = document.getElementById('file-content');
const rightPanel = document.getElementById('right-panel');
const toggleGraphBtn = document.getElementById('toggle-graph-btn');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');

const container = document.getElementById('container');
const expandGraphBtn = document.getElementById('expand-graph-btn');
const restoreGraphBtn = document.getElementById('restore-graph-btn');
const mainPanelButtons = document.getElementById('main-panel-buttons');
const graphControls = document.getElementById('graph-controls');

window.updateGraph = null;
window.centerOnNode = null;
window.reloadGraph = null;
window.loadFileContent = loadFileContent;

// --- API 로드 및 초기화 ---
async function loadFolderStructure() {
    try {
        const response = await fetch('/api/folder-structure');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        folderStructure = await response.json();

        fileListElement.innerHTML = '';
        allFiles = [];
        allLinks = [];
        
        createFolderStructure(folderStructure, fileListElement); 
        
        await preloadAllFiles();

        const homeFile = allFiles.find(file => file.name === 'home.md');
        if (homeFile) {
            loadFileContent(homeFile.path, homeFile.name);
        }
    } catch (error) {
        console.error('폴더 구조 로드 실패:', error);
    }
}

// --- 파일 목록 생성 (재귀적) ---
function createFolderStructure(data, parentElement) {
    for (let key in data) {
        const value = data[key];

        if (typeof value === 'object') {
            const folderItem = document.createElement('li');
            folderItem.classList.add('folder-item');

            const folderName = document.createElement('span');
            folderName.classList.add('folder-name');
            folderName.textContent = key;
            
            const folderToggleBtn = document.createElement('button');
            folderToggleBtn.textContent = '＋';
            folderToggleBtn.classList.add('folder-toggle');
            
            const fileList = document.createElement('ul');
            fileList.style.display = 'none';

            folderToggleBtn.onclick = (event) => {
                event.stopPropagation();
                const isVisible = fileList.style.display === 'block';
                fileList.style.display = isVisible ? 'none' : 'block';
                folderToggleBtn.textContent = isVisible ? '＋' : '－';
            };

            folderItem.appendChild(folderName);
            folderItem.appendChild(folderToggleBtn);
            folderItem.appendChild(fileList);
            parentElement.appendChild(folderItem);

            createFolderStructure(value, fileList);
        } else if (typeof value === 'string' && value.endsWith('.md')) {
            const fileItem = document.createElement('li');
            fileItem.textContent = key.replace('.md', '');
            fileItem.classList.add('file');
            fileItem.onclick = () => {
                loadFileContent(value, key);
            };
            parentElement.appendChild(fileItem);

            allFiles.push({
                name: key,
                path: value,
                content: null,
                htmlContent: null
            });
        }
    }
}

// --- 파일 미리 로드 및 링크 추출 ---
async function preloadAllFiles() {
    const filePromises = allFiles.map(async (file) => {
        try {
            const response = await fetch(file.path);
            const text = await response.text();
            file.content = text;
            file.htmlContent = marked.parse(text);
            extractLinks(text, file.name);
        } catch (error) {
            console.error(`파일 로드 실패: ${file.path}`, error);
        }
    });

    await Promise.all(filePromises);
    console.log("모든 파일 로드 완료!");
    
    const nodes = allFiles.map(file => ({ id: file.name, path: file.path }));
    const links = allLinks;
    if (window.updateGraph) {
        window.updateGraph(nodes, links);
    }
}

// --- 링크 추출 함수 (Obsidian 스타일 링크 지원 추가) ---
function extractLinks(content, fileName) {
    const markdownRegex = /\[.*?\]\((.*?).md\)/g;
    let match;
    while ((match = markdownRegex.exec(content)) !== null) {
        const targetFileName = match[1] + ".md";
        addLinkIfNotExists(fileName, targetFileName);
    }

    const obsidianRegex = /\[\[(.*?)\]\]/g;
    while ((match = obsidianRegex.exec(content)) !== null) {
        const targetFileName = match[1].split('|')[0] + ".md";
        addLinkIfNotExists(fileName, targetFileName);
    }
}

function addLinkIfNotExists(source, target) {
    const isExistingLink = allLinks.some(link => 
        (link.source === source && link.target === target) ||
        (link.source === target && link.target === source)
    );
    if (!isExistingLink) {
        allLinks.push({ source: source, target: target });
    }
}

// --- 파일 내용 로드 및 표시 ---
function loadFileContent(filePath, fileName) {
    const fileData = allFiles.find(file => file.path === filePath);
    if (fileData && fileData.htmlContent) {
        displayFileContent(fileData.htmlContent);
        if (window.centerOnNode) {
            window.centerOnNode(fileName);
        }
    } else {
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const htmlContent = marked.parse(text);
                if (fileData) {
                    fileData.content = text;
                    fileData.htmlContent = htmlContent;
                }
                displayFileContent(htmlContent);
                if (window.centerOnNode) {
                    window.centerOnNode(fileName);
                }
            })
            .catch(error => console.error('파일 로드 실패:', error));
    }
}

// --- 파일 내용 표시 및 링크 핸들링 ---
function displayFileContent(content) {
    fileContentElement.innerHTML = content;
    
    const links = fileContentElement.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.md')) {
                event.preventDefault();
                const matchedFile = allFiles.find(file => file.name === href);
                if (matchedFile) {
                    loadFileContent(matchedFile.path, matchedFile.name);
                }
            }
        });
    });
}

// --- 검색 기능 ---
function searchFiles() {
    const searchText = searchInput.value.toLowerCase();
    
    if (searchText.length > 0) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    if (searchText !== '') {
        const searchResults = allFiles.filter(file => 
            file.name.toLowerCase().includes(searchText) ||
            (file.content && file.content.toLowerCase().includes(searchText))
        );
        
        fileListElement.innerHTML = '';
        searchResults.forEach(file => {
            const fileItem = document.createElement('li');
            fileItem.textContent = file.name.replace('.md', '');
            fileItem.classList.add('file');
            fileItem.onclick = () => {
                loadFileContent(file.path, file.name);
            };
            fileListElement.appendChild(fileItem);
        });
    } else {
        fileListElement.innerHTML = '';
        createFolderStructure(folderStructure, fileListElement);
    }
}

// --- 초기 실행 ---
document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener('input', searchFiles);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchFiles();
        searchInput.focus();
    });
    
    toggleGraphBtn.addEventListener('click', () => {
        if (rightPanel.style.display === 'flex') {
            rightPanel.style.display = 'none';
            toggleGraphBtn.textContent = '＜ Show Graph';
            expandGraphBtn.style.display = 'none';
            graphControls.style.display = 'none'; // 그래프 닫을 때 컨트롤도 숨김
        } else {
            rightPanel.style.display = 'flex';
            toggleGraphBtn.textContent = 'Hide Graph ＞';
            expandGraphBtn.style.display = 'block';
            graphControls.style.display = 'flex'; // 그래프 열 때 컨트롤도 보임
            if (window.reloadGraph) {
                window.reloadGraph();
            }
        }
    });

    expandGraphBtn.addEventListener('click', () => {
        container.classList.add('expanded-graph-layout');
        fileContentElement.style.display = 'none';
        
        mainPanelButtons.style.display = 'none'; // 기존 버튼들 숨김
        restoreGraphBtn.style.display = 'block'; // '원래대로' 버튼만 보임
        
        if (window.reloadGraph) {
            window.reloadGraph();
        }
    });

    restoreGraphBtn.addEventListener('click', () => {
        container.classList.remove('expanded-graph-layout');
        fileContentElement.style.display = 'block';

        mainPanelButtons.style.display = 'flex'; // 기존 버튼들 다시 보임
        restoreGraphBtn.style.display = 'none'; // '원래대로' 버튼 숨김

        if (window.reloadGraph) {
            window.reloadGraph();
        }
    });

    loadFolderStructure();

    rightPanel.style.display = 'flex';
    toggleGraphBtn.textContent = 'Hide Graph ＞';
    expandGraphBtn.style.display = 'block';
    graphControls.style.display = 'flex';

    const checkD3GraphLoaded = setInterval(() => {
        if (window.reloadGraph) {
            window.reloadGraph();
            clearInterval(checkD3GraphLoaded);
        }
    }, 100);
});