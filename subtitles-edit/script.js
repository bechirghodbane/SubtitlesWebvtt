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
});

document.getElementById('subtitle-file').addEventListener('change', (event) => {
  const file = event.target.files[0];
  console.log(file.type)
  //if (file && file.type === 'text/plain') {
  if (file) {

    const reader = new FileReader();
    reader.onload = (e) => {
      const subtitles = parseSRT(e.target.result);
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
  const lines = srtContent.split('\n');
  const subtitles = [];
  let currentSubtitle = null;
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex].trim();

    if (line !== '' && !isNaN(line)) {
      // Subtitle index (e.g., "1", "2", etc.)
      currentSubtitle = { id:line , start: '', end: '', text: '' };
    } else if (line.includes('-->')) {
      // Time range (e.g., "00:00:01,000 --> 00:00:04,000")
      const [start, end] = line.split(' --> ');
      currentSubtitle.start = start.trim();
      currentSubtitle.end = end.trim();
    } else if (line === '') {
      // Empty line indicates the end of a subtitle block
      if (currentSubtitle) {
        subtitles.push(currentSubtitle);
        currentSubtitle = null;
      }
    } else if (currentSubtitle) {
      // Subtitle text
      currentSubtitle.text += line + ' ';
    }

    lineIndex++;
  }

  return subtitles;
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
      subtitle.start = startInput.value;
      subtitle.end = endInput.value;
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