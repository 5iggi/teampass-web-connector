from pathlib import Path
from html.parser import HTMLParser
import json,re,sys
class P(HTMLParser):
 def __init__(self): super().__init__(); self.ids={}; self.i18n=[]; self.stack=[]; self.bad=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs); self.stack.append(tag)
  if 'id' in a:self.ids[a['id']]=tag
  if 'data-i18n' in a:
   self.i18n.append(a['data-i18n'])
   if tag in {'label','div','section','form'}:self.bad.append((tag,a['data-i18n']))
 def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs); self.stack.pop()
 def handle_endtag(self,tag):
  if self.stack:self.stack.pop()
html=Path('src/options.html').read_text();p=P();p.feed(html)
required={'form','masterPassphrase','unlockVault','lockVault','vaultState','serverUrl','login','authMode','passwordFields','apiKey','password','tokenFields','pat','test','autoCacheEnabled','cacheRefreshMinutes','vaultLockMinutes','autoSavePrompt','showPendingBadge','collapseFolders','folderSearchDepth','itemUrlTemplate','clipboardClearSeconds','passwordLength','httpAuthEnabled','httpAuthTestUrl','httpAuthTest','httpAuthLog','httpAuthCacheBuild','httpAuthCacheStatus','httpAuthOutput','apiSelfTest','apiSelfTestOutput','status'}
errors=[]
if required-set(p.ids):errors.append('Missing IDs: '+', '.join(sorted(required-set(p.ids))))
if p.bad:errors.append('data-i18n on container would delete fields: '+repr(p.bad))
for lang in ['de','en']:
 d=json.loads(Path(f'src/_locales/{lang}/messages.json').read_text())
 missing=set(p.i18n)-set(d)
 if missing:errors.append(f'Missing {lang} translations: '+', '.join(sorted(missing)))
js=Path('src/options.js').read_text();jsids=set(re.findall(r"byId\('([^']+)'\)",js));missing_dom=jsids-set(p.ids)
if missing_dom:errors.append('options.js IDs missing from HTML: '+', '.join(sorted(missing_dom)))
if errors:print('\n'.join(errors));sys.exit(1)
print(f'Options validation: PASS ({len(p.ids)} IDs, {len(set(p.i18n))} localized keys, diagnostic output present)')
