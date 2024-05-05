var chartData;
function generateUniqueId() {
    return 'chart-' + Date.now(); // Utilisez un timestamp comme identifiant unique
}

function submitForm() {
    var form = document.getElementById('sentenceForm');
    var formData = new FormData(form);

    // Hide the presentation div
    var presentationDiv = document.getElementById('presentation');
    presentationDiv.classList.add('d-none');

    // Send a POST request to the Flask route with the form data
    fetch('/sentence', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {

            // Reset the textarea height to its initial value
            var textarea = document.getElementById("ocr-result");
            textarea.style.height = "50px";

            // Add the new user message to the chat conversation
            var userMessageElement = createUserMessageElement(formData.get('text'));
            var chatConversation = document.querySelector('.chat-conversation-content .os-content');
            chatConversation.appendChild(userMessageElement);

            // Create a new message element for Flask response
            var flaskResponseElement = createFlaskResponseElement(data);
            // Append the Flask response as a left message to the chat conversation
            chatConversation.appendChild(flaskResponseElement);
            var canvasElement = document.querySelector('.bestSellers'); // Sélectionnez le premier élément avec la classe 'bestSellers'
            chartData = canvasElement.getAttribute('data-chart');
            var data = JSON.parse(chartData).datasets[0].data.slice(0, 5);
            var backgroundColor = JSON.parse(chartData).datasets[0].backgroundColor.slice(0, 5);
            var borderColor = JSON.parse(chartData).datasets[0].borderColor.slice(0, 5);
            var labels = JSON.parse(chartData).labels.slice(0, 5);
            // Scroll to the bottom of the chat conversation
            addAutoResize();
            scrollDown();
            // Clear the textarea after submitting
            form.reset();
            // Create a new canvas element for the new chart
            var canvasId = generateUniqueId();
            var canvasHTML = document.getElementById('bestSellers#');
            canvasHTML.id = generateUniqueId();
            canvasId = canvasHTML.id;

            // Update the new chart with data
            updateChart(canvasId);
        })
        .catch(error => console.error('Error:', error));
}
function updateChart(canvasId) {
    var canvas = document.getElementById(canvasId);
    var chartData = JSON.parse(canvas.dataset.chart);
    var data = chartData.datasets[0].data.slice(0, 5).map(function(element) {
        return parseFloat(element).toFixed(2);
    });
    var backgroundColor = chartData.datasets[0].backgroundColor.slice(0,5);
    var borderColor  = chartData.datasets[0].borderColor.slice(0,5);
    var labels = chartData.labels.slice(0,5);
    var Data = {
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
    var pieChart = new Chart(canvas, {
        type: 'doughnut',
        data: Data,
        options: {
            responsive: true, // Rendre le graphique responsive
            cutoutPercentage: 80, // Définir le pourcentage de découpe
            legend: {
                display: false, // Masquer la légende
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


function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevent default behavior (line break)
        submitForm(); // Submit the form asynchronously
    }
}


document.getElementById('sentenceForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally
    var form = event.target;
    var formData = new FormData(form);

    // Hide the presentation div
    var presentationDiv = document.getElementById('presentation');
    presentationDiv.classList.add('d-none');

    // Send a POST request to the Flask route with the form data
    fetch('/sentence', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {

            // Reset the textarea height to its initial value
            var textarea = document.getElementById("ocr-result");
            textarea.style.height = "50px";
            // Add the new user message to the chat conversation
            var userMessageElement = createUserMessageElement(formData.get('text'));
            var chatConversation = document.querySelector('.chat-conversation-content .os-content');
            chatConversation.appendChild(userMessageElement);

            // Create a new message element for Flask response
            var flaskResponseElement = createFlaskResponseElement(data);

            // Append the Flask response as a left message to the chat conversation
            chatConversation.appendChild(flaskResponseElement);
            var canvasElement = document.querySelector('.bestSellers'); // Sélectionnez le premier élément avec la classe 'bestSellers'
            chartData = canvasElement.getAttribute('data-chart');
            var data = JSON.parse(chartData).datasets[0].data.slice(0, 5);
            var backgroundColor = JSON.parse(chartData).datasets[0].backgroundColor.slice(0, 5);
            var borderColor = JSON.parse(chartData).datasets[0].borderColor.slice(0, 5);
            var labels = JSON.parse(chartData).labels.slice(0, 5);
            // Scroll to the bottom of the chat conversation
            reloadDashboardScript(data, backgroundColor, borderColor, labels);
            addAutoResize();
            scrollDown();
            // Clear the textarea after submitting
            form.reset();
        })
        .catch(error => console.error('Error:', error));
});

// Function to create a message element for user's message
function createUserMessageElement(message) {
    var userMessageElement = document.createElement('div');
    userMessageElement.classList.add('d-flex', 'justify-content-end', 'text-end', 'mb-1');
    var userMessageSubElement = document.createElement('div');
    userMessageSubElement.classList.add('w-100');
    var userMessageContainer = document.createElement('div');
    userMessageContainer.classList.add('d-flex', 'flex-column', 'align-items-end');
    // Add message content
    var userMessageContent = document.createElement('div');
    userMessageContent.classList.add('bg-primary', 'text-white', 'p-2', 'px-3', 'rounded-2', 'mw-80');
    var userMessageText = document.createTextNode(message);
    userMessageContent.appendChild(userMessageText);
    userMessageContainer.appendChild(userMessageContent);
    userMessageSubElement.appendChild(userMessageContainer);
    userMessageElement.appendChild(userMessageSubElement);
    return userMessageElement;
}

// Function to create a message element for Flask response
function createFlaskResponseElement(response) {
    var flaskResponseElement = document.createElement('div');
    flaskResponseElement.classList.add('d-flex', 'mb-1');
    var flaskAvatarElement = document.createElement('div');
    flaskAvatarElement.classList.add('flex-shrink-0', 'avatar', 'avatar-xs', 'me-2');
    var flaskAvatarImg = document.createElement('img');
    flaskAvatarImg.classList.add('avatar-img', 'rounded-circle');
    flaskAvatarImg.setAttribute('src', '../static/icons/logo_header_128x128.png');
    flaskAvatarElement.appendChild(flaskAvatarImg);
    var flaskMessageContent = document.createElement('div');
    flaskMessageContent.classList.add('flex-grow-1');
    flaskMessageContent.innerHTML = response;
    flaskResponseElement.appendChild(flaskAvatarElement);
    flaskResponseElement.appendChild(flaskMessageContent);
    return flaskResponseElement;
}
// Function to reload the dashboard.js file with chartData
function reloadDashboardScript(data, backgroundColor, borderColor, labels) {
    // Create a new script element
    var scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.onload = function () {
        initializeChart(data, backgroundColor, borderColor, labels);
    };
    // Add chartData to the script source as a query parameter
    scriptElement.src = `../static/js/dashboard_sentence.js?data=${data}&backgroundColor=${backgroundColor}&borderColor=${borderColor}&labels=${labels}`;

    // Append the script element to the body
    document.body.appendChild(scriptElement);
}
// START: 12 Auto resize textarea
function addAutoResize() {
    document.querySelectorAll('[data-autoresize]').forEach(function (element) {
        element.style.boxSizing = 'border-box';
        var offset = element.offsetHeight - element.clientHeight;
        element.addEventListener('input', function (event) {
            event.target.style.height = 'auto';
            event.target.style.height = event.target.scrollHeight + offset + 'px';
        });
        element.removeAttribute('data-autoresize');
    });
}
// SCROLLDOWN
function scrollDown() {
    var objDiv = document.getElementsByClassName("os-viewport os-viewport-native-scrollbars-invisible");
    var index = 0;
    while (index < objDiv.length) {
        objDiv[index].scrollTop = objDiv[index].scrollHeight;
        index++;
    }
}

// RESIZE TEXTAREA
function resizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}


