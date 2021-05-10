class Station {
    lastFetch = null;
    lastChartUpdate = null;
    dataPrepared = {};
    datasetChart = {
        temperature: [],
        co2: [],
        humidity: []
    };

    /**
     *
     * @param dbFetch {object}
     */
    constructor(dbFetch) {
        this.id = dbFetch.pk_station_id;
        this.name = dbFetch.name;
        this.alertMessageHumidity = dbFetch.alert_message_humidity;
        this.alertMessageCO2 = dbFetch.alert_message_co2;
        this.location = dbFetch.location;

        document.getElementById("stations-box").innerHTML +=
            "<div class = \"tooltip-base\">" +
            "   <a id = \"station-" + this.id + "\" class = \"nav-link\" href=\"javascript:setSelectedStation(" + this.id + ")\">" +
            "       " + this.name + "" +
            "   </a>" +
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
            // this.values.append({
            //     date: mySQLToUTCJSDate(entry.time),
            //     co2: entry.co2,
            //     humidity: entry.humidity,
            //     temperature: entry.temperature
            // })
            this.dataPrepared[jsTimeToLocalReadableString(mySQLToUTCJSDate(entry.time))] = {
                co2: entry.co2,
                humidity: entry.humidity,
                temperature: entry.temperature
            }
        }
        this.lastFetch = new Date();
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

        if (this.lastChartUpdate == null) {
            push = function (where, what) {
                where.push(what);
            }
        } else {
            time = this.lastChartUpdate;
        }

        for (; time < actDate; time.setSeconds(time.getSeconds() + 1)) {
            let timeString = jsTimeToLocalReadableString(time);

            let values = this.dataPrepared[timeString];
            if (typeof values !== "object") {
                values = {temperature: NaN, co2: NaN, humidity: NaN}
            }
            push(this.datasetChart.temperature, values.temperature);
            push(this.datasetChart.co2, values.co2);
            push(this.datasetChart.humidity, values.humidity);
        }

        this.lastChartUpdate = new Date();
        return this.datasetChart;
    }
}