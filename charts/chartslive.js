let liveCharts = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,

    /**
     * The maximum number of values per chart.
     * @type {number}
     */
    MAX_ENTRIES: 60,

    displayedStations: null,

    lastUpdate: null
}

/**
 * initializes live charts and sets interval
 */
liveCharts.init = function () {
    // console.log("init called")
    let selectedStations = getSelectedStations();
    // const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

    if (loadedCharts !== "live") {

        document.getElementById("timing").innerHTML = "" +
            "                           Stand: <span id = \"lastUpdated\">noch nicht gelanden</span>, nächstes Update in <span id = \"nextUpdateIn\">0</span> Sekunden.\n" +
            "                           <a class=\"nav-link\" href=\"javascript:liveCharts.updateCharts()\">Update</a>"
        charts = {
            temperature: new Chart(document.getElementById('chart-temperature'), {
                type: 'line',
                data: {},
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
                data: {},
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
                data: {},
                options: {
                    legend: {
                        labels: {
                            fontColor: 'black',
                            defaultFontColor: 'black'
                        }
                    }
                }
            })
        };


        for (let station of selectedStations) {
            toggleDisplayedStation(station.id, true);
        }

    } else if (selectedStations === liveCharts.displayedStations) {
        return;
    }

    liveCharts.updateCharts();
    // console.log("inited live station-" + selectedStation.id);

    loadedCharts = "live";
    clearInterval(intervalObj);
    intervalObj = setInterval(liveCharts.updateCountdown, 1000);
}

/**
 * updates the countdown, is called by an interval every second
 */
liveCharts.updateCountdown = function () {
    if (nextUpdateIn <= 1) {
        liveCharts.fetchAndDeliverValuesFromDB();
        nextUpdateIn = liveCharts.UPDATE_INTERVAL;
    } else {
        nextUpdateIn--;
    }
    document.getElementById("nextUpdateIn").innerHTML = "" + nextUpdateIn;

    // feeds db
    // let xhttp = new XMLHttpRequest();
    // xhttp.open("GET", "PHP/feeddb.php", true);
    // xhttp.send();

}

liveCharts.updateCharts = function () {
    nextUpdateIn = 0;
    liveCharts.updateCountdown();
    clearInterval(intervalObj);
    intervalObj = setInterval(liveCharts.updateCountdown, 1000);
}

liveCharts.fetchAndDeliverValuesFromDB = function () {
    let selectedStations = getSelectedStations();

    let stationsToLoad = [/*{
            id: station.id,
            since: station.lastFetch
    }*/];
    for (let station of selectedStations) {
        stationsToLoad.push({
            id: station.id,
            since: station.lastFetch
        })
    }

    let data = new FormData();
    data.append('stations', JSON.stringify(stationsToLoad));

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log("db response: " + this.responseText);
            let dataPerStation = JSON.parse(this.responseText);
            for (let dataset of dataPerStation) {
                stations[dataset.id].updateValues(dataset.data);
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            }
            // selectedStation.updateValues(JSON.parse(this.responseText));
            liveCharts.appendValuesFromStationToCharts();
        }
    };
    xhttp.open("POST", "PHP/getDataLive.php", true);
    xhttp.send(data);
}

/**
 * appends values to a chart
 * @param index {number} the index of the station in the stations array
 * @param dataset {Object[]} an array that has entries of {time:,co2:,temperature:,humidity:} objects
 */
liveCharts.appendValuesFromStationToCharts = function () {
    let actDate = new Date();
    actDate.setMilliseconds(0);

    let time = new Date();
    time.setMinutes(actDate.getMinutes() - 5);

    let push = function (where, what) {
        where.push(what);
        where.shift();
    }

    if (liveCharts.lastUpdate == null) {
        push = function (where, what) {
            where.push(what);
        }
    } else {
        time = liveCharts.lastUpdate;
    }

    for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
        let timeString = jsTimeTo10MinLocalReadableString(time);
        push(charts.temperature.data.labels, timeString);
        push(charts.co2.data.labels, timeString);
        push(charts.humidity.data.labels, timeString);
    }

    for (let i = 0; i < displayedStations.length; i++) {
        let selectedStation = displayedStations[i];
        let datas = selectedStation.getChartValues();
        // console.log("getChartValues: " + datas);

        charts.temperature.update();
        charts.co2.update();
        charts.humidity.update();

        charts.temperature.data.datasets[i].data = datas.maxTemperature;
        charts.co2.data.datasets[i].data = datas.maxCo2;
        charts.humidity.data.datasets[i].data = datas.maxHumidity;

    }

    liveCharts.lastUpdate = actDate;

    charts.temperature.update();
    charts.co2.update();
    charts.humidity.update();

    liveCharts.displayedStations = displayedStations;
}

