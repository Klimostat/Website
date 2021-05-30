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

    /**
     *
     */
    _lastUpdate = null;

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
    };

    /**
     *
     * @param id {number}
     */
    remove(id) {
        if (this._ids.includes(id)) {
            let index = this._ids.indexOf(id);
            // console.log("sensorCharts.remove: remove station " + id);
            this._charts.forEach(chart => chart.chart.data.datasets.splice(index, 1));
            this._ids.splice(index, 1);
        }
    };

    /**
     *
     * @param id {number}
     * @param datasets {Object}
     */
    push(id, datasets) {
        if (!this._ids.includes(id)) {
            // console.log("sensorCharts.push: push station " + id);
            let color = stations[id].color;
            let station = stations[id];
            this._charts.forEach(chart => {
                chart.chart.data.datasets.push({
                    label: station.name,
                    data: datasets[chart.name],
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1,
                    segment: {
                        // borderDash: ctx => skipped(ctx, ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined),
                    }
                });
                // chart.chart.update();
            });
            this._ids.push(id);
        }
    };

    /**
     *
     * @param fn {function(Station)}
     */
    forEach(fn) {
        this._ids.forEach(id => fn(stations[id]));
    };

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
        return stations[this._ids[index]];
    };

    updateChartLabels() {
        let actDate = new Date();
        actDate.setMilliseconds(0);

        let time = new Date();
        time.setMinutes(actDate.getMinutes() - 5);

        let push = function (where, what) {
            where.push(what);
            where.shift();
        }

        if (this._lastUpdate == null) {
            push = function (where, what) {
                where.push(what);
            }
        } else {
            time = this._lastUpdate;
        }

        for (; time < actDate; time.setSeconds(time.getSeconds() + 10)) {
            let timeString = jsTimeTo10MinLocalReadableString(time);
            this._charts.forEach(chart => push(chart.chart.data.labels, timeString));
        }
        // this._charts.forEach(chart => chart.chart.update());

        this._lastUpdate = actDate;
    };

    updateCharts() {
        this.updateChartLabels();
        this._charts.forEach(chart => {
            // console.log("update chart " + chart.name);
            chart.chart.update()
        });
        this._ids.forEach(id => {
            // console.log("updateCharts -> _ids.foreach -> " + id + " updateDatasetChart()")
            // console.log(stations[id]);
            stations[id].updateDatasetChart();
        });
        this._charts.forEach(chart => {
            // console.log("update chart " + chart.name);
            chart.chart.update()
        });
    }
}