const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const fs = require('fs');
const { Command } = require('commander');
const restClient = require('sync-rest-client');
const _ = require("lodash");


async function fetcher(agg, config) {
  const url = config.mongo_address;

  var mongo_client = new MongoClient(url);
  await mongo_client.connect();
  const mongoDB = mongo_client.db();
  const contents_collection = mongoDB.collection("contents");
  var response = await contents_collection.aggregate(agg).toArray();
  await mongo_client.close();
  return response;
}

async function link_fetcher(agg, config) {
  var r = [];
  var response = await fetcher(agg, config);
  for (var i=0; i<response.length; i++) {
    r.push('https://d.tube/v/' + response[i]._id);
  }
  return r;
}

async function filter(tag, options) {
  var agg = false;
  if(tag != null) {
    agg = [
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
  }
  return agg;
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
    console.log(JSON.stringify(await link_fetcher(agg1, config)));
  }
  if(options.original) {
    var agg4 = await filter("originaldtuber", options);
    const originaldtubers = await restClient.get("https://dtube.fso.ovh/oc/creators").body;
    if (agg4 !== false) {
      var list = await fetcher(agg4, config);
      for (var i=0; i<list.length; i++) {
        list[i]["full_link"] = "https://d.tube/v/"+list[i]["_id"];
      }
      var original_requests = [];
      list.forEach(element => {
        if(! originaldtubers.includes(element.author)) {
          original_requests.push(element);
        }
      });
    }
    console.log(JSON.stringify(original_requests));
  }
  if(options.moments) {
    var agg2 = await filter("DTubeGo-Moments", options);
    console.log(JSON.stringify(await link_fetcher(agg2, config)));
  }
  if(options.tag != undefined) {
    var agg3 = await filter(options.tag, options);
    console.log(JSON.stringify(await link_fetcher(agg3, config)));
  }
}

const program = new Command();

program.option("-t, --tag <tag>", 'List videos tagged with \"tag\". It should be a string.');
program.option("-1, --onelove", "List recent videos tagged \"onelove\" or \"onelovedtube\"", false);
program.option("-m, --moments", "List recent DTubeGo moment videos", false);
program.option("-o, --original", "Look for videos tagged #originaldtuber from non whitelisted users", false);
program.option("-d, --days <N>", "How old the video can be? In days, default 5", 5);

program.parse(process.argv);
const options = program.opts();

main(options);