// liveCharts.clearCharts = function () {
//     charts.humidity.data.labels = [];
//     charts.humidity.data.datasets = [{
//         label: "Humidity in %",
//         data: [],
//         backgroundColor: 'rgba(153, 102, 255, 0.7)',
//         borderColor: 'rgba(153, 102, 255, 1)',
//         borderWidth: 1
//     }];
//     charts.co2.data.labels = [];
//     charts.co2.data.datasets = [{
//         label: "CO2 concentration in ppm",
//         data: [],
//         backgroundColor: 'rgba(54, 162, 235, 0.7)',
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 1
//     }];
//     charts.temperature.data.labels = [];
//     charts.temperature.data.datasets = [{
//         label: 'Temperature in °C',
//         data: [],
//         backgroundColor: 'rgba(255, 99, 132, 0.7)',
//         borderColor: 'rgba(255, 99, 132, 0.7)',
//         borderWidth: 1
//     }];
//     charts.temperature.update();
//     charts.co2.update();
//     charts.humidity.update();
// }

// liveCharts.appendValuesToCharts = function (index, dataset) {
//     let alert = false;
//     for (const entry of dataset) {
//         if (entry.co2 >= grenzwertCO2) {
//             alert = true;
//         } else if (entry.humidity < grenzwertHumidity) {
//             alert = true;
//         }
//         charts.temperature.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
//         charts.temperature.data.datasets[0].data.push(entry.temperature);
//         if (charts.temperature.data.datasets[0].data.length > liveCharts.MAX_ENTRIES) {
//             charts.temperature.data.labels.shift();
//             charts.temperature.data.datasets[0].data.shift();
//         }
//         charts.co2.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
//         charts.co2.data.datasets[0].data.push(entry.co2);
//         if (charts.co2.data.datasets[0].data.length > liveCharts.MAX_ENTRIES) {
//             charts.co2.data.labels.shift();
//             charts.co2.data.datasets[0].data.shift();
//         }
//         charts.humidity.data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
//         charts.humidity.data.datasets[0].data.push(entry.humidity);
//         if (charts.humidity.data.datasets[0].data.length > liveCharts.MAX_ENTRIES) {
//             charts.humidity.data.labels.shift();
//             charts.humidity.data.datasets[0].data.shift();
//         }
//     }
//     charts.temperature.update();
//     charts.co2.update();
//     charts.humidity.update();
//     if (alert) {
//         sendAlert("Klimostat: Grenzwertüberschreitung! Achtung ein Grenzwert wurde überschritten!")
//     }
// }


/**
 * updates the charts, the "last updated" message and variables
 */
// liveCharts.updateCharts = function (since = lastUpdate, clearExistingData = false) {
//     liveCharts.updateChartsWithValuesFromDB(getSelectedStation(), since);
//     lastUpdate = new Date();
//     document.getElementById("lastUpdated").innerHTML = jsToLocalReadableString(lastUpdate);
// }

/**
 * updates a chart by requesting data from the server
 * @param station {Station} the station_id in the database
 * @param from {Date|null} the date from when the data should be loaded, not requested on null but 10 mins by default
 */
// liveCharts.updateChartsWithValuesFromDB = function (station, from) {
//     let xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if (this.readyState === 4 && this.status === 200) {
//             console.log(this.responseText);
//             liveCharts.appendValuesToCharts(station.id, JSON.parse(this.responseText));
//         }
//     };
//     xhttp.open("POST", "PHP/getDataLive.php", true);
//     let data = new FormData();
//     data.append('station_id', station.id);
//     if (from !== null) {
//         data.append('from', jsToUTCMySQLDate(from));
//     }
//     xhttp.send(data);
// }
