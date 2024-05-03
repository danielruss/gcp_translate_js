// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate();


async function load_spanish_labels(){
    // create a map of code => spanish soc code labels
    const spanish_url = "https://danielruss.github.io/codingsystems/soc2010_6digit_es.json";
    const soc2010_labels_es = (await (await fetch(spanish_url)).json())
        .reduce( (pv,cv) =>{
            pv.set(cv.code,cv.title);
            return(pv);
        },new Map())
    return soc2010_labels_es;
}



/**
 * This function call google cloud translate and SOCcer in the field.
 * This is the only function that should be exported.
 * 
 * @param {*} job_description a js object optionally containing:
 *  {title: the job title,
 *  task: the job task,
 *  n: the number of jobs returned}
 * At least one of the title/task keys must be present. No other
 * keys should be included.
 * 
 * @param {*} soccer_url The url of soccer (default: )
 */
exports.translate_and_run_soccer = async function(job_description,soccer_url) {
    // set a few defaults...
    soccer_url ??= "https://us-central1-nih-nci-dceg-druss.cloudfunctions.net/soccerTest/soccer/code";
    job_description ??= {};
    job_description.n ??=4;
    if (!job_description.title && !job_description.task) {
        throw new Error("The job title and/or job tasks are required")
    }

    // translate the job description...
    let translated_job_description = await translate_job_description(job_description)

    // run SOCcer...
    let soccer_results = await run_soccer(soccer_url,translated_job_description)

    // convert the labels from english to spanish...
    const soc2010_labels_es = await load_spanish_labels()
    soccer_results.forEach(x => {
        x.label = soc2010_labels_es.get(x.code)
    })
    return soccer_results;
}


async function run_soccer(soccer_url,job_description){
    
    let url = new URL(soccer_url)
    url.search= new URLSearchParams(job_description);

    let soccer_response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    let res = {};
    if (soccer_response.statusText != 'OK'){
        console.log(".... ERROR!!!")
        throw new Error(`SOCcer responded with ${soccer_response.statusText}`)
    }else{
        res = await soccer_response.json()
    }
    return res;
}

async function translate_job_description(job_description){
    //let text = ["Yo soy una papa.","El perro esta en el horno."]

    // convert the job description into an array for translation...
    let text = { ...job_description }
    delete text.n
    text = Object.values(text)

    let target = "en"

    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];

    // build the translated job description from the array...
    let translated_job_description = {}
    let indx=0
    if (job_description.title) translated_job_description.title = translations[indx++]
    if (job_description.task) translated_job_description.task = translations[indx]
    translated_job_description.n = job_description.n;

    return translated_job_description;
}



//let res = await translate_and_run_soccer( {title:"médico",task:"Tratar pacientes",n:"3"} )
//console.log(res)

//translate_and_run_soccer( {title:"médico",n:"20"} )
//translate_and_run_soccer( {task:"Tratar pacientes",n:"20"} )
//translate_and_run_soccer( {n:"20"} )
//translateText();
  