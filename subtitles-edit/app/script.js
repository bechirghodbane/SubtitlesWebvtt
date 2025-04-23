let subtitles = [];
let currentSubtitleIndex = 0;
let player; // Declare the player globally

// Load the YouTube Player API
function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById('youtube-video');
  player = new YT.Player(iframe, {
    events: {
      onReady: onPlayerReady, // Ensure the player is ready
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  console.log('Player is ready'); // Debugging: Confirm the player is ready
}

// Handle player state changes
function onPlayerStateChange(event) {
  console.log('Player state changed:', event.data); // Log the state change for debugging

  if (event.data === YT.PlayerState.PLAYING) {
    console.log('Video is playing');
    // Sync subtitles with the video
    const intervalId = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime();
        console.log('Current time:', currentTime); // Debugging: Log the current time
        updateSubtitleOverlay(currentTime);
      } else {
        const type = typeof player.getCurrentTime;
        console.warn('Player is not ready yet or getCurrentTime is not a function:', type);
        clearInterval(intervalId); // Stop the interval if the player is not ready
      }
    }, 100);
  } else if (event.data === YT.PlayerState.PAUSED) {
    console.log('Video is paused');
    // Optionally, clear the interval if needed
  } else if (event.data === YT.PlayerState.ENDED) {
    console.log('Video has ended');
    // Handle video end state if needed
  }
}

document.getElementById('load-video').addEventListener('click', () => {
  const videoUrl = document.getElementById('video-url').value;
//  const videoId = extractYouTubeVideoId(videoUrl);
  videoId = videoUrl;
  if (videoId) {
    const iframe = document.getElementById('youtube-video');
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  } else {
    alert('Invalid YouTube URL');
  }

  // Load the YouTube Player API
  setTimeout(() => {
    onYouTubeIframeAPIReady();
  }, 2000);
});

document.getElementById('subtitle-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  console.log(file.type)
  //if (file && file.type === 'text/plain') {
  if (file) {

    const reader = new FileReader();
    reader.onload = (e) => {
      subtitles = parseSRT(e.target.result);
      console.log(measureMinMaxTime(subtitles));
      
      renderSubtitleEditor(subtitles);
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid SRT file.');
  }
});

function extractYouTubeVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^?&]+)/;
  const match = url.match(regex);
  return match ? match[1] || match[2] : null;
}

function parseSRT(srtContent) {
  const blocks = srtContent.split('\n\n');
  const subtitles = [];

  blocks.forEach((block) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const id = lines[0].trim();
      const [start, end] = lines[1].split(' --> ').map((time) => parseTime(time.trim()));
      const text = lines.slice(2).join(' ').trim();

      subtitles.push({
        id,
        start,
        end,
        text,
      });
    }
  });

  return subtitles;
}

// Function mesure min and max time of subtitles
function measureMinMaxTime(subtitles) {
  let minTime = Infinity;
  let maxTime = -Infinity;

  subtitles.forEach((subtitle) => {
    let time = subtitle.end - subtitle.start;
    if (time < minTime) {
      minTime = time;
    }
    if (time > maxTime) {
      maxTime = time;
    }
  });

  return { minTime, maxTime };
}

function parseTime(timeString) {
  const [hours, minutes, seconds] = timeString.split(':');
  const [sec, ms] = seconds.split(',');
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(sec) +
    parseInt(ms) / 1000
  );
}

function renderSubtitleEditor(subtitles) {
  const editor = document.getElementById('subtitle-editor');
  editor.innerHTML = '';

  subtitles.forEach((subtitle, index) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'subtitle-line';

    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = subtitle.id;

    const startInput = document.createElement('input');
    startInput.type = 'text';
    startInput.value = subtitle.start;

    const endInput = document.createElement('input');
    endInput.type = 'text';
    endInput.value = subtitle.end;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = subtitle.text;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
      subtitle.start = parseFloat(startInput.value);
      subtitle.end = parseFloat(endInput.value);
      subtitle.text = textInput.value;
      alert('Subtitle updated!');
    });

    lineDiv.appendChild(idInput);
    lineDiv.appendChild(startInput);
    lineDiv.appendChild(endInput);
    lineDiv.appendChild(textInput);
    lineDiv.appendChild(saveButton);

    editor.appendChild(lineDiv);
  });
}

function updateSubtitleOverlay(currentTime) {
  const overlay = document.getElementById('subtitle-overlay');
  if (
    currentSubtitleIndex < subtitles.length &&
    currentTime >= subtitles[currentSubtitleIndex].start &&
    currentTime <= subtitles[currentSubtitleIndex].end
  ) {
    overlay.textContent = subtitles[currentSubtitleIndex].text;
  } else if (
    currentSubtitleIndex < subtitles.length &&
    currentTime > subtitles[currentSubtitleIndex].end
  ) {
    currentSubtitleIndex++;
    overlay.textContent = '';
  } else if (
    currentSubtitleIndex > 0 &&
    currentTime < subtitles[currentSubtitleIndex - 1].start
  ) {
    currentSubtitleIndex--;
    overlay.textContent = '';
  }
}


function findMinTime(subtitles, start, end) {
  let minTime = Infinity;

  subtitles.forEach((subtitle) => {
    if (subtitle.start >= start && subtitle.end <= end) {
      minTime = Math.min(minTime, subtitle.start);
    }
  });

  return minTime === Infinity ? null : minTime; // Return null if no valid time is found
}