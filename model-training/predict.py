import joblib
from sentence_transformers import SentenceTransformer

import json
import numpy as np

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load trained ML model
clf = joblib.load("model.pkl")

# Load dataset
with open('data.json', 'r') as f:
    dataset = json.load(f)

def convert_to_text(quote):
    products_text = ", ".join([
        f"{p['name']} with {p['discount']}% discount"
        for p in quote['products']
    ])
    
    return f"Customer: {quote['customer']}, Products: {products_text}, Total: {quote['total']}"

# Prepare dataset embeddings (RAG)
dataset_texts = [convert_to_text(q) for q in dataset]
dataset_embeddings = model.encode(dataset_texts)

def find_similar_quotes(new_embedding, top_k=3):
    similarities = []

    for i, emb in enumerate(dataset_embeddings):
        sim = np.dot(new_embedding, emb) / (
            np.linalg.norm(new_embedding) * np.linalg.norm(emb)
        )
        similarities.append((sim, dataset[i]))

    similarities.sort(reverse=True, key=lambda x: x[0])
    return similarities[:top_k]

def format_similar_quotes(similar_quotes):
    context = ""
    for sim, q in similar_quotes:
        context += f"""
QuoteId: {q['quoteId']}
Customer: {q['customer']}
Product: {q['products']}
Discount: {q['products'][0]['discount']}%
Decision: {q['status']}
"""
    return context

import requests

def get_llm_explanation(quote, result, confidence, similar_context):
    prompt = f"""
You are a CPQ approval assistant.

A quote has been evaluated by a prediction model.

Quote Details:
Customer: {quote['customer']}
Products: {quote['products']}
Total: {quote['total']}

Model Prediction: {result}
Confidence: {confidence*100:.2f}%

Here are similar past quotes:
{similar_context}

Explain the decision using ONLY the similar quotes provided.

Rules:
- Be concise (max 4–5 lines)
- Focus on discount, product, and past decisions
- If similar quotes conflict, clearly state it is a boundary case
- Support the model prediction, do NOT avoid giving a conclusion
- Do NOT assume any external factors

End with a clear conclusion aligned with the model prediction.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]


# 🔹 New quote (input)
new_quote = {
    "customer": "AMD",
    "products": [
        {"name": "RYZEN", "discount": 25},
    ],
    "total": 150000
}

# Step 1: Convert to text
text = convert_to_text(new_quote)

# Step 2: Generate embedding
embedding = model.encode([text])

# RAG: find similar quotes
similar_quotes = find_similar_quotes(embedding[0])
similar_context = format_similar_quotes(similar_quotes)

# Step 3: Predict
prediction = clf.predict(embedding)[0]

# Step 4: Confidence
probs = clf.predict_proba(embedding)[0]
confidence = max(probs)

# Step 5: Convert result
result = "Approved" if prediction == 1 else "Rejected"

print("Quote Text:", text)
print(f"Prediction: {result} ({confidence*100:.2f}%)")
print("\nSimilar Quotes:")
for sim, q in similar_quotes:
    print(q["quoteId"], q["products"], q["status"])
explanation = get_llm_explanation(new_quote, result, confidence, similar_context)

print("\nExplanation:")
print(explanation)
