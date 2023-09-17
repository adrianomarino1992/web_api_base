

document.getElementById('root').innerHTML += '<div class="header" ><p>Made with <a href="https://www.npmjs.com/package/web_api_base" target="_blank">web_api_base</a></p></div>';

    
function AddResource(route)
{    
    document.getElementById('root').innerHTML += '<div id="'+ route.Controller.toLowerCase()+'" class="card"></div>';
    let root = document.getElementById(route.Controller.toLowerCase());

    

    root.innerHTML += '<h1 >'+route.Controller+'</h1>';
    root.innerHTML += '<div class="token-container"><input type="text" placeholder="header key"></input><input type="text" style="width:70%;margin-left:5px;" placeholder="header value"></input></div>';
   
    for(let r of route.Resources)
    {
        if(r.Description)
        {
            root.innerHTML += '<h2>'+r.Description+'</h2>';
        }

        let expandId = { ID : 'link_' + r.Id, RID : r.Id};

        console.log(expandId);

        root.innerHTML += '<h2 id="'+ expandId.ID +'"><verb>'+r.Verb+'</verb> '+r.Route+'</h2>';
        root.innerHTML += '<div id="'+r.Id+'_container" class="container"></div>';
        let container = document.getElementById(r.Id + '_container');
        container.innerHTML += '<textarea placeholder="{}">'+r.Template+'</textarea>';
        container.innerHTML += '<div class="btn-container" ><button>Send</button></div>';
        container.innerHTML += '<h3>Response:</h3>';
        container.innerHTML += '<textarea></textarea>';          
        
       
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

    
    
}AddResource({"Id":"c_0","Route":"/status","Controller":"StatusController","Resources":[{"Description":"","Id":"c_0-0","Route":"/status/check","Verb":"GET","Template":"{}"},{"Description":"","Id":"c_0-1","Route":"/status/test","Verb":"GET","Template":"{}"},{"Description":"","Id":"c_0-2","Route":"/status/testactiontwo","Verb":"GET","Template":"{}"},{"Description":"","Id":"c_0-3","Route":"/status/postaction","Verb":"POST","Template":"{}"},{"Description":"","Id":"c_0-4","Route":"/status/putaction","Verb":"PUT","Template":"{}"},{"Description":"","Id":"c_0-5","Route":"/status/deleteaction","Verb":"DELETE","Template":"{}"}]});