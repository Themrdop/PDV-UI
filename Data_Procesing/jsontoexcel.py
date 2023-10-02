import json
import os
import openpyxl
import pandas as pd
import numpy as np

class jsonToExcel:
    def __init__(self):
        pass

    def main(self):
        pass
    
    def retrieveJsonFiles(self):
        #Get our current working directory and map it to the input folder in our directory
        json_input_path = os.path.join(os.getcwd(), "input") 
        #Checking for every json file inside the input folder
        json_files = [ x for x in os.listdir(json_input_path) if x.endswith("json")] 
        json_data = list()
        for json_file in json_files: 
          	#Create the path to the json file
            json_file_path = os.path.join(json_input_path, json_file) 
            with open (json_file_path, "r") as f:
                json_data.append(json.load(f))

        return json_data

    def getResultsFromData(self, json_data, index):
        quiz_columns = list()
        quiz_value_rows = list()
        student_ids = list()
        student_ids_set = set()
        quizzes = json_data[index]["quizzes"]
        #Adds the student id column
        quiz_columns.append("Student IDs") 
        for i in range(len(quizzes)): 
            quiz = quizzes[i]
            quiz_grades = quiz["grades"]
            quiz_columns.append(quiz["title"] + f'{quiz["category"]}')
            #Formatted version of quiz_grades to just contain the number values
            quiz_grades_f = list() 
            for j in range(len(quiz_grades)):
                studentId = quiz_grades[j]["studentId"]
                #Checks for student ids to not add duplicates
                if studentId not in student_ids_set: 
                    student_ids_set.add(studentId)
                    student_ids.append(studentId)
                #We find the grade the student received on this particular quiz
                grade = quiz_grades[j]["grade"] 
                quiz_grades_f.append(grade)
            #Each row consists of a student id, we only add these in the first iteration
            if i == 0: quiz_value_rows.append(student_ids) 
            #Each row consists of the grade of the student from each quiz
  
            quiz_value_rows.append(quiz_grades_f) 

        df = self.resultsToDataFrame(quiz_columns, quiz_value_rows)

        return df      

    def resultsToDataFrame(self, quiz_columns, quiz_value_rows):
        i = 0
        while len(quiz_value_rows[-1]) < len(quiz_columns):
            #Filling blank values with 0s to properly format the database
            quiz_value_rows[(i % len(quiz_columns))].append(0)
            i += 1
 		#Creating the Data Frame
        df = pd.DataFrame(quiz_value_rows, columns=quiz_columns, dtype=object)
        #Transposes the Data Frame 90 degrees CCW
        df = df.T
        #Drop 1 row off the bottom
        df.drop(df.tail(1).index,inplace=True)
        if len(quiz_columns) >= len(quiz_value_rows):
          	#Populates indexes
        	df.index = np.arange(0, len(quiz_value_rows)-1, 1) 
        #Renames the columns after rotation
        df.columns=quiz_columns 
        
        return df