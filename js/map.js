var filelist = [];
for ( i = 1; i < 20; i ++ )
{
    // var filename = "data/aggDataHeatmap/Region" + i + ".csv";
    var filename = "data/aggTimeByReg/region" + i + ".csv";
    filelist.push(d3.csv(filename));
}
// some global variables for later usage
const regionNameList =
    ['Palace Hills',
        'Northwest',
        'Old Town',
        'Safe Town',
        'Southwest',
        'Downtown',
        'Wilson Forest',
        'Scenic Vista',
        'Broadview',
        'Chapparal',
        'Terrapin Springs',
        'Pepper Mill',
        'Cheddarford',
        'Easton',
        'Weston',
        'Southton',
        'Oak Willow',
        'East Parton',
        'West Parton'];
var projectionTs;
var mapTs;
var tsRoutes;
var tsDots;
// var tsfilelist = [];
// for ( i = 1; i < 20; i ++ )
// {
//     var tsfilename = "data/AggRegid/Region" + i + ".csv";
//     tsfilelist.push(d3.csv(tsfilename));
// }

// var mbfilelist = [];
// for (i = 1; i < 51; i++)
// {
//     var mbfilename = "data/mobileMaxValue/mobile" + i + ".csv";
//     mbfilelist.push(d3.csv(mbfilename));
// }
// console.log(mbfilelist);

