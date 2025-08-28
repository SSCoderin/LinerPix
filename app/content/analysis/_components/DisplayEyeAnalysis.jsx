import React, { useState, useMemo } from "react";
import { MoveLeft, BarChart3 } from "lucide-react";

export default function DisplayEyeAnalysis({ eyeanalysisData ,Displayback = true}) {
  const processedData = useMemo(() => {
    if (
      !eyeanalysisData?.eye_analysis ||
      !eyeanalysisData?.content_description
    ) {
      return {
        wordDurations: {},
        lineDurations: {},
        imageTransitions: [],
        totalDuration: 0,
        totalImageTime: 0,
        totalTextTime: 0,
      };
    }

    const wordDurations = {};
    const lineDurations = {};
    const imageTransitions = [];
    let totalDuration = 0;
    let totalImageTime = 0;
    let totalTextTime = 0;

    if (eyeanalysisData.duration && Array.isArray(eyeanalysisData.duration)) {
      eyeanalysisData.duration.forEach((durationItem) => {
        const lineIndex = durationItem.indexline;
        const lineDuration = durationItem.lineduration;
        lineDurations[lineIndex] = lineDuration;
        totalTextTime += lineDuration;
      });
    }

    eyeanalysisData.eye_analysis.forEach((event) => {
      const { wordText, lineIndex, completedLine, durationMs } = event;

      totalDuration += durationMs;

      if (typeof wordText === "string") {
        const key = `${lineIndex}-${wordText}`;
        wordDurations[key] = (wordDurations[key] || 0) + durationMs;
      }

      if (typeof wordText === "number" && completedLine !== null) {
        imageTransitions.push({
          fromLine: completedLine,
          toImage: wordText,
          duration: durationMs,
          timestamp: event.timestamp,
        });
        totalImageTime += durationMs;
      }
    });

    return {
      wordDurations,
      lineDurations,
      imageTransitions,
      totalDuration,
      totalImageTime,
      totalTextTime,
    };
  }, [eyeanalysisData]);

  const getHeatmapColor = (duration, maxDuration) => {
    const intensity = Math.min(duration / maxDuration, 1);
    const opacity = 0.2 + intensity * 0.8;
    return `rgba(59, 130, 246, ${opacity})`;
  };

  const stats = useMemo(() => {
    const {
      wordDurations,
      lineDurations,
      imageTransitions,
      totalDuration,
      totalImageTime,
      totalTextTime,
    } = processedData;

    const avgWordDuration =
      Object.values(wordDurations).length > 0
        ? Object.values(wordDurations).reduce((a, b) => a + b, 0) /
          Object.values(wordDurations).length
        : 0;

    const mostViewedLine = Object.entries(lineDurations).reduce(
      (max, [line, duration]) =>
        duration > max.duration ? { line: parseInt(line), duration } : max,
      { line: 0, duration: 0 }
    );

    const combinedTime = totalTextTime + totalImageTime;
    const imagePercentage =
      combinedTime > 0 ? (totalImageTime / combinedTime) * 100 : 0;
    const textPercentage =
      combinedTime > 0 ? (totalTextTime / combinedTime) * 100 : 0;

    return {
      totalDuration: totalDuration / 1000,
      avgWordDuration: avgWordDuration / 1000,
      mostViewedLine,
      imageTransitions: imageTransitions.length,
      linesCount: eyeanalysisData?.content_description?.length || 0,
      imagePercentage,
      textPercentage,
    };
  }, [processedData, eyeanalysisData]);

  const maxWordDuration = Math.max(
    ...Object.values(processedData.wordDurations),
    1
  );
  const maxLineDuration = Math.max(
    ...Object.values(processedData.lineDurations),
    1
  );

  return (
    <div className="min-h-screen">
      <div className={`${Displayback && "mt-10"} mx-4 md:mx-20`}>
        {Displayback && (          
       
        <div
          onClick={() => (window.location.href = "/content/analysis")}
          className="flex flex-row items-center mb-6 cursor-pointer hover:text-blue-600 transition-colors"
        >
          <MoveLeft className="mr-2 mt-1" />
          <span className="text-2xl font-bold">Back</span>
        </div>
         )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Eye Tracking Analysis: {eyeanalysisData?.title || "Untitled"}
          </h1>
        </div>

        <div className="gap-6 flex flex-row w-full mb-10">
          <div className="p-8 border rounded-2xl bg-green-50 flex flex-col justify-center items-center w-1/2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-green-600 mb-3">
              {stats.textPercentage.toFixed(1)}%
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Time spent on Text
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">
              {(processedData.totalTextTime / 1000).toFixed(1)}s total
            </div>
          </div>
          <div className="p-8 border rounded-2xl bg-blue-50 flex flex-col justify-center items-center w-1/2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-blue-600 mb-3">
              {stats.imagePercentage.toFixed(1)}%
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Time spent on Images
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">
              {(processedData.totalImageTime / 1000).toFixed(1)}s total
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">Heatmap</h2>
          <div className="space-y-4">
            {eyeanalysisData?.content_description?.map((line, lineIndex) => (
              <div key={lineIndex} className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-500 mb-2">
                  Line {lineIndex + 1} • Total:{" "}
                  {(
                    (processedData.lineDurations[lineIndex] || 0) / 1000
                  ).toFixed(2)}
                  s
                </div>
                <div className="flex flex-wrap gap-1">
                  {line.text.split(" ").map((word, wordIndex) => {
                    const wordKey = `${lineIndex}-${word}`;
                    const duration = processedData.wordDurations[wordKey] || 0;
                    const color =
                      duration > 0
                        ? getHeatmapColor(duration, maxWordDuration)
                        : "transparent";

                    return (
                      <span
                        key={wordIndex}
                        className="px-2 py-1 rounded text-sm font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: color,
                          border:
                            duration > 0
                              ? "1px solid rgba(59, 130, 246, 0.3)"
                              : "1px solid transparent",
                        }}
                        title={`Duration: ${(duration / 1000).toFixed(2)}s`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>Legend:</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                <span>Low Attention</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span>High Attention</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-20">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            Reading Flow Diagram
          </h2>

          <div className="relative w-full h-96 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 800 400">
              <defs>
                <marker
                  id="arrowhead-blue"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
                <marker
                  id="arrowhead-purple"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
                </marker>
              </defs>

              {eyeanalysisData?.content_description?.map((_, index) => (
                <g key={`line-${index}`}>
                  <rect
                    x="50"
                    y={50 + index * 60}
                    width="100"
                    height="40"
                    rx="8"
                    fill="#DBEAFE"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  <text
                    x="100"
                    y={75 + index * 60}
                    textAnchor="middle"
                    className="text-sm font-medium fill-blue-700"
                  >
                    Line {index + 1}
                  </text>
                </g>
              ))}

              {eyeanalysisData?.content_description?.map((_, index) => (
                <g key={`image-${index}`}>
                  <rect
                    x="650"
                    y={50 + index * 60}
                    width="100"
                    height="40"
                    rx="8"
                    fill="#EDE9FE"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                  />
                  <text
                    x="700"
                    y={75 + index * 60}
                    textAnchor="middle"
                    className="text-sm font-medium fill-purple-700"
                  >
                    Image {index + 1}
                  </text>
                </g>
              ))}

              {(() => {
                const lineToImageConnections = {};

                processedData.imageTransitions.forEach((transition) => {
                  const key = `${transition.fromLine}-${transition.toImage}`;
                  if (!lineToImageConnections[key]) {
                    lineToImageConnections[key] = {
                      fromLine: transition.fromLine,
                      toImage: transition.toImage,
                      totalDuration: 0,
                      count: 0,
                    };
                  }
                  lineToImageConnections[key].totalDuration +=
                    transition.duration;
                  lineToImageConnections[key].count += 1;
                });

                return Object.values(lineToImageConnections).map(
                  (connection, index) => {
                    const startY = 70 + connection.fromLine * 60;
                    const endY = 70 + connection.toImage * 60;
                    const strokeWidth = Math.max(
                      2,
                      Math.min(8, connection.count * 2)
                    );
                    const opacity = Math.min(1, 0.3 + connection.count * 0.2);

                    return (
                      <g key={`line-to-image-${index}`}>
                        <path
                          d={`M 150 ${startY} Q 400 ${
                            (startY + endY) / 2
                          } 650 ${endY}`}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          markerEnd="url(#arrowhead-blue)"
                        />
                        <text
                          x="400"
                          y={(startY + endY) / 2 - 10}
                          textAnchor="middle"
                          className="text-xs fill-blue-600"
                        >
                          {connection.count}x (
                          {(connection.totalDuration / 1000).toFixed(1)}s)
                        </text>
                      </g>
                    );
                  }
                );
              })()}

              {(() => {
                const imageToLineConnections = {};

                for (
                  let i = 0;
                  i < eyeanalysisData.eye_analysis.length - 1;
                  i++
                ) {
                  const current = eyeanalysisData.eye_analysis[i];
                  const next = eyeanalysisData.eye_analysis[i + 1];

                  if (
                    typeof current.wordText === "number" &&
                    typeof next.wordText === "string"
                  ) {
                    const key = `${current.wordText}-${next.lineIndex}`;
                    if (!imageToLineConnections[key]) {
                      imageToLineConnections[key] = {
                        fromImage: current.wordText,
                        toLine: next.lineIndex,
                        totalDuration: 0,
                        count: 0,
                      };
                    }
                    imageToLineConnections[key].totalDuration +=
                      next.durationMs;
                    imageToLineConnections[key].count += 1;
                  }
                }

                return Object.values(imageToLineConnections).map(
                  (connection, index) => {
                    const startY = 70 + connection.fromImage * 60;
                    const endY = 70 + connection.toLine * 60;
                    const strokeWidth = Math.max(
                      2,
                      Math.min(6, connection.count * 1.5)
                    );
                    const opacity = Math.min(1, 0.3 + connection.count * 0.15);

                    return (
                      <g key={`image-to-line-${index}`}>
                        <path
                          d={`M 650 ${startY} Q 400 ${
                            (startY + endY) / 2 + 20
                          } 150 ${endY}`}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          markerEnd="url(#arrowhead-purple)"
                          strokeDasharray="5,5"
                        />
                        <text
                          x="400"
                          y={(startY + endY) / 2 + 30}
                          textAnchor="middle"
                          className="text-xs fill-purple-600"
                        >
                          {connection.count}x (
                          {(connection.totalDuration / 1000).toFixed(1)}s)
                        </text>
                      </g>
                    );
                  }
                );
              })()}
            </svg>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">Flow Legend:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-8 h-1 bg-blue-500 mr-3"></div>
                <span className="text-sm">
                  Line → Image (solid blue): Reading completion to image viewing
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className="w-8 h-1 bg-purple-500 mr-3"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to right, #8B5CF6 0, #8B5CF6 3px, transparent 3px, transparent 6px)",
                  }}
                ></div>
                <span className="text-sm">
                  Image → Line (dashed purple): Image viewing to next line
                  reading
                </span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p>• Arrow thickness indicates frequency of transitions</p>
              <p>• Numbers show: frequency × (total duration)</p>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Flow Summary:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Line→Image Transitions:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {processedData.imageTransitions.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Image→Line Transitions:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {(() => {
                    let count = 0;
                    for (
                      let i = 0;
                      i < eyeanalysisData.eye_analysis.length - 1;
                      i++
                    ) {
                      const current = eyeanalysisData.eye_analysis[i];
                      const next = eyeanalysisData.eye_analysis[i + 1];
                      if (
                        typeof current.wordText === "number" &&
                        typeof next.wordText === "string"
                      ) {
                        count++;
                      }
                    }
                    return count;
                  })()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lines Engaged:</span>
                <span className="ml-2 font-medium">
                  {Object.keys(processedData.lineDurations).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Images Viewed:</span>
                <span className="ml-2 font-medium">
                  {
                    new Set(
                      processedData.imageTransitions.map((t) => t.toImage)
                    ).size
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}