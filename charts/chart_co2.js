var ctx = document.getElementById('chart-co2');
var chart_co2_var = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Blue', 'Blue', 'Blue', 'Blue', 'Blue', 'Blue'],
        datasets: [{
            label: 'Co2',
            data: [6, 4, 2, 1, 2, 4],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(54, 162, 235, 1)'
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

