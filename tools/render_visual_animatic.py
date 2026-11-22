#!/usr/bin/env python3
"""Render a review-only 9:16 image-first animatic; NEVER declares editorial approval.

The still images and scene narration must be assets from the approved project source.
No soundtrack is generated here; later audio QA and final motion rendering are separate.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import subprocess
import math

W, H, FPS = 720, 1280, 20
BORDER=54
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def text_lines(draw, text, font, max_width):
    lines=[]; line=''
    for word in text.split():
        new=(line+' '+word).strip()
        if draw.textbbox((0,0),new,font=font)[2] <= max_width:
            line=new
        else:
            if line:lines.append(line)
            line=word
    if line:lines.append(line)
    return lines


def overlay(scene_index, title, narration):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    label=ImageFont.truetype(BOLD,24)
    heading=ImageFont.truetype(BOLD,29)
    subtitle=ImageFont.truetype(FONT,34)
    small=ImageFont.truetype(BOLD,19)
    d.rounded_rectangle((45,76, W-45,164),radius=23,fill=(3,24,49,183),outline=(241,197,78,90),width=2)
    d.text((70,92),f'SCENE {scene_index:02}',font=label,fill=(249,208,87,255))
    d.text((215,90),title.title(),font=heading,fill=(247,249,255,255))
    # Footer is intentionally well above the bottom app UI/safe area.
    lines=text_lines(d,narration,subtitle,W-125)
    line_h=48
    caption_height=60+len(lines)*line_h
    bottom=H-112;top=bottom-caption_height
    d.rounded_rectangle((44,top,W-44,bottom),radius=24,fill=(4,20,37,204),outline=(255,255,255,50),width=1)
    for i,line in enumerate(lines):
        bb=d.textbbox((0,0),line,font=subtitle)
        x=(W-(bb[2]-bb[0]))/2
        d.text((x,top+26+i*line_h),line,font=subtitle,fill=(255,255,255,255),stroke_width=1,stroke_fill=(11,25,38,190))
    d.rounded_rectangle((460,194,680,233),radius=11,fill=(1,15,30,145))
    d.text((474,202),'DRAFT - SILENT',font=small,fill=(255,224,163,255))
    return np.array(im)


def frame_for(image, i, total, idx, hud, sparkles=True):
    phase=i/max(1,total-1)
    scale=1.015+phase*.072
    # Floating dolly/pan; no warping of the characters, preserving original image.
    szW=round(W*scale);szH=round(H*scale)
    # OpenCV accepts BGR input; scaling is based on near-native 9:16 image.
    zoom=cv2.resize(image,(szW,szH),interpolation=cv2.INTER_LINEAR)
    dx=szW-W;dy=szH-H
    horizontal_bias=[.35,.56,.40,.61,.45,.53][idx%6]
    x=max(0,min(dx,round(dx*(horizontal_bias+(.14*math.sin(math.pi*phase))))))
    y=max(0,min(dy,round(dy*(.34+.22*phase))))
    canvas=zoom[y:y+H,x:x+W,:]
    # Convert numpy overlay to BGR in an alpha-safe step.
    a=hud[:,:,3:4].astype(np.float32)/255
    rgb=hud[:,:,:3][:,:,::-1].astype(np.float32)
    out=(canvas.astype(np.float32)*(1-a)+rgb*a).astype(np.uint8)
    if sparkles:
        # Sparse motion graphics fairy-dust points for a review animatic, not lip sync/character rigging.
        for dot in range(9):
            theta=phase*2*math.pi + dot*1.54 + idx*.6
            px=round(140+dot*46+18*math.sin(theta))
            py=round(320+dot*53+18*math.cos(theta))
            if py<top_protected:
                cv2.circle(out,(px,py),1 if dot%2 else 2,(94,208,255),-1,cv2.LINE_AA)
    return out

top_protected=820


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--output',required=True)
    parser.add_argument('--contact-sheet',required=True)
    args=parser.parse_args()
    manifest=json.loads(Path(args.manifest).read_text(encoding='utf-8'))
    scenes=manifest['scenes']
    assert len(scenes)==6
    assert sum(int(x['duration_seconds']) for x in scenes)==50
    temp=Path(args.output).parent;temp.mkdir(parents=True,exist_ok=True)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','bgr24','-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',args.output]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    thumbnails=[]
    try:
        for idx,item in enumerate(scenes):
            path=Path(item['source_image'])
            digest=hashlib.sha256(path.read_bytes()).hexdigest()
            assert digest==item['sha256'],f'image hash mismatch scene {idx+1}'
            with Image.open(path) as im:
                assert im.size==(941,1672)
                base=np.array(im.convert('RGB'))[:,:,::-1].copy()
            base=cv2.resize(base,(W,H),interpolation=cv2.INTER_AREA)
            hud=overlay(idx+1,item['title'],item['narration'])
            duration=int(item['duration_seconds']);count=duration*FPS
            thumbnails.append(cv2.cvtColor(frame_for(base,count//2,count,idx,hud),cv2.COLOR_BGR2RGB))
            for f in range(count):
                proc.stdin.write(frame_for(base,f,count,idx,hud).tobytes())
            print(f'Rendered {idx+1}/6: {item["title"]} ({duration}s)',flush=True)
    finally:
        if proc.stdin:
            proc.stdin.close()
    status=proc.wait()
    if status!=0:
        raise RuntimeError('ffmpeg failed: '+proc.stderr.read().decode(errors='replace'))
    sheet=Image.new('RGB',(3*360,2*680),(235,239,243))
    for idx,raw in enumerate(thumbnails):
        thumb=Image.fromarray(raw).resize((360,640),Image.Resampling.LANCZOS)
        x=(idx%3)*360;y=(idx//3)*680
        sheet.paste(thumb,(x,y+40))
        ImageDraw.Draw(sheet).text((x+10,y+7),f'S{idx+1:02}',font=ImageFont.truetype(BOLD,24),fill=(35,63,91))
    sheet.save(args.contact_sheet)
    print('OUTPUT',args.output,'BYTES',Path(args.output).stat().st_size,flush=True)

if __name__=='__main__':
    main()
