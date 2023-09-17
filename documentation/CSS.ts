import FS from 'fs';


export default class CSS
{
    private static _css = `
    :root
    {
        --c-from : rgb(245, 245, 245);
        --c-to : rgba(238, 238, 238, 0);
        --g-from : rgb(240, 240, 240);
        --g-to : rgb(255, 255, 255);
        --b-from : rgba(78, 121, 185, 0.87);
        --b-to : rgba(33, 95, 189, 0.842);
        --t-from : rgb(240, 240, 240);
        --t-to : rgb(255, 255, 255);
        --b-from-hover : rgba(5, 42, 85, 0.733);
        --b-to-hover : rgba(6, 52, 150, 0.705);
        --borders : rgba(116, 116, 116, 0.384);
        --h1-color : rgb(94, 147, 226);
        --h2-color : rgb(104, 111, 209);
        --tx-color : rgb(73, 73, 73);
        --b-color : rgb(233, 233, 233);
    }
    
    body
    {
        background-image: linear-gradient(to right, var(--g-from) , var(--g-to));
    }
    
    .header
    {
        background-image: linear-gradient(to right, var(--h1-color) , var(--h2-color));
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: aliceblue;
        padding: 10px;
    }

    .DivHeader {
        width: 50%;
    }

    .DivHeaderRight {
        display: flex;
        flex-direction: column;
        align-items: end;
    }

    .DivHeaderRight p {
        height: 15px;
        font-size: 10px;
        margin: 1px;
    }
    
    a
    {
        font-weight: 600;
        cursor: pointer;
        color: aliceblue;
        text-decoration: none;
    }
    
    
    #root
    {
        position: absolute;
        top: 0%;
        left : 0%;
        width: 100%; 
        height: 100%; 
        background-image: linear-gradient(to right, var(--g-from) , var(--g-to));    
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        
    }
    
    h1{
        font-size: 15px;
        font-style: normal;
        font-weight: 400;
        text-align: left;
        color: var(--h1-color);
        
    }
    
    verb
    {
        font-size: 12px;
        font-weight: 600;
    }
    
    h2{
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        text-align: left;
        color: var(--h2-color);
        cursor: pointer;
    }
    
    h3{
        font-size: 11px;
        font-style: normal;
        font-weight: 400;
        text-align: left;
        color: var(--h2-color);
    }
    
    .container
    {
        display: none;
        flex-direction: column;
        justify-content: center;
    }
    
    .btn-container
    {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        padding-top: 5px;
    
    }
    
    .token-container
    {
        display: flex;
        flex-direction: row;    
        align-items: start;
        padding-top: 5px;
        
    
    }
    
    textarea, input
    {
        padding: 10px;    
        border: 1px solid var(--borders);
        background-image: linear-gradient(to right, var(--t-from) , var(--t-to)); 
        color: var(--tx-color);
        outline: none;
        height: 80px;
    }
    
    input
    {
        padding: 2px;     
        width: calc(30% - 5px);
        height: 20px;
    }
    
    .card
    {
        
        padding: 10px;
        width: calc(100% - 20px);
        background-image: linear-gradient(to right, var(--c-from) , var(--c-to)); 
        display: block;    
        
    }
    
    .colapsed
    {
        overflow: auto;
        display: none;
        height: 30px;    
    }
    
    button
    {
        background-image: linear-gradient(to right, var(--b-from) , var(--b-to)); 
        width: 100px;
        height: 30px;
        font-weight: 400;
        color: var(--b-color);
        border: none;
        cursor: pointer;
    }
    
    button:hover
    {
        background-image: linear-gradient(to right, var(--b-from-hover) , var(--b-to-hover)); 
    }
    
    
    .GET
    {
        color: rgb(129, 190, 38);
    }

    .POST
    {
        color: rgb(235, 187, 83);
    }

    .PUT
    {
        color: rgb(204, 196, 82);
    }
    
    .DELETE
    {
        color: rgb(201, 111, 89);
    }

    .OTHER
    {
        color: rgb(115, 206, 223);
    }
    
    status
    {
        font-size: 13px;
        cursor: pointer;
        font-weight: 600;
        margin-bottom: 2px;
    }

    
    tx
    {
        font-size: 11px;
        font-style: normal;
        font-weight: 400;
        text-align: left;
        color: var(--h2-color);
    }
    

    
    .OK
    {
        color: rgb(129, 190, 38);
    }    

    .ErrorClient
    {
        color: rgb(204, 196, 82);
    }
    
    .ErrorServer
    {
        color: rgb(201, 111, 89);
    }
    
    .Info
    {
        color: rgb(115, 206, 223);
    }
    
    
    
    `;    

    public static Save() : void
    {
        FS.writeFileSync(`${__dirname}\\style.css`, CSS._css, 'utf-8');
    }
}