/**
 * The interval in seconds in which the data should be updated.
 * @type {number}
 */
const UPDATE_INTERVAL = 10;

/**
 * The maximum number of values per chart.
 * @type {number}
 */
const MAX_ENTRIES = 60;

/**
 * Controls the data-updates
 * @type {Date}
 */
let lastUpdate;

/**
 * Controls the data-updates
 * @type {number}
 */
let nextUpdateIn;

let grenzwertCO2 = 440;
let grenzwertHumidity = 30;

let intervalObj;

    /**
 * initializes live charts and sets interval
 */
function initCharts() {
    document.getElementById("timing").innerHTML = "" +
        "                           Stand: <span id = \"lastUpdated\">noch nicht gelanden</span>, nächstes Update in <span id = \"nextUpdateIn\">0</span> Sekunden.\n" +
        "                           <button class=\"btn btn-outline-secondary logout bg-light text-dark\" type=\"button\" onclick=\"nextUpdateIn = 0; updateCountdown()\">Update</button>"

    charts = {
        temperature: new Chart(document.getElementById('chart-temperature'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature in °C',
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
    }),
        humidity: new Chart(document.getElementById('chart-humidity'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Humidity in %",
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
    }),
        co2: new Chart(document.getElementById('chart-co2'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "CO2 concentration in ppm",
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
    })};

    lastUpdate = null;
    nextUpdateIn = 0;

    Notification.requestPermission();

    // intervalSelect.addEventListener("change", updateSummaryChartsTrigger);
    clearInterval(intervalObj);
    intervalObj = setInterval(updateCountdown, 1000);
}

/**
 * updates the countdown, is called by an interval every second
 */
function updateCountdown() {
    if (nextUpdateIn <= 1) {
        updateCharts();
        nextUpdateIn = UPDATE_INTERVAL;
    } else {
        nextUpdateIn--;
    }
    document.getElementById("nextUpdateIn").innerHTML = nextUpdateIn;
}

/**
 * updates the charts, the "last updated" message and variables
 */
function updateCharts(since = lastUpdate, clearExistingData = false) {
    if (clearExistingData) {
        initCharts();
    }
    updateChartsWithValuesFromDB(getSelectedStation(), since);
    lastUpdate = new Date();
    document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(lastUpdate);
}

/**
 * updates a chart by requesting data from the server
 * @param station_id {number} the station_id in the database
 * @param from {Date|null} the date from when the data should be loaded, not requested on null but 10 mins by default
 */
function updateChartsWithValuesFromDB(station_id, from) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            appendValuesToCharts(station_id, JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getDataLive.php", true);
    let data = new FormData();
    data.append('station_id', station_id);
    if (from !== null) {
        data.append('from', jsToUTCMySQLDate(from));
    }
    xhttp.send(data);
}

/**
 * appends values to a chart
 * @param index {number} the index of the station in the stations array
 * @param dataset {Object[]} an array that has entries of {time:,co2:,temperature:,humidity:} objects
 */
function appendValuesToCharts(index, dataset) {
    let alert = false;
    for (const entry of dataset) {
        if (entry.co2 >= grenzwertCO2) {
            alert = true;
        } else if (entry.humidity < grenzwertHumidity) {
            alert = true;
        }
        charts.temperature.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts.temperature.data.datasets[0].data.push(entry.temperature);
        if (charts.temperature.data.datasets[0].data.length > MAX_ENTRIES) {
            charts.temperature.data.labels.shift();
            charts.temperature.data.datasets[0].data.shift();
        }
        charts.co2.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts.co2.data.datasets[0].data.push(entry.co2);
        if (charts.co2.data.datasets[0].data.length > MAX_ENTRIES) {
            charts.co2.data.labels.shift();
            charts.co2.data.datasets[0].data.shift();
        }
        charts.humidity.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts.humidity.data.datasets[0].data.push(entry.humidity);
        if (charts.humidity.data.datasets[0].data.length > MAX_ENTRIES) {
            charts.humidity.data.labels.shift();
            charts.humidity.data.datasets[0].data.shift();
        }
    }
    charts.temperature.update();
    charts.co2.update();
    charts.humidity.update();
    if (alert) {
        sendAlert("Klimostat: Grenzwertüberschreitung! Achtung ein Grenzwert wurde überschritten!")
    }
}

/**
 * updates the time interval that should be displayed.
 */
function updateSummaryChartsTrigger () {
    let index = intervalSelect.selectedIndex;
    switch (index) {
        case "0":
            location.assign(".");
            break;
        default:
            location.assign(".?hist=" + index);
    }
}

/**
 * sends an alert via notifications and displays a red bar
 */
function sendAlert() {
    if (Notification.permission === "granted") {
        new Notification("Achtung! Ein Grenzwert wurde überschritten!");
    }
    // document.getElementById("alert").style.display = "block";
}