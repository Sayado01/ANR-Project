const dropArea = document.getElementById("dropArea");
const dragText = dropArea.querySelector("h6");
const input = dropArea.querySelector("input");
const form = document.querySelector("form");
const ocrResult = document.getElementById("ocr-result");
const categoryResult = document.getElementById("category-result")
const reset = document.getElementById("reset");
const imagePreview = dropArea.querySelector("#image-preview");
const currentClassProbabilitiesList = document.getElementById("class-probabilities");
const currentPredictedClass = document.getElementById('predicted-class')
const staticDiv = document.getElementById("static");
const dynamicDiv = document.getElementById("dynamic");
var chartData;
let file;



// Event listener for clicking the dropArea to upload a file
dropArea.addEventListener("click", () => {
  // Trigger click event on the file input when the dropArea is clicked
  const input = document.getElementById("file-input");
  input.click();
});

// Update the event listener for input change to handle file selection
const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", function () {
  file = this.files[0];
  dropArea.classList.add("active");
  viewFile();
});


input.addEventListener("change", function () {
  file = this.files[0];
  dropArea.classList.add("active");
  viewFile();
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("active");
  dragText.textContent = "Release to Upload File";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  dragText.textContent = "Drag & Drop or Click to Upload File";
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  file = event.dataTransfer.files[0];
  viewFile();
});

// Définir la fonction initializeChart en premier
function initializeChart(data, backgroundColor, borderColor, labels) {
  // Créer une nouvelle instance Chart.js pour chaque élément canvas avec la classe 'bestSellers'
  data = data.map(function (element) {
    return parseFloat(element).toFixed(2);
  });
  document.querySelectorAll('.bestSellers').forEach(function (canvas) {
    // Initialiser le graphique
    new Chart(canvas, {
      type: 'doughnut', // Définir le type de graphique sur doughnut
      data: {
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
        }],
        labels: labels
      },
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
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!file) {
    alert("Please select a file!");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  fetch("/pdf/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((html) => {
      const responseDOM = new DOMParser().parseFromString(html, "text/html");
      const resultTextArea = responseDOM.getElementById("ocr-result");
      ocrResult.value = resultTextArea.value;
      const classProbabilitiesList = responseDOM.getElementById("class-probabilities");
      currentClassProbabilitiesList.innerHTML = classProbabilitiesList.innerHTML;
      const PredictedClass = responseDOM.getElementById("predicted-class")
      currentPredictedClass.innerHTML = PredictedClass.innerHTML;
      dynamicDiv.classList.remove('d-none');
      staticDiv.classList.add('d-none');

      var canvasElement = responseDOM.querySelector('.bestSellers'); // Sélectionnez le premier élément avec la classe 'bestSellers'
      chartData = canvasElement.getAttribute('data-chart');
      var data = JSON.parse(chartData).datasets[0].data.slice(0, 5);
      var backgroundColor = JSON.parse(chartData).datasets[0].backgroundColor.slice(0, 5);
      var borderColor = JSON.parse(chartData).datasets[0].borderColor.slice(0, 5);
      var labels = JSON.parse(chartData).labels.slice(0, 5);

      // Créer de nouveaux graphiques
      loadDashboardScript(data, backgroundColor, borderColor, labels);
    })
    .catch((error) => console.error(error));
});

function destroyPreviousCharts() {
  // Trouver tous les éléments canvas avec la classe 'bestSellers'
  document.querySelectorAll('.bestSellers').forEach(function (canvas) {
    // Récupérer l'instance du graphique
    var chartInstance = Chart.getChart(canvas);
    // Si une instance existe, détruire le graphique
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
}

function loadDashboardScript(data, backgroundColor, borderColor, labels) { // Correction ici
  var scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.src = '../static/js/dashboard_pdf.js';
  // Attendez que le script soit chargé avant d'appeler la fonction d'initialisation
  scriptElement.onload = function () {
    initializeChart(data, backgroundColor, borderColor, labels);
  };
  document.body.appendChild(scriptElement);
}


// Define the original HTML structure of the drop area
const originalDropAreaHTML = `
  <h6 class="text-white-50">Drag and Drop File Here</h6>
  <span class="text-white-50">OR</span>
  <h6 class="text-white-50">Click here</h6>
  <input id="file-input" type="file" name="image" accept=".pdf" hidden>
`;

function deleteCurrentFile() {
  // Recharger le fichier index.js après l'envoi du formulaire
  window.location.reload();
  file = null;

  // Restore the original HTML structure
  dropArea.innerHTML = originalDropAreaHTML;

  // Remove the 'active' class to reset the styling
  dropArea.classList.remove("active");

  // Update the event listener for input change to handle file selection
  const fileInput = document.getElementById("file-input");

  fileInput.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    viewFile();
  });
}


function viewFile() {
  let fileType = file.type;
  let validExtensions = ["application/pdf"];
  if (validExtensions.includes(fileType)) {
    let fileURL = URL.createObjectURL(file);
    let pdfTag = `<iframe src="${fileURL}" style="width:100%;height:100%;"></iframe>`;
    dropArea.innerHTML = pdfTag;
  } else {
    alert("This is not a PDF File!");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop or Click to Upload File";
  }
}

const copyBtn = document.getElementById("copy-btn");

copyBtn.addEventListener("click", () => {
  ocrResult.select();
  document.execCommand("copy");
});

function createResponseElement(response) {
  var pdfResponseElement = document.createElement('ul');
  pdfResponseElement.classList.add('graph-legend-rectangle');
  pdfResponseElement.innerHTML = response;
  return pdfResponseElement;
}

// Modifiez la fonction reloadDashboardScript pour accepter les données supplémentaires
function reloadDashboardScript(data, backgroundColor, borderColor, labels) {
  var scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.src = `../static/js/dashboard_pdf.js?data=${encodeURIComponent(JSON.stringify(data))}&backgroundColor=${encodeURIComponent(JSON.stringify(backgroundColor))}&borderColor=${encodeURIComponent(JSON.stringify(borderColor))}&labels=${encodeURIComponent(JSON.stringify(labels))}`;
  document.body.appendChild(scriptElement);
}
