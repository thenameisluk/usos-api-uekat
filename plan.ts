import { parsePlan } from "./parser.ts";
import { tryfetchplan } from "./scrapper.ts";

//0-6 pow-ned (current day of the week)
export function dayofweek(){
    let d = (new Date).getDay();
    d--;
    if(d==-1)
        d=6;
    return d;
}

export async function getCurrentPlan(username:string,password:string,path="./"){

    console.log("fetching cur plan");
    await tryfetchplan(username,password,path)

    try{
        return parsePlan(Deno.readTextFileSync(path+"plannow.html"));
    }catch{
        return [[],[],[],[],[]];
    }
}

export async function getNextPlan(username:string,password:string,path="./"){

    console.log("fetching next plan");
    await tryfetchplan(username,password,path)

    try{
        return parsePlan(Deno.readTextFileSync(path+"plannext.html"));
    }catch{
        return [[],[],[],[],[]];
    }
}