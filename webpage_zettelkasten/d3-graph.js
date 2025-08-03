// d3-graph.js

// D3.js Force Layout 시뮬레이션 설정
const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter());

let svg, link, node, label, graphData = { nodes: [], links: [] };

// DOM에서 그래프 관련 요소 가져오기
const graphContainer = document.getElementById("graph-view");
const distanceSlider = document.getElementById("link-distance");
const chargeSlider = document.getElementById("charge-strength");
const distanceValue = document.getElementById("distance-value");
const chargeValue = document.getElementById("charge-value");

// 그래프를 처음 로드하거나 다시 그리는 함수
window.reloadGraph = function() {
    const width = graphContainer.clientWidth;
    const height = graphContainer.clientHeight;
    
    if (width === 0 || height === 0) {
        setTimeout(window.reloadGraph, 200);
        return;
    }

    d3.select("#graph-view svg").remove();

    svg = d3.select("#graph-view").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().scaleExtent([0.5, 10]).on("zoom", zoomed))
        .append("g");

    simulation.force("center", d3.forceCenter(width / 2, height / 2));

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .style("cursor", "grab");

    if (graphData.nodes.length > 0) {
        window.updateGraph(graphData.nodes, graphData.links);
    }
};

// 줌 이벤트 핸들러
function zoomed(event) {
    svg.attr("transform", event.transform);
}

// D3 그래프 업데이트 함수
window.updateGraph = function(nodes, links) {
    graphData.nodes = nodes;
    graphData.links = links;
    
    svg.selectAll(".links").remove();
    svg.selectAll(".nodes").remove();
    svg.selectAll(".labels").remove();
    
    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1.5);
    
    node = svg.append("g")
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
        .on("click", (event, d) => {
            window.loadFileContent(d.path, d.id);
        });
    
    label = svg.append("g")
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
    simulation.alpha(0.15).restart();
};

// 시뮬레이션 틱 이벤트 핸들러
function ticked() {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x).attr("cy", d => d.y);
    label.attr("x", d => d.x).attr("y", d => d.y);
}

// 드래그 이벤트 핸들러
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

// 슬라이더 이벤트 핸들러
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

window.addEventListener('load', () => {
    window.reloadGraph();
});