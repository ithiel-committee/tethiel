import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Using ffmpeg: {ffmpeg_exe}")

os.makedirs("public/audio/bgm", exist_ok=True)

tracks = [
    {
        "id": "title",
        "url": "https://www.youtube.com/watch?v=xW1cyHu-Bog",
        "output": "public/audio/bgm/bgm_title.mp3",
    },
    {
        "id": "game",
        "url": "https://www.youtube.com/watch?v=mit5CYgctLQ",
        "output": "public/audio/bgm/bgm_game.mp3",
    },
    {
        "id": "story",
        "url": "https://youtu.be/Y2qWBZQT3go",
        "output": "public/audio/bgm/bgm_story.mp3",
    },
]

for t in tracks:
    out_file = t["output"]
    temp_template = f"public/audio/bgm/temp_{t['id']}.%(ext)s"
    print(f"\n--- Downloading {t['id']} from {t['url']} ---")
    cmd_dl = [
        "python", "-m", "yt_dlp",
        "--ffmpeg-location", ffmpeg_exe,
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "96K",
        "-o", out_file,
        "--force-overwrites",
        t["url"]
    ]
    res = subprocess.run(cmd_dl)
    if res.returncode == 0:
        sz = os.path.getsize(out_file)
        print(f"Successfully generated {out_file}: {sz / 1024:.1f} KB")
    else:
        print(f"Failed to process {t['id']}")
