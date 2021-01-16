document.addEventListener("DOMContentLoaded", init, false);
let temperatureChart, humidityChart, cO2Chart, floodChart, intervalSelect;

/**
 * initializes live charts and sets interval
 */
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
                label: 'Co2 max',
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
    intervalSelect = document.getElementById("interval");

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
    chart.data.datasets[1].data = [];

    for (const entry of dataset) {
        chart.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        chart.data.datasets[0].data.push(entry.min);
        chart.data.datasets[1].data.push(entry.max);
    }
    chart.update();
}

/**
 * convert a mySQL datetime string to a Date object
 * @param mysqlDatetimeStr the mySQL datetime string
 * @return {Date}
 */
function mySQLToUTCJSDate(mysqlDatetimeStr) {
    return new Date(mysqlDatetimeStr.replace(" ", "T") + "Z")
}

/**
 * converts a Date object to a mySQL datetime string
 * @param dateObj {Date} the Date
 * @return {string} the mySQL datetime string
 */
function jsToUTCMySQLDate(dateObj) {
    return dateObj.getUTCFullYear() + '-' +
        ('00' + (dateObj.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + dateObj.getUTCDate()).slice(-2) + ' ' +
        ('00' + dateObj.getUTCHours()).slice(-2) + ':' +
        ('00' + dateObj.getUTCMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getUTCSeconds()).slice(-2);
}

/**
 * converts a Date object to a local user readable string
 * @param dateObj {Date} the Date
 * @return {string} the string
 */
function jsToLocalReadableString(dateObj) {
    return dateObj.getDate() + '.' +
        ('00' + (dateObj.getMonth()+1)).slice(-2) + '.' +
        ('00' + dateObj.getFullYear()).slice(-2) + ' ' +
        ('00' + dateObj.getHours()).slice(-2) + ':' +
        ('00' + dateObj.getMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getSeconds()).slice(-2);
}

function updateSummaryChartsTrigger () {
    // console.log("works")
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
