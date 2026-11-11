from pathlib import Path
import re,sys,json
root=Path(__file__).parent/'src'; api=(root/'teampass-api.js').read_text(); bg=(root/'background.js').read_text()
required={'authorize','authorizeToken','itemFindByUrl','itemGet','itemsInFolders','itemCreate','itemUpdate','writableFolders','listFolders','folderCreate'}
block=re.search(r'endpoints:\s*Object\.freeze\(\{(.*?)\}\)',api,re.S)
defined=set(re.findall(r'\b([A-Za-z]\w*)\s*:',block.group(1))) if block else set()
used=set(re.findall(r"TP_API\.route\('([^']+)'",bg))
errors=[]
if required-defined: errors.append('Missing endpoint definitions: '+', '.join(sorted(required-defined)))
if used-defined: errors.append('Application uses undefined endpoints: '+', '.join(sorted(used-defined)))
if required-used-{'authorize','authorizeToken'}: errors.append('Central endpoints not exercised by application: '+', '.join(sorted(required-used-{'authorize','authorizeToken'})))
patterns=[r'api/index\.php',r'(?:item|folder)/(?:findByUrl|get|inFolders|create|update|writableFolders|listFolders)']
for p in root.glob('*.js'):
 if p.name=='teampass-api.js': continue
 for pat in patterns:
  if re.search(pat,p.read_text()): errors.append(f'Non-central API literal in {p.name}: {pat}')
if errors: print('\n'.join(errors));sys.exit(1)
print(f'Central API completeness: PASS ({len(defined)} endpoints, {len(used)} used routes)')
