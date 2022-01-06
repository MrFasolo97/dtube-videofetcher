const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const fs = require('fs');
const { Command } = require('commander');


async function fetcher(agg, config) {
  const url = config.mongo_address;

  var mongo_client = new MongoClient(url);
  var r = [];
  await mongo_client.connect();
  const mongoDB = mongo_client.db();
  const contents_collection = mongoDB.collection("contents");
  var response = await contents_collection.aggregate(agg).toArray();
  for (var i=0; i<response.length; i++) {
    r.push('https://d.tube/v/'+response[i]._id);
  }
  mongo_client.close();
  return r;
}

function filter(tag, options) {
  if(tag != null) {
    var agg = [
      {
        '$match': {
          '$and': [
            {
              'ts': {
                '$gte': (Date.now() - (1000*60*60*24*options.days))
              }
            }
          ]
        }
      }
    ];
    agg[0]["$match"]["$and"].push({['tags.'+tag]: { '$gt': 0 }});
    return agg;
  } else {
    return false;
  }
}

async function main(options) {
  const config_file = fs.readFileSync("./config.json");
  const config = JSON.parse(config_file); 

  if(options.onelove) {
    const agg1 = [
      {
        '$match': {
          '$and': [
            {
              '$or': [
                {
                  'tags.onelove': {
                    '$gt': 0
                  }
                }, {
                  'tags.onelovedtube': {
                    '$gt': 0
                  }
                }
              ]
            }, {
              'ts': {
                '$gte': (Date.now() - (1000*60*60*24*options.days)) // 5 days
              }
            }
          ]
        }
      }
    ];
    console.log(JSON.stringify(await fetcher(agg1, config)));
  }

  if(options.moments) {
    var agg2 = filter("DTubeGo-Moments", options);
    console.log(JSON.stringify(await fetcher(agg2, config)));
  }
  if(options.tag != undefined) {
    var agg3 = filter(options.tag, options);
    console.log(JSON.stringify(await fetcher(agg3, config)));
  }
}

const program = new Command();

program.option("-t, --tag <tag>", 'List videos tagged with \"tag\". It should be a string.');
program.option("-1, --onelove", "List recent videos tagged \"onelove\" or \"onelovedtube\"", false);
program.option("-m, --moments", "List recent DTubeGo moment videos", false);
program.option("-d, --days <N>", "How old the video can be? In days, default 5", 5);

program.parse(process.argv);
const options = program.opts();

main(options);
