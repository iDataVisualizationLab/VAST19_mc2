var filelist = [];
for ( i = 1; i < 20; i ++ )
{
    // var filename = "data/aggDataHeatmap/Region" + i + ".csv";
    var filename = "data/aggTimeByReg/region" + i + ".csv";

    filelist.push(d3.csv(filename));
}

var tsfilelist = [];
for ( i = 1; i < 20; i ++ )
{
    var tsfilename = "data/AggRegid/Region" + i + ".csv";
    tsfilelist.push(d3.csv(tsfilename));
}

var mbfilelist = [];
for (i = 1; i < 51; i++)
{
    var mbfilename = "data/mobileMaxValue/mobile" + i + ".csv";
    mbfilelist.push(d3.csv(mbfilename));
}
console.log(mbfilelist);

Promise.all(filelist).then(files => {
    Promise.all( tsfilelist ).then( tsfiles => {
        Promise.all(mbfilelist).then( mbfiles=> {
            var index = 1;
            var alldata = [];
            for (let i = 0; i < files.length; i++) {
                files[i].forEach(d => {
                    d.Timestamp = parse(d.Timestamp);
                    d.Value = +d.Value;
                })
                alldata.push(files[i]);
            }
            var mbdata =[];
            for (let j = 0; j < mbfiles.length; j++) {
                mbfiles[j].forEach(f => {
                    f.Timestamp = parse(f.Timestamp);
                    f.Value = +f.Value;
                    f.Long = +f.Long;
                    f.Lat = +f.Lat;
                })
                mbdata.push(mbfiles[j]);
            }
            console.log(mbdata[0]);

            const heatmapIds = [];
            for (let i = 1; i < 20; i++) {
                heatmapIds.push("region" + i + "heatmap");
            }
            console.log(heatmapIds);


            //draw initial heatmap and timeseries
            draw_heatmap(alldata[index - 1]);
            drawTimeSeries(tsfiles[index - 1]);
            // draw_mobile_location(mddata[index -1]);

            const mapTip = d3.select("#map")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tstooltip");

            d3.json('data/StHimark.geojson').then(geojson => {

                const width = 500, height = 500;
                const projection = d3.geoEquirectangular().scale(1).translate([0, 0]);

                const geoPath = d3.geoPath()
                    .projection(projection);

                //Scaling and translating.
                const b = geoPath.bounds(geojson),
                    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

                projection.scale(s).translate(t);

                // some variables for later usage
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
                    const mapSvg = d3.select('#map g.map')
                        .selectAll('path')
                        .data(geojson.features);

                    //append path to map
                    mapSvg.enter()
                        .append('path')
                        .attr('d', geoPath)
                        // .attr("class","geoPath")
                        .attr("id", d => removeWhitespace(d.properties.Nbrhood))
                        .classed("unselected", d => d.properties.Nbrhood !== "Palace Hills")
                        .classed("selected", d => d.properties.Nbrhood === "Palace Hills")
                        .on("mouseover", mouseover)
                        // .on("mousemove", mousemove)
                        .on("mouseleave", mouseleave)
                        .on("click", d => {
                            // d3.selectAll("path").classed("unselected",true);
                            d3.select("#"+"d.id").classed("selected",true);
                            for (const region of regionNameList) {
                                const index = regionNameList.indexOf(region);
                                if (d.properties.Nbrhood === region) {
                                    draw_heatmap(alldata[index]);
                                    drawTimeSeries(tsfiles[index]);
                                }
                            }
                            // toggleHeatmap();
                        })

                    //add region names to map
                    mapSvg.enter()
                        .append("svg:text")
                        .text(d => d.properties.Id + " " + d.properties.Nbrhood)
                        .style("display", "block")
                        .attr("x", d => geoPath.centroid(d)[0])
                        .attr("y", d => geoPath.centroid(d)[1])
                        .attr("text-anchor", "middle")
                        .attr("font-size", "8pt");

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

                        // .on("mouseover",d=>{
                        //     d3.select(".statIcon")
                        //         .html("Static: " + d["Sensor-id"])
                        // });
                    });



                    //plot initial mobile locations
                    const dotTip = d3.select("#map")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tstooltip");

                    mapSvg
                        .data(mbdata[0])// set mobile sensor 1 as initial data
                        .enter()
                        .append("circle")
                        .attr("class","dots")
                        .attr("cx", d=> {
                            return projection([d.Long, d.Lat])[0];
                        })
                        .attr("cy", function(d) {
                            return projection([d.Long, d.Lat])[1];
                        })
                        .attr("r", "3")
                        .style("fill", "#31a354")
                        .style("opacity",.8)
                        .on("mouseover", d=>{
                            dotTip.transition()
                                .duration(200)
                                .style("opacity","1");
                            dotTip
                                .html("Time: " + d.Timestamp.toLocaleTimeString([], { year: '2-digit', month: '2-digit',day: '2-digit', hour: '2-digit', minute:'2-digit'})  + "<br>"
                                    + "Value  : " + d.Value.toFixed(2) + " (cmp)")
                                // .style("left", (d3.mouse(this)[0] + 0) + "px")
                                // .style("top", (d3.mouse(this)[1]) + 0 + "px");})
                                .style("left", d3.select(this).attr("cx") + "px")
                                .style("top", d3.select(this).attr("cy") + "px");})
                        .on("mouseout",()=>{
                            dotTip.transition()
                                .duration(200)
                                .style("opacity","0");});




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


                    //plot radiation station on map
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
                    let iconFiles = [{"Neuclear station": "Icon/radiation.svg"}, {"Hospital": "Icon/hospital.svg"}, {"Static sensor": "Icon/meter.svg"}];
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
                    // legendSvg.selectAll("text")
                    //     .append("text")
                    //     .text(d=>Object.keys(d))
                    //     .attr("font-size",10)
                    //     .attr("x", 30)
                    //     .attr("y",(d,i)=>i*15);
                    debugger

                }

                draw_map(geojson);
            })

            // where helper functions go

            function toggleHeatmap(){
                let blocks = d3.select(".heatmapBlock");
                for(let i=0; i < blocks.length; i++ ){
                    if(blocks[i].style.display == "block"){
                        blocks[i].style.display = "none";
                        return;
                    }
                    blocks[i].style.display = "block";
                }

            }


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

            // function mousemove(d) {
            //     mapTip
            //         .html("Region: " + d.properties.Nbrhood + "<br>"
            //             + "ID  : " + d.properties.Id)
            //         .style("left", (d3.mouse(this)[0] + 30) + "px")
            //         .style("top", (d3.mouse(this)[1]) + 20 + "px")
            // }

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
});