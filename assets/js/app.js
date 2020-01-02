function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    // Reset chart at beginning of each new window (resize)
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    // 1. Chart Size
    // var svgWidth = 780;
    // var svgHeight = 540;
    var svgWidth = window.innerWidth * 0.6;
    var svgHeight = window.innerHeight * 0.8;

    var margin = {
        top: 25,
        right: 20, 
        bottom: 90,
        left: 55
    }

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // 2. SVG Wrapper
    var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 3. Import Data    
    d3.csv("assets/data/data.csv").then(healthData => {

        // 4. Format Data
        healthData.forEach(data => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        });

        // 5. Create Scales
        var xScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d.poverty))
        .range([0, width]);
        
        var yScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d.healthcare))
        .range([height, 0]);
        
        // 6. Create Axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        // 7. Append Axes to Chart
        chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
        
        chartGroup.append("g")
        .call(yAxis);

        // 8. Create Data Circles
        // Wrap each circle and text in a group
        var circlesPair = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("g");

        var circlesGroup = circlesPair.append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "10")
        .attr("class", "stateCircle");

        circlesPair.append("text")
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => yScale(d.healthcare - 0.2))
        .attr("class", "stateText")
        .text(d => d.abbr);

        // 9. Create Tool Tips      
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -70])
        .html(d => {
            return (`${d.state}<br>Poverty: ${d.poverty}%<br>Health Care: ${d.healthcare}%`);
        });

        chartGroup.call(toolTip);

        circlesPair.on("mouseover", data => {
            toolTip.show(data, this);
        }).on("mouseout", data => {
            toolTip.hide(data);
        });

        // 10. Create Axes Titles
        chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("text-anchor", "middle")
        .attr("class", "aText")
        .text("In Poverty (%)");

        chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .attr("class", "aText")
        .text("Lacks Healthcare (%)");



    }).catch(function(error) {
        console.log(error);
    });
};

makeResponsive();

// Event listener for window resize.
d3.select(window).on("resize", makeResponsive);