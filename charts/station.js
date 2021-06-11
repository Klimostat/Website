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
    /**
     *
     * @type {Object}
     */
    navNode = {
        /**
         * @type {Station}
         */
        station: this,

        /**
         * @type {?HTMLElement}
         */
        _node: null,

        /**
         *
         */
        STYLES: [
            "unselected",
            "selected",
            "offline"
        ],

        /**
         *
         * @return {HTMLElement|null}
         */
        get() {
            return this._node;
        },

        /**
         *
         * @param style {string}
         */
        setStyle: function (style) {
            if (!this.STYLES.includes(style)) {
                return;
            }
            // console.log(style);

            // selected
            this._node.classList.toggle("selected", style === "selected");

            //offline
            this._node.classList.toggle("offline", style === "offline");
        },

        /**
         *
         */
        updateNewestData: function () {
            this.get();
            this._node.parentElement.getElementsByTagName("span")[0].innerHTML = date.toLocalReadableString(this.station.liveData.timestampOfNewestData);
        }
    };

    /**
     *
     * @type {{maxTemperature: [], minTemperature: [], maxHumidity: [], maxCo2: [], minCo2: [], minHumidity: []}}
     */
    datasets = {
        dummy: [],
        minTemperature: [],
        maxTemperature: [],
        minCo2: [],
        maxCo2: [],
        minHumidity: [],
        maxHumidity: []
    };

    // lastDataPrepared = null;

    loadedInterval = "";
    color;
    id;
    name;
    alertMessageHumidity;
    alertMessageCO2;
    location;
    thresholdCo2;
    thresholdHumidity;

    /**
     *
     * @param dbFetch {Object}
     */
    constructor(dbFetch) {
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.alertMessageHumidity = dbFetch.alert_message_humidity;
        this.alertMessageCO2 = dbFetch.alert_message_co2;
        this.location = dbFetch.location;
        this.color = colors[klimostat.stations.length % 12];
        this.thresholdCo2 = dbFetch.threshold_co2;
        this.thresholdHumidity = dbFetch.threshold_humidity;

        // creates navNode
        let stationsBox = document.getElementById("stations-box");

        let tooltipBase = document.createElement("div");
        tooltipBase.classList.add("tooltip-base");

        let navNode = document.createElement("a");
        navNode.classList.add("list-group-item", "station-node");
        navNode.href = "javascript:selectedStations.toggle(" + this.id + ")";
        navNode.innerHTML = this.name;
        this.navNode._node = navNode;

        let card = document.createElement("div");
        card.classList.add("card");

        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = "Location: " + this.location + "<br> Last update: <span> not yet </span>";

        stationsBox.appendChild(tooltipBase);
        tooltipBase.appendChild(navNode);
        tooltipBase.appendChild(card);
        card.appendChild(cardBody);
    }

    /**
     *
     * @return {boolean}
     */
    isOffline() {
        if (this.liveData.timestampOfNewestData !== null) {
            let lastFetch = new Date(this.liveData.timestampOfNewestData);
            return lastFetch.setMinutes(lastFetch.getMinutes() + 5) < new Date();
        }
        return true;
    }

    /**
     *
     */
    clearDatasets() {
        // console.log("cleared data: " + this.id);
        let length = this.datasets.dummy.length;
        this.datasets.dummy.splice(0, length);
        this.datasets.minTemperature.splice(0, length);
        this.datasets.maxTemperature.splice(0, length);
        this.datasets.minCo2.splice(0, length);
        this.datasets.maxCo2.splice(0, length);
        this.datasets.minHumidity.splice(0, length);
        this.datasets.maxHumidity.splice(0, length);
    }

    /**
     *
     * @param count {number}
     * @param shiftLeft {boolean}
     */
    pushDatasets(count, shiftLeft=true) {
        // console.log("count to push: " + count);
        for (let i = 0; i < count; i++) {
            this.datasets.dummy.push(NaN);
            this.datasets.minTemperature.push(NaN);
            this.datasets.maxTemperature.push(NaN);
            this.datasets.minCo2.push(NaN);
            this.datasets.maxCo2.push(NaN);
            this.datasets.minHumidity.push(NaN);
            this.datasets.maxHumidity.push(NaN);
            if (shiftLeft) {
                this.datasets.dummy.shift();
                this.datasets.minTemperature.shift();
                this.datasets.maxTemperature.shift();
                this.datasets.minCo2.shift();
                this.datasets.maxCo2.shift();
                this.datasets.minHumidity.shift();
                this.datasets.maxHumidity.shift();
            }
        }
    }

    /**
     *
     * @type {Object}
     */
    liveData = {
        station: this,

        /**
         *
         * @type {number}
         */
        maxCo2: 0,

        /**
         *
         * @type {number}
         */
        minHumidity: 100,

        /**
         * @type {Date}
         */
        timestampOfNewestData: null,

        /**
         * @type {Date}
         */
        timestampOfNewestDatasetEntry: null,
    }
}