/**
 * Array of all sensors with all parameters as they are in the database.
 * Is initialized with the init() call.
 * ATTENTION!! The index is not equivalent to the sensor id.
 * @type {Object[]}
 */
let stations = [];

/**
 * Object of all ChartJS charts, initialized with the init() call.
 * @type {Object}
 */
let charts = {};


/**
 * initializes environment at the start
 */
function init() {
    // intervalSelect = document.getElementById("interval");

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            stations = JSON.parse(this.responseText);
            initCharts();
        }
    };
    xhttp.open("POST", "PHP/getStations.php", true);
    xhttp.send();
}