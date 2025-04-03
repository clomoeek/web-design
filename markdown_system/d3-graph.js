

document.addEventListener("DOMContentLoaded", function () {
    const graphContainer = document.getElementById("graph-view");
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;

    const controls = document.createElement("div");
    controls.innerHTML = `
        <label>링크 거리: <input type="range" id="link-distance" min="10" max="200" value="50"> <span id="distance-value">50</span></label>
        <label>반발력: <input type="range" id="charge-strength" min="-200" max="0" value="-50"> <span id="charge-value">-50</span></label>
    `;
    graphContainer.appendChild(controls);

    const distanceSlider = document.getElementById("link-distance");
    const chargeSlider = document.getElementById("charge-strength");
    const distanceValue = document.getElementById("distance-value");
    const chargeValue = document.getElementById("charge-value");

    const svg = d3.select("#graph-view").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().scaleExtent([0.5, 10]).on("zoom", zoomed)) // 줌 & 패닝 활성화
        .append("g"); // 그룹 요소를 추가해서 전체 그래프 이동 가능하게 설정

    function zoomed(event) {
        svg.attr("transform", event.transform);
    }

    const background = svg.append("rect") // 배경을 추가하여 드래그 가능하도록 설정
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent") // 배경을 투명하게 설정
        .style("cursor", "grab");

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const graphData = { nodes: [], links: [] };
    let folderStructure = {};

    async function loadFolderStructure() {
        try {
            const response = await fetch('folderStructure.json');
            folderStructure = await response.json();
            loadMarkdownFiles();
        } catch (error) {
            console.error('폴더 구조 로드 실패:', error);
        }
    }

    function extractLinks(content, fileName) {
        const regex = /\[(.*?)\]\((.*?)\.md\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const targetFile = match[2] + ".md";
            if (!graphData.nodes.some(node => node.id === targetFile)) {
                graphData.nodes.push({ id: targetFile });
            }
            if (!graphData.links.some(link => link.source === fileName && link.target === targetFile)) {
                graphData.links.push({ source: fileName, target: targetFile });
            }
        }
    }

    async function loadMarkdownFiles() {
        for (let folder in folderStructure) {
            for (let file in folderStructure[folder]) {
                const filePath = folderStructure[folder][file];
                if (!graphData.nodes.some(node => node.id === file)) {
                    graphData.nodes.push({ id: file });
                }
                try {
                    const response = await fetch(filePath);
                    const text = await response.text();
                    extractLinks(text, file);
                } catch (error) {
                    console.error(`파일 로드 실패: ${filePath}`, error);
                }
            }
        }
        initializeGraph();
    }

    function initializeGraph() {
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graphData.links)
            .enter().append("line")
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1.5);

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graphData.nodes)
            .enter().append("circle")
            .attr("r", 8)
            .attr("fill", "#6699cc")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", (event, d) => loadFileContentFromGraph(d.id));

        const label = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(graphData.nodes)
            .enter().append("text")
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .text(d => d.id.replace(".md", ""))
            .style("font-size", "12px");

        simulation.nodes(graphData.nodes).on("tick", ticked);
        simulation.force("link").links(graphData.links);

        function ticked() {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("cx", d => d.x).attr("cy", d => d.y);
            label.attr("x", d => d.x).attr("y", d => d.y);
        }
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function loadFileContentFromGraph(fileName) {
        for (let folder in folderStructure) {
            if (folderStructure[folder][fileName]) {
                loadFileContent(folderStructure[folder][fileName], fileName);
                break;
            }
        }
    }

    // 🎛 **슬라이더 이벤트 리스너 (사용자가 조정 가능)**
    distanceSlider.addEventListener("input", () => {
        const newDistance = parseInt(distanceSlider.value, 10);
        distanceValue.textContent = newDistance;
        simulation.force("link").distance(newDistance);
        simulation.alpha(1).restart();
    });

    chargeSlider.addEventListener("input", () => {
        const newCharge = parseInt(chargeSlider.value, 10);
        chargeValue.textContent = newCharge;
        simulation.force("charge").strength(newCharge);
        simulation.alpha(1).restart();
    });

    loadFolderStructure();
});
