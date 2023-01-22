import * as https from 'https'

const TOKEN = 'auth-token'
const TASK_ID = 26
const PROJECT_SLUG = 'grant-impact-evaluator-project'

let getJSON = (options, cb) => {
    https.request(options, (res) => {
        let body = ''
    
        res.on('data', (chunk) => {
            body += chunk
        })
    
        res.on('end', () => {
            let task = JSON.parse(body)
            cb(null, task)
        })

        res.on('error', cb)
    })
    .on('error', cb)
    .end()
}

export default function handler(req, res){

    if(req.method=="GET"){
        let options = {
            host: 'https:taiga.whatscookin.us',
            path: `/api/v1/tasks/by_ref?ref=${TASK_ID}\&project__slug=${PROJECT_SLUG}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`,
            }
        }
        
        getJSON(options, (err, result) => {
            if(err){
                return console.log('Error getting task from Taiga', err)
            }
            console.log(result)
        })
        return res.status(200)
    }

}





