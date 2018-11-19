# jetphotos-translator

Uses [Serverless](https://serverless.com/) framework

## Invoke Photo function locally
`serverless invoke local --function getjetphoto --data '{"tailNum": "<registraion number>"}'`

## Invoke on batch of tail numbers in CSV file 
`node batcher.js getjetphotobatch [path_to_input_file (default: tail_numbers.csv)] [tail_number_column (default: 'Tail Number')]`

Processes a CSV file of tail numbers and outputs a CSV with potentially multiple photos URLs per tail number, plus a status log.

Outputs two files:
`<input_filename>_status.csv` - Copy of the input file with a 'Status' column appended
`<imput_filename>_photos.csv` - All the retrieved photo URLs for each tail number that has photos. Columns: tailNum, photoUrl
