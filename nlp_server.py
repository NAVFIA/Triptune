import re
import json
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Make sure NLTK dependencies are ready
for dep in ['punkt', 'stopwords', 'wordnet', 'omw-1.4', 'punkt_tab']:
    try:
        nltk.download(dep, quiet=True)
    except Exception:
        pass

from nltk.corpus import stopwords

app = FastAPI(title="TripTune NLP Chatbot Service")

# 1. Training Dataset (from smart-travel-assistant.py)
data = {
    'text': [
        'I want to book a hotel in Cairo', 'What are the best hotels in Dubai',
        'I am looking for cheap flight tickets to Riyadh', 'I want to travel to Sharm El Sheikh',
        'How much does a flight ticket to Istanbul cost', 'I need a visa to enter Saudi Arabia',
        'What are the best restaurants in Dubai', 'I need to rent a car in Dubai',
        'What are the tourist attractions in Jordan', 'I want to book a trip to Bahrain',
        'How many days do I need to visit UAE', 'What is the best time to visit Oman',
        'I need a hotel near the airport', 'What is the best transportation in Qatar',
        'I am looking for tour guides in Morocco', 'I want to know the weather in Lebanon',
        'Are there any discounts on flight tickets', 'I need a hotel with a pool in Turkey',
        'What are the visa requirements', 'I am looking for special offers for families',
        'I want to visit historical sites in Egypt', 'How much does accommodation in a five-star hotel cost',
        'How can I get a tour guide', 'I am looking for child-friendly hotels',
        'What are the transportation options from the airport to the city', 'I need to rent a yacht in Dubai',
        'What are the best places for photography', 'I want to book a round-trip ticket',
        'How many days are enough to visit Dubai', 'What are the best beaches in Saudi Arabia',
        'I am looking for cruises in the Gulf', 'What are the traditional dishes in UAE',
        'I want to know museum visiting hours', 'How much does a tour in Egypt cost',
        'What are the best shopping areas in Dubai', 'I need a hotel with a sea view',
        'What activities are available at night', 'I am looking for honeymoon offers',
        'What cultural festivals are happening this month', 'I want to book a room for two people'
    ],
    'intent': [
        'hotel_booking', 'hotel_inquiry', 'flight_booking', 'trip_planning',
        'flight_inquiry', 'visa_inquiry', 'restaurant_inquiry', 'car_rental',
        'attraction_inquiry', 'trip_booking', 'trip_duration', 'best_time_travel',
        'hotel_nearby', 'transport_inquiry', 'tour_inquiry', 'weather_inquiry',
        'flight_deals', 'hotel_amenity', 'visa_requirements', 'special_offers',
        'attraction_inquiry', 'cost_inquiry', 'guide_inquiry', 'family_hotel',
        'airport_transport', 'special_rental', 'photo_spots', 'round_trip',
        'trip_duration', 'attraction_inquiry', 'cruise_inquiry', 'food_inquiry',
        'attraction_hours', 'cost_inquiry', 'shopping_inquiry', 'hotel_amenity',
        'activities_inquiry', 'special_offers', 'events_inquiry', 'hotel_booking'
    ]
}

# 2. Text Preprocessor
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text)
    processed = [lemmatizer.lemmatize(t) for t in tokens if t not in stop_words]
    return ' '.join(processed)

processed_texts = [preprocess_text(t) for t in data['text']]

# 3. Model Pipeline Training
nlp_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB())
])
nlp_pipeline.fit(processed_texts, data['intent'])

# 4. SpaCy Setup with Fallback
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    has_spacy = True
except Exception:
    has_spacy = False

def extract_entities(text: str) -> dict:
    entities = {
        'location': [],
        'date': [],
        'budget': [],
        'people': [],
        'amenities': []
    }
    
    if has_spacy:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ['GPE', 'LOC']:
                entities['location'].append(ent.text)
            elif ent.label_ == 'DATE':
                entities['date'].append(ent.text)
            elif ent.label_ in ['CARDINAL', 'MONEY']:
                if any(word in text.lower() for word in ['dollar', 'price', 'cost', '$', 'usd']):
                    entities['budget'].append(ent.text)
                elif any(word in text.lower() for word in ['people', 'person', 'guests', 'adults', 'children']):
                    entities['people'].append(ent.text)
    
    # Fallback/Supplemental Rule-Based Parsers
    # 1. Location matches (common world destinations)
    cities = [
        "cairo", "dubai", "riyadh", "sharm el sheikh", "istanbul", "saudi arabia", 
        "jordan", "bahrain", "uae", "oman", "qatar", "morocco", "lebanon", "turkey", 
        "egypt", "morocco", "paris", "london", "tokyo", "sydney", "new york", "rome"
    ]
    text_lower = text.lower()
    for city in cities:
        if city in text_lower and not any(city in loc.lower() for loc in entities['location']):
            entities['location'].append(city.title())
            
    # 2. Amenities parsing
    amenity_keywords = {
        'pool': ['pool', 'swimming'],
        'wifi': ['wifi', 'internet'],
        'breakfast': ['breakfast'],
        'gym': ['gym', 'fitness'],
        'spa': ['spa'],
        'sea_view': ['sea view', 'ocean view'],
        'airport': ['airport', 'near airport']
    }
    for amenity, keywords in amenity_keywords.items():
        if any(kw in text_lower for kw in keywords):
            entities['amenities'].append(amenity)
            
    # 3. People patterns
    people_match = re.search(r'(\d+)\s*(people|persons|guests|adults|children)', text_lower)
    if people_match:
        entities['people'].append(f"{people_match.group(1)} {people_match.group(2)}")
    elif 'family' in text_lower:
        entities['people'].append("family")
        
    # 4. Budget patterns
    budget_match = re.search(r'(?:usd|\$)\s*(\d+)|(\d+)\s*(dollars|usd|usd/night)', text_lower)
    if budget_match:
        val = budget_match.group(1) or budget_match.group(2)
        entities['budget'].append(f"${val}")
    elif any(kw in text_lower for kw in ['cheap', 'affordable', 'budget']):
        entities['budget'].append("cheap")
    elif any(kw in text_lower for kw in ['luxury', 'five-star', 'expensive']):
        entities['budget'].append("luxury")

    return entities

