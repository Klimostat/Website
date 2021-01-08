var ctx = document.getElementById('chart-flood');
var chart_wateringress_var = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Green', 'Green', 'Green', 'Green', 'Green', 'Green'],
        datasets: [{
            label: 'bar',
            data: [0, 0, 0, 1, 0, 0],
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