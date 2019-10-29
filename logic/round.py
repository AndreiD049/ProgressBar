import os
import shelve
from logic.utils import clear_folder


class Round:

    def __init__(self, name, teams=[], max_points=100):
        self.round_name = name
        self.teams = { k: 0 for k in teams }
        self.max_points = max_points

    def __str__(self):
        return str(self.teams)

    def create_self(self):
        # first delete all other files
        clear_folder(os.path.join(os.getcwd(), "data", "*"))
        self.write_to_db()

    def write_to_db(self):
        db_path = os.path.join(os.getcwd(), "data", self.round_name)
        db = shelve.open(db_path)
        for k in self.teams.keys():
            db[k] = self.teams[k]
        db.close()

    def exists(self):
        db_path = os.path.join(os.getcwd(), "data", self.round_name + '.dat')
        return os.path.exists(db_path)

    def open_existing(self):
        # expects that round_name already exists
        db_path = os.path.join(os.getcwd(), "data", self.round_name)
        db = shelve.open(db_path)
        for k in db.keys():
            self.teams[k] = db[k]
        db.close()

    def update_from_dict(self, d):
        for k in d.keys():
            if k in self.teams:
                val = int(d[k])
                if val < 0:
                    self.teams[k] = 0
                else:
                    self.teams[k] = val if val <= self.max_points else self.max_points
        self.write_to_db()
        
