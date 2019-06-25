




d3.json('../data/StHimark.geojson', geojson => {

    let width = 400, height = 400;
    let projection = d3.geoEquirectangular().scale(1).translate([0, 0]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    //Scaling and translating.
    var b = geoGenerator.bounds(geojson),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    function update(geojson) {
        var u = d3.select('#content g.map')
            .selectAll('path')
            .data(geojson.features);

        u.enter()
            .append('path')
            .attr('d', geoGenerator);
    }

    update(geojson);
});








// var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
// var filelist = [];
// for ( i = 1; i < 20; i ++ )
// {
//     var filename = "data/HeatmapData/Region" + i + ".csv";
//     filelist.push(d3.csv(filename));
// }
//
// // Read data from csv file and preprocess it
// Promise.all( filelist ).then( data => {
//     console.log(data[0][0]);
//     var region = 1;
//     // Use region 1 as an example
//     var sensorList = Object.keys(data[region - 1][0]).slice(1);
//     console.log(sensorList);
//
//     var mobileList = sensorList.filter(d => d.split("-")[0] === "mobile")
//         .sort((a, b) => {
//             var x = +a.split("-")[1],
//                 y = +b.split("-")[1];
//             return (x < y) ? -1 : 1;
//         });
//     var staticList = sensorList.filter(d => d.split("-")[0] === "static");
//     if (staticList.length != 0) {
//         staticList.sort((a, b) => {
//             var x = +a.split("-")[1],
//                 y = +b.split("-")[1];
//             return (x < y) ? -1 : 1;
//         });
//     }
//
//
//     var updateList = mobileList.concat(staticList);
//
//     var dataset = updateList.map(d => {
//         return {
//             name: d,
//             values: data[region].map(i => {
//                 return {
//                     time: parseTime(i["Timestamp"]),
//                     value: +i[d]
//                 }
//             }),
//             visible: true
//         }
//     });
//     debugger
//     console.log(dataset);
//
// })












// //==============================================heat map======================================================================
// //cell size
// var cellSize = 10;
//
// // set the dimensions and margins of the graph
// var heatMargin = {top: 30, right: 0, bottom: 30, left: 50},
//     heatWidth = 1000 - heatMargin.left - heatMargin.right,
//     heatHeight = cellSize * 19 -10;
//
// // append the svg object to the body of the page
// var svgHeat = d3.select("#heatmap")
//     .append("svg")
//     .attr("widthHeat", heatWidth + heatMargin.left + heatMargin.right)
//     .attr("heightHeat", heatHeight + heatMargin.top + heatMargin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + heatMargin.left + "," + heatMargin.top + ")");
//
//
//
// // Build x scales and axis:
// var xHeat = d3.scaleBand()
//     .range([ 0, heatWidth]);
//     // .padding(0.01);
//
//
// // Build y scales and axis:
// var yHeat = d3.scaleBand()
//     .range([ heatHeight, 0]);
//     // .padding(0.01);
//
// //draw axis
// var xAxisHeat = d3.axisBottom(xHeat);
// var yAxisHeat = d3.axisLeft(yHeat)
//     .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S"));
//
// //take the range of radiation values and divides by the number of colors
// //assign a color for each range of values
// var heatColor = d3.scaleQuantize()
//     .range(["#bdb7d6", "#948DB3", "#605885", "#433B67"]);
//
// // create a tooltip
// var heatTip = d3.select("#heatmap")
//     .append("div")
//     .style("opacity", 0)
//     .attr("class", "tooltip")
//     .style("background-color", "white")
//     .style("border", "solid")
//     .style("border-width", "2px")
//     .style("border-radius", "5px")
//     .style("padding", "5px")
//
//
// //Read the data
// d3.csv("data/newfile_heatmap.csv").then(function(data) {
//
//     data.forEach(function(d){
//         d.Timestamp = parse(d.Timestamp);
//         d.Value = +d.Value;
//     })
//     draw_heatmap(data)
//
// });
//
// function draw_heatmap(data) {
//
//     // Labels of row and columns
//     var sensors = d3.map(data, d => d["Sensor-id"]).keys();
//     var times = d3.map(data,d=>d.Timestamp).keys();
// debugger
//     // xHeat.domain(d3.extent(data,d=>d.Timestamp));
//     xHeat.domain(times);
//     yHeat.domain(sensors);
//     heatColor.domain(d3.extent(data, d => d.Value))
//
//     //add the squares
//     svgHeat.selectAll("rect")
//         .data(data)
//         .enter()
//         .append("rect")
//         .attr("class", "cell")
//         .attr("x", function (d) {
//             return xHeat(d.Timestamp)
//         })
//         .attr("y", function (d) {
//             return yHeat(d["Sensor-id"]) - cellSize;
//         })
//         .attr("width", cellSize)
//         .attr("height", cellSize)
//         .style("fill", function (d) {
//             return heatColor(d.Value)
//         })
//         // .style("stroke-width", 4)
//         .style("stroke", "#d6cdb7")
//         .style("opacity", 0.8)
//         .on("mouseover", mouseover)
//         .on("mousemove", mousemove)
//         .on("mouseleave", mouseleave)
//
//
//     //draw x axis
//     svgHeat.append("g")
//         .style("font-size", 3)
//         .attr("transform", "translate(0," + heatHeight + ")")
//         .call(xAxisHeat)
//         .selectAll('text')
//         .attr('font-weight', 'normal')
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", "-.5em")
//         .attr("transform", function (d) {
//             return "rotate(-65)";
//         });;
//         // .select(".domain").remove()
//
//     //draw y axis
//     svgHeat.append("g")
//         .style("font-size", 3)
//         .call(yAxisHeat)
//     ;
//         // .select(".domain").remove()
//
//     // Three function that change the tooltip when user hover / move / leave a cell
//     var mouseover = function (d) {
//         heatTip
//             .transition()
//             .duration(200)
//             .style("opacity", 1)
//         d3.select(this)
//             .style("stroke", "black")
//             .style("opacity", 1)
//     }
//     var mousemove = function (d) {
//         heatTip
//             .html("Value: " + d.Value)
//             .style("left", (d3.mouse(this)[0] + 70) + "px")
//             .style("top", (d3.mouse(this)[1]) + "px")
//     }
//     var mouseleave = function (d) {
//         heatTip
//             .transition()
//             .duration(500)
//             .style("opacity", 0)
//         d3.select(this)
//             .style("stroke", "none")
//             .style("opacity", 0.8)
//     }
//
// }