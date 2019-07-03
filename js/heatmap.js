
var parse = d3.timeParse("%Y-%m-%d %H:%M:%S");
// set the dimensions and margins of the graph
var heatMargin = {top: 5, right: 100, bottom: 0, left: 10};
// var heatWidth = Math.max(Math.min(window.innerWidth, 1000), 500) - heatMargin.left - heatMargin.right - 20;
var heatWidth = 800 - heatMargin.left - heatMargin.right;

//set the colors
// var colors = ['#f7f7f7','#d1e5f0','#b2182b'];
// var colors = [ "#e6e6e6", "#9dbee6",  "#e61e1a"];
var colors = [ "#e6e6e6" ,"#c8dce6", "#afcae6", "#9dbee6","#e6b061", "#e6852f", "#e61e1a","#ca0020"];

//[,"#e6e6d8",  "#e6d49c",,] "#e6531a",
//main function to update heatmap
function draw_heatmap(data,index) {

	// Labels of row and columns
	var sensor;
	var sensorList = d3.map(data, d => d["Sensor-id"]).keys();
	var mobileList = sensorList.filter(d => d.split("-")[0] === "mobile")
													.sort((a,b) => {
														var x = +a.split("-")[1],
																y = +b.split("-")[1];
														return(x < y)? -1:1;
													});
	var staticList = sensorList.filter(d => d.split("-")[0] === "static");
	if (staticList.length != 0 ){
    staticList.sort((a,b) => {
                var x = +a.split("-")[1],
                    y = +b.split("-")[1];
                return(x < y)? -1:1;
    });
		sensors = mobileList.concat(staticList);
	}else {
		sensors = mobileList;
	}

	var times = d3.map(data,d=>d.Timestamp).keys();
	// timesList = times.forEach(d => d.toLocaleString());


	// var cellSize = heatWidth/times.length;
	var cellSize = 5;

	var heatHeight = cellSize * (sensors.length + 2);

	//append heat map svg
	// d3.select("#heatmap").selectAll("*").remove();
	
	var heatTip = d3.select("#heatmap")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip");

	var svgHeat = d3.select("#heatmap")
		.append("div")
		.attr("id", "heatmap"+ (index + 1))
		.style("display", "block")
		.append("svg")
		// .style("display", "block")
		.attr("width", heatWidth + heatMargin.left + heatMargin.right)
		.attr("height", heatHeight + heatMargin.top + heatMargin.bottom)
		.attr("class","heatmapBlock")
		.append("g")
		.attr("transform",
			"translate(" + heatMargin.left + "," + heatMargin.top + ")");

	// define color scale for heatmap
	var heatColor = d3.scaleLinear()
		// .domain([0, d3.max(data, function(d) {return d.Value; })/2, d3.max(data, function(d) {return d.Value; })])
		.domain([0,250,550,900,1500,2000,3000])
		// .range(["#bdb7d6", "#948DB3", "#605885", "#433B67"])
		// .range(['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'])
		.range(colors);

	var sensorLabels = svgHeat.selectAll(".sensorLabel")
		.data(sensors)
		.enter().append("text")
		.text( d => d)
		.attr("x", heatWidth + 15)
		.attr("y", (d,i) => i * cellSize)
		// .attr("font-size",5)
		.style("text-anchor", "head")
		.attr("transform", "translate(0," + cellSize/1.5 + ")")
		.attr("class", d => d);
debugger
	// var timeLabels = svgHeat.selectAll(".timeLabel")
	// 	.data(times)
	// 	.enter().append("text")
	// 	.style("font-size", 75 + "%")
	// 	.text( d => {
	// 		var da = new Date(d);
	// 		return da.toLocaleTimeString([], { year: '2-digit', month: '2-digit',day: '2-digit', hour: '2-digit', minute:'2-digit'});
	// 		})
	// 	.attr("x", heatHeight - 25)
	// 	.attr("y", (d,i) => -i * cellSize + 4)
	// 	.style("text-anchor", "head")
	// 	.attr("transform", (d,i) => "translate(" + cellSize/2 + ", 0) rotate(90)")
	// 	.attr("class", d=> d.toLocaleString());

	var heatMap = svgHeat.selectAll(".cmp")
		 .data(data.filter(d=>{return d.Value>0}))
		// .data(data)
		 .enter().append("rect")
		 .attr("x", d => times.indexOf(d.Timestamp.toString()) * cellSize)
		 .attr("y", d => sensors.indexOf(d["Sensor-id"]) * cellSize)
		 .attr("class", "cmp bordered")
		 .attr("width", cellSize)
		 .attr("height", cellSize)
		 .style("stroke", "grey")
		 .style("stroke-opacity", 0.6)
		 .style("fill", d => heatColor(d["Value"]))
		 .on("mouseover", mouseover)
		 .on("mousemove", mousemove)
		 .on("mouseleave", mouseleave)
		 .append("text")
		 .text();



	// heatMap.exit().remove();

	// Three function that change the tooltip when user hover / move / leave a cell
	function mouseover() {
		heatTip
			.transition()
			.duration(100)
			.style("opacity", 1)
		d3.select(this)
		// .style("stroke", "black")
			.style("opacity", 0.5)
	}
	function mousemove(d) {
		heatTip
			.html( "Sensor: " + d["Sensor-id"] + "<br>"
					  + "Time  : " + d.Timestamp.toLocaleTimeString([], { year: '2-digit', month: '2-digit',day: '2-digit', hour: '2-digit', minute:'2-digit'})  + "<br>"
						+ "Value: " + d.Value.toFixed(2) + " (cmp)")
			.style("left", (d3.mouse(this)[0] + 80) + "px")
			.style("top", (d3.mouse(this)[1] + 200) + "px")
	}
	function mouseleave() {
		heatTip
			.transition()
			.duration(100)
			.style("opacity", 0)
		d3.select(this)
		// .style("stroke", "black")
			.style("opacity", 1)
	}




	// //=============================legend ============================
	//create value scale for the legend
	var valueScale = d3.scaleLinear()
		.domain([0, 2500])
		.range([0, heatWidth]);

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
		// .domain([0, 1300, 2500])
		.domain([0,500,1000,1500,2000,2500])
		// .range(["#bdb7d6", "#948DB3", "#605885", "#433B67"])
		// .range(['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'])
		.range(colors);
	//create the gradient
	var svgLegend = d3.select("#heatmapLegend").append("defs")
		.append("linearGradient")
		.attr("id", "legend-heatmap")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop")
		.data(d3.range(numStops))
		.enter().append("stop")
		.attr("offset", function(d,i) {
			return valueScale( valuePoint[i] )/heatWidth;
		})
		.attr("stop-color", function(d,i) {
			return legendColor( valuePoint[i] );
		});
	// debugger
	// draw legend
	var legendWidth = Math.min(heatWidth * 0.8, 400);

	// var legend = svgHeat.selectAll(".legend")
	//     .data([0].concat(heatColor.quantiles()), function(d) { return d; });

	var legend = svgLegend.append("g")
		.attr("class", "legendWapper")
		.attr("transform", "translate(" + (heatWidth/2) + "," + (40) + ")");

	legend.append("rect")
		.attr("class", "legendRect")
		.attr("x", -legendWidth/2)
		.attr("y", 0)
		.attr("width", legendWidth)
		.attr("height", 10)
		.style("fill", "url(#legend-heatmap)");

	legend.append("text")
		.attr("class", "mono")
		.text(function(d) { return "≥ " + Math.round(d); })
		.attr("x", 0)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text("Radiation Values (cmp)");

	// legend.exit().remove();

	//Set scale of x axis for legend
	var xLegend = d3.scaleLinear()
		.range([-legendWidth/2, legendWidth/2])
		.domain([ 0, 2500] );

	//Define x-axis for legend
	var xAxisLegend = d3.axisBottom(xLegend)
		.ticks(6);
	//.tickFormat(formatPercent)


	//draw X axis for legend
	legend.append("g")
		.attr("class", "axis--legend")
		.attr("transform", "translate(0," + (10) + ")")
		.call(xAxisLegend);

}

