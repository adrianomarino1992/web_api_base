import FS from 'fs';
import Application from '../Application';

export default class JS
{
    private static _js = `
    document.getElementById('root').innerHTML += '<div class="header" ><div class="DivHeader"><p>Made with <a href="https://www.npmjs.com/package/web_api_base" target="_blank">web_api_base</a></p></div></div>';
    document.getElementsByClassName('header')[0].innerHTML += '<div class="DivHeader DivHeaderRight"><p class="pTitle" style="font-size: 14px;font-weight:600;">??APP</p><p>??DESC</p></div>';
    
        function AddResource(route)
        {    
            console.log(route);
    
            document.getElementById('root').innerHTML += '<div id="'+ route.Controller.toLowerCase()+'" class="card"></div>';
    
            let root = document.getElementById(route.Controller.toLowerCase());           
               
            root.innerHTML += '<h1 >'+route.Controller+'</h1>';
           
            for(let r of route.Resources)
            {
        
                let expandId = { ID : 'link_' + r.Id, RID : r.Id};
        
                try{
                    r.Template = JSON.stringify(JSON.parse(r.Template), null, 2);
                }catch{}
        
                let verbClass = "OTHER";
    
                if(["GET", "POST", "PUT", "DELETE"].includes(r.Verb))
                {
                    verbClass = r.Verb
                }
    
                root.innerHTML += '<h2 id="'+ expandId.ID +'"><verb class="'+ verbClass+'">'+r.Verb+'</verb> '+window.location.origin+r.Route+'</h2>';
                root.innerHTML += '<div id="'+r.Id+'_container" class="container"></div>';
                let container = document.getElementById(r.Id + '_container');
    
                for(let c of r.FromQuery)
                {
                    container.innerHTML += '<div class="token-container"><input type="text" id="key-'+r.Id+r.FromQuery.indexOf(c)+'" placeholder="'+c.Field+'"></div>';
                }
    
                if(r.FromBody.length > 0)
                    container.innerHTML += '<textarea id="body-'+r.Id+'" placeholder="{}" spellcheck="false">'+r.Template+'</textarea>';
    
                    
                if(r.Description)
                {
                    container.innerHTML += '<h3>'+r.Description+'</h3>';
    
                }else {
    
                    container.innerHTML += '<h3>Use @Description(...) to add a description to a action</h3>';
                }
                
               
                container.innerHTML += '<div class="btn-container" ><button id="bt-'+expandId.ID+'">Send</button></div>';
                
                if(r.Response.length > 0 && r.Response[0].JSON?.length > 0)
                {
                    container.innerHTML += '<h3 id="response-bar-'+r.Id+'">Response'+(r.Response.length > 1 ? 's': '')+':</h3>';
    
                    container.innerHTML += '<div id="status-bar-'+r.Id+'" class="btn-container" ></div>';              
    
    
                    for(let s of r.Response.sort((a, b)=> a.Status - b.Status))
                    { 
                        let bar = document.getElementById('status-bar-'+r.Id);
    
                        let classValue = "Info";
        
                        if(s.Status.toString().indexOf('2') == 0)
                        {
                            classValue = "OK";  
        
                        }else if(s.Status.toString().indexOf('4') == 0)
                        {
                            classValue = "ErrorClient";
                        }
                        else if(s.Status.toString().indexOf('5') == 0)
                        {
                            classValue = "ErrorServer";
                        }    
                        
                       
                        bar.innerHTML += '<div><status id="status-'+r.Id+s.Status+'" class="'+classValue+'"> '+s.Status+ '</status> <tx>' + (s.Description ?? '')+'</tx></div>';
    
                        document.addEventListener('DOMContentLoaded', function() {
    
                            document.getElementById('status-'+r.Id+s.Status).addEventListener('click', function (evt) {
                
                                let textarea = document.getElementById('response-area-'+r.Id);
                                textarea.value = s.JSON;
                               
                            });
    
                           
                        });
    
                        
                    }
    
                   
                }else{
    
                    container.innerHTML += '<h3 id="response-bar-'+r.Id+'">Response:</h3>';
                    container.innerHTML += '<div id="status-bar-'+r.Id+'" class="btn-container" style="display:none;" ></div>';
                }
    
                document.addEventListener('DOMContentLoaded', function() {
                                 
    
                    document.getElementById('bt-'+expandId.ID).addEventListener('click', (evt) => 
                    {
                        let body = document.getElementById('body-'+r.Id);   
                        let resp = document.getElementById('response-area-'+r.Id);   
                        let bar = document.getElementById('status-bar-'+r.Id);
                        let h3 = document.getElementById('response-bar-'+r.Id);                
    
                        let req = new XMLHttpRequest();
                        let args = '?';
                        for(let c of r.FromQuery)
                        {
                            let input = document.getElementById('key-'+r.Id+r.FromQuery.indexOf(c));
    
                            args+= c.Field + '="' + input.value + '"&';
                        }
    
                        if(args.length > 1){
                            args = args.substring(0, args.length -1);
                        }else 
                        {
                            args = '';
                        }
    
                        req.open(r.Verb, window.location.origin+r.Route+args, true);
                        req.setRequestHeader('Content-type', 'application/json');
                        req.onerror = ()=>
                        {
                            h3.innerText = "Current response:";
                            bar.style.display = "flex";
                            resp.value = 'Error to send the request';
                            bar.innerHTML = '<div><status class="ErrorServer">-1</status> <tx>Error on request</tx></div>';
                        }
    
                      
                        req.onreadystatechange = ()=>
                        {
                            if(req.readyState == 4 && req.status > 0)
                            {
                                h3.innerText = "Current response:";
    
                                bar.style.display = "flex";
    
                                let classValue = "Info";
                
                                if(req.status.toString().indexOf('2') == 0)
                                {
                                    classValue = "OK";  
                
                                }else if(req.status.toString().indexOf('4') == 0)
                                {
                                    classValue = "ErrorClient";
                                }
                                else if(req.status.toString().indexOf('5') == 0)
                                {
                                    classValue = "ErrorServer";
                                }
                            
                                console.log(req);
                                bar.innerHTML = '<div><status class="'+classValue+'"> '+req.status+ '</status> <tx>New request</tx></div>';
                                resp.value = JSON.stringify(JSON.parse(req.responseText), null, 2);
                            }
                        }
    
                        if(body){
                            req.send(body.value);
                        }else
                        {
                            req.send();
                        }
                        
                    });
                });            
                
                container.innerHTML += '<textarea id="response-area-'+r.Id+'" style="margin-top:5px"; spellcheck="false" ></textarea>';          
                
               
                document.addEventListener('DOMContentLoaded', function() {
                    document.getElementById(expandId.ID).addEventListener('click', function (evt) {
        
                        let div = document.getElementById(expandId.RID + '_container');
        
                        if(div.style.display == "flex")
                            div.style.display = "none";
                        else
                            div.style.display = "flex";
                    });
                    
                });
                    
            }    
        
            
            
        }


    `;

    public static Append(text : string) : void
    {        
        JS._js += text;
    }

    public static Save() : void
    {
        let app = "";
        let version = "";
        let description = "";

        try{

            if(FS.existsSync(`${Application.Configurations.RootPath}\\package.json`))
            {
                let j = JSON.parse(FS.readFileSync(`${Application.Configurations.RootPath}\\package.json`, 'utf-8'));
                app = j.name;
                version = j.version;
                description = j.description;        
                
                this._js = this._js.replace('??APP', `${app} ${version}`);
                this._js = this._js.replace('??DESC', `${description}`);
            }

        }catch(err)
        {
            console.error(err);
        }

        FS.writeFileSync(`${__dirname}\\script.js`, JS._js, 'utf-8');
    }
}