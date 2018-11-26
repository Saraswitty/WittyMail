import requests

male_name_set = set([
'ajay',
'amit',
'omkar',
])

female_name_set = set([
'fatima',
'anamika',
'sonal'
])

# Need a looot of improvement
def guess_gender(name, surname = 'nair'):
  name = name.lower()
  surname = surname.lower()

  if name in male_name_set:
    return "male"
  if name in female_name_set:
    return "female"

  # curl -i https://api.namsor.com/onomastics/api/json/gender/Ajinkya/Nair/ind
  url = 'https://api.namsor.com/onomastics/api/json/gender/' + name + '/' + surname + '/ind'

  data = requests.get(url).json()
  gender = data['gender']

  if gender != "unknown":
    return gender

  vowels = "aeiou"
  if name[-1:] in vowels:
      return "female"
  return "male"
