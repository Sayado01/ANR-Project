@app.route('/sentence' , methods = ['GET' , 'POST'])
def sentence():
    if request.method == 'POST':
        # Get the form data
        text = request.form['text']
        # Replace these sample values with your actual data
        classes = ["Computer_Complexity", "Artificial_Intelligence", "Software", "Computation"]
        
        colors = ["danger" , "warning" , "info" , "success" ]
        categories = dict(zip(classes,colors))
        dominant_class = "Artificial_Intelligence"  # Example dominant class
        # Render the template with the data
        return render_template('response_sentence.html', text=text, categories=categories, dominant_class=dominant_class)

    # Render the initial form page
    return render_template('sentence.html')