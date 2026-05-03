KNOWN_FACTS = [

# 🔴 LEADERS (HIGH IMPORTANCE)
{
    "keywords": ["donald trump", "president usa"],
    "label": "Real",
    "confidence": 0.95,
    "explanation": "Donald Trump is the current President of the United States (2025).",
    "source": "USA.gov",
    "last_updated": "2025"
},
{
    "keywords": ["narendra modi", "prime minister india"],
    "label": "Real",
    "confidence": 0.95,
    "explanation": "Narendra Modi is the Prime Minister of India.",
    "source": "PM India",
    "last_updated": "2024"
},
{
    "keywords": ["emmanuel macron", "president france"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "Emmanuel Macron is the President of France.",
    "source": "Government of France",
    "last_updated": "2024"
},
{
    "keywords": ["rishi sunak", "prime minister uk"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "Rishi Sunak served as Prime Minister of the UK.",
    "source": "UK Government",
    "last_updated": "2024"
},

# 🟠 INDIA STATES (LIMITED BUT IMPORTANT)
{
    "keywords": ["yogi adityanath", "chief minister uttar pradesh"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "Yogi Adityanath is the Chief Minister of Uttar Pradesh.",
    "source": "UP Government",
    "last_updated": "2024"
},
{
    "keywords": ["mamata banerjee", "chief minister west bengal"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "Mamata Banerjee is the Chief Minister of West Bengal.",
    "source": "WB Government",
    "last_updated": "2024"
},
{
    "keywords": ["arvind kejriwal", "chief minister delhi"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "Arvind Kejriwal is the Chief Minister of Delhi.",
    "source": "Delhi Government",
    "last_updated": "2024"
},

# 🔵 GLOBAL ORGANIZATIONS
{
    "keywords": ["who", "world health organization"],
    "label": "Real",
    "confidence": 0.95,
    "explanation": "WHO is a global public health agency under the United Nations.",
    "source": "WHO",
    "last_updated": "2025"
},
{
    "keywords": ["united nations founded"],
    "label": "Real",
    "confidence": 0.95,
    "explanation": "The United Nations was founded in 1945.",
    "source": "UN",
    "last_updated": "static"
},
{
    "keywords": ["nato purpose"],
    "label": "Real",
    "confidence": 0.9,
    "explanation": "NATO is a military alliance formed for collective defense.",
    "source": "NATO",
    "last_updated": "static"
},

# 🟢 SCIENCE FACTS (VERY SAFE)
{
    "keywords": ["earth revolves around sun"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "The Earth revolves around the Sun.",
    "source": "Science",
    "last_updated": "static"
},
{
    "keywords": ["water boils 100"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "Water boils at 100°C at standard pressure.",
    "source": "Science",
    "last_updated": "static"
},
{
    "keywords": ["gravity pulls objects"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "Gravity pulls objects toward the Earth.",
    "source": "Physics",
    "last_updated": "static"
},
{
    "keywords": ["humans need oxygen"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "Humans need oxygen to survive.",
    "source": "Biology",
    "last_updated": "static"
},
{
    "keywords": ["sun is star"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "The Sun is a star.",
    "source": "Astronomy",
    "last_updated": "static"
},

# 🔴 COMMON MISINFORMATION (VERY IMPORTANT)
{
    "keywords": ["covid vaccine microchip"],
    "label": "Fake",
    "confidence": 0.95,
    "explanation": "COVID vaccines do not contain microchips.",
    "source": "WHO",
    "last_updated": "2023"
},
{
    "keywords": ["5g causes coronavirus"],
    "label": "Fake",
    "confidence": 0.95,
    "explanation": "5G does not spread viruses.",
    "source": "WHO",
    "last_updated": "2023"
},
{
    "keywords": ["earth flat"],
    "label": "Fake",
    "confidence": 0.99,
    "explanation": "The Earth is not flat.",
    "source": "Science",
    "last_updated": "static"
},
{
    "keywords": ["vaccines cause autism"],
    "label": "Fake",
    "confidence": 0.99,
    "explanation": "Vaccines do not cause autism.",
    "source": "CDC",
    "last_updated": "static"
},
{
    "keywords": ["drinking bleach cures covid"],
    "label": "Fake",
    "confidence": 0.99,
    "explanation": "Drinking bleach is dangerous and does not cure COVID.",
    "source": "WHO",
    "last_updated": "2023"
},

# 🟡 BASIC GENERAL KNOWLEDGE
{
    "keywords": ["india capital"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "New Delhi is the capital of India.",
    "source": "Government of India",
    "last_updated": "static"
},
{
    "keywords": ["usa capital"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "Washington, D.C. is the capital of the USA.",
    "source": "USA.gov",
    "last_updated": "static"
},
{
    "keywords": ["largest ocean"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "The Pacific Ocean is the largest ocean.",
    "source": "Geography",
    "last_updated": "static"
},
{
    "keywords": ["mount everest highest"],
    "label": "Real",
    "confidence": 0.99,
    "explanation": "Mount Everest is the highest mountain.",
    "source": "Geography",
    "last_updated": "static"
}

]

def normalize_text(text: str) -> str:
    text = text.lower()
    for ch in [",", ".", "?", "!", "-", "_", ":", ";"]:
        text = text.replace(ch, " ")
    stopwords = ["is", "the", "of", "a", "an", "current"]
    words = [w for w in text.split() if w not in stopwords]
    return " ".join(words)


def check_known_facts(text: str):
    normalized_input = normalize_text(text)

    for fact in KNOWN_FACTS:
        normalized_keywords = [normalize_text(keyword) for keyword in fact["keywords"]]

        if all(keyword in normalized_input for keyword in normalized_keywords):
            return {
                "label": fact["label"],
                "confidence": fact["confidence"],
                "model": "known_facts_layer",
                "explanation": fact["explanation"],
                "source": fact["source"],
                "last_updated": fact["last_updated"],
                "override": True,
            }

    return None