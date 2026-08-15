 
    
    document.getElementById('root').innerHTML += '<div class="header" ><div class="DivHeader"><p>Made with <a href="https://www.npmjs.com/package/web_api_base" target="_blank">web_api_base</a></p></div></div>';
    document.getElementsByClassName('header')[0].innerHTML += '<div class="DivHeader DivHeaderRight"><p class="pTitle" style="font-size: 14px;font-weight:600;">web_api_base 8.3.0</p><p>web api base</p></div>';
    
       
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
                        let btn = evt.currentTarget; 
                        let originalContent = btn.innerHTML; 

                        let body = document.getElementById('body-'+r.Id);   
                        let resp = document.getElementById('response-area-'+r.Id);   
                        let bar = document.getElementById('status-bar-'+r.Id);
                        let h3 = document.getElementById('response-bar-'+r.Id);                
                        resp.value = '';

                        btn.disabled = true;
                        btn.innerHTML = '<span class="spinner"></span>'; 

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

                        const resetBtn = () => {
                            btn.disabled = false;
                            btn.innerHTML = originalContent;
                        };

                        req.onerror = ()=>
                        {
                            resetBtn();
                            h3.innerText = "Current response:";
                            bar.style.display = "flex";
                            resp.value = 'Error to send the request';
                            bar.innerHTML = '<div><status class="ErrorServer">-1</status> <tx>Error on request</tx></div>';
                        }
    
                      
                        req.onreadystatechange = ()=>
                        {
                            if(req.readyState == 4 && req.status > 0)
                            {
                                resetBtn();
                                
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


    AddResource({"Id":"c_11","Route":"/subfolder/onemorelevel/adm/test","Controller":"AdmController","Headers":[],"Resources":[{"Description":"","Id":"c_11-0","Route":"/subfolder/onemorelevel/adm/test/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_11-1","Route":"/subfolder/onemorelevel/adm/test/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_11-2","Route":"/subfolder/onemorelevel/adm/test/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_8","Route":"/file","Controller":"FileController","Headers":[],"Resources":[{"Description":"","Id":"c_8-0","Route":"/file/uploadfilewithdecorator","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"}],"FromPath":[],"FromFiles":[{}],"Headers":[]},{"Description":"","Id":"c_8-1","Route":"/file/uploadfilewithnodecorator","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"}],"FromPath":[],"FromFiles":[{}],"Headers":[]},{"Description":"","Id":"c_8-2","Route":"/file/getlistoffiles","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_8-3","Route":"/file/sendfileasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_8-4","Route":"/file/downloadfileasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_8-5","Route":"/file/uploadfilewith1mbfilesize","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[{}],"Headers":[]},{"Description":"","Id":"c_8-6","Route":"/file/uploadfilewith1mbfilesizewithcustommessage","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[{}],"Headers":[]},{"Description":"","Id":"c_8-7","Route":"/file/uploadfilewithoptionalfile","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[{}],"Headers":[]},{"Description":"","Id":"c_8-8","Route":"/file/uploadfilewithrequiredfile","Verb":"POST","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[{}],"Headers":[]}]});AddResource({"Id":"c_7","Route":"/nondefaultexport2","Controller":"NonDefaultExport2Controller","Headers":[],"Resources":[{"Description":"","Id":"c_7-0","Route":"/nondefaultexport2/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_7-1","Route":"/nondefaultexport2/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_7-2","Route":"/nondefaultexport2/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_6","Route":"/nondefaultexport","Controller":"NonDefaultExportController","Headers":[],"Resources":[{"Description":"","Id":"c_6-0","Route":"/nondefaultexport/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_6-1","Route":"/nondefaultexport/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_6-2","Route":"/nondefaultexport/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_5","Route":"","Controller":"OmmitController","Headers":[],"Resources":[{"Description":"","Id":"c_5-0","Route":"/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_5-1","Route":"/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_5-2","Route":"/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_3","Route":"/:paRam/path","Controller":"PathParamController","Headers":[],"Resources":[{"Description":"","Id":"c_3-0","Route":"/:paRam/path/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_3-1","Route":"/:paRam/path","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_3-2","Route":"/:paRam/path/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_2","Route":"/results","Controller":"ResultsController","Headers":[],"Resources":[{"Description":"","Id":"c_2-0","Route":"/results/okresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-1","Route":"/results/createdresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-2","Route":"/results/acceptedresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-3","Route":"/results/nocontentresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-4","Route":"/results/badrequestresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-5","Route":"/results/unauthorizedresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-6","Route":"/results/forbiddenresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-7","Route":"/results/notfoundresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-8","Route":"/results/errorresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_2-9","Route":"/results/throwexception","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_0","Route":"/sample","Controller":"SampleController","Headers":[],"Resources":[{"Description":"","Id":"c_0-0","Route":"/sample/ping","Verb":"GET","Template":"","Response":[{"Status":200,"Description":"OK","JSON":"{\n  \"status\": \"pong\"\n}"}],"FromBody":[],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_1","Route":"/status","Controller":"StatusController","Headers":["api-key"],"Resources":[{"Description":"Action to check API status","Id":"c_1-0","Route":"/status/check","Verb":"POST","Template":"{\"Property\":\"\",\"Date\":\"2026-08-15T18:25:58.232Z\"}","Response":[{"Status":500,"Description":"Error","JSON":"{\n  \"Message\": \"Error while processing the request\"\n}"},{"Status":400,"Description":"Bad request","JSON":"{\n  \"Message\": \"Error message\"\n}"},{"Status":200,"Description":"OK","JSON":"{\n  \"status\": \"OK\"\n}"}],"FromBody":[{"Type":"SampleService"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":["token"]},{"Description":"","Id":"c_1-1","Route":"/status/getwithpathparams","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-2","Route":"/status/getwithnodecorators","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-3","Route":"/status/:lastName","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"},{"Field":"lastName","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-4","Route":"/status/:lastName/user","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"name","Type":"String"},{"Field":"age","Type":"Number"},{"Field":"lastName","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-5","Route":"/status/getwithfromquerydecoratorreturningactionresult","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-6","Route":"/status/getwithfromquerydecoratorreturningstring","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-7","Route":"/status/getwithoneparamwithdecorator","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"date","Type":"Date"},{"Field":"number","Type":"Number"},{"Field":"bool","Type":"Boolean"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-8","Route":"/status/getwithdecorators","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"nome","Type":"String"},{"Field":"age","Type":"Number"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-9","Route":"/status/postwithdecorator","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.233Z\",\"Description\":\"\",\"option_text\":\"\"}","Response":[],"FromBody":[{"Type":"TestClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-10","Route":"/status/postofany","Verb":"POST","Template":"{}","Response":[],"FromBody":[{"Type":"Object"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-11","Route":"/status/postofempty","Verb":"POST","Template":"{}","Response":[],"FromBody":[{"Type":"Object"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-12","Route":"/status/postwithnodecorator","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.233Z\",\"Description\":\"\",\"option_text\":\"\"}","Response":[],"FromBody":[{"Type":"TestClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-13","Route":"/status/postofderivedclass","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.233Z\",\"Description\":\"\",\"Hash\":\"\",\"Itens\":[{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.233Z\",\"Description\":\"\"}]}","Response":[],"FromBody":[{"Type":"DerivedClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-14","Route":"/status/postofderivedclassandrunmethod","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\",\"Hash\":\"\",\"Itens\":[{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.233Z\",\"Description\":\"\"}]}","Response":[],"FromBody":[{"Type":"DerivedClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-15","Route":"/status/postofitemclassandrunmethod","Verb":"POST","Template":"{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\"}","Response":[],"FromBody":[{"Type":"ItemTest"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-16","Route":"/status/deleteaction","Verb":"DELETE","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"id","Type":"Number"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-17","Route":"/status/postofrequiredbody","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\",\"Hash\":\"\",\"Itens\":[{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\"}]}","Response":[],"FromBody":[{"Type":"DerivedClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-18","Route":"/status/postofrequiredbodyandcustommessage","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\",\"Hash\":\"\",\"Itens\":[{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\"}]}","Response":[],"FromBody":[{"Type":"DerivedClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-19","Route":"/status/postofoptionalbody","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\",\"Hash\":\"\",\"Itens\":[{\"Name\":\"\",\"IsActive\":false,\"CreatedAt\":\"2026-08-15T18:25:58.234Z\",\"Description\":\"\"}]}","Response":[],"FromBody":[{"Type":"DerivedClass"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-20","Route":"/status/getwithrequiredqueryarg","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-21","Route":"/status/getwithrequiredqueryargandcustommessage","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-22","Route":"/status/getwithoptionalqueryarg","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-23","Route":"/status/postvalidatedmodel","Verb":"POST","Template":"{\"Name\":\"\",\"Age\":-1,\"Email\":\"\"}","Response":[],"FromBody":[{"Type":"ValidatedModel"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-24","Route":"/status/patchpartialrecord","Verb":"PATCH","Template":"{}","Response":[],"FromBody":[{"Type":"Object"}],"FromQuery":[],"FromPath":[],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_1-25","Route":"/status/patchusingonlyquery","Verb":"PATCH","Template":"","Response":[],"FromBody":[],"FromQuery":[{"Field":"name","Type":"String"}],"FromPath":[],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_4","Route":"/subexport","Controller":"SubExportController","Headers":[],"Resources":[{"Description":"","Id":"c_4-0","Route":"/subexport/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_4-1","Route":"/subexport/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_4-2","Route":"/subexport/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_9","Route":"/subfolder/subfolder/test","Controller":"SubFolderController","Headers":[],"Resources":[{"Description":"","Id":"c_9-0","Route":"/subfolder/subfolder/test/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_9-1","Route":"/subfolder/subfolder/test/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_9-2","Route":"/subfolder/subfolder/test/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});AddResource({"Id":"c_10","Route":"/v1/subfolder/cards","Controller":"SubFolderWithNoNameController","Headers":[],"Resources":[{"Description":"","Id":"c_10-0","Route":"/v1/subfolder/cards/ping","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_10-1","Route":"/v1/subfolder/cards/withnoname","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"}],"FromFiles":[],"Headers":[]},{"Description":"","Id":"c_10-2","Route":"/v1/subfolder/cards/getatoasync","Verb":"GET","Template":"","Response":[],"FromBody":[],"FromQuery":[],"FromPath":[{"Field":"paRam","Type":"String"},{"Field":"cod_param","Type":"String"}],"FromFiles":[],"Headers":[]}]});