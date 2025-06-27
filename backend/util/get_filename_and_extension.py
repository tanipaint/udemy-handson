import os 
# 引数で受け取ったファイルパスからファイル名と拡張子を取得するメソッド
def get_filename_and_extension(file_path: str):
  base_name = os.path.basename(file_path) # ファイル名と拡張子を取得
  file_name, extension = os.path.splitext(base_name) # ファイル名と拡張子を分割
  return file_name, extension