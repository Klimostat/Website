let colors = [
    "#ff0000",
    "#ffb000",
    "#ffff00",
    "#b0ff00",
    "#00ff00",
    "#00ffb0",
    "#00ffff",
    "#00b0ff",
    "#0000ff",
    "#b000ff",
    "#ff00ff",
    "#ff00b0"
]

class Station {
    lastFetch = null;
    lastChartUpdate = null;
    dataPrepared = {};
    datasetChart = {
        minTemperature: [],
        maxTemperature: [],
        minCo2: [],
        maxCo2: [],
        minHumidity: [],
        maxHumidity: []
    };
    navNode = null;
    maxCo2 = 0;
    minHumidity = 100;
    color = colors[/*(stations.length * 2 + 1) % 11*/stations.length % 12];

    /**
     *
     * @param dbFetch {object}
     * @param selected {boolean}
     */
    constructor(dbFetch, selected=false) {
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.alertMessageHumidity = dbFetch.alert_message_humidity;
        this.alertMessageCO2 = dbFetch.alert_message_co2;
        this.location = dbFetch.location;

        document.getElementById("stations-box").innerHTML +=
            "<div class = \"tooltip-base\">" +
            "   <label class=\"list-group-item\">" +
            "       <input  id = \"station-" + this.id + "\" type=\"checkbox\" onchange=\"selectedStations.toggle(" + this.id + ")\" value=\"" + this.id + "\"" + (selected ? " checked" : "") + ">" +
            "       " + this.name + "" +
            "   </label>" +
            "   <div class = \"card\">" +
            "       <div class = \"card-body\">" +
            "           Location: " + this.location + "" +
            "       </div>" +
            "   </div>" +
            "</div>";
    }

    /**
     * updates the charts, the "last updated" message and variables
     */
    updateValues(data) {
        for (const entry of data) {
            if (entry.co2 >= grenzwertCO2) {
                sendAlert(this.alertMessageCO2);
            }
            if (entry.humidity < grenzwertHumidity) {
                sendAlert(this.alertMessageHumidity);
            }
            let entryTimeString = jsTimeTo10MinLocalReadableString(mySQLToUTCJSDate(entry.time));
            if (typeof this.dataPrepared[entryTimeString] === "object") {
                let actSet = this.dataPrepared[entryTimeString];
                this.dataPrepared[entryTimeString] = {
                    minCo2: Math.min(actSet.minCo2, entry.co2),
                    maxCo2: Math.max(actSet.maxCo2, entry.co2),
                    minHumidity: Math.min(actSet.minHumidity, entry.humidity),
                    maxHumidity: Math.max(actSet.maxHumidity, entry.humidity),
                    minTemperature: Math.min(actSet.minTemperature, entry.temperature),
                    maxTemperature: Math.max(actSet.maxTemperature, entry.temperature)
                }
                this.minHumidity = Math.min(actSet.minHumidity, this.minHumidity);
                this.maxCo2 = Math.max(actSet.maxCo2, this.maxCo2);
            } else {
                this.dataPrepared[entryTimeString] = {
                    minCo2: entry.co2,
                    maxCo2: entry.co2,
                    minHumidity: entry.humidity,
                    maxHumidity: entry.humidity,
                    minTemperature: entry.temperature,
                    maxTemperature: entry.temperature
                }
            }
        }
        this.lastFetch = new Date();
        extremeStations.checkAppendedValues(this);
    }

    getChartValues() {
        let actDate = new Date();
        actDate.setMilliseconds(0);

        let time = new Date();
        time.setMinutes(actDate.getMinutes() - 5);

        let push = function (where, what) {
            where.push(what);
            where.shift();
        }

        if (this.lastChartUpdate === null) {
            push = function (where, what) {
                where.push(what);
            }
        } else {
            time = this.lastChartUpdate;
        }

        // console.log("stations - lastChartUpdate: " + this.lastChartUpdate);
        // console.log(this.dataPrepared);

        for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
            let timeString = jsTimeTo10MinLocalReadableString(time);

            let values = this.dataPrepared[timeString];
            if (typeof values !== "object") {
                values = {
                    minCo2: NaN,
                    maxCo2: NaN,
                    minHumidity: NaN,
                    maxHumidity: NaN,
                    minTemperature: NaN,
                    maxTemperature: NaN
                }
            }
            push(this.datasetChart.minTemperature, values.minTemperature);
            push(this.datasetChart.maxTemperature, values.maxTemperature);
            push(this.datasetChart.minCo2, values.minCo2);
            push(this.datasetChart.maxCo2, values.maxCo2);
            push(this.datasetChart.minHumidity, values.minHumidity);
            push(this.datasetChart.maxHumidity, values.maxHumidity);
        }

        this.lastChartUpdate = new Date();
        return this.datasetChart;
    }

    /**
     *
     * @return {HTMLElement|null}
     */
    getNavNode() {
        if (this.navNode === null) {
            this.navNode = document.getElementById("station-" + this.id);
        }
        return this.navNode;
    }
}

const extremeStations = {
    maxCo2: [],
    minHumidity: [],
    /**
     *
     * @param station {Station}
     */
    checkAppendedValues: function (station) {
        //CO2
        if (this.maxCo2.includes(station)) {
            this.maxCo2.sort((a, b) => - a.maxCo2 + b.maxCo2);
        } else if (this.maxCo2.length < 5) {
            this.maxCo2.push(station);
            this.maxCo2.sort((a, b) => - a.maxCo2 + b.maxCo2);
        } else if (station.maxCo2 > this.maxCo2[this.maxCo2.length - 1].maxCo2) {
            this.maxCo2.push(station);
            this.maxCo2.sort((a, b) => - a.maxCo2 + b.maxCo2);
            this.maxCo2.pop();
        }

        //Humidity
        if (this.minHumidity.includes(station)) {
            this.minHumidity.sort((a, b) => a.minHumidity - b.minHumidity);
        } else if (this.minHumidity.length < 5) {
            this.minHumidity.push(station);
            this.minHumidity.sort((a, b) => a.minHumidity - b.minHumidity);
        } else if (station.minHumidity < this.minHumidity[this.minHumidity.length - 1].minHumidity) {
            this.minHumidity.push(station);
            this.minHumidity.sort((a, b) => a.minHumidity - b.minHumidity);
            this.minHumidity.pop();
        }
    }
}