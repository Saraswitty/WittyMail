from util.FileUtils import FileUtils
from wittymail_server.ColumnMapping import ColumnMapping
import pdb
class Sheet:
   __instance = None
   filepath = None
   headers = []
   data = []
   extended_headers = ["status", "frozen_attachments"]
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
   
   def get_column_mappings(self, column_names):
      return self.c.get_column_mappings(column_names)

   def get_column_value(self, row, column_name):
      index = self.c.get_column_mappings(column_name)
      return row[index[0]]    

   def get_header_index_from_name(self, header_name):
      return self.headers.index(header_name)

   def set_attachment(self, attachment_name):
      frozen_attachments = self.c.get_column_mappings(["frozen_attachments"])
      self.data[frozen_attachments] = attachment_name

   def set_extended_dafault_data(self):
      self.data = self.c.set_default_values(self.data)

   def dump_to_memory(self):
      f = FileUtils()
      self.headers, self.data = f.read_excel_to_memory(self.filepath)
      data_width = len(self.data[0])
      self.c.set_column_delta(data_width)
      self.set_extended_dafault_data()

   def save_to_file(self):
      f = FileUtils()
      return f.save_to_excel(self.headers + self.data)

   def get_headers_with_sample_rows(self, row_count = 5):
      data = []
      for i in range(0, row_count):
         data.append(dict(zip(self.headers, self.data[i])))
      return self.headers, data
   
   def get_all_content(self):
      return self.headers, self.data

   def get_extended_headers(self):
      return self.extended_headers

   def template_to_str(self, st, list_ = None):
      f = FileUtils()
      if list_ == None:
         list_ = self.data[0]
      return f.template_to_str(st, list_)

   def set_column_mappings(self, map_info):
      for key in map_info:
         map_info[key] = self.headers.index(map_info[key])
      self.c.set_column_mappings(map_info)
   
   def set_column_value(self, row, column, value):
      index = self.c.get_index_from_row(row)
      column = self.c.get_column_mappings([column])
      
      self.data[index][column[0]] = value