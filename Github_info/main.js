const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const url = "https://github.com/topics";
const path= require('path');
console.log("Before Requesting");

request(url,cb);
console.log("After Requesting");
function cb(err, response, html){
    if(err)console.error(err);
    else get_html(html);
}

function get_html(html){
    let $ = cheerio.load(html);
    let box_topics=$(".topic-box");
    let links=[];

    for(let i=0; i<box_topics.length; i++){
        let name= $(box_topics[i]).find(".f3").text().trim();
        links[i]=$(box_topics[i]).find("a").attr("href");
        links[i]="https://github.com"+links[i];
        console.log(name);
        second_page(links[i],name);
        if(!fs.existsSync(name)){ 
            fs.mkdirSync(name);
        }
    }
}
function second_page(url,name){
    request(url,function (err,response, html) {
        if(err)console.error(err);
        else repo_page(html,name); 
    });
}
function repo_page(html,name){
    let $ = cheerio.load(html);
    let repo_page=$(".f3.color-fg-muted.text-normal.lh-condensed .text-bold.wb-break-word");
    let links=[];
    for(let i=0;i<repo_page.length; i++){
        links[i]=$(repo_page[i]).attr("href");
        let repo_name=$(repo_page[i]).text().trim();
        links[i]="https://github.com"+links[i];
        console.log(repo_name);
        if(!fs.existsSync(path.join(path.join(__dirname,name),repo_name))){
            fs.mkdirSync(path.join(path.join(__dirname,name),repo_name));
        }
        get_repo_page_code_link(links[i],name,repo_name);
        
        
    }
}
function get_repo_page_code_link(url,name,repo_name) {
    request (url,function (err,response, html){
        if(err)console.log(err);
        else repo_page_code(html,name,repo_name);
    });
}

function repo_page_code(html,name,repo_name) {
    let $ = cheerio.load(html);
    let link=$("#issues-tab").attr("href");
    link="https://github.com"+link;
    console.log(link);
    issue_page(link,name,repo_name);
}
function issue_page(url,name,repo_name) {
    request (url,function (err,response, html){
        if(err)console.error(err);
        else get_issues(html,name,repo_name);
    });
}
function get_issues(html,name,repo_name) {
    let $ = cheerio.load(html);
    // if(!fs.existsSync(name))fs.mkdirSync(name);
    let list_of_issues=$(".d-block.d-md-none");
    console.log(list_of_issues.length);
    let issues="";
    for(let i=0;i<list_of_issues.length;i++){
        issues=$(list_of_issues[i]).text();
        issues+="\n";
    }
    fs.appendFileSync(path.join(path.join(name,repo_name),"issues.txt"),"hi i am back"+issues);
}