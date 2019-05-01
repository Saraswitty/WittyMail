class ColumnMapping:
    def __init__(self):
        self.to = None
        self.cc = None
        self.status = None
        self.frozen_attachment = None

    def set_column_mapping(self, map_info):
        self.to = map_info['email_to']
        self.to = map_info['email_cc']
        self.to = map_info['email_status']
        self.frozen_attachment = map_info['email_email_frozen_attachment']
    
    def __del__(self):
        self.to = None
        self.cc = None
        self.status = None
        self.frozen_attachment = None
