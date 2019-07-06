
//This javascript is using D3.V5 library

// Width and height, height2 is for slider
var tsMargin = {top:20, right:120, bottom: 90, left: 50},
    tsMargin2 = {top: 400, right: 10, bottom: 20, left: 40},
    tsWidth = 1400 - tsMargin.left - tsMargin.right,
    tsHeight = 700 - tsMargin.top - tsMargin.bottom,
    tsHeight2 = 450 - tsMargin2.top - tsMargin2.bottom;

var tsParseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
bisectDate = d3.bisector( d => d.Timestamp).left;

// Set up scales
var tsxScale = d3.scaleTime().range([0, tsWidth]),
    tsxScale2 = d3.scaleTime().range([0, tsWidth]),
    tsxScale3 = d3.scaleTime().range([0, tsWidth]),
    tsyScale = d3.scaleLinear().range([tsHeight, 0]);
// tsyScale = d3.scaleSymlog().range([tsHeight, 0]);

// Define the axes
var tsxAxis = d3.axisBottom(tsxScale)
        .tickSize(-tsHeight),
    tsxAxis2 = d3.axisBottom(tsxScale2)
        .ticks(d3.timeHour.every(12)),
    tsxAxis3 = d3.axisBottom(tsxScale3)
        .ticks(d3.timeHour.every(2))
        .tickSize(-tsHeight2)
        .tickFormat( () => null ),
    tsyAxis = d3.axisLeft(tsyScale)
        .tickSize(-tsWidth)
        .tickFormat(d3.format(".2f"));

// Define the line
var line = d3.line()
    .x(d => tsxScale(d.Timestamp))
    .y(d => tsyScale(d.Value))
    .curve(d3.curveLinear)
    .defined(d => !isNaN(d.Value));// Hiding line value for missing data

var svgTs = d3.select("#timeSeries").append("svg")
    .attr("width", tsWidth + tsMargin.left + tsMargin.right)
    .attr("height", tsHeight + tsMargin.top + tsMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tsMargin.left + "," + tsMargin.top + ")");

// 59 Custom colors, 50 mobile, 9 static
colorScheme = ["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94",
    "#e377c2","#f7b6d2","#7f7f7f"," #c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5","#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94",
    "#e377c2","#f7b6d2","#7f7f7f"," #c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5","#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94",
    "#e377c2","#f7b6d2","#7f7f7f"," #c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5"]
// colorScheme =
// [
//   "rgb(110, 64, 170)",
//   "rgb(123, 63, 174)",
//   "rgb(138, 62, 178)",
//   "rgb(152, 61, 179)",
//   "rgb(167, 60, 179)",
//   "rgb(181, 60, 177)",
//   "rgb(195, 61, 173)",
//   "rgb(209, 62, 168)",
//   "rgb(221, 63, 162)",
//   "rgb(233, 66, 154)",
//   "rgb(243, 69, 145)",
//   "rgb(251, 73, 135)",
//   "rgb(255, 79, 124)",
//   "rgb(255, 85, 113)",
//   "rgb(255, 92, 102)",
//   "rgb(255, 100, 91)",
//   "rgb(255, 109, 81)",
//   "rgb(255, 119, 71)",
//   "rgb(255, 129, 63)",
//   "rgb(255, 140, 56)",
//   "rgb(250, 151, 51)",
//   "rgb(242, 162, 47)",
//   "rgb(234, 174, 46)",
//   "rgb(224, 186, 47)",
//   "rgb(214, 197, 50)",
//   "rgb(205, 208, 55)",
//   "rgb(195, 218, 63)",
//   "rgb(186, 227, 73)",
//   "rgb(179, 236, 84)",
//   "rgb(167, 241, 89)",
//   "rgb(150, 243, 87)",
//   "rgb(133, 245, 87)",
//   "rgb(116, 246, 90)",
//   "rgb(100, 247, 95)",
//   "rgb(85, 246, 101)",
//   "rgb(71, 245, 110)",
//   "rgb(59, 242, 119)",
//   "rgb(49, 239, 130)",
//   "rgb(40, 234, 141)",
//   "rgb(34, 229, 153)",
//   "rgb(29, 222, 164)",
//   "rgb(26, 214, 176)",
//   "rgb(25, 206, 186)",
//   "rgb(26, 197, 196)",
//   "rgb(28, 187, 205)",
//   "rgb(32, 177, 212)",
//   "rgb(38, 167, 218)",
//   "rgb(44, 156, 222)",
//   "rgb(51, 145, 225)",
//   "rgb(58, 134, 225)",
//   "rgb(66, 124, 224)",
//   "rgb(74, 113, 221)",
//   "rgb(82, 104, 216)",
//   "rgb(89, 94, 209)",
//   "rgb(95, 86, 201)",
//   "rgb(101, 78, 192)",
//   "rgb(106, 70, 181)",
//   "rgb(110, 64, 170)"
// ]
var color = d3.scaleOrdinal().range(colorScheme);

