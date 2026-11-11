#!/usr/bin/env python3
from pathlib import Path
import argparse,json,shutil,subprocess,sys,zipfile
ROOT=Path(__file__).resolve().parent
VERSION=(ROOT/'VERSION').read_text().strip()
DIST=ROOT/'dist'
TESTS=['test-api-layer.js','test-field-policy.js','test-folder-depth.js','test-folder-permissions.js','test-two-step-login.js','test-network-auth-encoding.js']
def run_checks():
    for script in TESTS: subprocess.run(['node',str(ROOT/'tests'/script)],check=True)
    for script in ['validate_api_layer.py','validate_options.py']: subprocess.run([sys.executable,str(ROOT/script)],check=True)
    for mf in ['manifest.chromium.json','manifest.firefox.json']:
        data=json.loads((ROOT/mf).read_text()); assert data['version']==VERSION; assert data['homepage_url']=='https://github.com/5iggi/teampass-web-connector'
    print('All checks passed.')
def zip_dir(folder,out):
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for f in sorted(folder.rglob('*')):
            if f.is_file(): z.write(f,f.relative_to(folder))
def build():
    if DIST.exists(): shutil.rmtree(DIST)
    DIST.mkdir()
    for target,mf,ext in [('chromium','manifest.chromium.json','zip'),('firefox','manifest.firefox.json','xpi')]:
        folder=DIST/target; shutil.copytree(ROOT/'src',folder); shutil.copy2(ROOT/mf,folder/'manifest.json')
        zip_dir(folder,DIST/f'teampass-web-connector-{target}-{VERSION}.{ext}')
    print(f'Build completed in {DIST}')
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--check',action='store_true',help='run tests only'); args=ap.parse_args()
    run_checks()
    if not args.check: build()
