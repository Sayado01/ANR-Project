// Récupérez les données, les couleurs de fond, les couleurs de bordure et les étiquettes des paramètres de l'URL
var urlParams = new URLSearchParams(window.location.search);
var data = JSON.parse(decodeURIComponent(urlParams.get('data')));
var backgroundColor = JSON.parse(decodeURIComponent(urlParams.get('backgroundColor')));
var borderColor = JSON.parse(decodeURIComponent(urlParams.get('borderColor')));
var labels = JSON.parse(decodeURIComponent(urlParams.get('labels')));

// Function to initialize or update the chart with dynamic data
function initializeOrUpdateChart(data, backgroundColor, borderColor, labels) {
    // Check if a chart instance exists
    if (window.myChart) {
        // Update the existing chart
        window.myChart.data.datasets[0].data = data;
        window.myChart.data.datasets[0].backgroundColor = backgroundColor;
        window.myChart.data.datasets[0].borderColor = borderColor;
        window.myChart.data.labels = labels;
        window.myChart.update();
    } else {
        // Create a new chart instance
        var ctx = document.getElementById('bestSellers').getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor
                }],
                labels: labels
            },
            options: {
                responsive: true,
                cutoutPercentage: 80,
                legend: {
                    display: false
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                plugins: {
                    datalabels: {
                        display: false,
                        align: 'center',
                        anchor: 'center'
                    }
                }
            }
        });
    }
}

// Initialize or update the chart when the script is loaded
initializeOrUpdateChart(data, backgroundColor, borderColor, labels);
