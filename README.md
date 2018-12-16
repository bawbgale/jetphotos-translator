# jetphotos-translator

Given an aircraft tail number, this gets photo urls from jetphotos.com

Uses [Serverless](https://serverless.com/) framework

## Deploying to AWS or Azure

The function will work on either AWS or Azure but needs different `serverless.yml` configs. There isn't an effective way to combine these, so we have separate `serverless-aws.yml` and `serverless-azure.yml` files and a script to swap them before deploying:

`./deploy.sh aws` or `./deploy.sh azure`

which pretty much just does:

`cp serverless-$1.yml serverless.yml && sls deploy`

## Invoke Photo function locally
`serverless invoke local --function getjetphoto --data '{"tailNum": "<registration number>"}'`

## Invoke on batch of tail numbers in CSV file 
`node batcher.js getjetphotobatch [path_to_input_file (default: tail_numbers.csv)] [tail_number_column (default: 'Tail Number')]`

Processes a CSV file of tail numbers and outputs a CSV with potentially multiple photos URLs per tail number, plus a status log.

Outputs two files:
`<input_filename>_status.csv` - Copy of the input file with a 'Status' column appended
`<imput_filename>_photos.csv` - All the retrieved photo URLs for each tail number that has photos. Columns: tailNum, photoUrl

Batch mode now keeps a local cache of retrieved pages to avoid repeatedly re-requesting them.
