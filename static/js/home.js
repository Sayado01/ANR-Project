const dropArea = document.querySelector(".drag-image");
const dragText = dropArea.querySelector("h6");
const button = dropArea.querySelector("button");
const input = dropArea.querySelector("input");
const form = document.querySelector("form");
const ocrResult = document.getElementById("ocr-result");
const categoryResult = document.getElementById("category-result")
const reset = document.getElementById("reset");
const imagePreview = dropArea.querySelector("#image-preview");
let file;

button.onclick = () => {
  input.click();
};

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



form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!file) {
      alert("Please select a file!");
      return;
  }
  const formData = new FormData();
  formData.append("file", file);
  fetch("/upload", {
      method: "POST",
      body: formData,
  })
      .then((response) => response.text())
      .then((html) => {
          // Afficher à nouveau le formulaire de téléchargement de fichier
          const responseDOM = new DOMParser().parseFromString(html, "text/html");
          const resultTextArea = responseDOM.getElementById("ocr-result");
          const categoryTextArea = responseDOM.getElementById("category-result"); // Récupération de la zone de texte category-result
          if (resultTextArea && categoryTextArea) {
              ocrResult.value = resultTextArea.value;
              categoryResult.value = categoryTextArea.value; // Affichage de la prédiction de classe dans la zone de texte category-result
          } else {
              console.error("Error: OCR result textarea not found in response");
          }
      })
      .catch((error) => console.error(error));
});


// Define the original HTML structure of the drop area
const originalDropAreaHTML = `
  <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
  <h6>Drag and Drop File Here</h6>
  <span>OR</span>
  <button id="browse-btn">Browse File</button>
  <input id="file-input" type="file" name="image" accept=".pdf" hidden>
`;

function deleteCurrentFile() {
  file = null;
  // Restore the original HTML structure
  dropArea.innerHTML = originalDropAreaHTML;

  // Reattach event listeners to the file input and browse button
  const button = dropArea.querySelector("#browse-btn");
  const input = dropArea.querySelector("#file-input");

  button.onclick = () => {
    input.click();
  };

  input.addEventListener("change", function () {
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
