import FS from 'fs';


export default class CSS
{

    private static _dark = `
    :root
    {
        --c-from : rgb(39, 39, 39);
        --c-to : rgba(53, 53, 53, 0);
        --g-from : rgb(24, 24, 24);
        --g-to : rgb(34, 33, 33);
        --b-from : rgba(78, 121, 185, 0.87);
        --b-to : rgba(33, 95, 189, 0.842);
        --t-from : rgb(27, 27, 27);
        --t-to : rgb(10, 10, 10);
        --b-from-hover : rgba(5, 42, 85, 0.733);
        --b-to-hover : rgba(6, 52, 150, 0.705);
        --borders : rgba(116, 116, 116, 0.384);
        --h1-color : rgb(231, 231, 231);
        --h2-color : rgb(211, 210, 210);
        --h-from : rgb(7, 7, 7);
        --h-to : rgb(26, 26, 26);
        --tx-color : rgb(199, 226, 136);
        --b-color : rgb(233, 233, 233);
    }`;

    private static _light = `
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
    `;

    private static _css = `   
    body
    {
        background-image: linear-gradient(to right, var(--g-from) , var(--g-to));
    }
    
    .header
    {
        background-image: linear-gradient(to right, var(--h-from) , var(--h-to));
        height: 40px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--h1-color);
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
        color: var(--h1-color);
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

    textarea
    {
        height: 150px;
        width: calc(100% - 20px);
        min-width: calc(100% - 20px);
        min-height: 80px;
        max-width: calc(100% - 20px);
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
    
    
    span
    {
        font-size: 10px;
        font-weight: 600;
        width: 35px;
        height: 15px;
        text-align: center;
    
    }
    

    .GET
    {
        background-color: rgb(138, 167, 96);
        color: rgb(255, 255, 255);
        padding: 1px 3px 1px 3px;
        border-radius: 5px;       
    }

    .POST
    {
        background-color: rgb(79, 132, 153);
        color: rgb(255, 255, 255);
        padding: 1px 3px 1px 3px;
        border-radius: 5px;
       
    }

    .PUT
    {
        background-color: rgb(161, 157, 89);
        color: rgb(255, 255, 255);
        padding: 1px 3px 1px 3px;
        border-radius: 5px;
        
    }
    
    .DELETE
    {
        background-color: rgb(158, 98, 82);
        color: rgb(255, 255, 255);
        padding: 1px 3px 1px 3px;
        border-radius: 5px;
        
    }

    .OTHER
    {
        background-color: rgb(73, 108, 114);
        color: rgb(255, 255, 255);
        padding: 1px 3px 1px 3px;
        border-radius: 5px;        
    }

    .row-div
    {
        display: flex;
        flex-direction: row;
        gap: 3px;
        justify-content: start;
        align-items: center;
        margin: 0px;
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
    

    
    .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 5px;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }


    button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    
    
    
    
    
    
    
    
    `;    

    public static Save() : void
    {       
        let theme = CSS._light;

        if(process.argv.indexOf("--dark") > -1 || process.argv.indexOf("--DARK") > -1)
            theme = CSS._dark;

        FS.writeFileSync(`${__dirname}\\style.css`, theme + '\r\n'+ CSS._css, 'utf-8');
    }
}