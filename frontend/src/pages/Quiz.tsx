import { useState, useEffect } from "react";

const allQuestions = [
  { text: "Vitamin C can reduce the duration of common cold symptoms", answer: "Real" },
  { text: "Drinking warm water with lemon every morning detoxifies your body completely", answer: "Fake" },
  { text: "India recently became the most populous country in the world", answer: "Real" },
  { text: "Mobile phones can explode if used while charging", answer: "Fake" },
  { text: "Some vaccines can cause mild fever as a side effect", answer: "Real" },
  { text: "Eating carrots dramatically improves night vision", answer: "Fake" },
  { text: "Artificial Intelligence is used in fraud detection systems", answer: "Real" },
  { text: "Reading in dim light permanently damages your eyesight", answer: "Fake" },
  { text: "Space agencies use robots to explore Mars", answer: "Real" },
  { text: "Humans use only 10% of their brain", answer: "Fake" },

  { text: "Exercise can help reduce symptoms of depression", answer: "Real" },
  { text: "Cracking your knuckles causes arthritis", answer: "Fake" },
  { text: "Bananas are a good source of potassium", answer: "Real" },
  { text: "Drinking coffee stunts growth in teenagers", answer: "Fake" },
  { text: "The internet was originally developed for military use", answer: "Real" },
  { text: "Goldfish have a memory span of only 3 seconds", answer: "Fake" },
  { text: "Climate change is linked to rising global temperatures", answer: "Real" },
  { text: "Using phones in the dark causes blindness", answer: "Fake" },
  { text: "Electric vehicles produce fewer emissions than petrol cars", answer: "Real" },
  { text: "Eating late at night always leads to weight gain", answer: "Fake" },

  { text: "Sleep is essential for memory and learning", answer: "Real" },
  { text: "Hair and nails continue to grow after death", answer: "Fake" },
  { text: "The human body needs water to function properly", answer: "Real" },
  { text: "Listening to music while studying always reduces focus", answer: "Fake" },
  { text: "Cybersecurity protects systems from digital attacks", answer: "Real" },
  { text: "All bacteria are harmful to humans", answer: "Fake" },
  { text: "The Earth revolves around the Sun", answer: "Real" },
  { text: "Sugar causes hyperactivity in children", answer: "Fake" },
  { text: "Cloud computing allows remote data storage", answer: "Real" },
  { text: "You must drink exactly 8 glasses of water daily", answer: "Fake" },

  { text: "Regular exercise improves heart health", answer: "Real" },
  { text: "Sitting too close to TV damages eyesight permanently", answer: "Fake" },
  { text: "The brain consumes a lot of energy compared to other organs", answer: "Real" },
  { text: "Eating spicy food causes ulcers", answer: "Fake" },
  { text: "Blockchain is used in cryptocurrencies", answer: "Real" },
  { text: "Shaving hair makes it grow back thicker", answer: "Fake" },
  { text: "The internet can spread misinformation quickly", answer: "Real" },
  { text: "Cold weather directly causes colds", answer: "Fake" },
  { text: "Solar energy is renewable", answer: "Real" },
  { text: "Using headphones causes instant hearing loss", answer: "Fake" },

  { text: "Machine learning improves with more data", answer: "Real" },
  { text: "Eating chocolate causes acne", answer: "Fake" },
  { text: "The heart pumps blood throughout the body", answer: "Real" },
  { text: "You should not wake a sleepwalker", answer: "Fake" },
  { text: "5G networks are faster than 4G", answer: "Real" },
  { text: "Microwaving food destroys all nutrients", answer: "Fake" },
  { text: "The liver helps detoxify chemicals in the body", answer: "Real" },
  { text: "You can sweat out toxins completely", answer: "Fake" },
  { text: "AI is used in recommendation systems like Netflix", answer: "Real" },
  { text: "Humans can multitask efficiently", answer: "Fake" },

  { text: "Vaccines help build immunity", answer: "Real" },
  { text: "You lose most body heat through your head", answer: "Fake" },
  { text: "Renewable energy includes solar and wind", answer: "Real" },
  { text: "Eating fats always leads to obesity", answer: "Fake" },
  { text: "Encryption secures online communication", answer: "Real" },
  { text: "You should wait 24 hours before reporting missing person", answer: "Fake" },
  { text: "The lungs help in oxygen exchange", answer: "Real" },
  { text: "Natural means always safe", answer: "Fake" },
  { text: "Data analytics helps businesses make decisions", answer: "Real" },
  { text: "Brain cells do not regenerate", answer: "Fake" },

  { text: "Regular handwashing prevents infections", answer: "Real" },
  { text: "Eating carrots alone improves eyesight drastically", answer: "Fake" },
  { text: "The CPU is the brain of the computer", answer: "Real" },
  { text: "You can charge phone faster by freezing it", answer: "Fake" },
  { text: "Cyberbullying is a serious online issue", answer: "Real" },
  { text: "More megapixels always mean better camera quality", answer: "Fake" },
  { text: "Search engines use algorithms to rank pages", answer: "Real" },
  { text: "WiFi signals are harmful to health", answer: "Fake" },
  { text: "Electricity can be generated using wind turbines", answer: "Real" },
  { text: "All viruses are deadly", answer: "Fake" },

  { text: "Programming is used to build software applications", answer: "Real" },
  { text: "Typing fast damages your fingers permanently", answer: "Fake" },
  { text: "Data privacy is important in digital platforms", answer: "Real" },
  { text: "More RAM always makes a computer faster in all cases", answer: "Fake" },
  { text: "The internet connects millions of devices globally", answer: "Real" },
  { text: "Airplane mode speeds up phone charging significantly", answer: "Real" },
  { text: "You can get hacked just by opening any image file", answer: "Fake" },
  { text: "Streaming videos consumes internet data", answer: "Real" },
  { text: "Closing background apps always saves battery", answer: "Fake" },
  { text: "Browsers store cookies for user sessions", answer: "Real" }
];

