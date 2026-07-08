import os
import subprocess
import json
import sys
from telethon import TelegramClient, events

# --- AUTO-INSTALL FFMPEG SYSTEM (SUDO FALLBACK) ---
try:
    subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
except FileNotFoundError:
    print("FFmpeg nahi mila! Re-install karne ki koshish kar rahe hain...")
    os.system("apt-get update -y && apt-get install ffmpeg -y < /dev/null")
    os.system("apk add ffmpeg < /dev/null")

# --- CONFIGURATION ---
API_ID = 34801155        
API_HASH = 'd7846c4d0f2c343dd5b67c80d45409e8' 
BOT_TOKEN = '8808145635:AAF-T-nhhmaiIYWPxtbFfa-H5CnQXbFhsdc' 

TARGET_CHANNEL = -1003895453478  
CHANNEL_TEXT_NAME = "@AllstoryFM2"  
# ---------------------

client = TelegramClient('multi_compressor_bot', API_ID, API_HASH).start(bot_token=BOT_TOKEN)

def get_audio_duration(file_path):
    try:
        # Pella server par exact path check karne ke liye backup list
        ffprobe_path = "ffprobe"
        if os.path.exists("/usr/bin/ffprobe"): ffprobe_path = "/usr/bin/ffprobe"
        elif os.path.exists("/usr/local/bin/ffprobe"): ffprobe_path = "/usr/local/bin/ffprobe"

        cmd = f'{ffprobe_path} -v error -show_entries format=duration -of default=noprint_wrappers=1:key=value -of json "{file_path}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        data = json.loads(result.stdout)
        return float(data['format']['duration'])
    except Exception:
        return 0

@client.on(events.NewMessage(incoming=True))
async def handle_new_message(event):
    is_audio = event.message.audio is not None
    is_video = event.message.video is not None

    if not (is_audio or is_video):
        return  

    status_msg = await event.reply("File mil gayi hai, dynamic calculation chalu hai... ⏳")
    
    orig_filename = event.message.file.name or ("video.mp4" if is_video else "audio.mp3")
    input_path = f"input_{orig_filename}"
    output_path = f"compressed_{orig_filename}"

    try:
        await event.download_media(file=input_path)

        final_bitrate = 64 

        if is_audio:
            duration_seconds = get_audio_duration(input_path)
            duration_minutes = duration_seconds / 60

            if duration_seconds > 0:
                # --- AUTOMATIC BITRATE CALCULATION ---
                target_size_bytes = 11 * 1024 * 1024  
                calculated_bitrate = int((target_size_bytes * 8) / (duration_seconds * 1024))
                
                if calculated_bitrate > 96: final_bitrate = 96
                elif calculated_bitrate < 24: final_bitrate = 24
                else: final_bitrate = calculated_bitrate
            else:
                # FALLBACK SYSTEM: Agar FFprobe na chale toh size ke hisab se automatic bitrate chunna
                input_size_mb = os.path.getsize(input_path) / (1024 * 1024)
                if input_size_mb > 50: final_bitrate = 32  
                elif input_size_mb > 25: final_bitrate = 48
                else: final_bitrate = 64

            bitrate_str = f"{final_bitrate}k"
            await status_msg.edit(f"Processing Audio | Bitrate Auto-Set: {bitrate_str}... ⏳")
            
            # FFmpeg exact path dhoondna
            ffmpeg_path = "ffmpeg"
            if os.path.exists("/usr/bin/ffmpeg"): ffmpeg_path = "/usr/bin/ffmpeg"
            elif os.path.exists("/usr/local/bin/ffmpeg"): ffmpeg_path = "/usr/local/bin/ffmpeg"

            cmd = f'{ffmpeg_path} -y -i "{input_path}" -b:a {bitrate_str} "{output_path}"'
        
        elif is_video:
            ffmpeg_path = "ffmpeg"
            if os.path.exists("/usr/bin/ffmpeg"): ffmpeg_path = "/usr/bin/ffmpeg"
            cmd = f'{ffmpeg_path} -y -i "{input_path}" -vcodec libx264 -crf 28 -preset faster -acodec mp3 -b:a 64k "{output_path}"'

        # Server hang na ho isliye priority automatic low rakhi hai
        try:
            subprocess.run('nice -n 19 ' + cmd, shell=True, check=True)
        except Exception:
            subprocess.run(cmd, shell=True, check=True)

        file_size_bytes = os.path.getsize(output_path)
        file_size_mb = round(file_size_bytes / (1024 * 1024), 2)

        custom_caption = (
            f">>JOIN > {CHANNEL_TEXT_NAME} 🔥\n"
            f"✅✨\n\n"
            f"👉 FILE SIZE :- {file_size_mb} MB 👑\n"
            f"🔥"
        )

        await client.send_file(TARGET_CHANNEL, file=output_path, caption=custom_caption, supports_streaming=True if is_video else False)
        await status_msg.edit("Done! ✅ File channel mein bhej di gayi hai.")

    except Exception as e:
        await status_msg.edit(f"Kuch galti hui: {str(e)}")
    
    finally:
        if os.path.exists(input_path):
            try: os.remove(input_path)
            except: pass
        if os.path.exists(output_path):
            try: os.remove(output_path)
            except: pass

print("Bot ready hai...")
client.run_until_disconnected()
