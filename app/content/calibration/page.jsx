
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Calibration() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isCalibrationComplete, setIsCalibrationComplete] = useState(false);
  const [webgazerLoaded, setWebgazerLoaded] = useState(false);

  const paragraphs = [
    {
      id: "paragraph1",
      text: "The quick brown fox jumps over the lazy sleeping dog.",
      words: [
        "The",
        "quick",
        "brown",
        "fox",
        "jumps",
        "over",
        "the",
        "lazy",
        "sleeping",
        "dog",
      ],
    },
    {
      id: "paragraph2",
      text: "Reading books helps expand your mind and improve vocabulary skills while providing entertainment and knowledge for personal growth.",
      words: [
        "Reading",
        "books",
        "helps",
        "expand",
        "your",
        "mind",
        "and",
        "improve",
        "vocabulary",
        "skills",
        "while",
        "providing",
        "entertainment",
        "and",
        "knowledge",
      ],
    },
    {
      id: "paragraph3",
      text: "Technology has revolutionized the way we communicate work learn and live our daily lives making everything more efficient and connected globally.",
      words: [
        "Technology",
        "has",
        "revolutionized",
        "the",
        "way",
        "we",
        "communicate",
        "work",
        "learn",
        "and",
        "live",
        "our",
        "daily",
        "lives",
        "making",
        "everything",
        "more",
        "efficient",
        "and",
        "connected",
      ],
    },
  ];

  const generateFixedPositions = (wordCount) => {
    const baseMargin = 2;
    const additionalMargin = Math.floor(wordCount / 8) * 2;
    const margin = baseMargin + additionalMargin;
    
    const positions = [
      { top: `${margin}%`, left: `${margin}%` }, 
      { top: `${margin}%`, left: `${100 - margin}%` }, 
      { top: `${margin + 10}%`, left: '50%' }, 
      
      { top: `${100 - margin}%`, left: `${margin}%` },
      { top: `${100 - margin}%`, left: `${100 - margin}%` },
      { top: `${100 - margin}%`, left: '50%' }, 
      
      { top: '50%', left: `${margin}%` }, 
      { top: '50%', left: `${100 - margin}%` },
      { top: '50%', left: '50%' }, 
      
      { top: `${margin + 10}%`, left: `${margin + 15}%` }, 
      { top: `${margin + 10}%`, left: `${100 - margin - 15}%` },
      { top: `${100 - margin - 10}%`, left: `${margin + 15}%` }, 
      { top: `${100 - margin - 10}%`, left: `${100 - margin - 15}%` }, 
      { top: `${30 + additionalMargin}%`, left: `${25 + additionalMargin}%` },
      { top: `${30 + additionalMargin}%`, left: `${75 - additionalMargin}%` }, 
      { top: `${70 - additionalMargin}%`, left: `${25 + additionalMargin}%` },
      { top: `${70 - additionalMargin}%`, left: `${75 - additionalMargin}%` }, 
      { top: `${20 + additionalMargin}%`, left: '50%' },
      { top: `${80 - additionalMargin}%`, left: '50%' },
      { top: '50%', left: `${20 + additionalMargin}%` },
    ];
    
    const result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(positions[i % positions.length]);
    }
    return result;
  };

  const [wordPositions, setWordPositions] = useState({});

  useEffect(() => {
    const positions = {};
    paragraphs.forEach((paragraph, index) => {
      positions[index] = generateFixedPositions(paragraph.words.length);
    });
    setWordPositions(positions);
  }, []);

  const webgazerstart = () => {
    try {
      console.log("webgazer started");
      const loadwebgazer = () => {
        const script = document.createElement("script");
        script.src = "/webgazer/Webgazer.js";
        script.defer = true;
        document.head.appendChild(script);
        script.onload = () => {
          console.log("WebGazer loaded successfully!");
          setWebgazerLoaded(true);
          window.webgazer.setRegression("ridge");
          window.webgazer.showVideo(false);
          window.webgazer.showFaceOverlay(false);
          window.webgazer.showFaceFeedbackBox(false);
          window.webgazer.begin();
        };
        script.onerror = (e) => {
          console.error("Failed to load webgazer.js:", e);
          setIsLoading(false);
        };
      };
      loadwebgazer();

      return () => {
        if (window.webgazer) {
          window.webgazer.end();
        }
      };
    } catch (error) {
      console.error("Error loading WebGazer:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    }
  };

  const getWordColor = () => {
    return "bg-blue-600 text-white hover:bg-blue-700";
  };

  const handleWordClick = (wordIndex) => {
    if (wordIndex === currentWordIndex) {
      if (currentWordIndex < paragraphs[currentPhase].words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        if (currentPhase < paragraphs.length - 1) {
          setCurrentPhase(currentPhase + 1);
          setCurrentWordIndex(0);
        } else {
          setIsCalibrationComplete(true);
          setTimeout(() => {
            window.location.href = "/content";
            if (window.webgazer) {
              window.webgazer.end();
            }
          }, 2000);
        }
      }
    }
  };

  const getCurrentParagraph = () => {
    return paragraphs[currentPhase];
  };

  const getShuffledWords = () => {
    const currentParagraph = getCurrentParagraph();
    if (!currentParagraph || !wordPositions[currentPhase]) return [];

    return currentParagraph.words.map((word, index) => ({
      word,
      originalIndex: index,
      position: wordPositions[currentPhase][index],
    }));
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-2xl">
          <div className="mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">Word Calibration Setup</h2>
          </div>
          <div className="text-lg leading-relaxed space-y-4 border-2 border-green-500 text-black p-8 bg-white">
            <p>
              <strong>
                Click the words in the correct order to complete each sentence.
              </strong>
            </p>
            <p>
              <strong className="text-red-500">
                Look at each word as you click it for proper eye tracking
                calibration.
              </strong>
            </p>
            <Button
              onClick={webgazerstart}
              className={"bg-green-600 cursor-pointer hover:bg-green-700"}
            >
              {webgazerLoaded ? "Loading...." : "Start Word Calibration"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isCalibrationComplete) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold mb-4 text-green-400">
            Calibration Complete!
          </h2>
          <p className="text-lg">Redirecting to content...</p>
        </div>
      </div>
    );
  }

  const currentParagraph = getCurrentParagraph();
  const shuffledWords = getShuffledWords();

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center max-w-4xl">
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-lg">
            <strong>Build the sentence:</strong>{" "}
            {currentParagraph?.words.map((word, index) => (
              <span
                key={index}
                className={
                  index < currentWordIndex
                    ? "text-green-400"
                    : index === currentWordIndex
                    ? "text-red-400 animate-pulse font-bold"
                    : "text-gray-400"
                }
              >
                {word}
                {index < currentParagraph.words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>

      {shuffledWords.map((item, index) => (
        <div
          key={`${currentPhase}-${index}`}
          className={`absolute px-3 py-2 rounded-lg cursor-pointer transform hover:scale-110 transition-all duration-200 font-medium text-sm ${getWordColor()}`}
          style={{
            top: item.position?.top || "50%",
            left: item.position?.left || "50%",
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleWordClick(item.originalIndex)}
        >
          {item.word}
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm">
          Paragraph {currentPhase + 1} of {paragraphs.length} | Word{" "}
          {currentWordIndex + 1} of {currentParagraph?.words.length}
        </p>
      </div>
    </div>
  );
}