# 5. Intent Response Templates
response_templates = {
    'hotel_booking': "I'll help you book a hotel in {location} for {people} with a budget of {budget}. I'll make sure it has {amenities}.",
    'hotel_inquiry': "The best hotels in {location} are: 1. Luxury Palace ($$$) 2. Skyline Suites ($$) 3. Central Inn ($). Would you like me to recommend one?",
    'flight_booking': "I'll search for flight tickets to {location}. When would you like to depart?",
    'trip_planning': "I'll plan a customized trip to {location}. What activities are you interested in?",
    'flight_inquiry': "Flights to {location} typically cost between $400 and $1200 depending on the season.",
    'visa_inquiry': "To travel to {location}, you'll need: 1. Passport 2. Visa application 3. Passport photos. Would you like a list of consulate locations?",
    'restaurant_inquiry': "Top dining spots in {location} include local food tours, waterfront seafood hubs, and downtown bistros.",
    'car_rental': "Car rentals in {location} start from $35/day. Do you need a manual or automatic vehicle?",
    'attraction_inquiry': "Must-see highlights in {location} include historical monuments, scenic overlooks, and local museums.",
    'trip_booking': "Let's book a trip to {location} for {people}. What starting dates are you looking at?",
    'trip_duration': "The recommended duration to explore {location} is 5 to 7 days to cover the top attractions.",
    'best_time_travel': "The best time to visit {location} is during the shoulder seasons (Spring/Autumn) for mild weather.",
    'hotel_nearby': "Convenient hotels near the airport in {location} include the Transit Lodge and Gateway Suites.",
    'transport_inquiry': "Getting around in {location} is easy using public metro lines, local taxis, and ride-shares.",
    'tour_inquiry': "Exciting tours in {location} cover city landmark walks, local cooking classes, and nature excursions.",
    'weather_inquiry': "The forecast for {location} calls for pleasant, travel-friendly weather conditions.",
    'flight_deals': "Current deals to {location} include early-bird flight discounts and package flight+hotel savings.",
    'hotel_amenity': "Great hotels in {location} offering {amenities} include the Coastal Inn and Aqua Resort.",
    'visa_requirements': "Visa rules for {location} require a passport valid for at least 6 months and proof of roundtrip flights.",
    'special_offers': "Special deals for a {people} trip to {location} include group package offers and activity vouchers."
}

def generate_response(intent: str, entities: dict) -> str:
    response = response_templates.get(intent, "I'm here to assist you with flight inquiries, hotel bookings, or itinerary planning. Could you share more details?")
    
    # Fill placeholders
    for etype, vals in entities.items():
        placeholder = "{" + etype + "}"
        if placeholder in response:
            if vals:
                if etype == 'amenities' and len(vals) > 1:
                    val_str = ', '.join(vals[:-1]) + ' and ' + vals[-1]
                else:
                    val_str = vals[0]
                response = response.replace(placeholder, val_str)
            else:
                # Default values if entity is empty
                defaults = {
                    'location': 'your destination',
                    'people': 'your group',
                    'budget': 'medium level',
                    'amenities': 'amenities'
                }
                response = response.replace(placeholder, defaults.get(etype, 'details'))
                
    return response

# 6. API Schemas & Routes
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    intent: str
    entities: dict
    response: str

@app.post("/api/nlp/chat", response_model=ChatResponse)
async def chat_nlp(payload: ChatRequest):
    query = payload.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query message cannot be empty")
        
    try:
        # Predict Intent
        processed = preprocess_text(query)
        # Handle case where preprocessed text is empty (e.g. only numbers or symbols)
        if not processed:
            processed = query.lower()
        intent = nlp_pipeline.predict([processed])[0]
        
        # Extract Entities
        entities = extract_entities(query)
        
        # Generate Template Response
        response = generate_response(intent, entities)
        
        return ChatResponse(
            intent=intent,
            entities=entities,
            response=response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "running", "service": "TripTune NLP Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
