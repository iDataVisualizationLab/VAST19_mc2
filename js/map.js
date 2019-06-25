var filelist = [];
for ( i = 1; i < 20; i ++ )
{
	var filename = "data/aggDataHeatmap/Region" + i + ".csv";
	filelist.push(d3.csv(filename));
}

var tsfilelist = [];
for ( i = 1; i < 20; i ++ )
{
  var tsfilename = "data/AggRegid/Region" + i + ".csv";
  tsfilelist.push(d3.csv(tsfilename));
}

Promise.all(filelist).then(files => {
	Promise.all( tsfilelist ).then( tsfiles => {
	var index = 1;
	var alldata = [];
	for (i = 0; i < files.length; i ++ ){
		files[i].forEach(d => {
			d.Timestamp = parse(d.Timestamp);
			d.Value = +d.Value;
		})
		alldata.push(files[i]);
	}

//Initialize a map inside a div called map
var map = L.map('map',{
  zoomControl: false,
  scrollWheelZoom: false,
  dragging: false,
  attributionControl: false,
  doubleClickZoom: false
}).setView([0.115, -119.855], 11.9);

var geojson;

var style_override = {};
var style_target = function(f) { return f.properties.Id};
function merge_styles(base, new_styles){
    for (var attrname in new_styles) { base[attrname] = new_styles[attrname]; }
    return base;
}

//set color palatte
function getColor(d) {
  return d == '1' ? '#FFB6C1':
         d == '2' ? '#DA70D6':
         d == '3' ? '#FFFF00':
         d == '4' ? '#EE82EE':
         d == '5' ? '#FFE4B5':
         d == '6' ? '#87CEFA':
         d == '7' ? '#66c2a4':
         d == '8' ? '#FFD700':
         d == '9' ? '#BA55D3':
         d == '10' ? '#00FFFF':
         d == '11' ? '#FFA500':
         d == '12' ? '#FFC0CB':
         d == '13' ? '#1E90FF':
         d == '14' ? '#87CEEB':
         d == '15' ? '#6495ED':
         d == '16' ? '#7FFFAA':
         d == '17' ? '#F0E68C':
         d == '18' ? '#DAA520':
         d == '19' ? '#FA8072': '#edf8fb'
};

//attach color palatte to category
function style(feature, color) {
    var target = style_target(feature);
    var fillColor = (!color) ? getColor(target) : color;
    // var fillColor = fillColor;
    var default_style = {
        fillColor: fillColor,
        weight: 0.8,
        opacity: 1,
        color: 'grey',
        fillOpacity: 1
    };
    return merge_styles(default_style, style_override);
};

L.geoJson(districts).addTo(map);

var sensor_list = ['sensor-1', 'sensor-2', 'sensor-3', 'sensor-4', 'sensor-5', 'sensor-6', 'sensor-7', 'sensor-8', 'sensor-9', 'sensor-10', 'sensor-11', 'sensor-12', 'sensor-13', 'sensor-14', 'sensor-15', 'sensor-16', 'sensor-17', 'sensor-18', 'sensor-19', 'sensor-20', 'sensor-21', 'sensor-22', 'sensor-23', 'sensor-24', 'sensor-25', 'sensor-26', 'sensor-27', 'sensor-28', 'sensor-29', 'sensor-30', 'sensor-31', 'sensor-32', 'sensor-33', 'sensor-34', 'sensor-35', 'sensor-36', 'sensor-37', 'sensor-38', 'sensor-39', 'sensor-40', 'sensor-41', 'sensor-42', 'sensor-43', 'sensor-44', 'sensor-45', 'sensor-46', 'sensor-47', 'sensor-48', 'sensor-49', 'sensor-50'];

function highlightSensor(sensor){
  for (let j = 0; j < sensor_list.length; j++) {
    if(sensor_list[j] !== sensor){
      var x = document.getElementById(sensor_list[j]);
      x.style.opacity = 0.4;
    }
    else{
      var x = document.getElementById(sensor_list[j]);
      x.style.opacity = 0.9;
    }
  }
}

var sensorR1;
var sensorR2;
var sensorR3;
var sensorR4;
var sensorR5;
var marker;

//add sensor route
function drawSensorRoute(sensorId){
  date = ['06', '07', '08', '09', '10'];
  route = [];
  for(i = 0; i < date.length; i++){
      day = date[i];
      route = route.concat(sensorRoute[sensorId][day]['location']);
  }
  sensorRouteDay1 = sensorRoute[sensorId]['06']['location'];
  sensorRouteDay2 = sensorRoute[sensorId]['07']['location'];
  sensorRouteDay3 = sensorRoute[sensorId]['08']['location'];
  sensorRouteDay4 = sensorRoute[sensorId]['09']['location'];
  sensorRouteDay5 = sensorRoute[sensorId]['10']['location'];
  marker = L.Marker.movingMarker(route, 50000);
  sensorR1 = L.polyline(sensorRouteDay1, {color: '#CC0000'});
  sensorR2 = L.polyline(sensorRouteDay2, {color: '#FF3300'});
  sensorR3 = L.polyline(sensorRouteDay3, {color: '#330033'});
  sensorR4 = L.polyline(sensorRouteDay4, {color: '#33CCCC'});
  sensorR5 = L.polyline(sensorRouteDay5, {color: '#0000CC'});
  map.addLayer(sensorR1);
  map.addLayer(sensorR2);
  map.addLayer(sensorR3);
  map.addLayer(sensorR4);
  map.addLayer(sensorR5);
  var taxiIcon = L.icon({
    iconUrl:'data/Icon/car_sensor.svg',
    iconSize: [15, 30], // size of the icon
    popupAnchor: [0, -5]
  });
  marker.once('click', function () {
      marker.start();
      marker.closePopup();
      marker.unbindPopup();
      marker.on('click', function() {
          if (marker.isRunning()) {
              marker.pause();
          } else {
              marker.start();
          }
      });
      setTimeout(function() {
          marker.bindPopup('<b>sensor-'+sensorId+'</b>').openPopup();
      }, 0);
  });
  marker.options.icon = taxiIcon;
  marker.openPopup('<b>sensor-'+sensorId+'</b>');
  map.addLayer(marker);
}

function removeRoute(){
  map.removeLayer(sensorR1);
  map.removeLayer(sensorR2);
  map.removeLayer(sensorR3);
  map.removeLayer(sensorR4);
  map.removeLayer(sensorR5);
  map.removeLayer(marker);
}

// click dot show sensorRoute
function showSensorRoute(){
  removeRoute();
  let targetText = event.target.id;
  console.log(targetText);
  sensorId = targetText.split('-')[1];
  drawSensorRoute(sensorId);
  highlightSensor(targetText);
}

function showGraph(e){
  var layer = e.target;
  var region_id = layer.feature.properties.Id;
	var region_name = layer.feature.properties.Nbrhood;
	// add region_name after click
	$('#region_name').children().remove();
	var html = '<span id="region_name" style="text-align: center; display: block; ">Region: ' + region_name + '</span>'
  $('#region_name').append(html);
  draw_heatmap(alldata[region_id-1]);
	drawTimeSeries(tsfiles[region_id-1]);
}

function onEachFeature(feature, layer) {
    layer.on({
        click: showGraph
    });
}

var geojson = L.geoJson(districts, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


// add region_Name label
// location of different regions
var regionList = [[0.18, -119.97], [0.185, -119.928], [0.193, -119.87], [0.18, -119.81],  [0.12, -119.93], [0.153, -119.925], [0.11, -119.727], [0.045, -119.755], [0.058, -119.845], [0.055, -119.79], [0.075, -119.769], [0.12, -119.76], [0.115, -119.805], [0.16, -119.869], [0.16, -119.895], [0.132, -119.895], [0.09, -119.842], [0.13, -119.84], [0.13, -119.87]];

var regionName = ['1 Palace Hills', '2 Northwest', '3 Old Town', '4 Safe Town', '5 Southwest', '6 Downtown', '7 Wilson Forest', '8_Scenic-Vista', '9 Broadview', '10 Chapparal', '11 Terrapin Springs', '12 Pepper Mill', '13 Cheddar-ford', '14 Easton', '15 Weston', '16 Southton', '17_Oak Willow', '18 East Parton', '19 West Parton'];

for(i = 0; i < 19; i++){
    window["regionLabel" + i] = L.marker(regionList[i], {
    icon: L.divIcon({
        className: 'text-labels',   // Set class for css styling
        html: regionName[i]
    }),
    draggable: false,
    zIndexOffset: 1000     // Make appear above other map features
    }).addTo(map);
}

// add hospital
hospitalList = [[0.180960, -119.959400], [0.153120, -119.915900], [0.151090, -119.909520], [0.121800, -119.904300], [0.134560, -119.883420], [0.182990, -119.855580], [0.041470, -119.828610], [0.065250, -119.744800]];

var hospitalIcon = L.icon({
    iconUrl:'data/Icon/hospital.svg',
    iconSize: [30, 45], // size of the icon
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});
for(i = 0; i < 8; i++){
  window["hospitalLabel" + i] = L.marker(hospitalList[i], {icon: hospitalIcon}).addTo(map).bindPopup('<b>This is a Hospital.</b>');
}

// add radiation station
var radiationIcon = L.icon({
    iconUrl:'data/Icon/radiation.svg',
    iconSize: [25, 30], // size of the icon
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});
var nuclear = L.marker([0.162679, -119.784825], {icon: radiationIcon}).addTo(map).bindPopup('<b>The Always Safe Nuclear plant.</b>');
map.addLayer(nuclear);

// add static sensor
staticList = [[0.15689, -119.9594], [0.15109, -119.90952], [0.1218, -119.9043], [0.18299, -119.85558], [0.04147, -119.82861], [0.20764, -119.81556], [0.15979, -119.80715], [0.1218, -119.79265], [0.16849, -119.79033]];
staticIdList = [1, 4, 6, 9, 11, 12, 13, 14, 15];
var staticIcon = L.icon({
    iconUrl:'data/Icon/meter.svg',
    iconSize: [15, 25], // size of the icon
    popupAnchor: [0, -5] // point from which the popup should open relative to the iconAnchor
});
for(i = 0; i < 9; i++){
  window["staticLabel" + i] = L.marker(staticList[i], {icon: staticIcon}).addTo(map).bindPopup('<b>This is the Static Sensor '+ staticIdList[i] +'</b>');
}

// draw dot
d3.select('#dot')
  .append('svg')
  .attr('id', 'dot')
  .attr('width', 715)
  .attr('height', 150)

dot_svg = d3.select('svg#dot')
j = 0;
for(var i = 1; i < 51; i++){
  if(i > 25){
    dot_g = dot_svg.append('g')
    .attr('transform', 'translate(' + j*28 + ', 50)')
    .attr('id', 'sensor-' + i.toString())
    .on('click', function(){
      showSensorRoute()
    });
    j++;
  }
  else{
    dot_g = dot_svg.append('g')
    .attr('transform', 'translate(' + (i-1)*28 + ', 5)')
    .attr('id', 'sensor-' + i.toString())
    .on('click', function(){
      showSensorRoute()
    });
  }

  dot_g.append('circle')
    .attr('x', 24)
    .attr('y', 9)
    .attr('cx', 12)
    .attr('cy', 9)
    .attr('r', 12)
    .attr('margin', 2)
    .attr('stroke-width', 3)
    .attr('fill', '#FFB6C1')

  dot_g.append('text')
    .attr('x', 24)
    .attr('y', 9)
    .attr('cx', 6)
    .attr('cy', 3)
    .attr('id', 'sensor-' + i.toString())
    .attr('text-anchor', 'middle')
    .attr('dx', '-0.85em')
    .attr('dy', '.35em')
    .attr('fill', '#000000')
    .text(i.toString())
}


function Initial(){
  let sensorId = 6;
	let regionId = 5;
	$('#region_name').children().remove();
	var html = '<span id="region_name" style="text-align: center; display: block; ">Region: Southwest</span>'
	$('#region_name').append(html);
	draw_heatmap(alldata[regionId-1]);
	drawTimeSeries(tsfiles[regionId-1]);
	drawSensorRoute(sensorId);
}

Initial()
});	// in Promise all end
}); // out Promise all end
