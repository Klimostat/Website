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
        station: this,
        _node: null,
        _loadedStyle: 0,
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

    datasets = {
        minTemperature: [],
        maxTemperature: [],
        minCo2: [],
        maxCo2: [],
        minHumidity: [],
        maxHumidity: []
    }

    loadedInterval = "";

    /**
     *
     * @type {string}
     */
    color = colors[/*(stations.length * 2 + 1) % 11*/klimostat.stations.length % 12];

    /**
     *
     * @param dbFetch {object}
     */
    constructor(dbFetch) {
        this.id = parseInt(dbFetch.pk_station_id);
        this.name = dbFetch.name;
        this.alertMessageHumidity = dbFetch.alert_message_humidity;
        this.alertMessageCO2 = dbFetch.alert_message_co2;
        this.location = dbFetch.location;

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

        unload() {
            this.timestampOfNewestData = null;
            this.timestampOfNewestDatasetEntry = null;
        }
    }
}