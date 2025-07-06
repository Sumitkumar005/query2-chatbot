#!/usr/bin/env python3
import sys
import json
from gtts import gTTS
from io import BytesIO

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        text = data['text']
        language = data.get('language', 'en')
        
        # Generate TTS
        tts = gTTS(text=text, lang=language, slow=False)
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Output binary audio data
        sys.stdout.buffer.write(audio_buffer.read())
        
    except Exception as e:
        print(f"TTS Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
