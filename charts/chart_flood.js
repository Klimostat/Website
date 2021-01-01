var ctx = document.getElementById('chart-flood');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Green', 'Green', 'Green', 'Green', 'Green', 'Green'],
        datasets: [{
            label: 'Wassserstand',
            data: [12, 19, 3, 5, 2, 3],
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
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});