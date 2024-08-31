# FlowLog Parsing with Node.js/Express.js

This project is a Node.js environment application that parses an input file (a flowlog file) with a lookup table (a CSV file) to generate an output CSV file. The application maps the flowlog data with the tags on the lookup table based on the destination port and protocol for each log. Additionally, it identifies and counts all combinations of port and protocols, adding this information to the same output file in a separate table.

## API Endpoint

- **POST** `localhost:3000/api/getTagCount`
  - **Input**: A file named `flowlog.txt` passed as `flowlog` in the form-data.
  - **Output**: A CSV file with mapped flowlog data and a count of all port-protocol combinations.

### API Example

```json
{
  "name": "localhost:3000/api/getTagCount",
  "request": {
    "method": "POST",
    "header": [],
    "body": {
      "mode": "formdata",
      "formdata": [
        {
          "key": "flowlog",
          "type": "file",
          "src": "/Users/ziddigsm/Desktop/flowlog.txt"
        }
      ]
    },
    "url": {
      "raw": "localhost:3000/api/getTagCount",
      "host": [
        "localhost"
      ],
      "port": "3000",
      "path": [
        "api",
        "getTagCount"
      ]
    }
  }
}
```
### Example API Response

```json
{
    "error": false,
    "message": "The tag count and port-protocol combination tables have been generated and are saved in the media/output folder under the name result.csv",
    "tagCount": {
        "Untagged": 8,
        "sv_p2": 1,
        "sv_p1": 4,
        "email": 5
    },
    "portProtocolCombination": {
        "49153,tcp": 1,
        "49154,tcp": 1,
        "49155,tcp": 1,
        "49156,tcp": 1,
        "49157,tcp": 1,
        "49158,tcp": 1,
        "80,tcp": 1,
        "1024,tcp": 1,
        "443,tcp": 1,
        "23,tcp": 3,
        "25,tcp": 1,
        "110,tcp": 2,
        "993,tcp": 1,
        "143,tcp": 2
    }
}
```
## Result Output

A file named `result.csv` has been created in the `media/output` directory, containing two tables:

- **TagCounts**: Lists the count of each tag found in the flowlog.
- **PortProtocolCombinationCounts**: Lists the count of each port-protocol combination found in the flowlog.

## Scenarios Considered

- **Flowlog File Format**: The application assumes the flowlog file contains data in the default format, supporting only version 2 columns.
- **File Size Limit**: The flowlog file size can be up to 10MB. If the file size exceeds this limit, the API will return a 400 Bad Request error.
- **Lookup Table Size**: The lookup file should contain only up to 10,000 mappings. If more are provided, the API will return a 500 Internal Server Error.
- **Multiple Tag Mappings**: The possibility of a tag being mapped to more than one port and protocol combination is handled.
- **Case Insensitivity**: Tags are treated as case-insensitive.
- **File Formats**: The lookup table should be in CSV format, and the flowlog file should be in TXT format.


TagCounts: Lists the count of each tag found in the flowlog.
PortProtocolCombinationCounts: Lists the count of each port-protocol combination found in the flowlog.

### Lookup Table Example
dstport,protocol,tag  
25,tcp,sv_P1  
68,udp,sv_P2  
23,tcp,sv_P1

### Flowlog File Example
2 123456789012 eni-0a1b2c3d 10.0.1.201 198.51.100.2 443 49153 6 25 20000 1620140761 1620140821 ACCEPT OK  
2 123456789012 eni-4d3c2b1a 192.168.1.100 203.0.113.101 23 49154 6 15 12000 1620140761 1620140821 REJECT OK  
2 123456789012 eni-5e6f7g8h 192.168.1.101 198.51.100.3 25 49155 6 10 8000 1620140761 1620140821 ACCEPT OK

### Output Table 1 (Tag Counts)
Tag,Count  
sv_P2,1  
sv_P1,2  
sv_P4,1

### Output Table 2 (Port Protocol Combination Counts)
Port,Protocol,Count
22,tcp,1  
23,tcp,1  
25,tcp,1  
110,tcp,1

## How to Run

### Ensure Node.js is Installed:
- Download and install Node.js from https://nodejs.org/en.

### Clone the Repository:
- Open a terminal and run the following command:

    ```bash
    git clone https://github.com/ziddigsm/FlowLogParsing.git
    ```

### Install Dependencies:
- Navigate to the project directory and run:

    ```bash
    npm install
    ```

### Run the Application:
- Start the server with:

    ```bash
    node index.js
    ```

### Test the API:
- Open Postman, enter the API details provided above, and use the sample input file from the `media/inputsample` folder for reference. Upload the file when sending the request.

### Sample Input File
- A sample input file is available in the `media/inputsample` folder of this repository for your reference. Please use this file to test the API.

