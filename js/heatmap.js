var hHeight;
var parse = d3.timeParse("%Y-%m-%d %H:%M:%S");
// set the dimensions and margins of the graph
var heatMargin = {top: 5, right: 100, bottom: 0, left: 20};
// var heatWidth = Math.max(Math.min(window.innerWidth, 1000), 500) - heatMargin.left - heatMargin.right - 20;
var heatWidth = 1400 - heatMargin.left - heatMargin.right;

var times;
d3.csv("data/times.csv").then(d=>{
	times = parse(d);
	console.log(times);
});

 //set the colors
// var colors = ['#f7f7f7','#d1e5f0','#b2182b'];
// var colors = [ "#e6e6e6", "#9dbee6",  "#e61e1a"];
var colors = ["#e6e6e6" ,"#9dbee6",   "#e6852f", "#e61e1a","#ca0020"];

["#e6e6d8",   "#e6531a",,"#e6b061","#c8dce6",,"#e6d49c","#afcae6",]
//main function to update heatmap
function draw_heatmap(data,index) {

	// // Labels of row and columns
	// var sensor;
	// var sensorList = d3.map(data, d => d["Sensor-id"]).keys();
	// var mobileList = sensorList.filter(d => d.split("-")[0] === "mobile")
	// 	.sort((a,b) => {
	// 	var x = +a.split("-")[1],
	// 		y = +b.split("-")[1];
	// 	return(x < y)? -1:1;
	// });
	// var staticList = sensorList.filter(d => d.split("-")[0] === "static");
	// if (staticList.length != 0 ){
    // staticList.sort((a,b) => {
    //             var x = +a.split("-")[1],
    //                 y = +b.split("-")[1];
    //             return(x < y)? -1:1;
    // });
	// 	sensors = mobileList.concat(staticList);
	// }else {
	// 	sensors = mobileList;
	// }

	// get sensors list
	var sensors = d3.map(data,d=>d["Sensor-id"]).keys();

	// get timestamps
	var times = d3.map(data,d=>d.Timestamp).keys();
	times.sort((a,b)=>a.Timestamp - b.Timestamp);
	// var times = d2.nest().key(d=>d.Timestamp)
	// d3.nest().key(d => d["Sensor-id"]).entries(regionData);


	var x = d3.scaleBand().range([0,1200]).domain(times)

debugger
	// var cellSize = heatWidth/times.length;
	var cellSize = 5;

	var heatHeight = cellSize * (sensors.length + 2);
	hHeight = heatHeight;
	//append heat map svg
	// d3.select("#"+ "heatmap" + index).selectAll("*").remove();
	
	var heatTip = d3.select("#heatmap")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip");

	var svgHeat = d3.select("#heatmap")
		.append("div")
		.attr("id", "heatmap"+ index)
		// .classed("selected",true)
		.style("display", "block")
		.append("svg")
		// .style("display", "block")
		.attr("width", heatWidth + heatMargin.left + heatMargin.right )
		.attr("height", heatHeight + heatMargin.top + heatMargin.bottom)
		.attr("class","heatmapBlock")
		.append("g")
		// .attr("transform",
		// 	"translate(" + heatMargin.left + "," + heatMargin.top + ")");

	d3.select("#" + "heatmap" + (index)).classed("displayed",true);

	// define color scale for heatmap
	var heatColor = d3.scaleLinear()
		// .domain([0, d3.max(data, function(d) {return d.Value; })/2, d3.max(data, function(d) {return d.Value; })])
		.domain([0,250,550,900,1500,2000,2500])
		// .range(["#bdb7d6", "#948DB3", "#605885", "#433B67"])
		// .range(['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'])
		.range(colors);

	// var sensorLabels = svgHeat.selectAll(".sensorLabel")
	var sensorLabels = svgHeat.selectAll(".sensorLabel")
		.data(sensors)
		.enter().append("text")
		.text( d => d)
		.attr("x",1210)
		.attr("y", (d,i) => i * cellSize)
		.style("font-size","7px")
		// .attr("font-size",5)
		.style("text-anchor", "head")
		.attr("transform", "translate(0," + cellSize/1.1 + ")")
		.attr("class", d => d);
    var regionLabel = d3.select("#" + "heatmap" + index)
		.append("svg")
		.attr("width","50")
		.attr("height","20")
		.attr("transform",	"translate(" + 1250 + "," + (-(heatHeight/2+20)) + ")")
	regionLabel
		.append("text")
		.text("Region" + index)
		.attr("font-size",10)
		.attr("x", 0)
		.attr("y", 10);

	var heatMap = svgHeat.selectAll(".cmp")
		 // .data(data.filter(d=>{return d.Value>0}))
		.data(data)
		// .data(data.sort(function (a, b) {
		// 	return a.Timestamp - b.Timestamp
		// }))
		 .enter().append("rect")
		 .attr("x", d => times.indexOf(d.Timestamp.toString()) * cellSize)
		// .attr("x",d=>)
		 .attr("y", d => sensors.indexOf(d["Sensor-id"]) * cellSize)
		 .attr("class", "cmp bordered")
		 .attr("width", cellSize)
		 .attr("height", cellSize)
		 .style("stroke", "black")
		 // .style("stroke-opacity", d=>(+d["value_count"]/360))
		 .style("stroke-width", d=>(+d["value_count"] / 1000 + 0.1 ))
		 .style("display", d=>{return d == null ? "none" : null;})
		 .style("fill", d => heatColor(d["Value"]))
		 .on("mouseover", mouseover)
		 .on("mousemove", mousemove)
		 .on("mouseleave", mouseleave);



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
						+ "Max: " + d.Value.toFixed(2) + " (cmp)" + "<br>"
						+ "Min:" + d["value_min"].toFixed(2)+ " (cmp)" + "<br>"
						+ "Mean:" + d["value_mean"].toFixed(2) + " (cmp)" + "<br>"
						+ "Number of readings:" + d["value_count"])
			.style("left",  (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY)  + "px");
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


}

	// //=============================legend ============================
	//create value scale for the legend
	var valueScale = d3.scaleLinear()
		.domain([0,300, 500,1000,1500,2000,3000, 5000])
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
	var legendWidth = Math.min(heatWidth * 0.8, 100);

	// var legend = svgHeat.selectAll(".legend")
	//     .data([0].concat(heatColor.quantiles()), function(d) { return d; });

	var legend = svgLegend.append("g")
		.attr("class", "legendWapper");
		// .attr("transform", "translate(" + (heatWidth/2) + "," + (40) + ")");

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


