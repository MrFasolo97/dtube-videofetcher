# dtube-videofetcher
Fetches links by tag on DTube blockchain from MongoDB Server of the avalon node.

    git clone https://github.com/MrFasolo97/dtube-videofetcher && cd dtube-videofetcher
    npm i
    cp config_example.json config.json # Remember to check the correctness of MongoDB Server address
 ## Command examples
    nodejs dtube-videofetcher.js -h         # Prints the help data
    nodejs dtube-videofetcher.js -m         # lists DTubeGo Moments from 5 days ago untill now
    nodejs dtube-videofetcher.js --onelove  # lists videos tagged "onelove" or "onelovedtube" from 5 days ago untill now
    nodejs dtube-videofetcher.js -m -d 10   # lists DTubeGo Moments uploaded in the last 10 days.
    nodejs dtube-videofetcher.js -t test    # lists recent videos tagged as "test"
    ## To save on a file call it like this:
    nodejs dtube-videofetcher.js --onelove > $(date +%F).json # Will save the script output in a file named YYYY-MM-DD.json, for example 2022-01-04.json.
