export default class Utils 
{
        
    public static ReplaceAll(source: string, oldChar : string, newChar : string)
    {
        while(source.indexOf(oldChar) > -1)
            source = source.replace(oldChar, newChar);
        
        return source;
    }

}