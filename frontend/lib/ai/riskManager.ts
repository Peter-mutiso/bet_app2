export function canExecuteAITrade(
  confidence:number,
  lastTradeTime:number|null
){

const MIN_CONFIDENCE = 80;


if(confidence < MIN_CONFIDENCE)
{
return false;
}



if(lastTradeTime){

const cooldown =
Date.now() - lastTradeTime;


if(cooldown < 30000)
{
return false;
}

}


return true;

}