// load data for time series
d3.csv("data/allSensorReadings_iqr.csv").then(data=>{
// d3.csv("data/MobileSensorReadings.csv").then(data=>{
    data.forEach(d=>{
        d.Timestamp = parse(d.Timestamp);
        d.Value = +d.Value;
        d["value_count"] = +d["value_count"];
        d["value_median"] = +d["value_median"];
        d["value_min"] = +d["value_min"];
        d.visible = true;
    })

// read heat map files
    Promise.all(filelist).then(files => {
            var index = 1;
            var alldata = [];
            for (let i = 0; i < files.length; i++) {
                files[i].forEach(d => {
                    d.Timestamp = parse(d.Timestamp);
                    d.Value = +d.Value;
                    d["value_count"] = +d["value_count"];
                    d["value_mean"] = +d["value_mean"];
                    d["value_min"] = +d["value_min"];
                })
                alldata.push(files[i]);
            }

            //draw initial heatmap
            draw_heatmap(alldata[index - 1],1);

            // create a tool tip for the map regions
            const mapTip = d3.select("#map")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tstooltip");

            // read geojson file
            d3.json('data/StHimark.geojson').then(geojson => {

                const width = 500, height = 500;
                var projection = d3.geoEquirectangular().scale(1).translate([0, 0]);

                const geoPath = d3.geoPath()
                    .projection(projection);

                //Scaling and translating.
                const b = geoPath.bounds(geojson),
                    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

                projection.scale(s).translate(t);

                projectionTs = projection;

                const hospitalLocation =
                    [{Lat: 0.180960, Long: -119.959400},
                        {Lat: 0.153120, Long: -119.915900},
                        {Lat: 0.151090, Long: -119.909520},
                        {Lat: 0.121800, Long: -119.904300},
                        {Lat: 0.134560, Long: -119.883420},
                        {Lat: 0.182990, Long: -119.855580},
                        {Lat: 0.041470, Long: -119.828610},
                        {Lat: 0.065250, Long: -119.744800}];
                const radiationStation = [{Lat: 0.162679, Long: -119.784825}];
                const mobileSensors = [];
                for (let i = 1; i < 51; i++) {
                    mobileSensors.push(i);
                }

                // draw map
                function draw_map(geojson) {
                    var mapSvg = d3.select('#map g#regMap')
                        .selectAll('path')
                        .data(geojson.features);

                    //append path to map
                    mapSvg.enter()
                        .append('path')
                        .attr('d', geoPath)
                        // .attr("class","geoPath")
                        .attr("id", d => removeWhitespace(d.properties.Nbrhood))
                        // // .attr("class", "regionPath")

                        .classed("unselected", true)
                        .classed("selected", d => d.properties.Nbrhood === "Palace Hills")
                        .on("mouseover", mouseover)
                        .on("mousemove", mousemove)
                        .on("mouseleave", mouseleave)
                        .on("click", d=>click(d));

                    // $(".geoPath").click(()=>{
                        // $(this).toggleClass("selected");
                    // })
                    //add region names to map
                    mapSvg.enter()
                        .append("svg:text")
                        .text(d => d.properties.Id + " " + d.properties.Nbrhood)
                        .style("display", "block")
                        .attr("x", d => geoPath.centroid(d)[0])
                        .attr("y", d => geoPath.centroid(d)[1])
                        .attr("text-anchor", "middle")
                        .attr("font-size", "8pt");

                    mapTs = mapSvg;

                    //load data for static sensors and plot them on to the map
                    d3.csv("data/StaticSensorLocations.csv").then(location => {
                        mapSvg.enter()
                            .data(location)
                            // .append("circle")
                            // .attr("id",d=>"static"+d["Sensor-id"])
                            // .attr("cx", d=> {
                            //     return projection([d.Long, d.Lat])[0];
                            // })
                            // .attr("cy", function(d) {
                            //     return projection([d.Long, d.Lat])[1];
                            // })
                            // .attr("r", "5px")
                            // .style("fill", "white");
                            .append("image")
                            .attr("class", "statIcon")
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("xlink:href", "Icon/meter.svg")
                            .attr("transform", d => {
                                return "translate(" + projection([d.Long, d.Lat]) + ")";
                            });

                    });


                    // function to plot sensor dots on map(used in time series)

                    let plotRoutes = function plotRoutes(sensor){
                        let filtered = data.filter(d=>d["Sensor-id"]===sensor && d.Value < 5000 && d["value_count"] >0);
                        let nest = d3.nest().key(d => d["Sensor-id"]).entries(filtered)
                        let points = filtered.map((d=>{
                            return [+d.Long,+d.Lat]

                        }));

                        let coordinate={
                            "type":"lineString",
                            "coordinates":points
                        }
                        let routeLine = d3.line()
                            .curve(d3.curveLinear)
                            .x( d=> {
                                return projection([d.Long, d.Lat])[0];
                            })
                            .y( d=> {
                                return projection([d.Long, d.Lat])[1];
                            })

                        let sensorRoute = mapSvg.data(nest)
                            .enter()
                            .append("path")
                            .attr("d",d=>routeLine(d.values))
                            .attr("class","mobileRoute")
                            .attr("id",d=>"route-" + d.key)

                        d3.selectAll(".mobileRoute")
                            .style("stroke",d=>getColorTs(d.key))
                            // .style("stroke-width", (d,i)=>d.values[i].value_median/250 +2)
                            .style("fill-opacity",0)
                            .style("opacity",0.5)
                            .on("mouseover", d=>highlight(d))
                            .on("mouseout",dim)
                    }



                    let plotDots = function plotDots(sensor) {
                        let filtered = data.filter(d=>d["Sensor-id"]===sensor && d.Value < 5000 && d["value_count"] >0);

                        let dotTip = d3.select("#map")
                            .append("div")
                            .style("opacity", 0)
                            .attr("class", "tstooltip");


                        //plot circles
                        mapSvg
                            .data(filtered)
                            // .data(data)
                            .enter()
                            .append("circle")
                            .attr("class", d => "dots dots-" + d["Sensor-id"])
                            .attr("id", (d, i) => "dot-" + d["Sensor-id"] + "-" + i)
                            .attr("cx", d => {
                                return projection([d.Long, d.Lat])[0];
                            })
                            .attr("cy", d => {
                                return projection([d.Long, d.Lat])[1];
                            })
                            // .attr("r", "3")
                            .attr("r", d => d.Value / 250 + 3)
                            .style("fill", d => getColorTs(d["Sensor-id"]))
                            .style("opacity", 0.5)
                            .on("mouseover", function (d, i) {
                                // d3.select(this)
                                //     .style("opacity", 1)
                                dotTip.transition()
                                    .duration(200)
                                    .style("opacity", "1");
                                dotTip
                                    .html("Sensor:" + d["Sensor-id"] + "<br>"
                                        + ""
                                        + "Time: " + d.Timestamp.toLocaleTimeString([],
                                            {
                                                year: '2-digit',
                                                month: '2-digit'
                                                , day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) + "<br>"
                                        + "Max: " + d.Value.toFixed(2) + " (cpm)" + "<br>"
                                        + "Median:" + d.value_median.toFixed(2) + " (cpm)" + "<br>"
                                        + "Min: " + d.value_min.toFixed(2) + " (cpm)" + "<br>"
                                    )
                                    // .style("left", (d3.mouse(this)[0] + 0) + "px")
                                    // .style("top", (d3.mouse(this)[1]) + 0 + "px");})
                                    .style("left", (d3.select(this).attr("cx") + 9) + "px")
                                    .style("top", (d3.select(this).attr("cy") - 43) + "px");

                            })

                            .on("mouseout", () => {
                                // d3.select(this)
                                //     .style("opacity", 0.8)
                                dotTip.transition()
                                    .duration(200)
                                    .style("opacity", "0");

                            });
                            // .on("click", d => drawRoute(d["Sensor-id"]))


                        // set up the initial position of car sensor
                        let initialPosition = [{Long: filtered[0].Long,Lat:filtered[0].Lat}];
                        // debugger

                        // plot car icon
                        mapSvg
                            .enter()
                            .data(initialPosition)
                            // .enter()
                            .append("image")
                            .attr("class", "carIcon")
                            .attr("id", d=>"carIcon-" + sensor)
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("xlink:href", "Icon/car_sensor.svg")
                            .attr("x",d=> projection([d.Long,d.Lat])[0] - 5)
                            .attr("y",d=> projection([d.Long,d.Lat])[1] - 5);
                            // .attr("transform", d => {
                            //     return "translate(" + [projection([d.Long, d.Lat])[0]-5, projection([d.Long, d.Lat])[1]-5] + ")";
                            // });
                    }

                    tsRoutes = plotRoutes;
                    tsDots = plotDots;


                    //plot hospitals on map
                    mapSvg.enter()
                        .data(hospitalLocation)
                        // .append("circle")
                        // .attr("id",d=>"static"+d["Sensor-id"])
                        // .attr("cx", d=> {
                        //     return projection([d.Long, d.Lat])[0];
                        // })
                        // .attr("cy", function(d) {
                        //     return projection([d.Long, d.Lat])[1];
                        // })
                        // .attr("r", "5px")
                        // .style("fill", "white");
                        .append("image")
                        .attr("class", "hospIcon")
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("xlink:href", "Icon/hospital.svg")
                        .attr("transform", d => {
                            return "translate(" + projection([d.Long, d.Lat]) + ")";
                        });


                    //plot nuclear station on map
                    mapSvg.enter()
                        .data(radiationStation)
                        .append("image")
                        .attr("class", "radIcon")
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("xlink:href", "Icon/radiation.svg")
                        .attr("transform", d => {
                            return "translate(" + projection([d.Long, d.Lat]) + ")";
                        });


                    // add map legend
                    let iconFiles = [{"Nuclear plant": "Icon/radiation.svg"}, {"Hospital": "Icon/hospital.svg"}, {"Static sensor": "Icon/meter.svg"}];
                    let legendSvg = d3.select("#map g.legendGroup");
                    legendSvg.selectAll("image")
                        .data(iconFiles)
                        .enter()
                        .append("image")
                        .attr("width", 13)
                        .attr("height", 13)
                        .attr("xlink:href", d => Object.values(d))
                        .attr("y", (d, i) => i * 15)
                        .attr("class", "mapLegend");
                    legendSvg.selectAll("text")
                        .data(iconFiles)
                        .enter()
                        .append("text")
                        .text(d=>Object.keys(d))
                        .attr("font-size",10)
                        .attr("x", 15)
                        .attr("y",(d,i)=>10 + i*15);

                    mapTs = mapSvg;
                }

                draw_map(geojson);
                drawTimeSeries(data.filter(d=>d.Value < 5000 && d.value_min >= 0));
            })


            // where helper functions go
            function removeWhitespace(str) {
                return str.replace(/\s+/g, '');
            }

            function mouseover() {
                // mapTip
                //     .transition()
                //     .duration(200)
                //     .style("opacity", 1)
                d3.select(this)
                // .style("stroke", "black")
                    .style("opacity", 0.5)
            }

            function click(d) {
                let thisElm = d3.select("#" + removeWhitespace(d.properties.Nbrhood));
                thisElm.classed("selected", function() { return !this.classList.contains("selected"); });
                for (let region of regionNameList) {
                    let index = regionNameList.indexOf(region);
                    if (d.properties.Nbrhood === region) {
                        draw_heatmap(alldata[index],index+1,);
                    }
                }
            }


            function highlight(d){
                d3.selectAll(".cpm").filter(e=> (e != undefined) && (e["Sensor-id"]===undefined || !e["Sensor-id"].find(f=>f["Sensor-id"]===d.key)).style("opacity"),0.2)
                d3.selectAll(".mobileRoute").style("opacity",0.1);
                d3.select("#route-" + d.key).style("opacity",1);

                d3.selectAll(".dots").style("opacity", 0.1);
                d3.selectAll(".dots-" + d.key).style("opacity", 1)

                d3.selectAll('.line').style("opacity",0.1);
                d3.select("#lin-" + d.key).style("opacity", 1);

                d3.selectAll(".legend").style("opacity", 0.1);
                d3.select("#leg-" + d.key).style("opacity", 1);

                d3.selectAll('.u-area').style("opacity",0.1);
                d3.select("#u-area-" + d.key).style("opacity",1)
                d3.selectAll('.l-area').style("opacity",0.1);
                d3.select("#l-area-" + d.key).style("opacity",1)
            }

            function dim(){
                d3.selectAll(".line").style("opacity",1);
                d3.selectAll(".legend").style("opacity",1);
                d3.selectAll(".mobileRoute").style("opacity", 0.5)
                d3.selectAll(".dots").style("opacity", 0.5)
                d3.selectAll(".u-area").style("opacity",0.5)
                d3.selectAll(".l-area").style("opacity",0.5)
            }

            function mousemove(d) {
                mapTip
                    .html("Region: " + d.properties.Nbrhood + "<br>"
                        + "ID  : " + d.properties.Id)
                    .style("left", (d3.mouse(this)[0] + 30) + "px")
                    .style("top", (d3.mouse(this)[1]) + 20 + "px")
            }

            function mouseleave() {
                mapTip
                    .transition()
                    .duration(200)
                    .style("opacity", 0)
                d3.select(this)
                // .style("stroke", "black")
                    .style("opacity", 1)
            }
    });
});