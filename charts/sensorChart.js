class SensorChart {
    /**
     *
     * @type {number[]}
     * @private
     */
    _ids = [];

    /**
     *
     * @type {{name: string, chart: Chart}[]}
     * @private
     */
    _charts;

    labels = [];

    loadedInterval = "";

    /**
     *
     */
    lastLabelUpdate = null;

    /**
     *
     * @param charts {{name: string, chart: Chart}[]}
     */
    constructor(charts) {
        if (charts.constructor === Array) {
            this._charts = charts;
        } else {
            throw new Error();
        }
        this._charts.forEach(chart => chart.chart.data.labels = this.labels);
    };

    /**
     *
     * @param id {number}
     */
    remove(id) {
        if (this._ids.includes(id)) {
            let index = this._ids.indexOf(id);
            this._charts.forEach(chart => chart.chart.data.datasets.splice(index, 1));
            this._ids.splice(index, 1);

            index = this._ids.indexOf(id);
            if (index >= 0) {
                this._charts.forEach(chart => chart.chart.data.datasets.splice(index, 1));
                this._ids.splice(index, 1);
            }
        }
    };

    /**
     *
     * @param id {number}
     * @param datasets {Object}
     * @param datasetsDashed {?Object}
     */
    push(id, datasets, datasetsDashed=null) {
        if (!this._ids.includes(id)) {
            let color = klimostat.stations[id].color;
            this._charts.forEach(chart => {
                chart.chart.data.datasets.push({
                    label: datasets[chart.name].name,
                    data: datasets[chart.name].dataset,
                    // cubicInterpolationMode: 'monotone',
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1,
                    segment: {}
                });
            });
            this._ids.push(id);
            if (datasetsDashed !== null) {
                this._charts.forEach(chart => {
                    chart.chart.data.datasets.push({
                        label: datasetsDashed[chart.name].name,
                        data: datasetsDashed[chart.name].dataset,
                        // cubicInterpolationMode: 'monotone',
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 1,
                        borderDash: [5, 5],
                        segment: {}
                    });
                });
                this._ids.push(id);
            }
        }
    };

    /**
     *
     * @param fn {function(Station)}
     */
    forEachLoadedStation(fn) {
        let distinctStations = []
        this._ids.forEach(id => {
            if (!distinctStations.includes(id)) {
                distinctStations.push(id)
            }
        });
        distinctStations.forEach(id => fn(klimostat.stations[id]));
    };

    /**
     *
     */
    forEachChart(fn) {
        this._charts.forEach(chart => fn(chart.chart));
    }

    /**
     *
     */
    clear() {
        this._charts.forEach(chart => {
            while (chart.chart.data.datasets.length > 0) {
                chart.chart.data.datasets.pop();
            }
        });
        this._ids = [];
    };

    /**
     *
     * @param id {number}
     * @return {boolean}
     */
    includes(id) {
        return this._ids.includes(id);
    };

    /**
     * @return {number}
     */
    size() {
        return this._ids.length;
    };

    /**
     *
     * @param index {number}
     * @return {Station}
     */
    get(index) {
        return klimostat.stations[this._ids[index]];
    };

    // updateChartLabels() {
    //     let actDate = new Date();
    //     actDate.setMilliseconds(0);
    //
    //     let time = new Date();
    //     time.setMinutes(actDate.getMinutes() - 5);
    //
    //     let push = function (where, what) {
    //         where.push(what);
    //         where.shift();
    //     }
    //
    //     if (this._lastUpdate == null) {
    //         push = function (where, what) {
    //             where.push(what);
    //         }
    //     } else {
    //         time = this._lastUpdate;
    //     }
    //
    //     for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
    //         let timeString = date.toIntervalLocalReadableString(time, "10sec");
    //         this._charts.forEach(chart => push(chart.chart.data.labels, timeString));
    //     }
    //     this._charts.forEach(chart => chart.chart.update());
        //
        // this._lastUpdate = actDate;
    // };

    /**
     *
     */
    updateCharts() {
        // this.updateChartLabels();
        this._charts.forEach(chart => {
            chart.chart.update();
        });
    }
}