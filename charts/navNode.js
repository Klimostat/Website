class NavNode {
    /**
     * the station the nav node belongs to
     * @type {Station}
     */
    station;

    /**
     * the different parts of the navNode
     */
    _nodes = {
        nav: null,
        lastUpdate: null,
        alert: null
    };

    /**
     * used for styling of the navNode
     */
    styles = {
        selected: false,
        offline: false,
        alerting: false
    };

    constructor(station) {
        this.station = station;

        // creates navNode
        let stationsBox = document.getElementById("stations-box");

        let tooltipBase = document.createElement("div");
        tooltipBase.classList.add("tooltip-base");

        let navNode = this._nodes.nav = document.createElement("a");
        navNode.classList.add("list-group-item", "station-node");
        navNode.href = "javascript:selectedStations.toggle(" + station.id + ")";
        navNode.innerHTML = station.name;

        // card
        let card = document.createElement("div");
        card.classList.add("card");

        let cardBody = document.createElement("div");
        cardBody.classList.add("list-group");

        let location = document.createElement("li");
        location.classList.add("list-group-item");
        location.innerHTML = "Location: " + station.location;

        let lastUpdate = this._nodes.lastUpdate = document.createElement("li");
        lastUpdate.classList.add("list-group-item");
        lastUpdate.innerHTML = "Last update: ";

        let lastUpdateSpan = document.createElement("span");
        lastUpdateSpan.innerHTML = "not yet";
        lastUpdate.appendChild(lastUpdateSpan);

        let alert = this._nodes.alert = document.createElement("li");
        alert.classList.add("list-group-item");
        alert.innerHTML = "everything ok";

        cardBody.appendChild(location);
        cardBody.appendChild(lastUpdate);
        cardBody.appendChild(alert);

        // appends
        stationsBox.appendChild(tooltipBase);
        tooltipBase.appendChild(navNode);
        tooltipBase.appendChild(card);
        card.appendChild(cardBody);
    }

    /**
     * used for changing the style of the navNode
     * @param style {string}
     */
    setStyle(style) {
        // selected
        this._nodes.nav.classList.toggle("selected", style === "selected");

        //offline
        this._nodes.nav.classList.toggle("offline", style === "offline");
    };

    /**
     * updates the timestamp displayed in the popup
     */
    setNewestData(timeString) {
        this._nodes.lastUpdate.innerHTML = timeString;
    };

    /**
     * changes the style of the navNode to appear alerting
     * @param alerting whether it is alerting or not
     * @param message the message to be displayed
     */
    setAlerting(alerting = true, message) {
        this.styles.alerting = alerting;
        this._nodes.nav.classList.toggle("alerting", alerting);
        this._nodes.alert.innerHTML = message;
    }
}