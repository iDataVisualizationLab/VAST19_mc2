
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

// Define the lines
var line = d3.line()
    .x(d => tsxScale(d.Timestamp))
    .y(d => tsyScale(d.value_mean))
    .curve(d3.curveLinear)
    .defined(d => !isNaN(d.value_mean));// Hiding line value for missing data
var maxLine = d3.line()
    .x(d => tsxScale(d.Timestamp))
    .y(d => tsyScale(d.Value))
    .curve(d3.curveLinear)
    .defined(d => !isNaN(d.Value));

var minLine = d3.line()
    .x(d => tsxScale(d.Timestamp))
    .y(d => tsyScale(d.value_min))
    .curve(d3.curveLinear)
    .defined(d => !isNaN(d.value_min));


// //define the min-max area
var upperArea = d3.area()
    .curve(d3.curveBasis)
    .x(d => tsxScale(d.Timestamp))
    // .x (function (d) { return x(d.Timestamp); })
    .y0(function (d) { return tsyScale(d.value_mean); })
    .y1(function (d) { return tsyScale(d.Value); })
    .defined(d => !isNaN(d.Value) && !isNaN(d.value_mean));;

var lowerArea = d3.area()
    .curve(d3.curveBasis)
    .x(d => tsxScale(d.Timestamp))
    // .x (function (d) { return x(d.Timestamp) ; })
    .y0(function (d) { return tsyScale(d.value_min); })
    .y1(function (d) { return tsyScale(d.value_mean); })
    .defined(d => !isNaN(d.value_mean)&& !isNaN(d.value_min));;

var svgTs = d3.select("#timeSeries").append("svg")
    .attr("width", tsWidth + tsMargin.left + tsMargin.right)
    .attr("height", tsHeight + tsMargin.top + tsMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + tsMargin.left + "," + tsMargin.top + ")");

var greyBtn = "#d7d7d7";

// 59 Custom colors, 50 mobile, 9 static
var colorScheme = ["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5",
    "#8c564b","#c49c94", "#e377c2","#f7b6d2","#bcbd22","#dbdb8d","#17becf","#9edae5", "#393b79","#6b6ecf",
    "#637939","#b5cf6b","#843c39","#d6616b","#7b4173","#ce6dbd","#5254a3","#8ca252","#9c9ede","#cedb9c",
    "#ff7f0e","#ffbb78","#2ca02c","#98df8a", "#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b", "#c49c94",
    "#e377c2","#f7b6d2","#bcbd22","#dbdb8d","#17becf","#9edae5", "#1f77b4","#aec7e8", "#ff7f0e","#ffbb78",
    "#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2"]

var color = d3.scaleOrdinal().range(colorScheme);



// function to draw time series
function drawTimeSeries(regionData) {
    let dataset = d3.nest().key(d => d["Sensor-id"]).entries(regionData);
    var yMin = d3.min(dataset, d => d3.min(d.values, v => v.value_min)),
        yMax = d3.max(dataset, d => d3.max(d.values, v => v.Value)) + 100;

    // console.log(yMin);
    // console.log(yMax);

    tsxScale.domain(d3.extent(regionData, d => d.Timestamp));
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
        .extent([[0, 0], [tsWidth, tsHeight2]])
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
        .style("opacity", 0)
        .attr("class", "tstooltip")

// define areas
    var upperAreas = svgTs.selectAll(".u-area-group")
        .data(dataset)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "u-area-group")

    var lowerAreas = svgTs.selectAll(".l-area-group")
        .data(dataset)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "l-area-group")
    // .attr("id", d=> "area-group-" + d.key);

    upperAreas.append("path")
        .attr("class", "u-area")
        .attr("d", d => d.visible ? upperArea(d.values) : null)
        .style("fill", d => getColorTs(d.key))
        .attr("id", d => "u-area-" + d.key)
        .on("click", d => {
            return d.visible = !d.visible;
        });

    lowerAreas.append("path")
        .attr("class", "l-area")
        .attr("d", d => d.visible ? lowerArea(d.values) : null)
        .style("fill", d => getColorTs(d.key))
        .attr("id", d => "l-area-" + d.key)
        .on("click", d => {
            return d.visible = !d.visible;
        });
