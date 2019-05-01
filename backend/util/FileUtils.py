import util.logger as logger 
from enum import Enum
import PyPDF2
import os
import shutil
from fuzzywuzzy import fuzz
import operator
import openpyxl
import re

log = logger.get_logger(__name__)

'''
Used to denote the direction of the rotation of pdf
'''
class Direction(Enum):
    CLOCKWISE = 0
    ANTICLOCKWISE = 1

'''
All file related helper operations
'''
class FileUtils:
    def __init__(self):
        pass
    
    '''
    Rotate a pdf based on the direction provided
    '''
    def pdf_rotate(self, filepath, direction):
        if direction == Direction.CLOCKWISE:
            rotation_degree = 270
        else:
            rotation_degree = 90

        output_file = filepath + '.tmp'

        with open(filepath, 'rb') as f:
            pdf_reader = PyPDF2.PdfFileReader(f)
            pdf_writer = PyPDF2.PdfFileWriter()

            for pagenum in range(pdf_reader.numPages):
                page = pdf_reader.getPage(pagenum)
                page.rotateCounterClockwise(rotation_degree)
                pdf_writer.addPage(page)

            log.info("Writing PDF: %s", output_file)
            with open(output_file, 'wb') as out:
                pdf_writer.write(out)
        os.remove(filepath)
        shutil.move(output_file, filepath)

    '''
    Converts 'a   b,c  d and e' to 'a','b','c','d','e'
    '''
    def sanitize_names_str(self, names_str):
        tmp_str = names_str.replace(" and ", ",")
        return [tmp_str2.strip() for tmp_str2 in tmp_str.split(',')]

    '''
    Reads excel from loc and returns [headers[] , data[]] 
    '''
    def read_excel_to_memory(self, loc):
        wb_obj = openpyxl.load_workbook(loc, data_only=True)   
        sheet_obj = wb_obj.active

        # Get headers
        excel_headers = []
        excel_rows = []
        for j in range(1, sheet_obj.max_column + 1):
            excel_headers.append(str(sheet_obj.cell(row = 1, column = j).value))
        for i in range(2, sheet_obj.max_row + 1):
            cells = []

            for j in range(1, len(excel_headers) + 1):
                cells.append(str(sheet_obj.cell(row = i, column = j).value))
            
            if all(c == 'None' for c in cells):
                break

            tmp_str = self.sanitize_names_str(cells[1])
            tmp_str2 = [i.split()[0] for i in tmp_str]
            if len(tmp_str2) == 1:
                tmp_str = tmp_str2[0]
            else:
                tmp_str3 = ', '.join(tmp_str2[:-1])
                tmp_str = tmp_str3 + " and " + tmp_str2[-1]
            cells.append(tmp_str)
            excel_rows.append(cells)
            
        assert len(excel_rows) > 0,            \
               "**** There are no entries in the excel sheet! ****"
        return [excel_headers, excel_rows]

    def find_n_files_by_fuzzymatch(self, directory, fuzzystring, filetype = 'pdf', n = 5, ignore_phrases = None):
        candidates = {}

        for filename in os.listdir(directory):
            if filename.endswith(filetype):
                for phrase in ignore_phrases:
                    filename_tmp = filename.lower().replace(phrase.lower(), '')
                ratio = fuzz.ratio(filename_tmp.lower(), fuzzystring.lower())
                candidates[filename] = ratio
        sorted_candidates = sorted(candidates.items(), key=operator.itemgetter(1), reverse=True)
        return [i[0] for i in sorted_candidates][:n]

    '''
    #no in st will be replaced by l[no]
    '''
    def template_to_str(self, st, l):
        log.debug('template_to_str() str = %s' % (st))

        # Find all substitutes to be replaced by a string from the list
        # For e.g. substitutes = ['#1', '#3', '#1']
        substitute = re.findall(r'#\d+', st)
    
        # Remove all duplicates
        # substitutes = ['#1', '#3']
        substitute = list(set(substitute))

        # Get index of each substitute
        # index = [1,3]
        index = [int(s[1:]) for s in substitute]

        # Iterate over each index and replace '#i' with l[i] in the input string
        for i in range(len(index)):
            st = st.replace(substitute[i], l[index[i] - 1])

        log.debug('template_to_str() final str = %s' % st)
        return st

def save_to_excel(excel_data, out_file):
    wb=openpyxl.Workbook()
    ws_write = wb.active

    for row in excel_data:
       ws_write.append(row)

    wb.save(filename=out_file)
    return os.path.join(os.getcwd(), out_file)

if __name__ == "__main__":
    f = FileUtils()
    #print(f.find_n_files_by_fuzzymatch(os.path.join("C:\\", "Users", "naira11", "Documents", "wittymail_data", 'allpdf'), 'aarahya jadav', ignore_phrases = ['Nursery', 'Kothrud']))
    #f.pdf_rotate(os.path.join("C:\\", "Users","naira11", 'Test.pdf'), Direction.CLOCKWISE)
    #f.pdf_rotate(Direction.ANTICLOCKWISE)
    f.read_excel_to_memory(os.path.join("C:\\", "Users", "naira11", "Documents", "Personal", "clean_sheet.xlsx"))
