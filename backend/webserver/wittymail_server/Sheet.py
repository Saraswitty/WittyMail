from util.FileUtils import FileUtils
from wittymail_server.ColumnMapping import ColumnMapping
import pdb

class Sheet:
   __instance = None
   filepath = None
   headers = []
   data = []
   data_width = []
   extended_headers = []

   c = ColumnMapping()

   @staticmethod
   def getInstance(filepath=None):
      """ Static access method. """
      if Sheet.__instance == None:
         Sheet(filepath)
      return Sheet.__instance

   def __init__(self, filepath):
      """ Virtually private constructor. """
      if Sheet.__instance != None:
         raise Exception("This class is a singleton!")
      else:
         Sheet.__instance = self
         Sheet.filepath = filepath
         Sheet.extended_headers = ["ID", "Attachment Name", "Status"]

   def __del__(self):
      Sheet.rows = []
      Sheet.filepath = None
      Sheet.__instance = None
   
   def set_attachment(self, attachment_name):
      id_index = Sheet.data_width + Sheet.extended_headers.index("Attachment Name")
      Sheet.data[id_index] = attachment_name

   def dump_to_memory(self):
      f = FileUtils()
      self.headers, self.data = f.read_excel_to_memory(self.filepath)
      self.data_width = len(self.data[0])
 
   def save_to_file(self):
      f = FileUtils()
      return f.save_to_excel(self.headers + self.data)

   def get_headers_with_sample_rows(self, row_count = 5):
      data = []
      for i in range(0, row_count):
         data.append(dict(zip(self.headers, self.data[i])))
      return self.headers, data
   
   def get_all_content(self):
      return self.headers + self.data

   def template_to_str(self, st, l):
      f = FileUtils()
      return f.template_to_str(st, l)

   def set_column_mapping(self, map_info):
      Sheet.c = ColumnMapping(map_info)