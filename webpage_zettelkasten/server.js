// SERVER 초기설정 - TERMINAL
// 1. npm init -y
// 2. npm install express

// SERVER 실행 - TERMINAL
// 1. node server.js
// 2. http://localhost:3000 실행

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 클라이언트가 요청하는 정적 파일(HTML, CSS, JS 등)을 제공
app.use(express.static(path.join(__dirname)));

// 마크다운 파일이 있는 디렉토리 지정
const mdFilesDir = path.join(__dirname, 'md-files');

// 폴더 구조를 재귀적으로 스캔하여 JSON 객체로 반환하는 함수
function scanDirectory(dir) {
    const structure = {};
    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach(item => {
        const itemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            // 폴더일 경우, 재귀적으로 탐색
            const subStructure = scanDirectory(itemPath);
            // 서브 폴더가 비어있지 않다면 구조에 추가
            if (Object.keys(subStructure).length > 0) {
                structure[item.name] = subStructure;
            }
        } else if (item.isFile() && item.name.endsWith('.md')) {
            // 파일일 경우, 경로와 함께 저장
            const relativePath = path.relative(__dirname, itemPath);
            structure[item.name] = relativePath.replace(/\\/g, '/'); // 윈도우 경로 \를 /로 변환
        }
    });

    return structure;
}

// 폴더 구조를 JSON으로 반환하는 API 엔드포인트
app.get('/api/folder-structure', (req, res) => {
    try {
        const folderStructure = scanDirectory(mdFilesDir);
        res.json(folderStructure);
    } catch (error) {
        console.error('Failed to scan directory:', error);
        res.status(500).json({ error: 'Failed to scan directory' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