// var tsfilelist = [];
// for ( i = 1; i < 20; i ++ )
// {
//   var tsfilename = "data/AggRegid/Region" + i + ".csv";
//   tsfilelist.push(d3.csv(tsfilename));
// }
//
// // Read data from csv file and preprocess it
// Promise.all( tsfilelist ).then( tsfiles => {
//   // console.log(data[0][0]);
//   var region = 6;
//   // Use region 1 as an example
//   // console.log(data[region-1]);
//   drawTimeSeries(tsfiles[region-1]);
//
// });

function drawTimeSeries(regionData){
    let dataset = d3.nest().key(d => d["Sensor-id"]).entries(regionData);

    // console.log(dataset);
    // svgTs.selectAll("*").remove();
    // var sensorList = Object.keys(regionData[0]).slice(1);
    // var mobileList = sensorList.filter(d => d.split("-")[0] === "mobile")
    //                            .sort((a,b) => {
    //                              var x = +a.split("-")[1],
    //                                  y = +b.split("-")[1];
    //                              return(x < y)? -1:1;
    //                            });
    // var staticList = sensorList.filter(d => d.split("-")[0] === "static");
    // if (staticList.length != 0 ){
    //   staticList.sort((a,b) => {
    //               var x = +a.split("-")[1],
    //                   y = +b.split("-")[1];
    //               return(x < y)? -1:1;
    //   });
    // }
    //
    // var updateList = mobileList.concat(staticList);

    // var dataset = updateList.map(d => {
    //     var dataset = regionData.map(d => {
    //
    //         return {
    //             name: d["Sensor-id"],
    //             values: regionData.map( i => {
    //                 return {
    //                     time:tsParseTime(i["Timestamp"]),
    //                     value:+i[d]
    //                 }
    //             }),
    //             visible:true
    //         }
    //     });
    // }
    debugger
    var greyBtn = "#d7d7d7";
    // var visible = true;
    //yMin, yMax
    var yMin = d3.min(dataset, d => d3.min(d.values, v => v.Value)),
        yMax = d3.max(dataset, d => d3.max(d.values, v => v.Value)) + 100;

    // console.log(yMin);
    // console.log(yMax);

    tsxScale.domain(d3.extent(regionData, d=>d.Timestamp));
    tsyScale.domain([yMin, yMax]);
    // Setting a duplicate xdomain for burshing reference
    tsxScale2.domain(tsxScale.domain());
    tsxScale3.domain(tsxScale.domain());

    // Create invisible rect for mouse tracking
    svgTs.append("rect")
        .attr("width", tsWidth)
        .attr("height", tsHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("id", "mouse-tracker")
        .style("fill", "none");

    // --------------------------For slider part--------------------------
    var context = svgTs.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + 0 + "," + 630 + ")");

    // Append clip path for lines plotted, hiding those part out of bounds
    svgTs.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", tsWidth)
        .attr("height", tsHeight);

    var brush = d3.brushX()
        .extent([[0,0], [tsWidth, tsHeight2]])
        .on("brush", brushing)
        .on("end", brushended);

    // Create brushing tsxAxis
    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + tsHeight2 + ")")
        .call(tsxAxis2);
    context.append("g")
        .attr("class", "axis axis--grid")
        .attr("transform", "translate(0," + tsHeight2 + ")")
        .call(tsxAxis3);
    context.append("g")
        .attr("class", "brush")
        .call(brush);