// draw min, max lines
    var maxLines = svgTs.selectAll(".max-line-group")
        .data(dataset)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "max-line-group")
        .attr("id", d => "maxlinegrp-" + d.key);

    maxLines.append("path")
        .attr("class", "max-line")
        .attr("d", d => d.visible ? maxLine(d.values) : null)
        .style("stroke", d => getColorTs(d.key))
        .style("fill-opacity", 0)
        .attr("id", d => "maxline-" + d.key)

    var minLines = svgTs.selectAll(".min-line-group")
        .data(dataset)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "min-line-group")
        .attr("id", d => "minlinegrp-" + d.key);

    minLines.append("path")
        .attr("class", "min-line")
        .attr("d", d => d.visible ? minLine(d.values) : null)
        .style("stroke", d => getColorTs(d.key))
        .style("fill-opacity", 0)
        .attr("id", d => "minline-" + d.key)


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
        .attr("d", d => d.visible ? line(d.values) : null)
        // .attr("d", d=> line(d.values))
        .style("stroke", d => getColorTs(d.key))
        // .style("fill-opacity", 0.5)
        .attr("id", d => "lin-" + d.key)
        .on("click", (d, i) => {

            d.visible = !d.visible;
            // Update graph
            upperAreas.select("#u-area-" + d.key)
                .transition()
                .attr("d", d => d.visible ? upperArea(d.values) : null);
            lowerAreas.select("#l-area-" + d.key)
                .transition()
                .attr("d", d => d.visible ? upperArea(d.values) : null);
            // maxLines.select("#maxline-" + d.key)
            //     .transition()
            //     .attr("d",d=>d.visible? maxLine(d.values):null);
            // minLines.select("#minline-" + d.key)
            //     .transition()
            //     .attr("d", d=>d.visible? minLine(d.values):null);
            // if(d.visible){
            //     plot_dots("d");
            // }else{
            //     null;
            // }
            plot_dots(d.key);
        })
        .on("mouseover", function (d,i) {
            d3.selectAll('.line').style("opacity", 0.2);
            d3.select(this).style("opacity", 1).style("stroke-width", "2px");
            d3.selectAll(".legend").style("opacity", 0.2);
            d3.select("#leg-" + d.key).style("opacity", 1);

            // Show circle
            var x0 = tsxScale.invert(d3.mouse(this)[0]),
                x1 = d3.timeMinute.every(10).round(x0),
                i = bisectDate(d.values, x1);
            focus.attr("transform", "translate(" + tsxScale(x1) + "," + tsyScale(d.values[i].value_mean) + ")"); // Find position
            focus.style("display", null);
            focus.selectAll("circle")
                // .attr("id", f=>"circle-" + f.key)
                .attr("fill", getColorTs(d.key));

            // console.log(d.values[i].time);
            // Show tooltip
            // tooltip.style("display", null)
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip
                .html("Sensor: " + d.key + "<br>"
                    + "Time: " + d.values[i].Timestamp.toLocaleTimeString([], {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + "<br>"
                    + "Mean: " + d.values[i].value_mean.toFixed(2) + " (cpm)" + "<br>"
                    + "Max: " + d.values[i].Value.toFixed(2) + "(cpm)" + "<br>"
                    + "Min: " + d.values[i].value_min.toFixed(2) + "(cpm)" + "<br>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function () {
            d3.selectAll('.line').style("opacity", 1);
            d3.select(this).style("stroke-width", "1.5px");
            d3.selectAll(".legend").style("opacity", 1);
            focus.style("display", "none");

            // Hide tooltip
            tooltip.style("opacity", 0)
        });

    // Draw legend
    var legendSpace = tsHeight / (dataset.length + 1);
    var legend = svgTs.selectAll('.legend')
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("id", d => "leg-" + d.key);

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", tsWidth + (tsMargin.right / 3) - 25)
        .attr("y", (d, i) => (i + 1) * legendSpace - 4)
        .attr("fill", d => d.visible ? getColorTs(d.key) : greyBtn)
        // .attr("fill", d =>  getColorTs(d.key))
        .attr("class", "legend-box")
        .on("click", (d, i) => {
            d.visible = !d.visible;

            //Update axis
            maxY = findMaxY(dataset) + 100;
            minY = findMinY(dataset) + 5;
            tsyScale.domain([minY, maxY]).nice();
            svgTs.select(".y.axis")
                .transition()
                .call(tsyAxis);


            // Update graph
            lines.select("path")
                .transition()
                .attr("d", d => d.visible ? line(d.values) : null);
            // update legend
            legend.select("rect")
                .transition()
                .attr("fill", d => d.visible ? getColorTs(d.key) : greyBtn);
            // // update upper area
            upperAreas.select("#u-area-" + d.key)
                .transition()
                .attr("d", d => {
                    if (!d.visible) {
                        null;
                    }
                });
            // update
            lowerAreas.select("#l-area-" + d.key)
                .transition()
                .attr("d", d => {
                    if (!d.visible) {
                        null;
                    }
                });

            if (d.visible) {
                tsPlot(d.key);
                // plot_dots(d.key);
            }else{
                removePlot(d.key);
            }
        })
        .on("mouseover", function (d) {
            // d3.select(this)
            //     .transition()
            //     .attr("fill", d => getColorTs(d.key));

            d3.selectAll('.line').style("opacity", 0.2);
            // d3.select(this).style("opacity", 1).style("stroke-width", "2px");
            d3.selectAll(".legend").style("opacity", 0.2);
            d3.select("#lin-" + d.key).style("opacity", 1);
            d3.select("#leg-" + d.key).style("opacity", 1);
        })
        .on("mouseout", function (d) {
            // d3.select(this)
            //     .transition()
            //     .attr("fill", d => d.visible ? getColorTs(d.key) : greyBtn);

            d3.selectAll('.line').style("opacity", 1);
            d3.select(this).style("stroke-width", "2px");
            d3.selectAll(".legend").style("opacity", 1);
            focus.style("display", "none");

            // Hide tooltip
            tooltip.style("opacity", 0)
        });

    legend.append("text")
        .attr("x", tsWidth + (tsMargin.right / 3))
        .attr("y", (d, i) => (i + 1) * legendSpace + 4)
        .attr("class", "legend-text")
        .attr("fill", "#5d5d5d")
        .style("font-size", "11")
        .text(d => d.key)
        // .on("click", d => {
        //     d.visible = !d.visible;
        //     legend.select("text")
        //         .transition()
        //         .attr("fill", d => d.visible ? getColorTs(d.key) : "#5d5d5d");
        //     if (d.visible) {
        //         tsPlot(d.key);
        //     }
        //
        //
        // });

    //For brusher of the slider bar at the bottom
    function brushing() {
        tsxScale.domain(!d3.event.selection ? tsxScale2.domain() : d3.event.selection.map(tsxScale2.invert)); // If brush is empty then reset the tsxScale domain to default, if not then make it the brush extent
        reDraw();
    }

    function brushended() {
        if (!d3.event.sourceEvent) {
            return; // Only transition after input;
        }
        if (!d3.event.selection) {
            tsxScale.domain(tsxScale2.domain());
        } else {
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

        upperAreas.select(".u-area-group path")
            .transition()
            .attr("d", d => d.visible ? upperArea(d.values) : null);
        lowerAreas.select(".l-area-group path")
            .transition()
            .attr("d", d => d.visible ? lowerArea(d.values) : null);

    }
debugger


    function plot_dots(sensor) {
        let dotTip = d3.select("#map")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tstooltip");
    mapTs.data(dataset.filter(f=>f.key === sensor ))
        .enter()
        .append("circle")
        .attr("class", "dots")
        .attr("cx", (d,i) => {
            return projectionTs([d.values[i].Long, d.values[i].Lat])[0];
        })
        .attr("cy", function (d,i) {
            return projectionTs([d.values[i].Long, d.values[i].Lat])[1];
        })
        .attr("r", "3")
        .style("fill", d=>getColorTs(d.key))
        .style("opacity", .8)
        .on("mouseover", (d,i) => {
            dotTip.transition()
                .duration(200)
                .style("opacity", "1");
            //
            // heatTip
            //     .html("Sensor: " + d.key + "<br>"
            //         + "Time: " + d.values[i].Timestamp.toLocaleTimeString([], {
            //             year: '2-digit',
            //             month: '2-digit',
            //             day: '2-digit',
            //             hour: '2-digit',
            //             minute: '2-digit'
            //         }) + "<br>"
            //         + "Mean: " + d.values[i].value_mean.toFixed(2) + " (cpm)" + "<br>"
            //         + "Max: " + d.values[i].Value.toFixed(2) + "(cpm)" + "<br>"
            //         + "Min: " + d.values[i].value_min.toFixed(2) + "(cpm)" + "<br>")
            //     .style("left", (d3.mouse(this)[0] + 0) + "px")
            //     .style("top", (d3.mouse(this)[1]) + 0 + "px")
            //     // .style("left", d3.select(this).attr("cx") + "px")
            //     // .style("top", d3.select(this).attr("cy") + "px");

            // heatTip
            //     .transition()
            //     .duration(100)
            //     .style("opacity", 1)
            //
            // tooltip.transition()
            //     .duration(200)
            //     .style("opacity", 1);


            dotTip
                .html("Sensor: " + d.key + "<br>"
                    + "Time: " + d.values[i].Timestamp.toLocaleTimeString([], {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + "<br>"
                    + "Mean: " + d.values[i].value_mean.toFixed(2) + " (cpm)" + "<br>"
                    + "Max: " + d.values[i].Value.toFixed(2) + "(cpm)" + "<br>"
                    + "Min: " + d.values[i].value_min.toFixed(2) + "(cpm)" + "<br>")
                // .style("left", (d3.mouse(this)[0] + 0) + "px")
                // .style("top", (d3.mouse(this)[1]) + 0 + "px");})
                .style("left", d3.select(this).attr("cx") + "px")
                .style("top", d3.select(this).attr("cy") + "px");
        })
        .on("mouseout", () => {
            dotTip.transition()
                .duration(200)
                .style("opacity", "0");
        })
        on("click", d=>drawRoute(d.key))
}

    // function to remove mobile dots on map
    function removePlot(sensor){
        d3.selectAll(".dots-" + sensor).remove();

}
    //function to draw routes on map
    function drawRoute(sensor){





    }

// control panel
    // check to select/unselect all sensors
    d3.select("#allSensor")
        .on("change", ()=> {
            if (d3.select("#allSensor").property("checked")) {
                d3.selectAll(".line")
                    .transition()
                    .attr("d", d =>  line(d.values))
                    .attr("fill", d => getColorTs(d.key))// .style("opacity",1);
                d3.selectAll(".legend-box")
                    .attr("fill", d => getColorTs(d.key))
            }
            else
            {
                d3.selectAll("path.line").remove();
                d3.selectAll(".legend-box").attr("fill",greyBtn);
            }
        })


    function selectAllMobile() {


    };


    // d3.select("input#cleaAll").on("click", () => {
    //     d3.selectAll("path.line").remove();
    //     d3.select("svgTs").selectAll(".u-area").remove();
    //     d3.select("svgTs").selectAll(".l-area").remove();
    // });

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
            return d3.min(d.values, value => value.value_min) - 1;
        }
    });
    return d3.min(minYValues);
}


// function selectAll(){
//     d3.select("svgTs").selectAll("path.line")
//         .style("stroke", d => getColorTs(d.key))
//         .style("opacity", 1)
//
// }
//
function clearAll() {
    d3.selectAll("path.line").remove();
    // d3.selectAll("path.area").style("opacity", 0);
    // d3.selectAll("rect.legend-box").style("fill",greyBtn );


}