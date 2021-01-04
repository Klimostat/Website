var ctx = document.getElementById('chart-temperatur');
var chart_temp_var = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Red', 'Red', 'Red', 'Red', 'Red', 'Red'],
        datasets: [{
            label: 'Temperatur',
            data: [1, 4, 2, 8, 5, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 99, 132, 0.7)'
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
    },
});