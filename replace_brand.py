from pathlib import Path

root = Path(r'C:\Excelora All Website\SparkleLove')
exclude_dirs = {'node_modules', '.git', 'dist', 'client\\node_modules', 'server\\node_modules'}
skip_files = {root / 'server' / '.env', root / '.env'}
replacements = [
    ('Excelora Classes Private Limited', 'Elovia Love Private Limited'),
    ('Excelora Classes Editorial Team', 'Elovia Love Editorial Team'),
    ('Excelora Classes Team', 'Elovia Love Team'),
    ('Excelora Classes Dating App', 'Elovia Love Dating App'),
    ('https://www.exceloraclasses.com/', 'https://elovialove.onrender.com/'),
    ('https://exceloraclasses.com/', 'https://elovialove.onrender.com/'),
    ('https://www.exceloraclasses.com', 'https://elovialove.onrender.com'),
    ('https://exceloraclasses.com', 'https://elovialove.onrender.com'),
    ('www.exceloraclasses.com', 'www.elovialove.onrender.com'),
    ('exceloraclasses.com', 'elovialove.onrender.com'),
    ('exceloraclasses-server', 'elovialove-server'),
    ('exceloraclasses', 'elovialove'),
    ('Excelora Classes', 'Elovia Love'),
    ('excelora classes', 'elovia love'),
    ('Excelora-Classes', 'Elovia-Love'),
    ('excelora-classes', 'elovia-love'),
    ('excelora_classes', 'elovia_love'),
    ('Excelora', 'Elovia'),
    ('excelora', 'elovia'),
]
file_exts = {'.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.yml', '.yaml', '.txt'}
changed_files = []
for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path in skip_files:
        continue
    if any(part in exclude_dirs for part in path.parts):
        continue
    if path.suffix.lower() not in file_exts:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    original = text
    for old, new in replacements:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding='utf-8')
        changed_files.append(str(path.relative_to(root)))
print('Replaced strings in', len(changed_files), 'files')
for p in changed_files:
    print(p)
