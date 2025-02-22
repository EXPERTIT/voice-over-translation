import debug from "./debug.js";
import { availableLangs } from "../config/constants.js";
import { langTo6391 } from "./utils.js";

async function getCourseData(courseId) {
  const response = await fetch(
    `https://www.coursera.org/api/onDemandCourses.v1/${courseId}`
  );
  const resJSON = await response.json();
  return resJSON?.elements?.[0];
}

function getSubtitlesFileURL(responseLang, tracks) {
  const subtitle = tracks.find(
    (caption) => langTo6391(caption.srclang) === responseLang
  );
  return subtitle?.src;
}

function getVideoFileURL(sources) {
  const source = sources.find((src) => src.type === "video/mp4");
  return source?.src;
}

function getPlayerData() {
  return getPlayer()?.player;
}

function getPlayer() {
  return document.querySelector("#video_player");
}

// Get the video data from the player
async function getVideoData(responseLang = "en") {
  let translationHelp = null;
  const data = getPlayerData();

  const { duration } = data?.cache_ || {};
  const { courseId, tracks, sources } = data?.options_ || {};

  const videoURL = getVideoFileURL(sources);
  const courseData = await getCourseData(courseId);

  let detectedLanguage = courseData?.primaryLanguageCodes?.[0];
  detectedLanguage = detectedLanguage ? langTo6391(detectedLanguage) : "en";

  if (!availableLangs.includes(detectedLanguage)) {
    detectedLanguage = "en";
  }

  const subtitlesURL = getSubtitlesFileURL(responseLang, tracks);
  if (subtitlesURL) {
    translationHelp = [
      {
        target: "video_file_url",
        targetUrl: videoURL,
      },
      {
        target: "subtitles_file_url",
        targetUrl: `https://www.coursera.org${subtitlesURL}`,
      },
    ];
  }

  const videoData = {
    duration,
    detectedLanguage,
    translationHelp,
  };

  debug.log("coursera video data:", videoData);
  console.log("[VOT] Detected language: ", videoData.detectedLanguage);
  return videoData;
}

export const courseraUtils = {
  getPlayer,
  getPlayerData,
  getVideoData,
};
