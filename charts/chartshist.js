const hist = {

    /**
     * @type {SensorChart}
     */
    sensorCharts: null,

    /**
     * initializes live charts and sets interval
     */
    init: function () {
        // console.log("init called")
        // const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;

        charts = {
            temperature: new Chart(document.getElementById('chart-temperature'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'Temperature'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '°C',
                                align: 'end'
                            }
                        }
                    }
                }
            }),
            humidity: new Chart(document.getElementById('chart-humidity'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'Humidity'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '% rH',
                                align: 'end'
                            }
                        }
                    }
                }
            }),
            co2: new Chart(document.getElementById('chart-co2'), {
                type: 'line',
                data: {},
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                        },
                        title: {
                            display: true,
                            text: 'CO2'
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'ppm',
                                align: 'end'
                            }
                        }
                    }
                }
            })
        };
        this.sensorCharts = new SensorChart([
            {name: "temperature", chart: charts.temperature},
            {name: "humidity", chart: charts.humidity},
            {name: "co2", chart:charts.co2}
        ]);
        selectedStations.display();
        this.startFetch(-10);
    },

    /**
     *
     */
    destroy: function () {
        charts.temperature.destroy();
        charts.humidity.destroy();
        charts.co2.destroy();
        this.sensorCharts.clear();
    },

    startFetch: function (secs) {
        // countdown.start(secs, function () {hist.fetchDataAndRestartCountdown()});
        this.fetchData();
    },

    /**
     *
     */
    fetchData: function () {
        /**
         *
         * @type {number[]}
         */
        let stationsToLoad = [];
        this.sensorCharts.forEach((station) => {
            stationsToLoad.push(
                station.id,
            )
        });

        let data = new FormData();
        data.append('stations', JSON.stringify(stationsToLoad));
        data.append('interval', 'yesterday');

        /**
         *
         * @param xhr {XMLHttpRequest}
         */
        let update_fn = function (xhr) {
            let dataPerStation = JSON.parse(xhr.responseText);
            // console.log("db response: ");
            // console.log(dataPerStation);
            for (let dataset of dataPerStation) {
                stations[parseInt(dataset.id)].updateValues(dataset.data);
                // console.log("id: " + dataset.id);
                // console.log(stations[dataset.id].getChartValues());
            }
            // selectedStation.updateValues(JSON.parse(this.responseText));
            hist.sensorCharts.updateCharts();

            // selectedStations.forEach(station => {
            //     selectedStations.updateOffline(station.id);
            // });

            // live.startFetch(10);
        }

        fetcher.fetch(data, "POST", "PHP/getDataHist.php", update_fn, true);
    }
}

// const selectedStations = {
//     _ids: null,
//
//     get: function () {
//         let lstations = [];
//         this.getIds().forEach(id => {
//             lstations.push(stations[id])
//         });
//         return lstations;
//     },
//
//     getIds: function () {
//         if (this._ids === null) {
//             this._ids = [];
//
//             let cookie = document.cookie.split('; ')
//                 .find(cookie => cookie.startsWith("station_ids="));
//             if (cookie !== undefined) {
//                 cookie.split("=")[1].split(",").forEach(id => {
//                     this._ids.push(parseInt(id));
//                 });
//             }
//         }
//         return this._ids;
//     },
//
//     /**
//      *
//      * @param id {number}
//      */
//     toggle: function (id) {
//         this.getIds();
//
//         checks on wrong loaded charts
        // if (this._ids.length === 0 && loadedCharts !== "live") {
        //     this._ids.push(id);
        //     this.updateCookie();
        //     determineView();
        //     return;
        // }
        //
        // if (this._ids.includes(id)) {
        //     remove
        //     console.log("remove " + id);
            // this.remove(id, true)
        // } else {
        //     add
        //     console.log("adds " + id);
            // this.push(id, true);
        // }
        //
        // this.updateCookie();
        //
        // updateCharts();
    // },
    //
    // /**
    //  *
    //  */
    // updateCookie: function () {
    //     if (this._ids.length === 0) {
    //         document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    //     } else {
    //         document.cookie = "station_ids=" + this._ids + "; SameSite=Strict; Secure";
    //     }
    // },
    //
    // /**
    //  *
    //  */
    // clear: function () {
    //     loads updates from cookie
        // this.getIds();
        //
        // clears list
        // this._ids = [];
        //
        // writes cookie
        // this.updateCookie();
        //
        // disables all styling
        // this.display();
        //
        // determineView();
    // },
    //
    // /**
    //  *
    //  * @param id {number}
    //  * @param secure {boolean}
    //  */
    // remove: function (id, secure = true) {
    //     if (secure) {
    //         loads updates from cookie
            // this.getIds();
        // }
        //
        // checks for already displayed
        // if (!this._ids.includes(id)) {
        //     return;
        // }
        //
        // takes out of list
        // this._ids.splice(this._ids.indexOf(id), 1);
        //
        // disables styling and removes from displayed stations
        // this.display(id);
        //
        // if (secure) {
        //     writes cookie
            // this.updateCookie();
        // }
    // },

    // /**
    //  *
    //  * @param id {number}
    //  * @param secure {boolean}
    //  */
    // push: function (id, secure=true) {
    //     if (secure) {
    //         loads updates from cookie
            // this.getIds();
        // }
        //
        // checks for already displayed
        // if (this._ids.includes(id)) {
        //     return;
        // }
        //
        // checks on wrong loaded charts
        // if (loadedCharts !== "live") {
        //     this._ids.push(id);
        //     this.updateCookie();
        //     determineView();
        //     return;
        // }
        //
        // adds to list
        // this._ids.push(id);
        //
        // enables styling and adds to displayed stations
        // this.display(id);
        //
        // if (secure) {
        //     updates cookies
            // this.updateCookie();
        // }
    // },
    //
    // /**
    //  *
    //  * @param id
    //  */
    // display: function (id=null) {
    //     loads updates from cookie
        // this.getIds();
        //
        // let displayFunction = station => {
        //     let toDisplay = this._ids.includes(station.id);
        //     console.log("display - id: " + station.id + ", toDisplay: " + toDisplay);
            //
            // toggles styling
            // station.getNavNode().classList.toggle("selected", toDisplay);
            // selectedStations.updateOffline(station.id, toDisplay);
            //
            // if (toDisplay) {
            //     adds to graph
            //     console.log("pushed toDisplay");
                // live.sensorCharts.push(station.id, {
                //     humidity: {dataset: station.datasetChart.minHumidity, name: station.name + " min"},
                //     temperature: {dataset: station.datasetChart.maxTemperature, name: station.name + " max"},
                //     co2: {dataset: station.datasetChart.maxCo2, name: station.name + " max"},
                // },{
                //     humidity: {dataset: station.datasetChart.maxHumidity, name: station.name + " max"},
                //     temperature: {dataset: station.datasetChart.minTemperature, name: station.name + " min"},
                //     co2: {dataset: station.datasetChart.minCo2, name: station.name + " min"},
                // });
            // } else {
            //     removes from graph
                // live.sensorCharts.remove(station.id);
            // }
        //
        // };
        //
        // if (typeof id === "number") {
        //     displayFunction(stations[id]);
        // } else {
        //     stations.forEach(displayFunction);
        // }
    // },
    //
    // /**
    //  *
    //  * @param fn
    //  */
    // forEach: function (fn) {
    //     loads updates from cookie
        // this.getIds();
        //
        // this._ids.forEach(id => {
        //     fn(stations[id]);
        // });
    // },
    //
    // /**
    //  *
    //  * @param id {number}
    //  * @return {boolean}
    //  */
    // includes: function (id) {
    //     loads updates from cookie
        // this.getIds();
        //
        // return this._ids.includes(id);
    // },
    //
    // /**
    //  *
    //  * @param id {number}
    //  * @param forceOnline {boolean}
    //  */
    // updateOffline: function (id, forceOnline=true) {
    //     stations[id].getNavNode().classList.toggle("offline", forceOnline && stations[id].isOffline());
    // }
// }

