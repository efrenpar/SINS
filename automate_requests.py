import urllib2
import urllib
import json
import pprint
import csv
import sys


auth_token = '6d3325fc-8987-4e72-a4c8-861274363275'
url_CKAN = 'http://142.93.127.17:5000'
n = len(sys.argv)

if n==1:
   print("Ingresa el resource_id y el nombre del archivo.")
   sys.exit()

if n>3:
    print("Ingresa solo 2 argumentos.")
    sys.exit()
    
    
nameVal = sys.argv[1]
fileName = sys.argv[2]




records = []
recordTemp = {}
headerFile = []
fields = []
with open(fileName) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            headerFile = row
            #print(headerFile)
            line_count += 1
        else:
            #print(row[0])
           # print(row[1])
            #print('nombre:{0} apellido:{1} correo:{2} genero:{3} ip:{4} fecha:{5}'.format(row[0],
            #row[1],row[2],row[3],row[4],row[5],))
            for i in range(0,len(headerFile)):
            	if(row[i] == '' or row[i] == 'No registrado'):
            		row[i]= '0'
            	recordTemp[headerFile[i]]= row[i]
            records.append(recordTemp)
            recordTemp={}
            line_count += 1
    #print(records)

prestacion_records = records[0]['PRESTACION']



if not nameVal in prestacion_records:
	print("No corresponde el recurso con el tipo de prestacion")
	sys.exit() 

pair = "name:"+nameVal
resource_dict = {
	"query": pair
}



data_string = urllib.quote(json.dumps(resource_dict))

request = urllib2.Request(
    url_CKAN+'/api/3/action/resource_search')
    
request.add_header('Authorization', auth_token)

response = urllib2.urlopen(request, data_string)
assert response.code == 200

response_dict = json.loads(response.read())
assert response_dict['success'] is True


resourceId = response_dict['result']['results'][0]['id']


print(resourceId)



# Put the details of the dataset we're going to create into a dict.
dataset_dict = {
    'resource_id': resourceId,
    'records': records,
    'force': 'true',
    'method': 'insert'
}

# Use the json module to dump the dictionary to a string for posting.
data_string = urllib.quote(json.dumps(dataset_dict))

# We'll use the package_create function to create a new dataset.
request = urllib2.Request(
    url_CKAN+'/api/3/action/datastore_upsert')

# Creating a dataset requires an authorization header.
# Replace *** with your API key, from your user account on the CKAN site
# that you're creating the dataset on.
request.add_header('Authorization', auth_token)

# Make the HTTP request.
response = urllib2.urlopen(request, data_string)
assert response.code == 200

# Use the json module to load CKAN's response into a dictionary.
response_dict = json.loads(response.read())
assert response_dict['success'] is True

# package_create returns the created package as its result.
created_package = response_dict['result']
pprint.pprint(created_package)



