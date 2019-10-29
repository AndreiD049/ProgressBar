import os
import glob

def clear_folder(path):
    old_files = glob.glob(path)
    for f in old_files:
        os.remove(f)