// /**
//  * initializes live charts and sets interval
//  */
// function initCharts() {
//     document.getElementById("timing").innerHTML = "";
//
//     charts = [
//         new Chart(document.getElementById('chart-temperatur'), {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Maximum der ' + sensors[0].funktionalitaet + ' in ' + sensors[0].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(255, 99, 132, 0.7)',
//                 borderColor: 'rgba(255, 99, 132, 0.7)',
//                 borderWidth: 1
//             }, {
//                 label: 'Minimum der ' + sensors[0].funktionalitaet + ' in ' + sensors[0].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(255, 99, 132, 0.7)',
//                 borderColor: 'rgba(255, 99, 132, 0.7)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             legend: {
//                 labels: {
//                     fontColor: 'black',
//                     defaultFontColor: 'black'
//                 }
//             },
//         },
//     }),
//         new Chart(document.getElementById('chart-humidity'), {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Maximum der ' + sensors[1].funktionalitaet + ' in ' + sensors[1].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(153, 102, 255, 0.7)',
//                 borderColor: 'rgba(153, 102, 255, 1)',
//                 borderWidth: 1
//             }, {
//                 label: 'Minimum der ' + sensors[1].funktionalitaet + ' in ' + sensors[1].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(153, 102, 255, 0.7)',
//                 borderColor: 'rgba(153, 102, 255, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             legend: {
//                 labels: {
//                     fontColor: 'black',
//                     defaultFontColor: 'black'
//                 }
//             },
//         }
//     }),
//         new Chart(document.getElementById('chart-co2'), {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Maximum der ' + sensors[2].funktionalitaet + ' in ' + sensors[2].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(54, 162, 235, 0.7)',
//                 borderColor: 'rgba(54, 162, 235, 1)',
//                 borderWidth: 1
//             }, {
//                 label: 'Minimum der ' + sensors[2].funktionalitaet + ' in ' + sensors[2].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(54, 162, 235, 0.7)',
//                 borderColor: 'rgba(54, 162, 235, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             legend: {
//                 labels: {
//                     fontColor: 'black',
//                     defaultFontColor: 'black'
//                 }
//             }
//         }
//     }),
//         new Chart(document.getElementById('chart-flood'), {
//         type: 'bar',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: sensors[3].funktionalitaet + ' in ' + sensors[3].messeinheit,
//                 data: [],
//                 backgroundColor: 'rgba(75, 192, 192, 0.7)',
//                 borderColor: 'rgba(75, 192, 192, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             legend: {
//                 labels: {
//                     fontColor: 'black',
//                     defaultFontColor: 'black'
//                 }
//             },
//             scales: {
//                 yAxes: [{
//                     ticks: {
//                         beginAtZero: true
//                     }
//                 }]
//             }
//         }
//     })
//     ]
//
//     intervalSelect.addEventListener("change", updateSummaryChartsTrigger);
//
//     if (!Number.isInteger(intervalSelectIndex)) {
//         intervalSelectIndex = 1;
//     }
//     intervalSelect.selectedIndex = intervalSelectIndex;
//     updateSummaryChartsTrigger(intervalSelectIndex);
// }
//
// /**
//  * updates the charts
//  * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
//  * @param from {Date} the date since when the data should be loaded
//  * @param to {Date} the date until when the data should be loaded
//  */
// function updateSummaryCharts(interval, from = new Date(2000, 1, 1), to = new Date()) {
//     for (let i = 0; i < 4; i++) {
//         updateSummaryChartWithValuesFromDB(i, from, to, interval);
//     }
// }
//
// /**
//  * updates a chart by requesting data from the server
//  * @param id {number} the id of the sensor and chart
//  * @param from {Date} the date since when the data should be loaded
//  * @param to {Date} the date until when the data should be loaded
//  * @param interval {string} the interval in which the data should be summarized, options are "min", "10min", "hr", "day"
//  */
// function updateSummaryChartWithValuesFromDB(id, from, to, interval) {
//     let xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//         if (this.readyState === 4 && this.status === 200) {
//             // console.log(this.responseText);
//             setValuesOfSummaryChart(id, JSON.parse(this.responseText));
//         }
//     };
//     xhttp.open("POST", "PHP/getDataTimewise.php", true);
//     let data = new FormData();
//     data.append('sensorId', sensors[id].pk_SensorId);
//     data.append('from', jsToUTCMySQLDate(from));
//     data.append('to', jsToUTCMySQLDate(to));
//     data.append('interval', interval);
//     xhttp.send(data);
// }
//
// /**
//  * sets the values of a chart
//  * @param id {number} the id of the chart
//  * @param dataset {Object[]} an array that has entries of {time:,min:,max:} objects
//  */
// function setValuesOfSummaryChart(id, dataset) {
//     charts[id].data.labels = [];
//     charts[id].data.datasets[0].data = [];
//     if (charts[id].data.datasets.length > 1) {
//         charts[id].data.datasets[1].data = [];
//     }
//
//     for (const entry of dataset) {
//         charts[id].data.labels.push(jsToLocalReadableString(mySQLToUTCJSDate(entry.time)));
//         charts[id].data.datasets[0].data.push(entry.max);
//         if (charts[id].data.datasets.length > 1) {
//             charts[id].data.datasets[1].data.push(entry.min);
//         }
//     }
//     charts[id].update();
// }
//
// /**
//  * updates the time interval that should be displayed.
//  */
// function updateSummaryChartsTrigger () {
//     let index = intervalSelect.selectedIndex;
//     let myDate = new Date();
//     switch (index) {
//         case 0:
//             location.assign(".");
//             break;
//         case 1: // last hour
//             myDate.setHours(myDate.getHours() -1);
//             updateSummaryCharts("min", myDate);
//             break;
//         case 2: // last day
//             myDate.setHours(myDate.getHours() -24);
//             updateSummaryCharts("10min", myDate);
//             break;
//         case 3: // last week
//             myDate.setHours(myDate.getHours() - (24 * 7));
//             updateSummaryCharts("hr", myDate);
//             break;
//         case 4: // last month
//             myDate.setMonth(myDate.getMonth() - 1);
//             updateSummaryCharts("day", myDate);
//             break;
//         case 5:
//             myDate.setMonth(myDate.getMonth() - 3);
//             updateSummaryCharts("day", myDate);
//             break;
//         case 6:
//             myDate.setMonth(myDate.getMonth() - 6);
//             updateSummaryCharts("day", myDate);
//             break;
//         case 7:
//             myDate.setFullYear(myDate.getFullYear() - 1);
//             updateSummaryCharts("day", myDate);
//             break;
//         case 8:
//             updateSummaryCharts("day");
//             break;
//         default:
//             // console.log(index);
//     }
// }