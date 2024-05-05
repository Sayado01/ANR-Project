from flask import Flask, render_template,request, redirect,url_for, jsonify
from PyPDF2 import PdfReader
from helper_functions import predict_class
import fitz  # PyMuPDF
import os, shutil
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import fitz  # PyMuPDF
import pickle

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/upload", methods=['POST'])
def process_pdf():
    # Récupérer le fichier PDF de la requête
    file = request.files['file']
    filename = file.filename

    # Enregistrer le fichier dans le répertoire de téléchargement
    filepath = app.config['UPLOAD_FOLDER'] + "/" + filename
    file.save(filepath)

    # Ouvrir le fichier PDF
    pdf_document = fitz.open(filepath)

    # Initialiser une variable pour stocker le texte extrait
    extracted_text = ""

    # Boucler à travers chaque page pour extraire le texte
    for page_num in range(len(pdf_document)):
        # Récupérer l'objet de la page
        page = pdf_document.load_page(page_num)

        # Extraire le texte de la page
        page_text = page.get_text()

        # Ajouter le texte de la page à la variable d'extraction
        extracted_text += f"\nPage {page_num + 1}:\n{page_text}"

    # Fermer le fichier PDF
    pdf_document.close()

    # Charger le tokenizer
    tokenizer = BertTokenizer.from_pretrained(r"C:\Users\user\Desktop\3A\PFE\France\Stage PFE\models1-20240411T071206Z-001\models1\bert_tokenizer")
    # Charger le modèle
    model = BertForSequenceClassification.from_pretrained(r"C:\Users\user\Desktop\3A\PFE\France\Stage PFE\models1-20240411T071206Z-001\models1\bert_model")
    
    # Charger les labels
    with open(r"C:\Users\user\Desktop\3A\PFE\France\Stage PFE\models1-20240411T071206Z-001\models1\labels.pkl", 'rb') as f:
        labels = pickle.load(f)

    # Prétraiter le texte extrait
    inputs = tokenizer(extracted_text, return_tensors="pt", padding=True, truncation=True)

    # Passer l'entrée à travers le modèle pour obtenir les prédictions
    with torch.no_grad():
        outputs = model(**inputs)

    # Obtenir les prédictions de classe
    predicted_class_id = torch.argmax(outputs.logits, dim=1).item()
    predicted_class = labels[predicted_class_id]

    # Retourner la prédiction de classe ainsi que le texte extrait
    return render_template("home.html", extracted_text=extracted_text, predicted_class=predicted_class)


@app.route('/pdf')
def pdf():
    predict_class = ""
    class_probabilities = dict()
    chart_data = dict()
    return render_template('pdf.html', class_probabilities= class_probabilities, predicted_class=predict_class,chart_data = chart_data)

@app.route('/pdf/upload' , methods = ['POST'])
def treatment():
    if request.method == 'POST' :
        # Récupérer le fichier PDF de la requête
        file = request.files['file']
        filename = file.filename

        # Enregistrer le fichier dans le répertoire de téléchargement
        filepath = app.config['UPLOAD_FOLDER'] + "/" + filename
        file.save(filepath)

        # Ouvrir le fichier PDF
        pdf_document = fitz.open(filepath)

        # Initialiser une variable pour stocker le texte extrait
        extracted_text = ""

        # Boucler à travers chaque page pour extraire le texte
        for page_num in range(len(pdf_document)):
            # Récupérer l'objet de la page
            page = pdf_document.load_page(page_num)

            # Extraire le texte de la page
            page_text = page.get_text()

            # Ajouter le texte de la page à la variable d'extraction
            extracted_text += f"\nPage {page_num + 1}:\n{page_text}"

        # Fermer le fichier PDF
        pdf_document.close()
        # Prepare data for the chart
        predicted_class , class_probabilities = predict_class([extracted_text])
        chart_data = {
            'datasets': [{
                'data': list(class_probabilities.values()),
                'backgroundColor': [color[2] for color in class_probabilities.keys()],
                'borderColor': [color[2] for color in class_probabilities.keys()]
            }],
            'labels': [label[0] for label in class_probabilities.keys()]
        }
        print(predict_class)
        print(chart_data)
         # clear the uploads folder
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))
        return render_template('pdf.html',extracted_text = extracted_text, class_probabilities=class_probabilities, predicted_class=predicted_class, chart_data = chart_data)
    return render_template('pdf.html')

@app.route('/sentence' , methods = ['GET' , 'POST'])
def sentence():
    if request.method == 'POST':
        # Get the form data
        text = [request.form['text']]
        predicted_class , class_probabilities = predict_class(text)
        # Prepare data for the chart
        chart_data = {
            'datasets': [{
                'data': list(class_probabilities.values()),
                'backgroundColor': [color[2] for color in class_probabilities.keys()],
                'borderColor': [color[2] for color in class_probabilities.keys()]
            }],
            'labels': [label[0] for label in class_probabilities.keys()]
        }
        print(chart_data)
         # clear the uploads folder
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))
        return render_template('response_sentence.html', text=text, class_probabilities=class_probabilities, predicted_class=predicted_class,chart_data = chart_data)

    # Render the initial form page
    return render_template('sentence.html')


if __name__ == '__main__':
    app.run(debug=True)