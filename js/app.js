
// Setting svg chart area for chart transformation
var margin = {left:100, right:20, top:50, bottom:150 };

var width = 1000 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var chartGroup = d3.select("#scatter")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial X axis Params
var chosenXAxis = "poverty";

// Initial Y axis Params
var chosenYAxis = "healthcare";

// X Scale
function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

    return xLinearScale;
}

// Y Scale
function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

    return yLinearScale;
}

// X Axis
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Y Axis
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// X Axis and Y Axis Circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("transform", d => `translate(${newXScale(d[chosenXAxis])},${newYScale(d[chosenYAxis])})`);

    return circlesGroup;
}

// X Label and Y Label for Tooltip
// x scale will include In Poverty (%), Age(Median), Household Income(Median)
// y scale will include Lacks Health care, Smokes(%), Obese(%)
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel;
    var xformatLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty: "
        xformatLabel = "%";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age: "
        xformatLabel = " ";
    }
    else {
        xLabel = "Household Income: $"
        xformatLabel = " ";
    }

    var yLabel;
    var yformatLabel;

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Health care: "
        yformatLabel = "%";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes: "
        yformatLabel = "%";
    }
    else {
        yLabel = "Obesity: "
        yformatLabel = "%";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
          return (`${d.state}<br>
            ${xLabel}${d[chosenXAxis]}${xformatLabel}<br>
            ${yLabel}${d[chosenYAxis]}${yformatLabel}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    circlesGroup.on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}

// Retrieving data
d3.csv("data/data.csv").then(function(healthData){
    
    // clean data
    healthData.forEach(function(d) {
        d.age = +d.age;
        d.healthcare = +d.healthcare;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
    // console.log(healthData)
    });

    // X Scale
    var xLinearScale = xScale(healthData, chosenXAxis);

    // Y Scale
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("g")
        .data(healthData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xLinearScale(d[chosenXAxis])},${yLinearScale(d[chosenYAxis])})`);

    var circles = circlesGroup.append("circle")
        .classed("stateCircle", true)
        .attr("r", "30");

    // Create the text for each circle
    circlesGroup.append("text")
        .attr("dy", 6)
        .classed("stateText", true)
        .text(d => d.abbr);


    // Create title for chart
    chartGroup.append("text")
        .attr("transform", `translate(${width/2 -320}, ${-30} )`)
        .classed("h2", true)
        .text("Behavioral risk factors and health indicators by State")

    // Create group for three x-axis labels
    // x scale will include In Poverty (%), Age(Median), Household Income(Median)
    var xlabelsGroup = chartGroup.append("g")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age(Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income(Median)");

    // Create group for three y-axis labels
    // y scale will include Lacks Health care(%), Smokes(%), Obese(%)
    var ylabelsGroup = chartGroup.append("g")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", -250)
        .attr("y", -30)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Health care(%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", -250)
        .attr("y", -55)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes(%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", -250)
        .attr("y", -80)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese(%)");


    // UpdateToolTip function 
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X Axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {

          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {

            // Setting value to chosenXAxis
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // Update X Scale
            xLinearScale = xScale(healthData, chosenXAxis);

            // Update X Axis
            xAxis = renderXAxis(xLinearScale, xAxis)

            // Update circles
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // UpdateToolTip function 
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // X Axis labels
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            }
            else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
          }
        });

    // Y Axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
        
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // Setting value to chosenYAxis
            chosenYAxis = value;

            // console.log(chosenYAxis)

             // Update Y Scale
            yLinearScale = yScale(healthData, chosenYAxis);

            // Update Y Axis
            yAxis = renderYAxis(yLinearScale, yAxis)

            // Update circles
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // UpdateToolTip function 
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Y Axis labels
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);  
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
          }
        });

}).catch(function(error) {
  console.log(error);
});
