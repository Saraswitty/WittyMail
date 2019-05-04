import pdb
class ColumnMapping:
    def __init__(self):
        self.mapping = {}
        self.column_delta = None

    def set_column_delta(self, column_delta):
        self.column_delta = column_delta

    def set_column_mappings(self, map_info):
        self.mapping = map_info
        self.mapping['status'] = self.column_delta
        self.mapping['frozen_attachments'] = self.column_delta + 1
        self.mapping['index'] = self.column_delta + 2

    def get_index_from_row(self, row):
        return row['index']

    def set_default_values(self, data):
        for i in range(0, len(data)):
            data[i].extend([None, None])
            data[i].append(i)
        return data

    def set_column_mapping(self, map_info):
        self.mapping.append(map_info)

    def get_column_mappings(self, column_names):
        column_maps = []
        for c in column_names:
            if c in self.mapping.keys():
                column_maps.append(self.mapping[c])
            else:
                column_maps.append(None)
        return tuple(column_maps)