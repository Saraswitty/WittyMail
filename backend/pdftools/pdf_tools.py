import os, sys
sys.path.insert(0, os.path.abspath('..'))

# This should be the first import to bootstrap the runtime env
import util.bootstrap

import PyPDF2
from util.logger import get_logger

_log = get_logger(__name__)

def main():
    input_file = sys.argv[1]
    filename = os.path.basename(input_file)
    output_file = os.path.join("D:\\", "projects", "WittyMail", "PDFs", "rotated_pdfs", filename)
    _log.info("Processing PDF: %s", input_file)

    with open(input_file, 'rb') as f:
        pdf_reader = PyPDF2.PdfFileReader(f)
        pdf_writer = PyPDF2.PdfFileWriter()

        for pagenum in range(pdf_reader.numPages):
            page = pdf_reader.getPage(pagenum)
            page.rotateCounterClockwise(90)
            pdf_writer.addPage(page)

        
        _log.info("Writing PDF: %s", output_file)
        with open(output_file, 'wb') as out:
            pdf_writer.write(out)

if __name__ == "__main__":
    main()