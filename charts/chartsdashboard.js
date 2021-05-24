let dashboard = {

    /**
     * The interval in seconds in which the data should be updated.
     * @type {number}
     */
    UPDATE_INTERVAL: 10,

    lastUpdate: null,
}

/**
 * initializes live charts and sets interval
 */
dashboard.init = function () {

    if (charts.temperature !== null) {
        charts.temperature.destroy();
    }
    if (charts.humidity !== null) {
        charts.humidity.destroy();
    }
    if (charts.co2 !== null) {
        charts.co2.destroy();
    }
    // console.log("destroyed charts and loaded dashboard");
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
    displayedStations.clear();

    dashboard.updateCharts();
}

/**
 * updates the countdown, is called by an interval every second
 */
dashboard.updateCountdown = function () {
    if (nextUpdateIn <= 1) {
        dashboard.fetchAndDeliverValuesFromDB();
        nextUpdateIn = dashboard.UPDATE_INTERVAL;
    } else {
        nextUpdateIn--;
    }
    document.getElementById("nextUpdateIn").innerHTML = "" + nextUpdateIn;

    // feeds db
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", "PHP/feeddb.php", true);
    xhttp.send();

}

dashboard.updateCharts = function () {
    nextUpdateIn = 0;
    dashboard.updateCountdown();
    clearInterval(intervalObj);
    intervalObj = setInterval(dashboard.updateCountdown, 1000);
}

dashboard.fetchAndDeliverValuesFromDB = function () {
    let stationsToLoad = [];
    stations.forEach(station => {
        stationsToLoad.push({
            id: station.id,
            since: station.lastFetch
        })
    });

    let data = new FormData();
    data.append('stations', JSON.stringify(stationsToLoad));

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            // console.log("db response: " + this.responseText);
            let dataPerStation = JSON.parse(this.responseText);
            for (let dataset of dataPerStation) {
                stations[parseInt(dataset.id)].updateValues(dataset.data);
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            }
            dashboard.appendValuesFromStationToCharts();
        }
    };
    xhttp.open("POST", "PHP/getDataLive.php", true);
    xhttp.send(data);
}

/**
 * appends values to a chart
 */
dashboard.appendValuesFromStationToCharts = function () {
    let actDate = new Date();
    actDate.setMilliseconds(0);

    let time = new Date();
    time.setMinutes(actDate.getMinutes() - 5);

    let push = function (where, what) {
        where.push(what);
        where.shift();
    }

    if (dashboard.lastUpdate == null) {
        push = function (where, what) {
            where.push(what);
        }
    } else {
        time = dashboard.lastUpdate;
    }

    for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
        let timeString = jsTimeTo10MinLocalReadableString(time);
        push(charts.temperature.data.labels, timeString);
        push(charts.co2.data.labels, timeString);
        push(charts.humidity.data.labels, timeString);
    }

    charts.temperature.update();
    charts.co2.update();
    charts.humidity.update();

    for (let i = 0; i < extremeStations.maxCo2.length; i++) {
        let selectedStation = extremeStations.maxCo2[i];
        displayedStations.push(selectedStation);

        let datas = selectedStation.getChartValues();
        // console.log("getChartValues: " + datas);

        // charts.temperature.data.datasets[i].data = datas.maxTemperature;
        charts.co2.data.datasets[i].data = datas.maxCo2;
        // charts.humidity.data.datasets[i].data = datas.maxHumidity;
    }

    for (let i = 0; i < extremeStations.minHumidity.length; i++) {
        let selectedStation = extremeStations.minHumidity[i];
        displayedStations.push(selectedStation);
        let datas = selectedStation.getChartValues();
        // console.log("getChartValues: " + datas);

        // charts.temperature.data.datasets[i].data = datas.maxTemperature;
        charts.humidity.data.datasets[i].data = datas.minHumidity;
        // charts.humidity.data.datasets[i].data = datas.maxHumidity;
    }

    dashboard.lastUpdate = actDate;

    charts.temperature.update();
    charts.co2.update();
    charts.humidity.update();

    dashboard.displayedStations = displayedStations;
}