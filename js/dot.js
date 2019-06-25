// colors = ['#FF0000', '#DC143C', '#A52A2A', '#B22222', '#8B0000', '#CD5C5C', '#BC8F8F', '#FF4500', '#FF6347', '#FF7F50', '#FFA07A', '#E9967A', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#DAA520', '#F5DEB3', '#FFE4B5',  '#FFDAB9', '#D2B48C', '#F4A460', '#CD853F', '#D2691E', '#8B4513', '#0000FF', '#0000CD', '#191970', '#00008B', '#000080', '#4169E1', '#6495ED', '#00BFFF', '#00CED1', '#20B2AA', '#008080', '#2F4F4F', '#48D1CC', '#00FFFF', '#40E0D0', '#7FFFAA', '#00FA9A', '#00FF7F', '#DB7093', '#FF69B4', '#FF1493', '#C71585', '#DA70D6', '#D8BFD8', '#DDA0DD', '#EE82EE', '#FF00FF', '#DA70D6', '#8B008B', '#8A2BE2', '#BA55D3', '#9400D3', '#9932CC', '#4B0082'];
//
// j = 0;
// html = ""
// html += '<svg width="250" height="700" style="margin-top:25px;">';
// for(var i = 0; i < 50; i++){
//     if(i > 24){
//       html += '<g transform = "translate(120,' + j*25 + ')" id = "sensor-' + (i+1) + '" onclick="showSensorRoute()">';
//       j++;
//     }
//     else{
//       html += '<g transform = "translate(0,' + i*25 + ')" id = "sensor-' + (i+1) + '" onclick="showSensorRoute()">';
//     }
//     html += '<circle x = "1066" y = "61" cx = "12" cy = "9" r = "10" stroke-width = "3" fill = "' + colors[i] + '" id = "sensor-' + (i+1) + '"/>';
//     html += '<text x = "24" y = "9" dy = ".35em" fill = "black" id = "sensor-' + (i+1) + '">Sensor-' + (i+1) +'</text>';
//     html += '</g>';
// }
// html += '</svg>';
// $('#dot').append(html);
