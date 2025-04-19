import re
import streamlit as st

def time_to_seconds(time_str):
    """Converts a time string (HH:MM:SS.mmm) to seconds."""
    milliseconds = float(time_str.split('.')[1])
    time_str = time_str.split('.')[0]
    hours, minutes, seconds = map(float, time_str.split(':'))
    return hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds

def filter_line_timestamps(parsed_line):
    if parsed_line is None:
        return None
    start_time = time_to_seconds(parsed_line['start_time'])
    end_time = time_to_seconds(parsed_line['end_time'])
    diff = end_time - start_time
    if diff > 20:
        return parsed_line
    else:
        return None

def parse_vtt_timestamp_line(line):
    pattern = re.compile(
        r"(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})"
        r"(.*)"  # Capture any remaining attributes
    )
    match = pattern.search(line)

    if match:
        result = {
            'start_time': match.group(1),
            'end_time': match.group(2)
        }
        attributes = match.group(3).strip().split()  # Split attributes string into a list
        for attr in attributes:
            if '=' in attr:
                key, value = attr.split('=', 1)  # Split only at the first '='
                result[key] = value
        return result
    else:
        return None

def parse_vtt_file_to_words(file_content):
    """
    Parses a VTT file to extract word-by-word subtitles.

    Args:
        file_content: The content of the VTT file as a string.

    Returns:
        A list of tuples, where each tuple contains a word and its corresponding timestamp.
    """
    results = []
    lines = file_content.strip().split('\n')
    slected_line_timestamp = None
    for line in lines:
        line_timestamps = filter_line_timestamps(parse_vtt_timestamp_line(line))
        if line_timestamps is not None:
            slected_line_timestamp = line_timestamps

        if '<c>' in line:
            parts = re.split(r'(<c>)?([^<]+)(</c>)?(?:<0*(\d{2}:\d{2}:\d{2}\.\d{3})>)?', line)
            start_timestamp = slected_line_timestamp['start_time']
            word = ""

            for part in parts:
                if not part:
                    continue  # Skip empty strings

                if re.match(r'\d{2}:\d{2}:\d{2}\.\d{3}', part):
                    if word:
                        results.append((word, start_timestamp, part))
                    start_timestamp = part
                    word = ""
                elif part != '<c>' and part != '</c>':
                    word += part
            if word:
                results.append((word, start_timestamp, slected_line_timestamp['end_time']))
    return results

# Streamlit app
st.title("VTT File Parser")

uploaded_file = st.file_uploader("Upload a VTT file", type=["vtt"])

if uploaded_file is not None:
    file_content = uploaded_file.read().decode("utf-8")
    word_list = parse_vtt_file_to_words(file_content)

    st.write("Parsed Words and Timestamps:")
    for item in word_list:
        st.write(item)