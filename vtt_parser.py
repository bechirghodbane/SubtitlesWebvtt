import re

def parse_vtt_file_to_words(file_path):
    """
    Parses a VTT file to extract word-by-word subtitles.

    Args:
        file_path: The path to the VTT file.

    Returns:
        A list of dictionaries, where each dictionary contains a word and its timestamp.
        For example:
        [
            {'word': 'هو', 'timestamp': '00:00:00.160'},
            {'word': 'ما', 'timestamp': '00:00:00.280'},
            {'word': 'فاتك', 'timestamp': '00:00:00.599'},
            ...
        ]
    """

    words = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            vtt_content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return

    lines = vtt_content.strip().split('\n')
    
    for line in lines:
        # Extract words with timestamps using regex
        matches = re.findall(r'<c>([^<]+)</c>', line)
        timestamp_matches = re.findall(r'({2}:{2}:{2}\.{3})', line)
        
        if matches and timestamp_matches:
            for i, match in enumerate(matches):
                words.append({'word': match, 'timestamp': timestamp_matches[i]})
    return words

# Example Usage (replace 'your_file.vtt' with the actual path to your file):
file_path = '/app/input.ar.vtt'  #  <--- REPLACE THIS WITH YOUR FILE PATH
word_list = parse_vtt_file_to_words(file_path)

for item in word_list:
    print(item)