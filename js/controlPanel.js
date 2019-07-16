

//=============================legend for time series ============================
//create value scale for the legend
var valueScale = d3.scaleLinear()
    .domain([0,100,300,600,1000,1500,2100,2800])
    .range([0, 300]);

//Calculate the variables for the temp gradient
var numStops = 5;
valueRange = valueScale.domain();
valueRange[2] = valueRange[1] - valueRange[0];
valuePoint = [];
for(var i = 0; i < numStops; i++) {
    valuePoint.push(i * valueRange[2]/(numStops-1) + valueRange[0]);
}//for i

// console.log(d3.range(numStops));
// console.log(valueScale( valuePoint[i] ));
var legendColor =  d3.scaleLinear()
    .domain([0,600,1500,2100,2800])
    // .domain([0,2800])
//     .domain([0,250,550,900,1500,2000,2500])
//     .domain([0,100,300,600,1000,1500,2100,2800])
    .range(["#e6e6e6" , "#e6852f", "#e61e1a","#ca0020",'#67001f']);

//create the gradient horizontally
var svgLegend = d3.select("#colorLegend").append("svg")
    .attr("width",400)
    .attr("height",60)

svgLegend.append("g").append("defs")
    .append("linearGradient")
    .attr("id", "legend-heatmap")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .selectAll("stop")
    // .data(d3.range(numStops))
    .data(legendColor.range())
    .enter().append("stop")
    .attr("offset", function(d,i) {
        // return valueScale( valuePoint[i] )/heatWidth;
        return  (i-0.25)/(legendColor.range().length  )
    })
    .attr("stop-color", function(d) {
        return d
    });
// debugger
// draw legend
var legendWidth = 300;

// var legend = svgHeat.selectAll(".legend")
//     .data([0].concat(heatColor.quantiles()), function(d) { return d; });


svgLegend.append("rect")
    .attr("class", "legendRect")
    .attr("x", 50)
    .attr("y", 30)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#legend-heatmap)");

debugger
svgLegend.append("text")
    .attr("class", "mono")
    .text(function(d) { return "≥ " + Math.round(d); })
    .attr("x", 180)
    .attr("y", 20)
    .attr("font-size",10)
    .style("text-anchor", "middle")
    .text("Radiation Values (cmp)");

// legend.exit().remove();

//Set scale of x axis for legend
var xLegend = d3.scaleLinear()
    .range([0, legendWidth])
    .domain([0,2800] );

//Define x-axis for legend
var xAxisLegend = d3.axisBottom(xLegend)
    .tickValues([0,100,300,600,1000,1500,2100,2800]);
    // .ticks(6);
//.tickFormat(formatPercent)


//draw X axis for legend
svgLegend.append("g")
    .attr("class", "axis--legend")
    .attr("transform", "translate(50," + (40) + ")")
    .call(xAxisLegend);