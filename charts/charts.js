requestChart(setCO2Chart, '2');
requestChart(setFloodChart, '2');
requestChart(setHumidityChart, '2');
requestChart(setTemperatureChart, '2');

function requestChart(fn_toUpdate, sensorId) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText)
            dataset = JSON.parse(this.responseText);
            fn_toUpdate(dataset);
        }
    };
    xhttp.open("POST", "PHP/getData.php", true);
    let data = new FormData();
    data.append('sensorId', sensorId);
    xhttp.send(data);
}

function setHumidityChart(dataset) {
    new Chart(document.getElementById('chart-humidity'), {
        type: 'line',
        data: {
            labels: dataset.labels,
            datasets: [{
                label: 'Luftfeuchtigkeit',
                data: dataset.values,
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function setTemperatureChart(dataset) {
    new Chart(document.getElementById('chart-temperatur'), {
        type: 'line',
        data: {
            labels: dataset.labels,
            datasets: [{
                label: 'Temperatur',
                data: dataset.values,
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        },
    });
}

function setCO2Chart(dataset) {
    new Chart(document.getElementById('chart-co2'), {
        type: 'line',
        data: {
            labels: dataset.labels,
            datasets: [{
                label: 'Co2',
                data: dataset.values,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            }
        }
    });
}

function setFloodChart(dataset) {
    new Chart(document.getElementById('chart-flood'), {
        type: 'bar',
        data: {
            labels: dataset.labels,
            datasets: [{
                label: 'Wassersensor',
                data: dataset.values,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'black',
                    defaultFontColor: 'black'
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
