from util.FileUtils import FileUtils
from wittymail_server.ColumnMapping import ColumnMapping
import pdb
import re
from util.FileUtils import FileUtils
import copy

class Sheet:
   __instance = None
   filepath = None
   headers = []
   data = []
   extended_headers = ["status", "frozen_attachments", "index"]
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

   def __del__(self):
      Sheet.rows = []
      Sheet.filepath = None
      Sheet.__instance = None
   
   def get_column_mappings_index(self, column_names):
      return self.c.get_column_mappings_index(column_names)

   def get_column_mappings_name(self, column_names):
      return self.c.get_column_mappings_name(column_names)
   
   def get_column_value(self, row, column_name):
      index = self.c.get_column_mappings_name(column_name)
      return row[index[0]]    

   def get_count_of_column_value_from_data(self, row, column_name):
      index = self.c.get_index_from_row(row)
      column_index = self.c.get_column_mappings_index([column_name])[0]
      f = FileUtils()
      return len(f.sanitize_names_str(self.data[index][column_index]))

   def get_column_value_from_data(self, row, column_name):
      index = self.c.get_index_from_row(row)
      column_index = self.c.get_column_mappings_index([column_name])[0]
      return self.data[index][column_index]

   def get_header_index_from_name(self, header_name):
      if header_name in self.headers:
         return self.headers.index(header_name)
      if header_name in self.extended_headers:
         return self.extended_headers.index(header_name)
      return None

   def set_attachment(self, attachment_name):
      attachment_index = self.c.get_column_mappings_index(["frozen_attachments"])
      self.data[attachment_index] = attachment_name

   def set_extended_dafault_data(self):
      self.data = self.c.set_default_values(self.data)

   def dump_to_memory(self):
      f = FileUtils()
      self.headers, self.data = f.read_excel_to_memory(self.filepath)
      data_width = len(self.data[0])

      if ('status' in self.headers):
         data_width -= 3
         self.headers = self.headers[:-3]
      else:
         self.set_extended_dafault_data()

      self.c.set_column_delta(data_width)

   def add_extended_headers(self):
      headers_ = copy.deepcopy(self.headers)
      headers_.extend(self.extended_headers)
      return headers_

   def save_to_file(self, outfile = 'outfile.xlsx'):
      f = FileUtils()
      extended_headers = self.add_extended_headers()
      data = [extended_headers]
      data.extend(self.data)
      return f.save_to_excel(data, outfile)

   def get_headers_with_sample_rows(self, row_count = 5):
      data = []
      for i in range(0, row_count):
         data.append(dict(zip(self.headers, self.data[i])))
      return self.headers, data
   
   def get_all_content(self):
      return self.headers, self.extended_headers, self.data

   def get_extended_headers(self):
      return self.extended_headers

   def _template_to_str(self, template, list_ = None):
      header_names = re.findall("{.*?}", template)

      # TODO Modify template_to_str to support header name instead of header_index
      for header_name in header_names:
         header_name = header_name[1:-1]
         header_index = self.get_header_index_from_name(header_name)
         template = template.replace('{' + header_name + '}', '#' + str(header_index))

      return self.template_to_str(template, list_)

   def template_to_str(self, st, list_ = None):
      f = FileUtils()
      if list_ == None:
         list_ = self.data[0]
      return f.template_to_str(st, list_)

   def set_column_mappings(self, map_info):
      for key in map_info:
         map_info[key] = [map_info[key], self.headers.index(map_info[key])]
      self.c.set_column_mappings(map_info)
   
   def set_column_value(self, row, column, value):
      index = self.c.get_index_from_row(row)
      column_index = self.c.get_column_mappings_index([column])[0]
      self.data[index][column_index] = value