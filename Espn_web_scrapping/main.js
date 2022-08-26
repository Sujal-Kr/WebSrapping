const request= require("request");
const cheerio= require("cheerio");
const fs= require("fs");
const path= require("path");

console.log("Before Requesting...");
// orginal link provided.
const url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url,cb);
function cb(err,res,html){
    console.log("requesting data...");
    if(err) console.log(err);
    else getlink(html);
}
// all matches page...
function getlink(html){
    let $ = cheerio.load(html);
    let data=$(".ds-py-3.ds-px-4 span.ds-leading-none");
    let link=$(data[10]).find("a").attr("href");
    console.log("Fetching the link...");
    link="https://www.espncricinfo.com"+link;
    console.log(link);
    console.log("Fetching all matches link");
    get_matches_link(link);
}
function get_matches_link(link) {
    request(link,cb);
    function cb(err,res,html) {
        if(err) console.log(err);
        else fetch_matches_link(html);
    }
}

function fetch_matches_link(html) {
    let $ = cheerio.load(html);
    let data=$("div.ds-border-b.ds-border-line div.ds-px-4.ds-py-3");
    let links = [];
    // All matches link
    console.log("All matches link...");
    for(let i=0;i<data.length;i++){
        links[i]=$(data[i]).find("a").attr("href");
        links[i]="https://www.espncricinfo.com"+links[i];
        // console.log(links[i]);
        match_info(links[i]);
    }  
}
// opening pages macthe by match
function match_info(link){ 
    request(link,cb);
    function cb(err,res,html){
        if(err) console.log(err);
        else scorecard_page(html);
    }
}
 
function scorecard_page(html){
    // Create main Folder of IPL
    let main_folder="IPL"
    if(!fs.existsSync(path.join(__dirname,main_folder)))fs.mkdirSync(main_folder);
    const main_folder_path = path.join(__dirname,main_folder);
    let $ = cheerio.load(html);
    // Fetch the Team Name
    let team=$(".ds-text-tight-l.ds-font-bold");
    for(let i=0;i<team.length;i++){
        let team_name=$(team[i]).text();
        let team_path=path.join(main_folder,team_name);
        if(!fs.existsSync(team_path)) {
            fs.mkdirSync(team_path);
            // folder created with the name of the team
        }
        // create Players file.
        let players_table=$(".ds-w-full.ds-table.ds-table-xs.ds-table-fixed.ci-scorecard-table");
        let player_record= $(players_table[i]).find("tr");//.hasClass("ds-text-tight-s");
        for(let j=1;j<player_record.length-2;j++){
            // Getting players name 
            let player_data=$(player_record[j]).find("td");
            let player_name=$(player_data[0]).text();
            let player_runs=$(player_data[2]).text();
            let balls_played=$(player_data[3]).text();
            let fours_count=$(player_data[5]).text();
            let six_count=$(player_data[6]).text();
            let strike_rate=$(player_data[7]).text();
            let full_path=player_name+".txt";
            
            fs.appendFileSync(path.join(team_path,full_path),`${player_name}`+"\t"+player_runs+"\t"+balls_played+"\t"+fours_count+"\t"+six_count+"\t"+strike_rate+"\n");
        } 
        
    }
}

