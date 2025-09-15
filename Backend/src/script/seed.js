import dotenv from 'dotenv'
import connecttoDB from '../db.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { Review } from '../models/review.js'
import { normalizeHostawayReview } from '../models/normalisedHostawayReview.js'


dotenv.config({
    path:"./.env"
})

const _filename=fileURLToPath(import.meta.url)
const _dirname=path.dirname(_filename)
const dataPath=path.join(_dirname,'../data/hostway.json')


async function runScript(){
    connecttoDB()


    const data=JSON.parse(fs.readFileSync(dataPath,'utf-8'))
    const items=(data.result || []).map(normalizeHostawayReview)

    for(const n of items){
        const key=`${n.channel}:${n.id}`
        await Review.updateOne({key},{$set:{
            ...n,key
        }},{upsert:true})
    }
    console.log(`[seed] upserted ${items.length} reviews`)
process.exit(0)
}



runScript().catch(err=>{console.log(err);
    process.exit(1)
})