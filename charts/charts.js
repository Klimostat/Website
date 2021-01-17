document.addEventListener("DOMContentLoaded", init, false);

/**
 * Array of all sensors with all parameters as they are in the database.
 * Is initialized with the init() call.
 * ATTENTION!! The index is not equivalent to the sensor id.
 * @type {Object[]}
 */
let sensors = [];

/**
 * Array of all ChartJS charts, initialized with the init() call.
 * @type {Chart[]}
 */
let charts = [];


/**
 * The HTML-select-element used for selecting the time interval, initialized with the init() call.
 */
let intervalSelect;

/**
 * initializes environment at the start
 */
function init() {
    intervalSelect = document.getElementById("interval");

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // console.log(this.responseText);
            sensors = JSON.parse(this.responseText);
            initCharts();
        }
    };
    xhttp.open("POST", "PHP/getSensors.php", true);
    xhttp.send();
}

/**
 * convert a mySQL datetime string to a Date object
 * @param mysqlDatetimeStr the mySQL datetime string
 * @return {Date}
 */
function mySQLToUTCJSDate(mysqlDatetimeStr) {
    return new Date(mysqlDatetimeStr.replace(" ", "T") + "Z")
}

/**
 * converts a Date object to a mySQL datetime string
 * @param dateObj {Date} the Date
 * @return {string} the mySQL datetime string
 */
function jsToUTCMySQLDate(dateObj) {
    return dateObj.getUTCFullYear() + '-' +
        ('00' + (dateObj.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + dateObj.getUTCDate()).slice(-2) + ' ' +
        ('00' + dateObj.getUTCHours()).slice(-2) + ':' +
        ('00' + dateObj.getUTCMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getUTCSeconds()).slice(-2);
}

/**
 * converts a Date object to a local user readable string
 * @param dateObj {Date} the Date
 * @return {string} the string
 */
function jsToLocalReadableString(dateObj) {
    return dateObj.getDate() + '.' +
        ('00' + (dateObj.getMonth()+1)).slice(-2) + '.' +
        ('00' + dateObj.getFullYear()).slice(-2) + ' ' +
        ('00' + dateObj.getHours()).slice(-2) + ':' +
        ('00' + dateObj.getMinutes()).slice(-2) + ':' +
        ('00' + dateObj.getSeconds()).slice(-2);
}
