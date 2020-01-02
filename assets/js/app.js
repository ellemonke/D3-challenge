// Chart Size
// var svgWidth = 780;
// var svgHeight = 540;
var svgWidth = window.innerWidth * 0.6;
var svgHeight = window.innerHeight * 0.8;

var margin = {
    top: 25,
    right: 20, 
    bottom: 180,
    left: 55
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// SVG Wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Chart Group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Axes Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function to render new xScale upon event
function xScale(healthData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenXAxis]))
        .range([0, width]);    

    return xLinearScale;
};

// Function to render new xAxis upon event
function renderXAxis(newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
};

// Function to render new Circles upon event
function renderCircles(circlesPair, newXScale, chosenXaxis) {

    circlesPair.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    circlesPair.selectAll("text")
        .transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesPair;
};

// Function to render new Tool Tips upon event
function updateToolTip(chosenXAxis, circlesPair) {

    if (chosenXAxis === "poverty") {
        var label = "Poverty (%):";
    } else if (chosenXAxis === "age") {
        var label = "Age (Median):";
    } else {
        var label = "Income (Median):";
    };
    
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -70])
        .html(d => {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Health Care (%): ${d.healthcare}`);
        });

    chartGroup.call(toolTip);

    circlesPair.on("mouseover", data => {
        toolTip.show(data, this);
    }).on("mouseout", data => {
        toolTip.hide(data);
    });

    return circlesPair;
};


// function makeResponsive() {

    // // Reset chart at beginning of each new window (resize)
    // var svgArea = d3.select("body").select("svg");

    // if (!svgArea.empty()) {
    //   svgArea.remove();
    // }

    // Import Data    
    d3.csv("assets/data/data.csv").then((healthData, err) => {
        if (err) throw err;

        // Format Data
        healthData.forEach(data => {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Create Initial xScales
        var xLinearScale = xScale(healthData, chosenXAxis);         

        // Create Initial yScales
        var yScale = d3.scaleLinear()
            .domain(d3.extent(healthData, d => d.healthcare))
            .range([height, 0]);
        
        // Create Initial xAxis and yAxis
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yScale);

        // Append xAxis to Chart
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        // Append yAxis to Chart
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Create Initial Data Circles
        // Wrap each circle and text in a group
        var circlesPair = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("g");

        var circlesGroup = circlesPair.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yScale(d.healthcare))
            .attr("r", "10")
            .attr("class", "stateCircle");

        circlesPair.append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yScale(d.healthcare - 0.2))
            .attr("class", "stateText")
            .text(d => d.abbr);

        // Create Initial Tool Tips    
        circlesPair = updateToolTip(chosenXAxis, circlesPair);

        // Create X-Axes Labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("text-anchor", "middle")
            .attr("class", "aText");

        var povertyXLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageXLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeXLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create Y-Axes Labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2))
            .attr("class", "aText")
            .text("Lacks Healthcare (%)");

        // Call functions upon event
        xLabelsGroup.selectAll("text").on("click", function() {

            // Fetch chosenXAxis
            var value = d3.select(this).attr("value");

            if (value !== chosenXAxis) {
                chosenXAxis = value;

                // Create New xScale
                xLinearScale = xScale(healthData, chosenXAxis);

                // Create New xAxis
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Create New Circles
                circlesPair = renderCircles(circlesPair, xLinearScale, chosenXAxis);

                // Create New Tool Tips
                circlesPair = updateToolTip(chosenXAxis, circlesPair);

                // Highlight chosenXAxis
                if (chosenXAxis === "poverty") {
                    povertyXLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageXLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageXLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeXLabel
                        .classed("active", true)
                        .classed("inactive", false);
                };
            };
        });
    }).catch(function(error) {
        console.log(error);
    });
// };

// makeResponsive();

// // Event listener for window resize.
// d3.select(window).on("resize", makeResponsive);