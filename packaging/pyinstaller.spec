# -*- mode: python -*-
# coding=utf-8

import os, shutil

# Globals #####################################################################
angular_base_dir = os.path.abspath(os.path.join('..','frontend','wittymail'))
angular_dist_dir = os.path.abspath(os.path.join(angular_base_dir, 'dist', 'wittymail'))
flask_static_dir = os.path.abspath(os.path.join('..', 'backend', 'webserver', 'static'))
flask_main_module = os.path.abspath(os.path.join('..', 'backend', 'webserver', 'wittymail_web_gui.py'))

# Cleanup #####################################################################
print("## Deleting static files in Flask directory")
try:
    shutil.rmtree(flask_static_dir)
except FileNotFoundError:
    pass

print("## Deleting PyInstaller 'dist' directory...")
try:
    shutil.rmtree('dist')
except FileNotFoundError:
    pass
os.mkdir("dist")

# Pre-requisites ##############################################################
print("## Building Angular app for production")
cmd = 'cd "' + angular_base_dir + '" && yarn install && ng build --prod'
print("\t%s" % cmd)
r = os.system(cmd)
if r:
    print("## Failed to build Angular app, aborting...")
    exit(1)

print("## Collecting static files")
shutil.copytree(angular_dist_dir, flask_static_dir)

# PyInstaller #################################################################
block_cipher = None
entry_point =  flask_main_module
binary_name = 'wittymail'

a = Analysis([entry_point],
             pathex=[os.path.abspath(os.path.join('..', 'backend'))],
             binaries=[],
             datas=[(flask_static_dir,'static')],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)

pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name=binary_name,
          debug=False,
          strip=False,
          upx=True,
          console=True )
