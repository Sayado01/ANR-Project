var data = data;
var backgroundColor = backgroundColor;
var borderColor = backgroundColor;
var labels = labels;
(function($) {
    'use strict';
    $(function() {
        var bestSellersData = {
            datasets: [{
                data: data,
                backgroundColor: 
                    backgroundColor
                ,
                borderColor: backgroundColor,
            }],
            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: labels
        };
        var bestSellersOptions = {
            responsive: true,
            cutoutPercentage: 80,
            legend: {
                display: false,
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

        };
        // Loop through each canvas element with the class 'bestSellers'
        document.querySelectorAll('.bestSellers').forEach(function(canvas, index) {
            var pieChart = new Chart(canvas, {
                type: 'doughnut',
                data: bestSellersData,
                options: bestSellersOptions
            });
        });
    });
})(jQuery);
