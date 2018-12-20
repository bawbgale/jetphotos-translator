# jetphotos-translator

Given an aircraft tail number, this gets photo urls and photographer name from jetphotos.com. Function returns the first image as an HTML page with image tag and photographer name in caption. Batch mode returns CSV of tail numbers, photo URLs, and photographer names.

Uses [Serverless](https://serverless.com/) framework

## Deploying to AWS or Azure

The function will work on either AWS or Azure but needs different `serverless.yml` configs. There isn't an effective way to combine these, so we have separate `serverless-aws.yml` and `serverless-azure.yml` files and a script to swap them before deploying:

`./deploy.sh aws` or `./deploy.sh azure`

which pretty much just does:

`cp serverless-$1.yml serverless.yml && sls deploy`

## Invoke Photo function locally
`serverless invoke local --function getjetphoto --data '{"tailNum": "<registration number>"}'`

Returns an HTML-Gateway-ready response object:

```
{
    "headers": {
        "Content-Type": "text/html"
    },
    "statusCode": 200,
    "body": "<html><body>...</body></html>"
}
```

## Invoke on batch of tail numbers in CSV file 
`node batcher.js getjetphotobatch [path_to_input_file (default: tail_numbers.csv)] [tail_number_column (default: 'Tail Number')]`

Processes a CSV file of tail numbers and outputs a CSV with potentially multiple photos URLs per tail number, plus a status log. In case of errors, the status log can be fed back through for another pass, which will skip the successfully processed items.

Outputs two files:

* `<input_filename>_status.<pass_number>.csv` - Copy of the input file with a 'Status' column appended
* `<imput_filename>_photos.<pass_number>.csv` - All the retrieved photo URLs for each tail number that has photos. Columns: tailNum, photoUrl, photograher

Batch mode now keeps a local cache of retrieved pages to avoid repeatedly re-requesting them.
