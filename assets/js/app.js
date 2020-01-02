function makeResponsive() {

    // Reset chart at beginning of each new window (resize)
    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
      svgArea.remove();
    }

    // Chart Size
    var svgWidth = window.innerWidth * 0.6;
    var svgHeight = window.innerHeight * 0.8;

    var margin = {
        top: 25,
        right: 20, 
        bottom: 180,
        // left: 55
        left: 100
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
    function updateXScale(healthData, chosenXAxis) {

        var xLinearScale = d3.scaleLinear()
            .domain(d3.extent(healthData, d => d[chosenXAxis]))
            .range([0, width]);    

        return xLinearScale;
    };

    // Function to render new yScale upon event
    function updateYScale(healthData, chosenYAxis) {

        var yLinearScale = d3.scaleLinear()
            .domain(d3.extent(healthData, d => d[chosenYAxis]))
            .range([height, 0]);    

        return yLinearScale;
    };

    // Function to render new xAxis upon event
    function renderXAxis(newXScale, xAxis) {

        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

        return xAxis;
    };

    // Function to render new yAxis upon event
    function renderYAxis(newYScale, yAxis) {

        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
        .duration(1000)
        .call(leftAxis);

        return yAxis;
    };

    // Function to render new Circles upon event
    function renderCircles(circlesPair, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesPair.selectAll("circle")
            .transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        circlesPair.selectAll("text")
            .transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return circlesPair;
    };

    // Function to render new Tool Tips upon event
    function updateToolTip(chosenXAxis, chosenYAxis, circlesPair) {

        if (chosenXAxis === "poverty") {
            var xLabel = "Poverty (%):";
        } else if (chosenXAxis === "age") {
            var xLabel = "Age (Median):";
        } else {
            var xLabel = "Income ($):";
        };
        
        if (chosenYAxis === "healthcare") {
            var yLabel = "Health Care (%):";
        } else if (chosenYAxis === "obesity") {
            var yLabel = "Obese (%):";
        } else {
            var yLabel = "Smokes (%):";
        };

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([40, -70])
            .html(d => {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
            });

        chartGroup.call(toolTip);

        circlesPair.on("mouseover", data => {
            toolTip.show(data, this);
        }).on("mouseout", data => {
            toolTip.hide(data);
        });

        return circlesPair;
    };

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

        // Create Initial xScale and yScale
        var xLinearScale = updateXScale(healthData, chosenXAxis);         
        var yLinearScale = updateYScale(healthData, chosenYAxis);

        // Create Initial xAxis and yAxis
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append xAxis to Chart
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        // Append yAxis to Chart
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Create Initial Data Circles
        // Wrap each circle and text in a pair group
        var circlesPair = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("g");

        circlesPair.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "10")
            .attr("class", "stateCircle");

        circlesPair.append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis] - 0.2))
            .attr("class", "stateText")
            .text(d => d.abbr);

        // Create Initial Tool Tips    
        circlesPair = updateToolTip(chosenXAxis, chosenYAxis, circlesPair);

        // Create X-Axes Labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("class", "aText");

        var povertyXLabel = xLabelsGroup.append("text")
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageXLabel = xLabelsGroup.append("text")
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeXLabel = xLabelsGroup.append("text")
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create Y-Axes Labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "aText");
    
        var healthcareYLabel = yLabelsGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -30)
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var obesityYLabel = yLabelsGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -50)
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        var smokesYLabel = yLabelsGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -70)
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        // Call functions for xAxis and xValues upon event
        xLabelsGroup.selectAll("text").on("click", function() {

            // Fetch chosenXAxis
            var xValue = d3.select(this).attr("value");

            if (xValue !== chosenXAxis) {
                chosenXAxis = xValue;

                // Create New xScale
                xLinearScale = updateXScale(healthData, chosenXAxis);

                // Create New xAxis
                xAxis = renderXAxis(xLinearScale, xAxis);

                // Create New Circles
                circlesPair = renderCircles(circlesPair, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Create New Tool Tips
                circlesPair = updateToolTip(chosenXAxis, chosenYAxis, circlesPair);

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

        // Call functions for yAxis and yValues upon event
        yLabelsGroup.selectAll("text").on("click", function() {

            // Fetch chosenYAxis
            var yValue = d3.select(this).attr("value");

            if (yValue !== chosenYAxis) {
                chosenYAxis = yValue;

                // Create New yScale
                yLinearScale = updateYScale(healthData, chosenYAxis);

                // Create New yAxis
                yAxis = renderYAxis(yLinearScale, yAxis);

                // Create New Circles
                circlesPair = renderCircles(circlesPair, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Create New Tool Tips
                circlesPair = updateToolTip(chosenXAxis, chosenYAxis, circlesPair);

                // Highlight chosenXAxis
                if (chosenYAxis === "healthcare") {
                    healthcareYLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "obesity") {
                    healthcareYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityYLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityYLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesYLabel
                        .classed("active", true)
                        .classed("inactive", false);
                };
            };
        });        
    }).catch(function(error) {
        console.log(error);
    });
};

makeResponsive();

// Event listener for window resize.
d3.select(window).on("resize", makeResponsive);