//======= draw time label ========
var time = ["04/06","04/07","04/08", "04/09", "04/10"]
var timeLabel = d3.select("#timeLabel").append("svg")
	.attr("width",heatWidth)
	.attr("height",20)
	.attr("transform", "translate(0," + (10) + ")")
	// .attr("background","white")
	.append("g");
timeLabel.selectAll("g")
	.data(time)
	.enter().append("text")
	.text(d=>d)
	// .text( d => {
	// 	var da = new Date(d);
	// 	return da.toLocaleTimeString([], { year: '2-digit', month: '2-digit',day: '2-digit', hour: '2-digit', minute:'2-digit'});
	// })

	// .attr("x", heatHeight - 25)
	// .attr("y", (d,i) => -i * cellSize + 4)
	.attr("x",(d,i)=> i * 240)
	.attr("y",10)
	.style("font-size", 13)
	.style("text-anchor", "start");
	// .attr("transform", (d,i) => "translate(" + cellSize/2 + ", 0) rotate(90)")
	// .attr("class", d=>d)
debugger


// var sensorLabels = svgHeat.selectAll(".sensorLabel")
// 	.data(sensors)
// 	.enter().append("text")
// 	.text( d => d)
// 	.attr("x", heatWidth + 100)
// 	.attr("y", (d,i) => i * cellSize)
// 	.style("font-size","7px")
// 	// .attr("font-size",5)
// 	.style("text-anchor", "head")
// 	.attr("transform", "translate(0," + cellSize/1.5 + ")")
// 	.attr("class", d => d);