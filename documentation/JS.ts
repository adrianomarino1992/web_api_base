import FS from 'fs';
import Path from 'path';
import Application from '../Application';

export default class JS
{
    private static _js = ` 
    
    document.getElementById('root').innerHTML += '<div class="header" ><div class="DivHeader"><p>Made with <a href="https://www.npmjs.com/package/web_api_base" target="_blank">web_api_base</a></p></div></div>';
    document.getElementsByClassName('header')[0].innerHTML += '<div class="DivHeader DivHeaderRight"><p class="pTitle" style="font-size: 14px;font-weight:600;">??APP ??VERSION</p><p>??DESC</p></div>';
    
       
        function AddResource(route)
        {    
            console.log(route);
    
            document.getElementById('root').innerHTML += '<div id="'+ route.Controller.toLowerCase()+'" class="card"></div>';
    
            let root = document.getElementById(route.Controller.toLowerCase());           
               
            root.innerHTML += '<h1 >'+route.Controller+'</h1>';

            
            if(route.Headers.length > 0)
            {
                root.innerHTML += '<div id="'+route.Controller.toLowerCase()+'_headers" class="container" style="display: block;"></div>';

                let container = document.getElementById(route.Controller.toLowerCase()+'_headers');
                
                container.innerHTML += "<h3>Controller headers:</h3>";
                
                for(let r of route.Headers)
                {                    
                    container.innerHTML += '<div class="token-container"><input type="text" id="header-'+r+route.Controller.toLowerCase()+route.Headers.indexOf(r)+'" placeholder="'+r+'" style="width: 100%;"></div>';                  
                }
            }               

            let date = new Date();

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
    
                root.innerHTML += '<div class="row-div"><span class="'+ verbClass+'">'+r.Verb+'</span><h2 id="'+ expandId.ID +'"> '+window.location.origin+r.Route+'</h2></div>';
                root.innerHTML += '<div id="'+r.Id+'_container" class="container"></div>';

                let container = document.getElementById(r.Id + '_container');
    
                if(r.Headers.length > 0)
                    container.innerHTML += "<h3>Headers:</h3>";

                for(let c of r.Headers)
                {
                    container.innerHTML += '<div class="token-container"><input type="text" id="action-header-'+r.Id+r.Headers.indexOf(c)+'" placeholder="'+c+'" style="width: 100%;"></div>';                   
                }

                if(r.Headers.length > 0 && (r.FromQuery.length > 0 || r.FromBody.length > 0 || r.FromFiles.length == 0))
                    container.innerHTML +='</br>'

                 let getURLFunction = (_) => 
                 {                 
                    let args = '?';
                    let path = '';

                    for(let c of r.FromQuery)
                    {
                        let input = document.getElementById('key-'+r.Id+r.FromQuery.indexOf(c));   

                        if(input.value.trim() != '')                            
                            args+= c.Field + '="' + input.value + '"&';                           

                    }


                    if(args.length > 1)
                        args = args.substring(0, args.length -1);
                    else
                        args = '';


                    let route = r.Route;
                    for(let c of r.FromPath)
                    {
                        let input = document.getElementById('path-'+r.Id+r.FromPath.indexOf(c));    

                        if(route.indexOf(':'+c.Field) == -1)                        
                           path+= '/' + input.value.trim();   
                        else
                           route = route.replace(':'+c.Field, input.value.trim());  

                    }

                    if(route.endsWith('/') && path.length > 0)
                        path = path.substring(1);

                    return  window.location.origin+route+path+args;   
                }


                if(r.FromPath.length > 0)
                    container.innerHTML += "<h3>Path parameters:</h3>";



                for(let c of r.FromPath)
                {
                    let isDate = c.Type && c.Type == "Date";                    

                    let placeholder = isDate ? date.getUTCFullYear()+"-"+(date.getUTCMonth() + 1) +"-"+ date.getUTCDate() : c.Field;

                    container.innerHTML += '<div class="token-container"><input type="text" id="path-'+r.Id+r.FromPath.indexOf(c)+'" placeholder="'+placeholder+'"></div>'; 

                }

                if(r.FromPath.length > 0 && (r.FromQuery.length > 0 || r.FromBody.length > 0 || r.FromFiles.length > 0 || r.FromFiles.length == 0))
                    container.innerHTML +='</br>'

                if(r.FromQuery.length > 0)
                    container.innerHTML += "<h3>Query parameters:</h3>";



                for(let c of r.FromQuery)
                {

                    let isDate = c.Type && c.Type == "Date";                    

                    let placeholder = isDate ? date.getUTCFullYear()+"-"+(date.getUTCMonth() + 1) +"-"+ date.getUTCDate() : c.Field;

                    container.innerHTML += '<div class="token-container"><input type="text" id="key-'+r.Id+r.FromQuery.indexOf(c)+'" placeholder="'+placeholder+'"></div>';  
                   

                }

                if(r.FromQuery.length > 0 && (r.FromBody.length > 0 || r.FromFiles.length > 0 || r.FromFiles.length == 0))
                    container.innerHTML +='</br>'

                
                if(r.FromFiles.length > 0)
                    container.innerHTML += "<h3>Files:</h3>";

                for(let c of r.FromFiles)
                {
                    let cIndex = r.FromFiles.indexOf(c);
                    if(!c.FieldName)
                        c.FieldName = 'file' + cIndex > 0 ? '' : cIndex;
                    
                    container.innerHTML += '<div class="token-container"><input type="text" id="file-label-'+r.Id+cIndex+'" placeholder="select a file" readonly><input type="file" id="file-'+r.Id+cIndex+'" hidden></div>';                   
                }

                if(r.FromFiles.length > 0)
                {
                    document.addEventListener('DOMContentLoaded', function() {
    
                        for(let c of r.FromFiles)
                        {
                            let cIndex = r.FromFiles.indexOf(c);

                            let label = document.getElementById('file-label-'+r.Id+cIndex);                          
                            let file = document.getElementById('file-'+r.Id+cIndex);                          
                            label.style.cursor = 'pointer';
                            label.addEventListener('click', function(evt) 
                            {
                                file.click();    
                            });

                            file.addEventListener('change', function(evt){

                                console.log(evt.target.files[0]);
                                if(evt.target.files.length > 0)
                                    label.value = evt.target.files[0].name;
                                label.blur();
                            });
                        }    
                       
                    });
                }

                if(r.FromFiles.length > 0 && (r.FromBody.length > 0 || r.FromBody.length == 0))
                    container.innerHTML +='</br>'
    
                if(r.FromBody.length > 0)
                    container.innerHTML += "<h3>Body:</h3>";

                if(r.FromBody.length > 0)
                {
                    container.innerHTML += '<textarea id="body-'+r.Id+'" placeholder="{}" spellcheck="false">'+r.Template+'</textarea>';                  

                    document.addEventListener('DOMContentLoaded', function() {
    
                        let checkTimeOut;

                        let  textarea = document.getElementById('body-'+r.Id);                          

                        textarea.addEventListener('keydown', function(evt) 
                        {
                            if(checkTimeOut)
                                clearTimeout(checkTimeOut);                               

                            checkTimeOut = setTimeout(()=>{

                                try{

                                    textarea.value = JSON.stringify(JSON.parse(textarea.value), null, 2);
                                    textarea.style.border = "";

                                }catch
                                {
                                    textarea.style.border = "2px solid rgb(201, 111, 89)";
                                }

                            }, 2000);

                        });

                       
                    });
                }
    
                    
                if(r.Description)                
                    container.innerHTML += '<h3>'+r.Description+'</h3>';    
                else    
                    container.innerHTML += '<h3>Use @Description(...) to add a description to a action</h3>';               
                
               
                container.innerHTML += '<div class="btn-container" ><button id="bt-'+expandId.ID+'">Send</button></div>';
                
                if(r.Response.length > 0)
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
                   
                }
                else
                {    
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
                        resp.value = '';
                        let req = new XMLHttpRequest();
                        req.open(r.Verb, getURLFunction(), true);   

                        if (r.FromFiles.length == 0 && r.FromBody.length > 0)                        
                            req.setRequestHeader('Content-type', 'application/json');
                        

                        if(route.Headers.length > 0)
                        {
                            if(route.Headers.length > 0)
                            {
                                for(let r of route.Headers)
                                {   
                                    let header = document.getElementById('header-'+r+route.Controller.toLowerCase()+route.Headers.indexOf(r));
                                    req.setRequestHeader(r,header.value);           
                                                      
                                }
                            }    
                           
                        }

                        if(r.Headers.length > 0)
                        {
                            for(let v of r.Headers)
                            {   
                                let header = document.getElementById('action-header-'+r.Id+r.Headers.indexOf(v));
                                req.setRequestHeader(v,header.value);           
                                                      
                            }
                        }

                        document.getElementById( expandId.ID).innerHTML = getURLFunction();

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
                                try{
                                    resp.value = JSON.stringify(JSON.parse(req.responseText), null, 2);
                                }catch{
                                    resp.value = req.responseText;
                                }
                            }
                        }
    
                        if(r.FromFiles.length > 0)
                        {
                            let form = new FormData();

                            for(let c of r.FromFiles)
                            {
                                let cIndex = r.FromFiles.indexOf(c);  
                                let file = document.getElementById('file-'+r.Id+cIndex);                          
                                if(file.files.length > 0)
                                {                                            
                                    form.append(c.FieldName, file.files[0]);
                                }
                                        
                            }  
                            if(body)
                            {
                                form.append('body', body.value);
                            }

                            req.send(form);
                            
                        }else{

                            if(body){
                                req.send(body.value);
                            }else
                            {
                                req.send();
                            }
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

            let applicationPackageJson = Path.join(Application.Configurations.RootPath, "package.json");

            if(!FS.existsSync(applicationPackageJson))
                applicationPackageJson = Path.join(Application.Configurations.RootPath, "..", "package.json");

            if(!FS.existsSync(applicationPackageJson))
                applicationPackageJson = Path.join(Application.Configurations.RootPath, "..", "..", "package.json");

            if(FS.existsSync(applicationPackageJson))
            {
                let j = JSON.parse(FS.readFileSync(applicationPackageJson, 'utf-8'));
                app = j.name;
                version = j.version;
                description = j.description;        
                
                this._js = this._js.replace('??APP', app);
                this._js = this._js.replace('??DESC', description);
                this._js = this._js.replace('??VERSION', version);

            }

        }catch(err)
        {
            console.error(err);
        }       
        

        FS.writeFileSync(`${__dirname}\\script.js`, JS._js, 'utf-8');
    }
}