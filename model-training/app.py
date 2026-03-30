from fastapi import FastAPI
import joblib
from sentence_transformers import SentenceTransformer
import json
import numpy as np
import requests

app = FastAPI()

# Load models (only once)
model = SentenceTransformer('all-MiniLM-L6-v2')
clf = joblib.load("model.pkl")

# Load dataset
with open('data.json', 'r') as f:
    dataset = json.load(f)

# ----------- Helpers -----------

def convert_to_text(quote):
    products_text = ", ".join([
        f"{p['name']} with {p['discount']}% discount"
        for p in quote['products']
    ])
    return f"Customer: {quote['customer']}, Products: {products_text}, Total: {quote['total']}"

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

def get_llm_explanation(quote, result, confidence, similar_context):
    prompt = f"""
You are a CPQ approval assistant.

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
- Use only product, discount, and past decisions
- Do NOT mention or assume any other factors
- If decisions conflict, clearly state it is a boundary case
- If confidence is low, mention uncertainty
- Support the model prediction in the conclusion
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    try:
        data = response.json()
        return data.get("response", "No explanation generated")
    except Exception as e:
        return f"LLM Error: {str(e)}"

# ----------- API -----------

@app.post("/predict")
def predict(quote: dict):
    # Step 1: Text
    text = convert_to_text(quote)

    # Step 2: Embedding
    embedding = model.encode([text])

    # Step 3: RAG
    similar_quotes = find_similar_quotes(embedding[0])
    similar_context = format_similar_quotes(similar_quotes)

    # Step 4: Prediction
    prediction = clf.predict(embedding)[0]
    probs = clf.predict_proba(embedding)[0]
    confidence = max(probs)

    result = "Approved" if prediction == 1 else "Rejected"

    # Step 5: Explanation
    explanation = get_llm_explanation(
        quote,
        result,
        confidence,
        similar_context
    )

    return {
        "prediction": result,
        "confidence": round(confidence, 4),
        "explanation": explanation
    }