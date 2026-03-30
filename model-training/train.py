import json
from sentence_transformers import SentenceTransformer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load data
with open('data.json', 'r') as f:
    data = json.load(f)

texts = []
labels = []

def convert_to_text(quote):
    products_text = ", ".join([
        f"{p['name']} with {p['discount']}% discount"
        for p in quote['products']
    ])
    
    return f"Customer: {quote['customer']}, Products: {products_text}, Total: {quote['total']}"

# Prepare dataset
for quote in data:
    text = convert_to_text(quote)
    texts.append(text)
    
    label = 1 if quote['status'] == "Approved" else 0
    labels.append(label)

# Generate embeddings
embeddings = model.encode(texts)

# Train on full data (for PoC)
clf = LogisticRegression()
clf.fit(embeddings, labels)

import joblib

# Save model
joblib.dump(clf, "model.pkl")
print("Model saved!")

# Predict on same data
y_pred = clf.predict(embeddings)

accuracy = accuracy_score(labels, y_pred)

print("Accuracy:", accuracy)


# Test with new quote
new_quote = {
    "customer": "Intel",
    "products": [
        {"name": "I9", "discount": 30}
    ],
    "total": 190000
}

new_text = convert_to_text(new_quote)
new_embedding = model.encode([new_text])

# Get probabilities
probs = clf.predict_proba(new_embedding)[0]

confidence = max(probs)
prediction = clf.predict(new_embedding)[0]

result = "Approved" if prediction == 1 else "Rejected"

print(f"Prediction: {result} ({confidence*100:.2f}%)")