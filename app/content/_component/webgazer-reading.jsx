"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function WebgazerReadingPage({ imageData, selectedContent }) {
  const { user } = useUser();
  const [processedContent, setProcessedContent] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [completedLineIndex, setCompletedLineIndex] = useState(null);
  const [highlightedWords, setHighlightedWords] = useState({});
  const [gazeLog, setGazeLog] = useState([]);

  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);
  const [allContentRead, setAllContentRead] = useState(false);
  const [durationData, setDurationData] = useState([]);
  const [lineStartTime, setLineStartTime] = useState(null);

    const [isWebGazerLoading, setIsWebGazerLoading] = useState(true);

  const webgazerRef = useRef(null);
  const gazeListenerRef = useRef(null);
  const wordGazeStartRef = useRef(null);
  const imageGazeStartRef = useRef(null);
  const isCleaningUpRef = useRef(false);
  const currentSentenceIndexRef = useRef(currentSentenceIndex);
  const completedLineIndexRef = useRef(completedLineIndex);
  const highlightedWordsRef = useRef(highlightedWords);
  const processedContentRef = useRef(processedContent);
  const allContentReadRef = useRef(allContentRead);
  const activeImageIndexRef = useRef(activeImageIndex);
  const lastLoggedWordRef = useRef(null);
  const durationDataRef = useRef(durationData);
  const lineStartTimeRef = useRef(lineStartTime);

  useEffect(() => {
    currentSentenceIndexRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  useEffect(() => {
    completedLineIndexRef.current = completedLineIndex;
  }, [completedLineIndex]);

  useEffect(() => {
    highlightedWordsRef.current = highlightedWords;
  }, [highlightedWords]);

  useEffect(() => {
    processedContentRef.current = processedContent;
  }, [processedContent]);

  useEffect(() => {
    allContentReadRef.current = allContentRead;
  }, [allContentRead]);

  useEffect(() => {
    activeImageIndexRef.current = activeImageIndex;
  }, [activeImageIndex]);

  useEffect(() => {
    durationDataRef.current = durationData;
  }, [durationData]);

  useEffect(() => {
    lineStartTimeRef.current = lineStartTime;
  }, [lineStartTime]);

  useEffect(() => {
    if (imageData?.content?.content_description) {
      const content = imageData.content.content_description.map((item) => ({
        text: item.text,
        words: item.text.split(" ").filter((word) => word.length > 0),
      }));
      setProcessedContent(content);
      setCurrentSentenceIndex(0);
      setCompletedLineIndex(null);
      setHighlightedWords({});
      setGazeLog([]);
      setActiveImageIndex(-1);
      setAllContentRead(false);
      isCleaningUpRef.current = false;
      lastLoggedWordRef.current = null;
      setDurationData([]);
      setLineStartTime(null);

      console.log(
        "Content processed. Total sentences:",
        content.length,
        "Current sentence index set to 0, completed line index set to null."
      );
    }
  }, [imageData]);

  useEffect(() => {
    if (
      webgazerInitialized &&
      processedContent.length > 0 &&
      lineStartTime === null &&
      currentSentenceIndex === 0
    ) {
      setLineStartTime(performance.now());
      console.log(`Line 0 timer started at: ${performance.now()}`);
    }

    if (lineStartTime !== null && currentSentenceIndex > 0) {
      const previousLineIndex = currentSentenceIndex - 1;
      const duration = performance.now() - lineStartTime;

      setDurationData((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.indexline === previousLineIndex
        );
        let updatedDurationData;

        if (existingIndex > -1) {
          updatedDurationData = [...prev];
          updatedDurationData[existingIndex] = {
            ...updatedDurationData[existingIndex],
            lineduration: Math.round(duration),
          };
          console.log(
            `Updated duration for line ${previousLineIndex}: ${Math.round(
              duration
            )}ms`
          );
        } else {
          const newDurationEntry = {
            indexline: previousLineIndex,
            lineduration: Math.round(duration),
          };
          updatedDurationData = [...prev, newDurationEntry];
          console.log(
            `Recorded new duration for line ${previousLineIndex}: ${Math.round(
              duration
            )}ms`
          );
        }
        return updatedDurationData;
      });
      setLineStartTime(performance.now());
      console.log(
        `Line ${currentSentenceIndex} timer started at: ${performance.now()}`
      );
    }

    if (allContentRead && lineStartTime !== null) {
      const lastLineIndex = processedContent.length - 1;
      const duration = performance.now() - lineStartTime - 4000;
      setDurationData((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.indexline === lastLineIndex
        );
        let updatedDurationData;

        if (existingIndex > -1) {
          updatedDurationData = [...prev];
          updatedDurationData[existingIndex] = {
            ...updatedDurationData[existingIndex],
            lineduration: Math.round(duration),
          };
          console.log(
            `Updated final line ${lastLineIndex} duration: ${Math.round(
              duration
            )}ms`
          );
        } else {
          const newDurationEntry = {
            indexline: lastLineIndex,
            lineduration: Math.round(duration),
          };
          updatedDurationData = [...prev, newDurationEntry];
          console.log(
            `Recorded final line ${lastLineIndex} duration: ${Math.round(
              duration
            )}ms`
          );
        }
        return updatedDurationData;
      });
      setLineStartTime(null);
    }
  }, [
    currentSentenceIndex,
    webgazerInitialized,
    processedContent.length,
    allContentRead,
  ]);

  const logGazeData = useCallback((gazeData, duration) => {
    if (isCleaningUpRef.current) return;

    const currentWordKey = `${gazeData.lineIndex}-${gazeData.wordText}`;

    if (lastLoggedWordRef.current === currentWordKey) {
      return;
    }

    const newLogEntry = {
      wordText: gazeData.wordText,
      lineIndex: gazeData.lineIndex,
      completedLine: gazeData.completedLine,
      durationMs: Math.round(duration),
      timestamp: Date.now(),
    };

    setGazeLog((prevLog) => [...prevLog, newLogEntry]);
    lastLoggedWordRef.current = currentWordKey;

    console.log("Logged gaze data:", newLogEntry);
  }, []);

  const SubmitEyeAnalysis = async (finalGazeData = null) => {
    try {
      const gazeDataToSubmit = finalGazeData || gazeLog;

      console.log(
        "Submitting eye analysis with",
        gazeDataToSubmit.length,
        "gaze entries"
      );
      const eyeResponse = await axios.post("/api/eyeanalysis", {
        userid: user.id,
        contentid: selectedContent._id,
        title: selectedContent.title,
        content_description: imageData.content.content_description,
        duration: durationDataRef.current,
        eye_analysis: gazeDataToSubmit,
      });
      console.log(eyeResponse.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (allContentRead) {
      const timer = setTimeout(() => {
        let finalGazeData = [...gazeLog];

        if (wordGazeStartRef.current && typeof performance !== "undefined") {
          const prevWordData = wordGazeStartRef.current;
          const duration = performance.now() - prevWordData.startTime;
          finalGazeData.push({
            wordText: prevWordData.wordText,
            lineIndex: prevWordData.sentenceIndex,
            completedLine: completedLineIndexRef.current,
            durationMs: Math.round(duration),
            timestamp: Date.now(),
          });
          wordGazeStartRef.current = null;
        }

        if (imageGazeStartRef.current && typeof performance !== "undefined") {
          const prevImageData = imageGazeStartRef.current;
          const duration = performance.now() - prevImageData.startTime;
          finalGazeData.push({
            wordText: prevImageData.imageIndex,
            lineIndex: prevImageData.imageIndex,
            completedLine: completedLineIndexRef.current,
            durationMs: Math.round(duration),
            timestamp: Date.now(),
          });
          imageGazeStartRef.current = null;
        }

        SubmitEyeAnalysis(finalGazeData);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [allContentRead, gazeLog]);

  const gazeListener = useCallback(
    (data) => {
      const latestProcessedContent = processedContentRef.current;
      const latestCurrentSentenceIndex = currentSentenceIndexRef.current;
      const latestCompletedLineIndex = completedLineIndexRef.current;
      const latestHighlightedWords = highlightedWordsRef.current;
      const latestAllContentRead = allContentReadRef.current;
      const latestActiveImageIndex = activeImageIndexRef.current;

      if (
        !data ||
        !latestProcessedContent.length ||
        isCleaningUpRef.current ||
        !window.webgazer ||
        latestAllContentRead
      ) {
        return;
      }

      try {
        const element = document.elementFromPoint(data.x, data.y);
        let sIndex = -1,
          wIndex = -1,
          wordText = "";
        let isImageElement = false;
        let imageIndex = -1;

        if (element) {
          const imgElement = element.closest("[data-image-idx]");
          if (imgElement) {
            isImageElement = true;
            imageIndex = parseInt(
              imgElement.getAttribute("data-image-idx"),
              10
            );
          } else {
            const sIdxStr = element.getAttribute("data-sentence-idx");
            const wIdxStr = element.getAttribute("data-word-idx");
            if (sIdxStr && wIdxStr) {
              sIndex = parseInt(sIdxStr, 10);
              wIndex = parseInt(wIdxStr, 10);
              if (
                latestProcessedContent[sIndex] &&
                latestProcessedContent[sIndex].words[wIndex]
              ) {
                wordText = latestProcessedContent[sIndex].words[wIndex];
              } else {
                sIndex = -1;
                wIndex = -1;
              }
            }
          }
        }

        if (wordGazeStartRef.current) {
          const prevWordData = wordGazeStartRef.current;
          const isSameWord =
            prevWordData.sentenceIndex === sIndex &&
            prevWordData.wordIndex === wIndex &&
            !isImageElement;

          if (!isSameWord) {
            const duration = performance.now() - prevWordData.startTime;
            logGazeData(
              {
                wordText: prevWordData.wordText,
                lineIndex: prevWordData.sentenceIndex,
                completedLine: latestCompletedLineIndex,
              },
              duration
            );
            wordGazeStartRef.current = null;

            if (sIndex !== -1 && wIndex !== -1) {
              lastLoggedWordRef.current = null;
            }
          }
        }

        if (imageGazeStartRef.current) {
          const prevImageData = imageGazeStartRef.current;
          const isSameImage =
            prevImageData.imageIndex === imageIndex && isImageElement;

          if (!isSameImage) {
            const duration = performance.now() - prevImageData.startTime;
            logGazeData(
              {
                wordText: prevImageData.imageIndex,
                lineIndex: prevImageData.imageIndex,
                completedLine: latestCompletedLineIndex,
              },
              duration
            );
            imageGazeStartRef.current = null;

            if (isImageElement && imageIndex !== -1) {
              lastLoggedWordRef.current = null;
            }
          }
        }

        if (sIndex !== -1 && wIndex !== -1 && !isImageElement) {
          if (!wordGazeStartRef.current) {
            wordGazeStartRef.current = {
              sentenceIndex: sIndex,
              wordIndex: wIndex,
              wordText: wordText,
              startTime: performance.now(),
            };
          }

          if (
            sIndex === latestCurrentSentenceIndex &&
            !latestHighlightedWords[`${sIndex}-${wIndex}`]
          ) {
            if (isCleaningUpRef.current) return;

            setHighlightedWords((prevHighlighted) => {
              const newHighlighted = {
                ...prevHighlighted,
                [`${sIndex}-${wIndex}`]: true,
              };

              const sentenceIdxOfGazedWord = sIndex;
              const wordsInThisSentence =
                processedContentRef.current[sentenceIdxOfGazedWord]?.words;

              if (!wordsInThisSentence) {
                console.error(
                  "Error: wordsInThisSentence is undefined for sentence index:",
                  sentenceIdxOfGazedWord
                );
                return newHighlighted;
              }

              let allWordsInSentenceHighlighted = true;
              for (let i = 0; i < wordsInThisSentence.length; i++) {
                if (!newHighlighted[`${sentenceIdxOfGazedWord}-${i}`]) {
                  allWordsInSentenceHighlighted = false;
                  break;
                }
              }

              if (
                allWordsInSentenceHighlighted &&
                sentenceIdxOfGazedWord === latestCurrentSentenceIndex
              ) {
                console.log(
                  `COMPLETED: Sentence ${latestCurrentSentenceIndex}.`
                );
                if (!isCleaningUpRef.current) {
                  setCompletedLineIndex(latestCurrentSentenceIndex);
                  setActiveImageIndex(latestCurrentSentenceIndex);
                  const nextSentenceIndexToSet = latestCurrentSentenceIndex + 1;
                  if (
                    nextSentenceIndexToSet < processedContentRef.current.length
                  ) {
                    console.log(
                      `ADVANCING: To sentence ${nextSentenceIndexToSet}. Total sentences: ${processedContentRef.current.length}. Completed line: ${latestCurrentSentenceIndex}`
                    );
                    setCurrentSentenceIndex(nextSentenceIndexToSet);
                  } else {
                    console.log(
                      `ALL CONTENT READ: ${processedContentRef.current.length} sentences. Setting allContentRead=true. Final completed line: ${latestCurrentSentenceIndex}`
                    );
                    setTimeout(() => setAllContentRead(true), 4000);
                  }
                }
              }
              return newHighlighted;
            });
          }
        }

        if (
          isImageElement &&
          imageIndex !== -1 &&
          imageIndex <= latestActiveImageIndex
        ) {
          if (!imageGazeStartRef.current) {
            imageGazeStartRef.current = {
              imageIndex: imageIndex,
              startTime: performance.now(),
            };
          }
        }
      } catch (error) {
        console.error("Error in gaze listener:", error);
      }
    },
    [logGazeData]
  );

  const initializeWebGazer = useCallback(async () => {
    if (
      webgazerInitialized ||
      isCleaningUpRef.current ||
      allContentReadRef.current
    ) {
      return;
    }
        setIsWebGazerLoading(true); // Start loading

    try {
      if (!window.webgazer) {
        const script = document.createElement("script");
        script.src = "/webgazer/Webgazer.js";

        // script.src = "https://webgazer.cs.brown.edu/webgazer.js";
        script.async = true;
        const scriptPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        webgazerRef.current = script;
        document.body.appendChild(script);
        await scriptPromise;
      }
      if (window.webgazer && !isCleaningUpRef.current) {
        window.webgazer.showVideo(false);
        window.webgazer.showFaceOverlay(false);
        window.webgazer.showFaceFeedbackBox(false);
        gazeListenerRef.current = gazeListener;
        await window.webgazer.setGazeListener(gazeListenerRef.current).begin();
        if (!isCleaningUpRef.current) {
          setWebgazerInitialized(true);
          setEyeTrackingActive(true);
          setIsWebGazerLoading(false); // Loading complete

          console.log("WebGazer initialized and line 0 timer started.");
        }
      }
    } catch (error) {
      console.error("WebGazer initialization failed:", error);
      setWebgazerInitialized(false);
      setEyeTrackingActive(false);
      setIsWebGazerLoading(false); // Loading failed

    }
  }, [webgazerInitialized, gazeListener]);

  useEffect(() => {
    if (
      processedContent.length > 0 &&
      !webgazerInitialized &&
      !allContentRead
    ) {
      const timer = setTimeout(() => {
        initializeWebGazer();
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    processedContent,
    webgazerInitialized,
    initializeWebGazer,
    allContentRead,
  ]);

  useEffect(() => {
    isCleaningUpRef.current = false;
    return () => {
      isCleaningUpRef.current = true;

      if (wordGazeStartRef.current && typeof performance !== "undefined") {
        const prevWordData = wordGazeStartRef.current;
        const duration = performance.now() - prevWordData.startTime;
        console.log("Final word gaze entry on unmount:", {
          wordText: prevWordData.wordText,
          lineIndex: prevWordData.sentenceIndex,
          completedLine: completedLineIndexRef.current,
          durationMs: Math.round(duration),
          timestamp: Date.now(),
        });
        wordGazeStartRef.current = null;
      }

      if (imageGazeStartRef.current && typeof performance !== "undefined") {
        const prevImageData = imageGazeStartRef.current;
        const duration = performance.now() - prevImageData.startTime;
        console.log("Final image gaze entry on unmount:", {
          wordText: prevImageData.imageIndex,
          lineIndex: prevImageData.imageIndex,
          completedLine: completedLineIndexRef.current,
          durationMs: Math.round(duration),
          timestamp: Date.now(),
        });
        imageGazeStartRef.current = null;
      }

      if (allContentReadRef.current && lineStartTimeRef.current !== null) {
        const lastLineIndex = processedContentRef.current.length - 1;
        const duration = performance.now() - lineStartTimeRef.current;

        setDurationData((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.indexline === lastLineIndex
          );
          let updatedDurationData;

          if (existingIndex > -1) {
            updatedDurationData = [...prev];
            updatedDurationData[existingIndex] = {
              ...updatedDurationData[existingIndex],
              lineduration: Math.round(duration),
            };
            console.log(
              `Updated final line ${lastLineIndex} duration on unmount: ${Math.round(
                duration
              )}ms`
            );
          } else {
            const newDurationEntry = {
              indexline: lastLineIndex,
              lineduration: Math.round(duration),
            };
            updatedDurationData = [...prev, newDurationEntry];
            console.log(
              `Recorded final line ${lastLineIndex} duration on unmount: ${Math.round(
                duration
              )}ms`
            );
          }
          return updatedDurationData;
        });
      }

      if (window.webgazer && webgazerInitialized) {
        window.webgazer.setGazeListener(null);
        window.webgazer.pause();
      }
    };
  }, [webgazerInitialized, processedContent]);

  if (!imageData || !selectedContent || processedContent.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading content...</p>
      </div>
    );
  }

   if (isWebGazerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Initializing Eye Tracking
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we set up the eye tracking system...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            This may take a few moments to complete
          </p>
        </div>
      </div>
    );
  }

  const handleSkipLine = () => {
   setCurrentSentenceIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <>
      <div className="min-h-screen">
        <div className=" mx-20 mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg text-red-600">
            Look at any word in the current line to highlight it. Look and read
            all words in the line to see the image.
          </p>
         
          </div>
        <div className="flex flex-row h-auto mx-20 mt-4 items-start justify-center gap-4">
          <div className="w-3/5 rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h1 className="text-3xl font-bold text-blue-600 underline mb-6">
              {selectedContent.title}
            </h1>

            <div className="text-black text-2xl leading-relaxed flex flex-col">
              {processedContent.map((sentence, sIdx) => (
                <div
                  key={sIdx}
                  className={` flex flex-wrap mb-4 p-3 rounded transition-colors duration-200 text-3xl font-bold
                    ${
                      currentSentenceIndex === sIdx && !allContentRead
                        ? "bg-gray-100 ring-2 ring-blue-300"
                        : ""
                    }
                    ${activeImageIndex >= sIdx ? "opacity-60" : ""}
                  `}
                >
                  {sentence.words.map((word, wIndex) => (
                    <span
                      key={`${sIdx}-${wIndex}`}
                      data-sentence-idx={sIdx}
                      data-word-idx={wIndex}
                      className={`mr-1 p-0.5 transition-colors duration-150 rounded cursor-pointer
                        ${
                          highlightedWords[`${sIdx}-${wIndex}`]
                            ? "bg-yellow-400 text-black"
                            : ""
                        }
                      `}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {allContentRead && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold text-green-600 mb-2">
                  Reading Complete!
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  Congratulations! You have successfully completed the entire
                  reading.
                </p>
                <button
                  onClick={() => (window.location.href = "/content")}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  GO BACK
                </button>
              </div>
            )}
          </div>

          <div className="w-2/5 rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 ">Image Display</h1>
           

            {activeImageIndex >= 0 && imageData?.content?.gen_image && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: activeImageIndex + 1 }).map((_, imgIdx) =>
                  imageData.content.gen_image[imgIdx] ? (
                    <div
                      key={imgIdx}
                      data-image-idx={imgIdx}
                      className="relative h-auto rounded-lg overflow-hidden m-2 border-2 border-blue-300 shadow-lg"
                    >
                      <img
                        src={`data:image/png;base64,${imageData.content.gen_image[imgIdx].data}`}
                        alt={`Image ${imgIdx + 1}`}
                        className="w-full h-full object-cover"
                        data-image-idx={imgIdx}
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                        {imgIdx + 1}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
