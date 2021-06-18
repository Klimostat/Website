/**
 * api for chartjs charts, allows modifying datasets and keep consistency over some charts
 */
class SensorChart {
    /**
     * the ids of the stations that are displayed
     * @type {number[]}
     */
    _ids = [];

    /**
     * the charts with names
     * @type {{name: string, chart: Chart}[]}
     * @private
     */
    _charts;

    /**
     * the labels of all charts, direct reference, do not change
     * @type {string[]}
     * @const
     */
    labels = [];

    /**
     * the loaded interval as string
     * @type {string}
     */
    loadedInterval = "";

    /**
     * the timestamp of the last update of the labels, used for appending timestamps
     * @type {?Date}
     */
    lastLabelUpdate = null;

    /**
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
     * removes a station from the charts
     * @param id {number} the id of the station
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
     * adds a station to the charts
     * @param id {number} the id of the station
     * @param datasets {Object} the dataset of the values, this is a reference, so if the original dataset is pushed, the charts also get pushed
     * @param datasetsDashed {?Object} a second dataset, like above but dashed displayed
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
     * empties the charts, removes all stations
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
     * checks whether a station is displayed
     * @param id {number} the id of the station
     * @return {boolean}
     */
    includes(id) {
        return this._ids.includes(id);
    };

    /**
     * returns the number of stations displayed
     * @return {number}
     */
    size() {
        return this._ids.length;
    };

    /**
     * returns the station at the given index
     * @param index {number} the index of the station in the chart (this is not the station id)
     * @return {Station}
     */
    get(index) {
        return klimostat.stations[this._ids[index]];
    };

    /**
     * updates all charts
     */
    updateCharts() {
        this._charts.forEach(chart => {
            chart.chart.update();
        });
    }

    /**
     * updates the labels by pushing data to the end, if shiftLeft is true then the first elements are shifted
     * @param labels {string|string[]} the labels to add
     * @param shiftLeft {boolean} whether the oldest labels from left should be shifted
     */
    pushTimestampRight(labels, shiftLeft=true) {
        if (labels.constructor !== Array) {
            labels = [labels];
        }
        labels.forEach(label => {
            this.labels.push(label);
            if (shiftLeft) {
                this.labels.shift();
            }
        });
    }

    /**
     * empties the labels
     */
    clearChartContents() {
        let length = this.labels.length;
        this.labels.splice(0, length);
    }
}