function getRandomQuestions() {
  const selected = [];
  const usedIndexes = new Set();

  while (selected.length < 10 && usedIndexes.size < allQuestions.length) {
    const randomIndex = Math.floor(Math.random() * allQuestions.length);

    if (!usedIndexes.has(randomIndex)) {
      selected.push(allQuestions[randomIndex]);
      usedIndexes.add(randomIndex);
    }
  }

  return selected;
}

export function Quiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setQuestions(getRandomQuestions());
  }, []);

  const handleAnswer = (choice: string) => {
    setSelected(choice);

    setTimeout(() => {
      if (choice === questions[current].answer) {
        setScore((prev) => prev + 1);
      }

      const next = current + 1;

      if (next < questions.length) {
        setCurrent(next);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 700);
  };

 const restartQuiz = () => {
  setQuestions(getRandomQuestions()); // THIS LINE IS IMPORTANT
  setCurrent(0);
  setScore(0);
  setShowResult(false);
  setSelected(null);
};

  if (questions.length === 0) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-full max-w-xl">

        <h2 className="text-2xl font-bold mb-4">🎯 Fake News Quiz</h2>

        {showResult ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Your Score: {score}/10
            </h3>

            <p className="mb-4">
              {score >= 8
                ? "🔥 Excellent! You're a Fact-Checker Pro!"
                : score >= 5
                ? "👍 Good job! Keep improving!"
                : "😅 Try again to improve your skills!"}
            </p>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={restartQuiz}
            >
              Play Again 🔁
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Question {current + 1} of 10
            </p>

            <p className="mb-6 text-lg font-medium">
              {questions[current].text}
            </p>

            <div className="flex justify-center gap-4">
              <button
                className={`px-5 py-2 rounded-lg text-white ${
                  selected === "Real"
                    ? "bg-green-700"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={() => handleAnswer("Real")}
              >
                Real ✅
              </button>

              <button
                className={`px-5 py-2 rounded-lg text-white ${
                  selected === "Fake"
                    ? "bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={() => handleAnswer("Fake")}
              >
                Fake ❌
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}