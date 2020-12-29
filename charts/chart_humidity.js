var ctx = document.getElementById('chart-humidity');
var myChart = new Chart(ctx, {
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
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});