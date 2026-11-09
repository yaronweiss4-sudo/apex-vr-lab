"""Assemble the APEX VR lab (ready for GitHub Pages) → dist/vr (or argv[1]) from:
   - the hydraulics engine shared with the website (src/engine: core_pre3d.js + core_3d.js + audio.js)
   - lab code (src/labs/lab_XX.js) → labs/chXX.js
   - the VR platform (src/vr)
   - vendor/three-vr.js and hand/controller models from tools/npm/node_modules
"""
import os, re, shutil, base64, json, sys
from paths import *

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else DIST_VR
NM = NODE_MODULES
if OUT.exists(): shutil.rmtree(OUT)
for d in ['vendor','engine','labs','platform','assets/hands','assets/profiles']: os.makedirs(OUT/d, exist_ok=True)

# 1. 3D library with WebXR add-ons
shutil.copy(VENDOR/'three-vr.js', OUT/'vendor'/'three-vr.js')
# 2. engine (shared by every lab)
eng = '/* APEX hydraulics engine – shared by the website and the VR lab */\n' + read(ENGINE/'core_pre3d.js') + '\n' + read(ENGINE/'core_3d.js')
write(OUT/'engine'/'engine.js', eng)
# 3. labs: block-wrapped, registered in window.LABS
cfg = read(VRSRC/'stations.js')
files = re.findall(r"labs/ch(\d\d)\.js", cfg.split('parts:')[0])
for n in sorted(set(files)):
    code = lab_code(n).rstrip()
    code = re.sub(r'\n\s*boot\(\);\s*$', '', code)
    code, k = re.subn(r'\bconst LAB=(\{.*?\});\s*$', r'LABS.push(\1);', code, flags=re.S|re.M)
    if k != 1: raise SystemExit(f'lab {n}: LAB definition not found')
    write(OUT/'labs'/f'ch{n}.js', f'/* lab {int(n)} – same code as the website */\n{{\n{code}\n}}\n')
# 4. schematic CSS for the live ISO drawing (svg rules only)
css = read(ENGINE/'orig.css') + '\n' + read(ENGINE/'ui2.css')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
keep = []; tok = re.compile(r'(^|[\s,>])(\.(sy|syf|syb|oil|load|st|pl|plh|jd|pt|cmp|clbl|tag\w*|lead|schsvg|pil2|drn2|bub|gv|spool|s|b|b2|thin|thick|run|rr|dash|pil|drn)\b|:root)')
for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
    sel, body = m.group(1).strip(), m.group(2)
    if tok.search(' '+sel) and not re.search(r'#|details|button|input|label|header|nav|\.r\b|\.kpi|\.row|\.note', sel): keep.append(f'{sel}{{{body}}}')
sch_css = '\n'.join(keep) + '\n.cmp.hl{filter:none}text{font-family:Heebo,Arial,sans-serif}'
write(OUT/'platform'/'sch_css.js', 'window.VRP=window.VRP||{};VRP.SCH_CSS=' + json.dumps(sch_css, ensure_ascii=False) + ';\n')
# 5. platform + page + configuration (audio.js comes from the engine – one copy for website and VR)
shutil.copy(ENGINE/'audio.js', OUT/'platform'/'audio.js')
for f in ['ui.js','board.js','station.js','platform.js']: shutil.copy(VRSRC/'platform'/f, OUT/'platform'/f)
shutil.copy(VRSRC/'index.html', OUT/'index.html'); shutil.copy(VRSRC/'stations.js', OUT/'stations.js')
if (VRSRC/'README.md').exists(): shutil.copy(VRSRC/'README.md', OUT/'README.md')
os.makedirs(OUT/'tools', exist_ok=True)
shutil.copy(ROOT/'tools'/'build_vr.py', OUT/'tools'/'build_vr.py')
shutil.copy(TESTS/'xrtest.js', OUT/'tools'/'xrtest.js')
shutil.copy(TESTS/'vrall.js', OUT/'tools'/'test_all_stations.js')
shutil.copy(TESTS/'_lib.js', OUT/'tools'/'_lib.js')   # paths + local server for the two tests above
write(OUT/'.nojekyll', '')
# 6. assets: hand models, controller models, logo
P = NM/'@webxr-input-profiles'/'assets'/'dist'/'profiles'
if not P.exists(): raise SystemExit('missing hand/controller models – run "npm install" in tools/npm')
for h in ['left.glb','right.glb']: shutil.copy(P/'generic-hand'/h, OUT/'assets'/'hands'/h)
shutil.copy(P/'profilesList.json', OUT/'assets'/'profiles'/'profilesList.json')
for prof in ['meta-quest-touch-plus','generic-hand']: shutil.copytree(P/prof, OUT/'assets'/'profiles'/prof)
m = re.search(r'alt="APEX TRAINING[^"]*" src="data:image/png;base64,([^"]+)"', read(HUB))
(OUT/'assets'/'logo.png').write_bytes(base64.b64decode(m.group(1)))
tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
print('vr: built', OUT, f'{tot/1e6:.2f} MB', 'labs:', len(set(files)), 'sch css rules:', len(keep))
