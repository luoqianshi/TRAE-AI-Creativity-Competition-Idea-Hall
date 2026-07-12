#!/usr/bin/env python3
import os
import sys
import time
import subprocess

def restart_server():
    if len(sys.argv) > 1:
        app_path = os.path.abspath(sys.argv[1])
    else:
        print("Error: No app path provided")
        return
    
    python_exe = sys.executable
    
    pythonw_exe = os.path.join(os.path.dirname(python_exe), 'pythonw.exe')
    if os.path.exists(pythonw_exe):
        python_exe = pythonw_exe
    
    time.sleep(3)
    
    env = os.environ.copy()
    env['FLASK_DEBUG'] = '0'
    
    if os.name == 'nt':
        subprocess.Popen([python_exe, app_path],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL,
                         creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW,
                         env=env)
    else:
        subprocess.Popen([python_exe, app_path],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL,
                         env=env)

if __name__ == '__main__':
    restart_server()