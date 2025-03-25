import re

def time_to_seconds(time_str):
        """Converts a time string (HH:MM:SS.mmm) to seconds."""
        milliseconds = float(time_str.split('.')[1])
        time_str = time_str.split('.')[0]
        hours, minutes, seconds = map(float, time_str.split(':'))
        return hours * 3600 * 1000 + minutes * 60 *1000 + seconds * 1000 + milliseconds

def filter_line_timestamps(parsed_line):
    print(f'parsed_line :{parsed_line}')
    if parsed_line is None:
        return None
    start_time = time_to_seconds(parsed_line['start_time'])
    end_time = time_to_seconds(parsed_line['end_time'])
    diff = end_time - start_time
    if diff > 20:
        print(f'timestamp not filtred : {diff}')
        return parsed_line
    else:
        print(f'timestamp filtred : {diff}')
        return None

def parse_vtt_timestamp_line(line):
    """
    Parses a VTT timestamp line to extract start time, end time, and attributes.

    Args:
        line: A string representing a VTT timestamp line.

    Returns:
        A dictionary containing the extracted information.
        For example:
        {
            'start_time': '00:00:00.040',
            'end_time': '00:00:02.230',
            'align': 'start',
            'position': '100%'
        }
    """

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
        return None  # Or raise an exception, depending on your error handling


def parse_vtt_file_to_words(file_path):
    """
    Parses a VTT file to extract word-by-word subtitles.

    Args:
        file_path: The path to the VTT file.

    Returns:
        A list of tuples, where each tuple contains a word and its corresponding timestamp.
        For example:
        [
            ('هو', '00:00:00.160'),
            ('ما', '00:00:00.280'),
            ('فاتك', '00:00:00.599'),
            ('حتى', '00:00:00.799'),
            ('شيء', '00:00:01.040'),
            ('بالعكس', '00:00:01.520'),
            ('العشر', '00:00:01.880'),
            ('لالي', None)  # Handle the last word without a timestamp
        ]
    """

    results = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            vtt_content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return

    lines = vtt_content.strip().split('\n')
    
    for line in lines:
        slected_line_timestamp = None
        line_timestamps = filter_line_timestamps(parse_vtt_timestamp_line(line))
        if line_timestamps is not None:
            slected_line_timestamp = line_timestamps

        
        parts = re.split(r'(<c>)?([^<]+)(</c>)?(?:<0*(\d{2}:\d{2}:\d{2}\.\d{3})>)?', line)
        
        current_timestamp = None
        word = ""

        for part in parts:
            if not part:
                continue  # Skip empty strings

            if re.match(r'\d{2}:\d{2}:\d{2}\.\d{3}', part):
                if word:
                    results.append((word, current_timestamp))
                current_timestamp = part
                word = ""
            elif part != '<c>' and part != '</c>':
                word += part
        #if word:
        #    results.append((word, current_timestamp))
    return results

# Example Usage (replace 'your_file.vtt' with the actual path to your file):
file_path = '/app/input.ar.vtt'  #  <--- REPLACE THIS WITH YOUR FILE PATH
word_list = parse_vtt_file_to_words(file_path)

for item in word_list:
    print(item)