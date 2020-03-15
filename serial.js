const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');
const moment = require('moment');

document.addEventListener('DOMContentLoaded',pageLoaded);

var port;

function pageLoaded() {
    SerialPort.list().then(
        ports => {
            portSelect = document.getElementById('port');
            ports.forEach((info,index,all) => {
                var option = document.createElement("option");
                option.text = info.path;
                option.value = info.path;
                portSelect.add(option);
            });
        },
        err => console.error(err)
      )
}

 function openPort(){

    let dataLocation = document.getElementById('dataLocation');
    if(!dataLocation.files.length)
    {
        alert('Please select data directory');
        return;
    }

    port = new SerialPort(document.getElementById('port').value, { baudRate: 9600 },function (err) {
        if (err) {
          return alert(err.message);
        }
    });

    const parser = new Readline();
    port.pipe(parser);

    var time = new Date();

    temp = document.getElementById('temp');
    let data  = [{
        x: [time],
        y: [],
        name: "Temperature",
        mode: 'lines+markers' },
        {
            x: [time],
            y: [],
            name: 'Volmetic Water Content %',
            yaxis: 'y2',
            mode: 'lines+markers'
        }];
    Plotly.newPlot( temp, data ,{
        title: '1 Minute Interval',
        yaxis: {title: '&#176;F'},
        yaxis2: {
          title: 'Percentage',
          titlefont: {color: 'rgb(148, 103, 189)'},
          tickfont: {color: 'rgb(148, 103, 189)'},
          overlaying: 'y',
          side: 'right',
          range:[-20,110],
        } } );

    parser.on('data', line => {
        if(line.includes("Temperature") || line.includes("Moisture")){
            let token = line.split(" ");
            var time = new Date();
            var olderTime = time.setMinutes(time.getMinutes() - 1);
            var futureTime = time.setMinutes(time.getMinutes() + 1);
        
            var minuteView = {
                  xaxis: {
                    type: 'date',
                    range: [olderTime,futureTime]
                  }
                };

            Plotly.relayout(temp, minuteView);

            var val = 0.0;
            if(line.includes("Temperature")){
                val = Math.round(token[2]);
                updateTemp(temp,val);
                var file = dataLocation.files[0].path + moment().format('YYYY-MM-DD') + '.csv'; 
                fs.appendFile(file, '\n' + moment().format() + "," + token[2], (err) => {
                    if (err) throw err;
                    console.log('Temp was updated.');
                });
            }else{
                val = Math.round(token[2].replace('%',''));
                updateVWC(temp,val);
            }


        }
    });
 }

 function updateVWC(plot, value){
    Plotly.extendTraces(plot, {
        x: [[new Date()]],
        y: [[value]]},[1]);
 }

 function updateTemp(plot, value){
    Plotly.extendTraces(plot, {
        x: [[new Date()]],
        y: [[value]]},[0]);
 }

