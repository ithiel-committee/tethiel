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
        # titleトラックの末尾ジングル・無音の除去 (84.0秒でカット＆スムーズフェードアウト)
        if t["id"] == "title":
            temp_clean = "public/audio/bgm/temp_clean_title.mp3"
            cmd_trim = [
                ffmpeg_exe, "-y",
                "-i", out_file,
                "-t", "84.0",
                "-af", "afade=t=out:st=83.3:d=0.7",
                "-b:a", "96k",
                temp_clean
            ]
            if subprocess.run(cmd_trim).returncode == 0:
                os.replace(temp_clean, out_file)
        sz = os.path.getsize(out_file)
        print(f"Successfully generated {out_file}: {sz / 1024:.1f} KB")
    else:
        print(f"Failed to process {t['id']}")
