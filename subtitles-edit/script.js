document.getElementById('load-video').addEventListener('click', () => {
  const videoUrl = document.getElementById('video-url').value;
  //const videoId = extractYouTubeVideoId(videoUrl);
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
  if (file && file.type === 'text/vtt') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const subtitles = parseWebVTT(e.target.result);
      renderSubtitleEditor(subtitles);
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid WebVTT file.');
  }
});

function extractYouTubeVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^?&]+)/;
  const match = url.match(regex);
  return match ? match[1] || match[2] : null;
}

function parseWebVTT(vttContent) {
  const lines = vttContent.split('\n');
  const subtitles = [];
  let currentSubtitle = null;

  lines.forEach((line) => {
    if (line.includes('-->')) {
      const [start, end] = line.split(' --> ');
      currentSubtitle = { start: start.trim(), end: end.trim(), text: '' };
    } else if (line.trim() === '') {
      if (currentSubtitle) {
        subtitles.push(currentSubtitle);
        currentSubtitle = null;
      }
    } else if (currentSubtitle) {
      currentSubtitle.text += line.trim() + ' ';
    }
  });

  return subtitles;
}

function renderSubtitleEditor(subtitles) {
  const editor = document.getElementById('subtitle-editor');
  editor.innerHTML = '';

  subtitles.forEach((subtitle, index) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'subtitle-line';

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

    lineDiv.appendChild(startInput);
    lineDiv.appendChild(endInput);
    lineDiv.appendChild(textInput);
    lineDiv.appendChild(saveButton);

    editor.appendChild(lineDiv);
  });
}