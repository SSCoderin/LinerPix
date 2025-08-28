
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DisplayAllAnalysis = ({
  ContentDiscription,
  voiceAnalysisData,
  eyeAnalysisData,
}) => {
  const analysisResults = useMemo(() => {
    if (!ContentDiscription || !voiceAnalysisData || !eyeAnalysisData) {
      return null;
    }

    const contentLines = ContentDiscription.map((item) => ({
      lineIndex: item.line - 1,
      originalText: item.text,
      description: item.description,
    }));

    const voiceStats = {
      totalStudents: voiceAnalysisData.length,
      studentsData: voiceAnalysisData.map((student) => ({
        name: student.studentname,
        email: student.student_email,
        readings: student.voice_analysis,
      })),
    };

    const voiceAccuracyByLine = contentLines.map((line) => {
      const lineAccuracyScores = voiceStats.studentsData.map((student) => {
        const studentReading = student.readings.find(
          (r) => r.lineindex === line.lineIndex
        );
        if (!studentReading) return 0;

        const original = line.originalText
          .toLowerCase()
          .replace(/[^\w\s]/g, "");
        const reading = studentReading.userReading
          .toLowerCase()
          .replace(/[^\w\s]/g, "");

        const originalWords = original.split(/\s+/).filter(Boolean);
        const readingWords = reading.split(/\s+/).filter(Boolean);

        let correctWords = 0;
        const tempOriginalWords = [...originalWords];
        readingWords.forEach((word) => {
          const originalIndex = tempOriginalWords.indexOf(word);
          if (originalIndex > -1) {
            correctWords++;
            tempOriginalWords.splice(originalIndex, 1);
          }
        });

        const totalSpokenWords = readingWords.length;
        const wrongWordsCount = totalSpokenWords - correctWords;

        return totalSpokenWords > 0
          ? ((totalSpokenWords - wrongWordsCount) / totalSpokenWords) * 100
          : 0;
      });

      const validAccuracyScores = lineAccuracyScores;

      const lineReadingTimes = voiceStats.studentsData.map((student) => {
        const studentReading = student.readings.find(
          (r) => r.lineindex === line.lineIndex
        );
        return studentReading ? studentReading.duration : 0;
      }).filter((duration) => duration > 0);

      const averageReadingTime = lineReadingTimes.length > 0
        ? lineReadingTimes.reduce((a, b) => a + b, 0) / lineReadingTimes.length
        : 0;

      return {
        lineIndex: line.lineIndex + 1,
        text: line.originalText.substring(0, 30) + "...",
        averageAccuracy:
          validAccuracyScores.length > 0
            ? validAccuracyScores.reduce((a, b) => a + b, 0) /
              validAccuracyScores.length
            : 0,
        accuracyScores: lineAccuracyScores,
        averageReadingTime: averageReadingTime,
        readingTimes: lineReadingTimes,
      };
    });

    const overallVoiceAccuracy =
      voiceAccuracyByLine.length > 0
        ? voiceAccuracyByLine.reduce(
            (sum, line) => sum + line.averageAccuracy,
            0
          ) / voiceAccuracyByLine.length
        : 0;

    const totalVoiceReadingTime = voiceStats.studentsData.map((student) => {
      return student.readings.reduce((sum, reading) => sum + reading.duration, 0);
    });

    const overallVoiceReadingTime = totalVoiceReadingTime.length > 0
      ? totalVoiceReadingTime.reduce((a, b) => a + b, 0) / totalVoiceReadingTime.length
      : 0;

    const eyeStats = eyeAnalysisData.map((student) => {
      const totalFixationTime = student.duration.reduce(
        (sum, durationData) => sum + durationData.lineduration,
        0
      );
      
      const linesAnalyzed = student.duration.length;
      
      const averageFixationTime = linesAnalyzed > 0 ? totalFixationTime / linesAnalyzed : 0;

      const durationByLine = {};
      student.duration.forEach((durationData) => {
        const lineIndex = durationData.indexline;
        let lineDuration = durationData.lineduration;
        

        
        durationByLine[lineIndex] = lineDuration;
      });

      return {
        studentName: student.studentname,
        totalFixationTime,
        averageFixationTime,
        linesAnalyzed,
        durationByLine,
      };
    });

    // Calculate difficulty by line using duration data
    const difficultyByLine = contentLines.map((line) => {
      const lineDifficulties = eyeStats.map((student) => {
        const lineDuration = student.durationByLine[line.lineIndex] || 0;
        return lineDuration;
      });

      const averageDifficulty = lineDifficulties.length > 0
        ? lineDifficulties.reduce((a, b) => a + b, 0) / lineDifficulties.length
        : 0;

      return {
        lineIndex: line.lineIndex + 1,
        text: line.originalText.substring(0, 30) + "...",
        averageDifficulty: averageDifficulty,
        difficultyScores: lineDifficulties,
      };
    });

    const overallStats = {
      totalStudents: voiceStats.totalStudents,
      totalEyeTrackingStudents: eyeStats.length,
      averageReadingTime:
        eyeStats.reduce(
          (sum, student) => sum + student.averageFixationTime,
          0
        ) / eyeStats.length,
      totalContentLines: contentLines.length,
      overallVoiceAccuracy: overallVoiceAccuracy,
      overallVoiceReadingTime: overallVoiceReadingTime,
    };

    return {
      contentLines,
      voiceAccuracyByLine,
      difficultyByLine,
      eyeStats,
      overallStats,
      voiceStats,
    };
  }, [ContentDiscription, voiceAnalysisData, eyeAnalysisData]);

  if (!analysisResults) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Data Loading Error
        </h2>
        <p className="text-red-600">
          Unable to process the analysis data. Please check if all required data
          is provided.
        </p>
      </div>
    );
  }

  const { voiceAccuracyByLine, difficultyByLine, eyeStats, overallStats, voiceStats } =
    analysisResults;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

  return (
    <div className=" mx-20 p-6 space-y-8 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Student Reading Analysis Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive analysis of student reading performance across voice and
          eye-tracking metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {overallStats.totalStudents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Content Lines
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {overallStats.totalContentLines}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Overall Voice Accuracy
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {overallStats.overallVoiceAccuracy.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Average Voice Reading Time
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {overallStats.overallVoiceReadingTime.toFixed(2)}s
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Voice Reading Analysis - Students with Mistakes
        </h2>
        <div className="space-y-6">
          {voiceAccuracyByLine.map((line, index) => {
            const studentsWithMistakes = voiceAnalysisData.filter((student) => {
              const studentReading = student.voice_analysis.find(
                (r) => r.lineindex === index
              );
              if (!studentReading) return false;

              const originalWords =
                analysisResults.contentLines[index]?.originalText
                  .toLowerCase()
                  .replace(/[^\w\s]/g, "")
                  .split(/\s+/)
                  .filter(Boolean) || [];
              const readingWords = studentReading.userReading
                .toLowerCase()
                .replace(/[^\w\s]/g, "")
                .split(/\s+/)
                .filter(Boolean);

              const wrongWords = readingWords.filter(
                (word) => !originalWords.includes(word) && word.trim() !== ""
              );
              return wrongWords.length > 0;
            });

            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-700 mb-2">
                  Line {line.lineIndex}
                </h3>
                <p className="text-gray-600 mb-3 font-medium">
                  Original: "{analysisResults.contentLines[index]?.originalText}
                  "
                </p>
                <div className="flex gap-6 mb-3">
                  <p className="text-sm text-blue-600">
                    Average Accuracy: {line.averageAccuracy.toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600">
                    Average Reading Time: {line.averageReadingTime.toFixed(2)}s
                  </p>
                </div>

                {studentsWithMistakes.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-700">
                      Students with mistakes:
                    </h4>
                    {studentsWithMistakes.map((student, studentIndex) => {
                      const studentReading = student.voice_analysis.find(
                        (r) => r.lineindex === index
                      );
                      const originalWords =
                        analysisResults.contentLines[index]?.originalText
                          .toLowerCase()
                          .replace(/[^\w\s]/g, "")
                          .split(/\s+/)
                          .filter(Boolean) || [];
                      const readingWords = studentReading.userReading
                        .toLowerCase()
                        .replace(/[^\w\s]/g, "")
                        .split(/\s+/)
                        .filter(Boolean);
                      const wrongWords = readingWords.filter(
                        (word) =>
                          !originalWords.includes(word) && word.trim() !== ""
                      );

                      return (
                        <div
                          key={studentIndex}
                          className="bg-white p-3 rounded border border-red-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-700">
                              {student.studentname}:
                            </p>
                            <span className="text-sm text-orange-600 font-medium">
                              Time: {studentReading.duration.toFixed(2)}s
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Read: "{studentReading.userReading}"
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-red-600 font-medium">
                              Wrong words:
                            </span>
                            {wrongWords.map((word, wordIndex) => (
                              <span
                                key={wordIndex}
                                className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <span className="text-green-700 font-medium">
                      ✓ All students read this line correctly
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Reading Time Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Voice Reading Time Comparison
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={voiceStats.studentsData.map((student) => ({
                name: student.name.split(" ")[0],
                totalTime: student.readings.reduce((sum, reading) => sum + reading.duration, 0),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                label={{
                  value: "Students",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Total Time (s)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                formatter={(value) => [
                  `${value.toFixed(2)}s`,
                  "Total Voice Reading Time",
                ]}
              />
              <Bar dataKey="totalTime" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="border-t-4 border-black my-10"></p>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Eye Tracking Reading Time Analysis
        </h2>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Total Students Analyzed
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {eyeStats.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Overall Average Reading Time (Per Paragraph)
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {(
                eyeStats.reduce(
                  (sum, student) => sum + student.totalFixationTime,
                  0
                ) /
                eyeStats.length /
                1000
              ).toFixed(2)}{" "}
              s
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Average Fixation Time (Per Line)
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {(overallStats.averageReadingTime / 1000).toFixed(2)}s
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Average Reading Time per Line
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResults.contentLines.map((line, lineIndex) => {
              const lineReadingTimes = eyeStats
                .map((student) => {
                  return student.durationByLine[lineIndex] || 0;
                })
                .filter((time) => time > 0);

              const avgTimeForLine =
                lineReadingTimes.length > 0
                  ? lineReadingTimes.reduce((a, b) => a + b, 0) /
                    lineReadingTimes.length
                  : 0;

              return (
                <div
                  key={lineIndex}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h4 className="font-semibold text-gray-700">
                    Line {lineIndex + 1}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    "{line.originalText.substring(0, 40)}..."
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {(avgTimeForLine / 1000).toFixed(2)}s
                  </p>
                  <p className="text-xs text-gray-500">Average reading time</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Individual Student Reading Time Comparison
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eyeStats.map((student) => ({
                  name: student.studentName.split(" ")[0],
                  totalTime: student.totalFixationTime,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: "Students",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Total Time (s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tickFormatter={(value) => (value / 1000).toFixed(1)}
                />
                <Tooltip
                  formatter={(value) => [
                    `${(value / 1000).toFixed(2)}s`,
                    "Total Reading Time",
                  ]}
                />
                <Bar dataKey="totalTime" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayAllAnalysis;