let temperatureChart, humidityChart, cO2Chart, floodChart;

/**
 * initializes live charts and sets interval
 */
function initCharts() {
    document.getElementById("timing").innerHTML = "";

    temperatureChart = new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Maximum der ' + sensors[0].function + ' in ' + sensors[0].unit,
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[0].function + ' in ' + sensors[0].unit,
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
                label: 'Maximum der ' + sensors[1].function + ' in ' + sensors[1].unit,
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[1].function + ' in ' + sensors[1].unit,
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
                label: 'Maximum der ' + sensors[2].function + ' in ' + sensors[2].unit,
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Minimum der ' + sensors[2].function + ' in ' + sensors[2].unit,
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
                label: sensors[3].function + ' in ' + sensors[3].unit,
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

    intervalSelect.addEventListener("change", updateSummaryChartsTrigger);

    if (!Number.isInteger(intervalSelectIndex)) {
        intervalSelectIndex = 1;
    }
    intervalSelect.selectedIndex = intervalSelectIndex;
    updateSummaryChartsTrigger(intervalSelectIndex);
}

/**
 * updates the charts
 * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
 * @param from {Date} the date since when the data should be loaded
 * @param to {Date} the date until when the data should be loaded
 */
function updateSummaryCharts(interval, from = new Date(2000, 1, 1), to = new Date()) {
    updateSummaryChartWithValuesFromDB(temperatureChart, 1, from, to, interval);
    updateSummaryChartWithValuesFromDB(humidityChart, 2, from, to, interval);
    updateSummaryChartWithValuesFromDB(cO2Chart, 3, from, to, interval);
    updateSummaryChartWithValuesFromDB(floodChart, 4, from, to, interval);
}

/**
 * updates a chart by requesting data from the server
 * @param chart {chart} the chart to be filled
 * @param sensorId {number} the id of the sensor
 * @param from {Date} the date since when the data should be loaded
 * @param to {Date} the date until when the data should be loaded
 * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
 */
function updateSummaryChartWithValuesFromDB(chart, sensorId, from, to, interval) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            setValuesOfSummaryChart(chart, JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getDataTimewise.php", true);
    let data = new FormData();
    data.append('sensorId', sensorId);
    data.append('from', jsToUTCMySQLDate(from));
    data.append('to', jsToUTCMySQLDate(to));
    data.append('interval', interval);
    xhttp.send(data);
}

/**
 * sets the values of a chart
 * @param chart {Chart} the chart
 * @param dataset {Object[]} an array that has entries of {time:,min:,max:} objects
 */
function setValuesOfSummaryChart(chart, dataset) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    if (chart.data.datasets.length > 1) {
        chart.data.datasets[1].data = [];
    }

    for (const entry of dataset) {
        chart.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        chart.data.datasets[0].data.push(entry.max);
        if (chart.data.datasets.length > 1) {
            chart.data.datasets[1].data.push(entry.min);
        }
    }
    chart.update();
}

function updateSummaryChartsTrigger () {
    let index = intervalSelect.selectedIndex;
    let myDate = new Date();
    switch (index) {
        case 0:
            location.assign(".");
            break;
        case 1: // last hour
            myDate.setHours(myDate.getHours() -1);
            updateSummaryCharts("min", myDate);
            break;
        case 2: // last day
            myDate.setHours(myDate.getHours() -24);
            updateSummaryCharts("10min", myDate);
            break;
        case 3: // last week
            myDate.setHours(myDate.getHours() - (24 * 7));
            updateSummaryCharts("hr", myDate);
            break;
        case 4: // last month
            myDate.setMonth(myDate.getMonth() - 1);
            updateSummaryCharts("day", myDate);
            break;
        case 5:
            myDate.setMonth(myDate.getMonth() - 3);
            updateSummaryCharts("day", myDate);
            break;
        case 6:
            myDate.setMonth(myDate.getMonth() - 6);
            updateSummaryCharts("day", myDate);
            break;
        case 7:
            myDate.setFullYear(myDate.getFullYear() - 1);
            updateSummaryCharts("day", myDate);
            break;
        case 8:
            updateSummaryCharts("day");
            break;
        default:
            // console.log(index);
    }
}
