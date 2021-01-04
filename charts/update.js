function chart_update() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            addData(chart_co2_var, 'Blue', 12)
            addData(chart_wateringress_var, 'Green', 1)
            addData(chart_humidity_var, 'Purple', 0)
            addData(chart_temp_var, 'Red', 2)
        }
    };
    xhttp.open("GET", "index.html", true);
    xhttp.send();
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}
