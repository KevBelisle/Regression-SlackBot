const fateLadder = {
  8:	"Legendary",
  7:	"Epic",
  6:	"Fantastic",
  5:	"Superb",
  4:	"Great",
  3:	"Good",
  2:	"Fair",
  1:	"Average",
  0:	"Mediocre",
  "-1":	"Poor",
  "-2":	"Terrible"
};

const partRegex = /((?:\w+)(?: [+-]?\d+)?|(?:\w+ )?(?:[+-]?\d+))/g;
const findParts = (str) => {return str.match(partRegex)};

const partSplitRegex = /^(\w+)? ?([+-]?\d+)?$/;
const splitPart = (str) => {return str.match(partSplitRegex)};

let rollDice = (modifier = 0) => {
  let result = parseInt(modifier);
  for (let i = 0; i < 4; i++) {
    result += Math.floor(Math.random() * (3)) - 1;
  }
  return result;
};

let roll = (skill="Unnamed roll", modifier=0) => {
	let result = rollDice(modifier);
	return {
  	skill: skill,
    modifier: modifier,
    result: result,
    resultLabel: fateLadder[result]
  }
}

const rollCommand = (user_name, text) => {
	let parts = findParts(text);
  let results = parts.reduce((acc, part) => {
  	let [,skill,modifier] = splitPart(part);
    acc.push(roll(skill,modifier));
    return acc;
  }, [])

  let response = {
  "response_type": "in_channel",
	"text": `*${user_name}* rolls for...`,
    "attachments": results.map((result) => {
    	return {
      	mrkdwn_in: ["text"],
      	text: `${result.skill}: *${result.result}* _(${result.resultLabel})_`
      }
    })
};

  return response;
}


/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.slashCommandsHttp = function slashCommandsHttp (req, res) {

  console.log(req.body);

  if (req.body.team_id != 'T77AH0J0N')
  {
    res.send("I will not regress for you.")
    return;
  }

  res.json({
    '/roll': rollCommand
  }[req.body.command](req.body.user_name, req.body.text));
};

/*
  Example req.body :
  {
    token: 'tkZ5APRroLCWhJMf6ebJ2Sef',
    team_id: 'T77AH0J0N',
    team_domain: 'regressionio',
    channel_id: 'D77GN9WMV',
    channel_name: 'directmessage',
    user_id: 'U76J576QM',
    user_name: 'kev.belisle',
    command: '/rbot',
    text: 'HELLO HELLO',
    response_url: 'https://hooks.slack.com/commands/T77AH0J0N/245367693313/8R6ljfDxgyLy1Ipam07SaOGg',
    trigger_id: '245367693329.245357018022.faa699ceeba26ac0c9c913668abde51d'
  }
*/