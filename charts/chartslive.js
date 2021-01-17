const UPDATE_INTERVAL = 10;
const MAX_ENTRIES = 60;
let lastUpdate, nextUpdateIn, charts;

/**
 * initializes live charts and sets interval
 */
function initCharts() {
    document.getElementById("timing").innerHTML = "" +
        "                           Stand: <span id = \"lastUpdated\">noch nicht gelanden</span>, nächstes Update in <span id = \"nextUpdateIn\">0</span> Sekunden.\n" +
        "                           <button class=\"btn btn-outline-secondary logout bg-light text-dark\" type=\"button\" onclick=\"nextUpdateIn = 0; updateCountdown()\">Update</button>"

    charts = [
        new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: sensors[0].funktionalitaet + ' in ' + sensors[0].messeinheit,
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
        new Chart(document.getElementById('chart-humidity'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: sensors[1].funktionalitaet + ' in ' + sensors[1].messeinheit,
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
        new Chart(document.getElementById('chart-co2'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: sensors[2].funktionalitaet + ' in ' + sensors[2].messeinheit,
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
    }),
        new Chart(document.getElementById('chart-flood'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: sensors[3].funktionalitaet + ' in ' + sensors[3].messeinheit,
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
    })
    ];

    lastUpdate = null;
    nextUpdateIn = 0;

    Notification.requestPermission();

    intervalSelect.addEventListener("change", updateSummaryChartsTrigger);
    setInterval(updateCountdown, 1000);
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
function updateCharts() {
    for (let i = 0; i < 4; i++) {
        updateChartWithValuesFromDB(i, lastUpdate);
    }
    lastUpdate = new Date();
    document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(lastUpdate);
}

/**
 * updates a chart by requesting data from the server
 * @param id {number} the id of the sensor and chart
 * @param from {Date|null} the date from when the data should be loaded, not requested on null but 10 mins by default
 */
function updateChartWithValuesFromDB(id, from) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            appendValuesToChart(id, JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "PHP/getDataLive.php", true);
    let data = new FormData();
    data.append('sensorId', "" + (id + 1));
    if (from !== null) {
        data.append('from', jsToUTCMySQLDate(from));
    }
    xhttp.send(data);
}

/**
 * appends values to a chart
 * @param id {number} the id of the chart
 * @param dataset {Object[]} an array that has entries of {time:,value:} objects
 */
function appendValuesToChart(id, dataset) {
    let alert = false;
    for (const entry of dataset) {
        if (entry.value >= sensors[id].grenzwert) {
            alert = true;
        }
        charts[id].data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
        charts[id].data.datasets[0].data.push(entry.value);
        if (charts[id].data.datasets[0].data.length > MAX_ENTRIES) {
            charts[id].data.labels.shift();
            charts[id].data.datasets[0].data.shift();
        }
    }
    charts[id].update();
    if (alert) {
        sendAlert("Klimostat: Grenzwertüberschreitung! Achtung ein Grenzwert wurde überschritten!")
    }
}

function updateSummaryChartsTrigger () {
    console.log("works")
    let index = intervalSelect.selectedIndex;
    switch (index) {
        case "0":
            location.assign(".");
            break;
        default:
            location.assign(".?hist=" + index);
    }
}


function sendAlert(message) {
    if (Notification.permission === "granted") {
        new Notification(message);
        // alert(title + "\n" + message);
    }
}