// --------------------------End slider part--------------------------

    //Draw line graph
    svgTs.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + tsHeight + ")")
        .call(tsxAxis);

    svgTs.append("g")
        .attr("class", "y axis")
        .call(tsyAxis);

    svgTs.append("g")
        .append("text")
        .attr("y", -18)
        .attr("x", -4)
        .attr("dy", "0.7em")
        .style("text-anchor", "end")
        .text("cpm")
        .attr("fill", "#000000");

// Draw focus
    var focus = svgTs.append("g")
        .attr("class", "circle")
        .style("display", "none")
        .attr("pointer-events", "none");
    focus.append("circle")
        .attr("r", 3);

// create a tooltip
    var tooltip = d3.select("#timeSeries")
        .append("div")
        .style("display", "none")
        .attr("class", "tstooltip")


// Draw Line
    var lines = svgTs.selectAll(".line-group")
        .data(dataset)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line-group")
        .attr("id", d => "line-" + d.key);

    lines.append("path")
        .attr("class", "line")
        .attr("d", d => d.visible? line(d.values) : null)
        .style("stroke", d => getColorTs(d.key))
        .attr("id", d => "lin-" + d.key)
        .on("mouseover", function(d) {
            d3.selectAll('.line').style("opacity", 0.2);
            d3.select(this).style("opacity", 1).style("stroke-width", "2px");
            d3.selectAll(".legend").style("opacity", 0.2);
            d3.select("#leg-" + d.key).style("opacity", 1);

            // Show circle
            var x0 = tsxScale.invert(d3.mouse(this)[0]),
                x1 = d3.timeMinute.every(10).round(x0),
                i = bisectDate(d.values, x1);
            focus.attr("transform", "translate(" + tsxScale(x1) + "," + tsyScale(d.values[i].Value) + ")"); // Find position
            focus.style("display", null);
            focus.selectAll("circle")
                .attr("fill", getColorTs(d.key));

            // console.log(d.values[i].time);
            // Show tooltip
            tooltip.style("display", null)
                .html( "Sensor: " + d.key + "<br>"
                    +  "Time  : " + d.values[i].Timestamp.toLocaleTimeString([], { year: '2-digit', month: '2-digit',day: '2-digit', hour: '2-digit', minute:'2-digit'})  + "<br>"
                    +  "Value : " + d.values[i].Value.toFixed(2) +  " (CPM)" )
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");
        })
        .on("mouseout", function() {
            d3.selectAll('.line').style("opacity", 1);
            d3.select(this).style("stroke-width", "1.5px");
            d3.selectAll(".legend").style("opacity", 1);
            focus.style("display", "none");

            // Hide tooltip
            tooltip.style("display", "none")
        });

    // Draw legend
    var legendSpace = tsHeight/(dataset.length + 1);
    var legend = svgTs.selectAll('.legend')
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("id", d => "leg-" + d.key);

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", tsWidth + (tsMargin.right/3) - 25)
        .attr("y", (d, i) => (i + 1) * legendSpace - 4)
        .attr("fill", d => d.visible? getColorTs(d.key) : greyBtn)
        .attr("class", "legend-box")
        .on("click", (d, i) => {
            d.visible = ! d.visible;

            //Update axis
            maxY = findMaxY(dataset) + 100;
            minY = findMinY(dataset) + 5;
            tsyScale.domain([minY, maxY]).nice();
            svgTs.select(".y.axis")
                .transition()
                .call(tsyAxis);
//
            // Update graph
            lines.select("path")
                .transition()
                .attr("d", d=> d.visible? line(d.values) : null);
            legend.select("rect")
                .transition()
                .attr("fill", d => d.visible? getColorTs(d.key) : greyBtn);
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .attr("fill", d =>getColorTs(d.key));

            d3.selectAll('.line').style("opacity", 0.2);
            // d3.select(this).style("opacity", 1).style("stroke-width", "2px");
            d3.selectAll(".legend").style("opacity", 0.2);
            d3.select("#lin-" + d.key).style("opacity", 1);
            d3.select("#leg-" + d.key).style("opacity", 1);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .attr("fill", d => d.visible? getColorTs(d.key) : greyBtn);

            d3.selectAll('.line').style("opacity", 1);
            d3.select(this).style("stroke-width", "1.5px");
            d3.selectAll(".legend").style("opacity", 1);
            focus.style("display", "none");

            // Hide tooltip
            tooltip.style("display", "none")
        });

    legend.append("text")
        .attr("x", tsWidth + (tsMargin.right/3) )
        .attr("y", (d, i) => (i + 1) * legendSpace + 4 )
        .attr("fill", "#5d5d5d")
        .style("font-size","11")
        .text(d => d.key);

    //For brusher of the slider bar at the bottom
    function brushing() {
        tsxScale.domain(!d3.event.selection ? tsxScale2.domain() : d3.event.selection.map(tsxScale2.invert)); // If brush is empty then reset the tsxScale domain to default, if not then make it the brush extent
        reDraw();
    }

    function brushended() {
        if( !d3.event.sourceEvent) {
            return; // Only transition after input;
        }
        if( !d3.event.selection) {
            tsxScale.domain(tsxScale2.domain());
        }
        else {
            var d0 = d3.event.selection.map(tsxScale2.invert),
                d1 = d0.map(d3.timeHour.round);
            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeHour.floor(d0[0]);
                d1[1] = d3.timeHour.offset(d1[0]);
            }
            d3.select(this).transition().call(d3.event.target.move, d1.map(tsxScale2));
            tsxScale.domain([d1[0], d1[1]]);
        }
        reDraw();
    }

    function reDraw() {
        svgTs.select(".x.axis")
            .transition()
            .call(tsxAxis);

        maxY = findMaxY(dataset) + 100;
        minY = findMinY(dataset);
        tsyScale.domain([minY, maxY]).nice();

        svgTs.select(".y.axis")
            .transition()
            .call(tsyAxis);

        lines.select(".line-group path")
            .transition()
            .attr("d", d => d.visible ? line(d.values) : null);

    }

    // // select/clear all the lines
    // var toggle = true;
    // d3.select("input")
    //     .on("click", function() {
    //         d3.selectAll("path.line")
    //             .style("opacity", +(toggle = !toggle))
    //     })

}

function getColorTs(name){
    var sensor = name.split("-");
    var type = sensor[0];
    // console.log(type);
    var id = +sensor[1];
    // console.log(id);
    var result;
    if(type == "mobile") {
        result = id - 1;
    }else{
        switch(id) {
            case 1:
                result = 1;
                break;
            case 4:
                result = 2;
                break;
            case 6:
                result = 2;
                break;
            case 9:
                result = 4;
                break;
            case 11:
                result = 5;
                break;
            case 12:
                result = 6;
                break;
            case 13:
                result = 7;
                break;
            case 14:
                result = 8;
                break;
            case 15:
                result = 9;
                break;
            default:
                result = 10;
        }
    }
    return colorScheme[result];
}

function findMaxY(data) {
    var maxYValues = data.map( d => {
        if (d.visible) {
            return d3.max(d.values, value => value.Value) + 1;
        }
    });
    return d3.max(maxYValues);
}

function findMinY(data) {
    var minYValues = data.map( d => {
        if (d.visible) {
            return d3.min(d.values, value => value.Value) - 1;
        }
    });
    return d3.min(minYValues);
}
