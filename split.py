import os

with open('INDEX.html', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

css_lines = []
in_css = False
js_lines = []
in_js = False

html_out = []

for line in lines:
    if '<style>' in line:
        in_css = True
        html_out.append(line[:line.find('<style>')])
        html_out.append('<link rel="stylesheet" href="css/styles.css">')
        continue
    if '</style>' in line:
        in_css = False
        continue
        
    if '<script>' in line:
        in_js = True
        html_out.append(line[:line.find('<script>')])
        html_out.append('<script src="js/config.js"></script>')
        html_out.append('<script src="js/traffic.js"></script>')
        html_out.append('<script src="js/agent.js"></script>')
        html_out.append('<script src="js/canvas.js"></script>')
        html_out.append('<script src="js/ui.js"></script>')
        continue
    if '</script>' in line:
        in_js = False
        continue

    if in_css:
        css_lines.append(line)
    elif in_js:
        js_lines.append(line)
    else:
        html_out.append(line)

os.makedirs('css', exist_ok=True)
with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write('\n'.join(css_lines))

with open('index.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_out))

os.makedirs('js', exist_ok=True)

current_file = 'config.js'
file_contents = {
    'config.js': [],
    'ui.js': [],
    'traffic.js': [],
    'canvas.js': [],
    'agent.js': []
}

for line in js_lines:
    if '// LOCATION DATA' in line or '// CONGESTION SCEN' in line or '// STATE' in line:
        current_file = 'config.js'
    elif '// CLOCK' in line or '// SEARCH' in line or '// START / BOOT' in line or '// DATA UPDATES' in line or '// CHART' in line:
        current_file = 'ui.js'
    elif '// SCENARIO ENGINE' in line or '// VEHICLE ENGINE' in line:
        current_file = 'traffic.js'
    elif '// CANVAS SETUP' in line or '// DRAW' in line or '// ══ DRAW' in line:
        current_file = 'canvas.js'
    elif '// SIGNAL CONTROLLER' in line or '// AGENT LOG' in line:
        current_file = 'agent.js'
    
    file_contents[current_file].append(line)

for fname, f_lines in file_contents.items():
    with open('js/' + fname, 'w', encoding='utf-8') as f:
        f.write('\n'.join(f_lines))

try:
    os.remove('INDEX.html')
except Exception as e:
    pass
