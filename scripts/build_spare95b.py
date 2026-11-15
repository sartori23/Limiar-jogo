#!/usr/bin/env python3
"""Etapa B — restaura exatamente o MP3 fornecido pelo usuário.
GitHub armazena 14 blocos binários para evitar limites de transferência.
O arquivo publicado é o MP3 ORIGINAL, sem conversão/YouTube.
"""
import hashlib,sys,subprocess
from pathlib import Path
site=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
parts=Path('assets/audio95')
all_parts=sorted(parts.glob('part_*.bin'))
assert len(all_parts)==14,(len(all_parts),all_parts)
expected_size=10486595
sha='bd29dd14739d9c174b2048bac7afc9de62ef5e4c9952eb7f8f0f83787c0f64d6'
song=site/'spare-hearts.mp3'
digest=hashlib.sha256()
size=0
with song.open('wb') as handle:
    for i,part in enumerate(all_parts):
        assert part.name==f'part_{i:02d}.bin',part.name
        data=part.read_bytes()
        if i<13:assert len(data)==750000,(part,len(data))
        handle.write(data);digest.update(data);size+=len(data)
assert size==expected_size,(size,expected_size)
assert digest.hexdigest()==sha,(digest.hexdigest(),sha)
duration=subprocess.check_output(['ffprobe','-v','error','-show_entries',
        'format=duration','-of','default=nokey=1:noprint_wrappers=1',str(song)],text=True).strip()
assert 261.5<float(duration)<263.0,duration
print('SPARE HEARTS ORIGINAL VALIDADO:',size,'bytes,',duration,'s, sha256=',sha,flush=True)
