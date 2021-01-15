document.addEventListener("DOMContentLoaded", init, false);
const UPDATE_INTERVAL = 10;
let temperatureChart, humidityChart, cO2Chart, floodChart, lastUpdate, nextUpdateIn;

function init() {
    document.getElementById("timing").innerHTML = "" +
        "                           Stand: <span id = \"lastUpdated\">noch nicht gelanden</span>, nächstes Update in <span id = \"nextUpdateIn\">0</span> Sekunden.\n" +
        "                           <button class=\"btn btn-outline-secondary logout bg-light text-dark\" type=\"button\" onclick=\"nextUpdateIn = 0; updateCountdown()\">Update</button>"

    temperatureChart = new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatur',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
        },
    });
    humidityChart = new Chart(document.getElementById('chart-humidity'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Luftfeuchtigkeit',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
        }
    });
    cO2Chart = new Chart(document.getElementById('chart-co2'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Co2',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            }
        }
    });
    floodChart = new Chart(document.getElementById('chart-flood'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Wassersensor',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    lastUpdate = new Date(0);
    nextUpdateIn = 0;

    setInterval(updateCountdown, 1000);
}

function updateToBeLive() {
    updateCharts(true, jsToUTCMySQLDate(lastUpdate), jsToUTCMySQLDate(lastUpdate = new Date()));
    document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(lastUpdate);
}

function updateCountdown() {
    if (nextUpdateIn <= 1) {
        updateToBeLive();
        nextUpdateIn = UPDATE_INTERVAL;
    } else {
        nextUpdateIn--;
    }
    document.getElementById("nextUpdateIn").innerHTML = nextUpdateIn;
}

function jsToUTCMySQLDate(dateObj) {
    return dateObj.getUTCFullYear() + '-' +
        ('00' + (dateObj.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + dateObj.getUTCDate()).slice(-2) + ' ' +
        ('00' + dateObj.getUTCHours()).slice(-2) + ':' +
        ('00' + dateObj.getUTCMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getUTCSeconds()).slice(-2);
}

function jsToLocalReadableString(dateObj) {
    return dateObj.getDate() + '.' +
    ('00' + (dateObj.getMonth()+1)).slice(-2) + '.' +
    ('00' + dateObj.getFullYear()).slice(-2) + ' ' +
    ('00' + dateObj.getHours()).slice(-2) + ':' +
    ('00' + dateObj.getMinutes()).slice(-2) + ':' +
    ('00' + dateObj.getSeconds()).slice(-2);
}

function mySQLToUTCJSDate(mysqlDateStr) {
    return new Date(mysqlDateStr.replace(" ", "T") + "Z")
}

function updateCharts(append, from = "2000-01-01 00:00:00") {
    updateChartWithValuesFromDB(temperatureChart, '1', from);
    updateChartWithValuesFromDB(humidityChart, '2', from);
    updateChartWithValuesFromDB(cO2Chart, '3', from);
    updateChartWithValuesFromDB(floodChart, '4', from);
}

function updateChartWithValuesFromDB(chart, sensorId, from) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            setValuesOfChart(chart, JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getDataLive.php", true);
    let data = new FormData();
    data.append('sensorId', sensorId);
    data.append('from', from);
    xhttp.send(data);
}

/**
 *
 * @param chart {Chart}
 * @param dataset {Object}
 * @param append boolean
 */
function setValuesOfChart(chart, dataset) {
    for (const entry of dataset) {
        chart.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        chart.data.datasets[0].data.push(entry.value);
    }
    chart.update();
}