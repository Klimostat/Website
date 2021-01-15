document.addEventListener("DOMContentLoaded", init, false);
let temperatureChart, humidityChart, cO2Chart, floodChart;

function init() {
    document.getElementById("timing").innerHTML = "";

    temperatureChart = new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatur min',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }, {
                label: 'Temperatur max',
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
                label: 'Luftfeuchtigkeit min',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }, {
                label: 'Luftfeuchtigkeit max',
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
                label: 'Co2 min',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Co2 min',
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
                label: 'Wassersensor min',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }, {
                label: 'Wassersensor max',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
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

    updateSummaryCharts(false, "min");
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


function updateSummaryCharts(append, timewise, from = "2000-01-01 00:00:00", to = "2100-01-01 00:00:00") {
    updateSummaryChartWithValuesFromDB(temperatureChart, '1', from, to, timewise, append);
    updateSummaryChartWithValuesFromDB(humidityChart, '2', from, to, timewise, append);
    updateSummaryChartWithValuesFromDB(cO2Chart, '3', from, to, timewise, append);
    updateSummaryChartWithValuesFromDB(floodChart, '4', from, to, timewise, append);
}

function updateSummaryChartWithValuesFromDB(chart, sensorId, from, to, timewise, append = false) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            setValuesOfSummaryChart(chart, JSON.parse(this.responseText), append);
        }
    };
    xhttp.open("POST", "PHP/getDataTimewise.php", true);
    let data = new FormData();
    data.append('sensorId', sensorId);
    data.append('from', from);
    data.append('to', to);
    data.append('timewise', timewise);
    xhttp.send(data);
}

/**
 *
 * @param chart {Chart}
 * @param dataset {Object}
 * @param append boolean
 */
function setValuesOfSummaryChart(chart, dataset, append = false) {
    if (append !== true) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];
    }
    for (const entry of dataset) {
        chart.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        chart.data.datasets[0].data.push(entry.min);
        chart.data.datasets[1].data.push(entry.max);
    }
    chart.update();
}