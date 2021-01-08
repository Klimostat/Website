var ctx = document.getElementById('chart-humidity');
var chart_humidity_var = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Purple', 'Purple', 'Purple', 'Purple', 'Purple', 'Purple'],
        datasets: [{
            label: 'Luftfeuchtigkeit',
            data: [6, 5, 4, 3, 2, 1],
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: [
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(153, 102, 255, 1)'
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