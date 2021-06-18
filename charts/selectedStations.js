/**
 * api for the selected station cookie
 * @type {Object}
 */
const selectedStationsCookie = {
    /**
     * the ids of the stations selected (cache)
     */
    _ids: null,

    /**
     * returns the ids of the stations that are saved in the cookie or in the cache
     * @return {null}
     */
    getIds: function () {
        if (this._ids === null) {
            this._ids = [];

            let cookie = document.cookie.split('; ')
                .find(cookie => cookie.startsWith("station_ids="));
            if (cookie !== undefined) {
                cookie.split("=")[1].split(",").forEach(id => {
                    this._ids.push(parseInt(id));
                });
            }
        }
        return this._ids;
    },

    /**
     * updates the cache and the cookie
     * @param ids {number[]}
     */
    update: function (ids) {
        ids.sort();
        this._ids = ids;
        if (this._ids.length === 0) {
            document.cookie = "station_ids=null; SameSite=Strict; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } else {
            document.cookie = "station_ids=" + this._ids + "; SameSite=Strict; Secure";
        }
    },
}

/**
 * api for station selection
 * @type {Object}
 */
const selectedStations = {
    /**
     * the ids of the station that are currently displayed in the charts
     * @type {number[]}
     */
    _idsDisplayed: [],

    /**
     * the ids of the stations that are selected by teh user
     * @type {number[]}
     */
    _idsSelected: [],

    /**
     * returns the selected station objects
     * @return {Station[]}
     */
    get: function () {
        let lstations = [];
        this._idsSelected.forEach(id => {
            lstations.push(klimostat.stations[id])
        });
        return lstations;
    },

    /**
     * toggles a station, pushes or removes depending on the selection state, updates cookie
     * @param id {number} the id of the station
     */
    toggle: function (id) {
        // checks on wrong loaded charts
        if (this._idsSelected.length === 0 && klimostat.loadedView === "dashboard") {
            selectedStationsCookie.update([id]);
            klimostat.determineView();
            return;
        }

        if (this._idsSelected.includes(id)) {
            if (this._idsSelected.length !== 1) {
                //remove
                // console.log("remove " + id);
                this.remove(id);
            }
        } else {
            // add
            // console.log("adds " + id);
            this.push(id);
        }

        klimostat.updateCharts();
    },

    /**
     * removes all stations from selection, updates cookie
     */
    clear: function () {
        // clears list
        this._idsSelected = [];

        // writes cookie
        this.updateCookie();

        // disables all styling
        // this.updateAndDisplay();

        klimostat.determineView();
    },

    /**
     * removes the station with the given id, updates cookie
     * @param id {number} the id of the station to remove
     */
    remove: function (id) {
        // checks for already displayed
        if (!this._idsSelected.includes(id)) {
            return;
        }

        // takes out of list
        this._idsSelected.splice(this._idsSelected.indexOf(id), 1);

        // disables styling and removes from displayed stations
        // this.display(id);

        //updates cookie
        this.updateCookie();
    },

    /**
     * adds the station with the given id, updates cookie
     * @param id {number}
     */
    push: function (id) {
        // checks for already displayed
        if (this._idsSelected.includes(id)) {
            return;
        }

        // adds to list
        this._idsSelected.push(id);

        // enables styling and adds to displayed stations
        // this.display(id);

        // updates cookies
        this.updateCookie();
    },

    /**
     * executes the given function for all selected stations
     * @param fn {function(Station)} the function
     */
    forEach: function (fn) {
        this._idsSelected.forEach(id => {
            fn(klimostat.stations[id]);
        });
    },

    /**
     * whether the station with the given id is selected or not
     * @param id {number} the id of the station
     * @return {boolean}
     */
    includes: function (id) {
        return this._idsSelected.includes(id);
    },

    /**
     * calls {@link selectedStationsCookie.update} with the selected stations
     */
    updateCookie: function () {
        selectedStationsCookie.update(this._idsSelected);
    },

    /**
     * displays all selected stations, pushes new ones to the chart and removes unselected ones
     * @param sensorCharts {SensorChart} the sensorChart object where the stations should be displayed
     * @param interval {Interval} the interval that is displayed
     */
    updateAndDisplay: function (sensorCharts, interval) {
        //removes unselected
        for (let i = 0; i < this._idsDisplayed.length; i++){
            const station = klimostat.stations[this._idsDisplayed[i]];
            if (!this._idsSelected.includes(station.id) && !station.isOffline()) {
                this._idsDisplayed.splice(i, 1);
                sensorCharts.remove(station.id);
                i--;
                station.navNode.setStyle("unselected");
            }
        }

        // adds selected
        // console.log("idsDisplayed: ");
        // console.log(this._idsDisplayed);
        for (let i = 0; i < this._idsSelected.length; i++) {
            const station = klimostat.stations[this._idsSelected[i]];
            if (!this._idsDisplayed.includes(station.id)) {
                if (station.isOffline() && interval.constructor === LiveInterval) {
                    station.navNode.setStyle("offline");
                } else {
                    this._idsDisplayed.push(station.id);
                    sensorCharts.push(station.id, {
                        humidity: {dataset: station.datasets.minHumidity, name: station.name + " min"},
                        temperature: {dataset: station.datasets.maxTemperature, name: station.name + " max"},
                        co2: {dataset: station.datasets.maxCo2, name: station.name + " max"},
                    }, {
                        humidity: {dataset: station.datasets.maxHumidity, name: station.name + " max"},
                        temperature: {dataset: station.datasets.minTemperature, name: station.name + " min"},
                        co2: {dataset: station.datasets.minCo2, name: station.name + " min"},
                    });
                    station.navNode.setStyle("selected");
                }
            }
        }
        // console.log(this._idsDisplayed);
    }
}