var hHeight;
var parse = d3.timeParse("%Y-%m-%d %H:%M:%S");
// set the dimensions and margins of the graph
var heatMargin = {top: 5, right: 100, bottom: 0, left: 20};
// var heatWidth = Math.max(Math.min(window.innerWidth, 1000), 500) - heatMargin.left - heatMargin.right - 20;
var heatWidth = 1400 - heatMargin.left - heatMargin.right;

// d3.csv("data/times.csv").then(d=>{
// 	times = parse(d);
// 	console.log(times);
// });

 //set the colors
// var colors = ['#f7f7f7','#d1e5f0','#b2182b'];
// var colors = [ "#e6e6e6", "#9dbee6",  "#e61e1a"];
var colors = ["#e6e6e6" ,  "#e6852f", "#e61e1a","#ca0020"];

//["#e6e6d8",   "#e6531a",,"#e6b061","#c8dce6",,"#e6d49c","#afcae6",]
//main function to update heatmap
// get timestamps
let startTime = new Date('2020-04-06 00:00:00');
let endTime = new Date('2020-04-11 00:00:00');
let step = 1000 * 60 * 30;
let times = [];
let prevDate = startTime;
while (true) {
	let theDate = new Date(prevDate.getTime() + step);
	if (theDate < endTime) {
		times.push(theDate);
	} else {
		break;
	}
	prevDate = theDate;
}
times = times.map(d => d.toString());

var heatTip = d3.select("#heatmap")
	.append("div")
	.style("opacity", 0)
	.attr("class", "tooltip");

function draw_heatmap(data,index,value) {
	// get sensors list
	var sensors = d3.map(data,d=>d["Sensor-id"]).keys();

	// var cellSize = heatWidth/times.length;
	var cellSize = 5;

	var heatHeight = cellSize * (sensors.length + 2);
	hHeight = heatHeight;

	// d3.select("#"+ "heatmap" + index).selectAll("*").remove();
	


	let theDiv = d3.select("#heatmap"+index);
	if(!theDiv.empty()){
		//Remove it and exit
		theDiv.remove();
		//Don't draw any more
		return;

	}

	// if(theDiv.style.display==="none"){
	// 	theDiv.style.display="block";
	// }else{
	// 	theDiv.style.display="block";
	// }

	var svgHeat = d3.select("#heatmap")
		.append("div")
		.attr("id", "heatmap"+ index)
		// .classed("selected",true)
		// .style("display", "block")
		.append("svg")
		// .style("display", "block")
		.attr("width", heatWidth + heatMargin.left + heatMargin.right )
		.attr("height", heatHeight + heatMargin.top + heatMargin.bottom)
		.attr("class","heatmapBlock")
		.append("g")
		// .attr("transform",
		// 	"translate(" + heatMargin.left + "," + heatMargin.top + ")");

	// d3.select("#" + "heatmap" + (index)).classed("displayed",true);

	// define color scale for heatmap
	var heatColor = d3.scaleLinear()
		.domain([0,250,550,900,1500,2000,2500])
		// .domain([0,100,300,600,1000,1500,2100,2800])
		// .domain(d3.extent(data,d=>d.Value))
		// .domain([0, d3.max(data, d=>d.Value)])
		// .domain([0, d3.max(data, d=> d.Value)/3, d3.max(data, d=> d.Value)/2, 2500])
		// .range(["#bdb7d6", "#948DB3", "#605885", "#433B67"])
		// .range(['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'])
		.range(colors);


	// add sensor labels
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

	// add region label
    var regionLabel = d3.select("#" + "heatmap" + index)
		.append("svg")
		.attr("width","50")
		.attr("height","20")
		.attr("transform",	"translate(" + 1245 + "," + (-(heatHeight/2+20)) + ")")
	regionLabel
		.append("text")
		.text("Region" + index)
		.attr("font-size",10)
		.attr("x", 0)
		.attr("y", 10);

    // draw heat map rects
	var heatMap = svgHeat.selectAll(".cmp")
		 // .data(data.filter(d=>{return d.Value>0}))
		.data(data.filter(d=>{return d.value_count>0}))

		// .data(data)
		// .data(data.sort(function (a, b) {
		// 	return a.Timestamp - b.Timestamp
		// }))
		 .enter().append("rect")
		 .attr("x", d => times.indexOf(d.Timestamp.toString()) * cellSize)
		 // .attr("x",d=>x(d.Timestamp))
		 .attr("y", d => sensors.indexOf(d["Sensor-id"]) * cellSize)
		 .attr("class", "cmp bordered")
		 .attr("width", cellSize)
		 .attr("height", cellSize)
		 .style("stroke", "black")
		 // .style("stroke-opacity", d=>(+d["value_count"]/360))
		 .style("stroke-width", d=>(+d["value_count"] / 1000 + 0.1 ))
		 // .style("display", d=>{return d == null ? "none" : null;})
		 .style("fill", d => heatColor(d["Value"]))
		 // .style("fill","url(#legend-heatmap)")

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

	// drop down change
	//
	// let value_data = {
	// 	"Min value": data.map(d => d.value_min),
	// 	"Mean value": data.map(d => d.value_mean),
	// 	"Max value": data.map(d => d.Value)
	// }
	//
	// console.log(value_data);
	//
	// let dropDown = d3.select("#updateHeatmap")
	// 	.insert("select","svg")
	// 	.on("change",dropDownChange)
	//
	// let dropDownChange = function(){
	// 	let new_value = d3.select(this).property("value");
	//
	// 	update_values(new_value);
	//
	// }
	// dropDown.selectAll("option")
	// 	.data(value_data)
	// 	.enter()
	// 	.append("option")
	// 	.attr("value",d=>d.key)
	// 	.text(d=>d.key);
	//
	// function update_values(value){
	// 	svgHeat
	// 		.transition()
	// 		.duration()
	// 		.style("fill",d=>heatColor(value_data[value]));
	//
	// }

	// let initial = update_value("Max value");
	// let radioMax = d3.select("#maxValue").on("change",show_min())
	// let radioMean = d3.select("#meanValue").on("change",show_mean());
	// let radiomin = d3.select("#minValue").on("change",show_min());

    // control panel selector
	let inputs = d3.selectAll(".valueSelector input");
	inputs.on("change",()=>{
		let inputValue = this.value;
		if(inputValue === "Max Value" ) { show_max(); }
		else if (inputValue === "Min Value") {show_min(); }
		else{show_mean();}
	})

	function show_min(){
		heatMap
			.transition()
			.duration(500)
			.style("fill",d => heatColor(+d.value_min));
	}

	function show_mean(){
        heatMap
			.transition()
			.duration(500)
			.style("fill",d=>heatColor(+d.value_mean));
	}
	function show_max(){
        heatMap
			.transition()
			.duration(500)
			.style("fill",d => heatColor(+d.Value));
	}


}




//======= draw time label ========
var time = ["04/06","04/07","04/08", "04/09", "04/10"]
var timeLabel = d3.select("#timeLabel").append("svg")
	.attr("width",heatWidth)
	.attr("height",20)
	// .attr("transform", "translate(0," + (10) + ")")
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