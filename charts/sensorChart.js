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
     * @type {string[]}
     */
    labels = [];

    /**
     *
     * @type {string}
     */
    loadedInterval = "";

    /**
     *
     * @type {?Date}
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

    /**
     *
     */
    updateCharts() {
        this._charts.forEach(chart => {
            chart.chart.update();
        });
    }
}