class SensorChart {
    /**
     *
     * @type {number[]}
     * @private
     */
    _ids = [];

    /**
     *
     * @type {Chart[]}
     * @private
     */
    _charts;

    /**
     *
     * @param charts {Chart|Chart[]}
     */
    constructor(charts) {
        if (charts.constructor === Array) {
            this._charts = charts;
        } else if (charts.constructor === Chart) {
            this._charts = [charts];
        } else {
            throw new Error();
        }
    }

    /**
     *
     * @param id {number}
     */
    remove(id) {
        if (this._ids.includes(id)) {
            let index = this._ids.indexOf(id);
            this._charts.forEach(chart => chart.data.datasets.splice(index, 1));
            this._ids.splice(index, 1);
        }
    };

    /**
     *
     * @param id {number}
     * @param color {?string}
     */
    push(id, color=stations[id].color) {
        if (!this._ids.includes(id)) {
            let station = stations[id];
            this._charts.forEach(chart => chart.data.datasets.push({
                    label: station.name,
                    data: [],
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1,
                    segment: {
                        // borderDash: ctx => skipped(ctx, ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined),
                    }
                }));
            this._ids.push(id);
        }
    };

    /**
     *
     * @param fn {function}
     */
    forEach(fn) {
        this._ids.forEach(id => fn(stations[id]));
    };

    /**
     *
     */
    clear() {
        this._ids = [];
        this._charts.forEach(chart => chart.data.datasets = []);
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
    }
}