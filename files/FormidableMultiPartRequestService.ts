import formidable from 'formidable';

import AbstractMultiPartRequestService, { IGetPartsOptions, IRequestPart, PartType } from './AbstractMultiPartRequestService';
import Exception from '../exceptions/Exception';

export default class FormidableMultiPartRequestService extends AbstractMultiPartRequestService {
    
    
    public GetPartsFromRequestAsync(request: any, options? : IGetPartsOptions): Promise<IRequestPart[]> {
        
        let maxFileSize = 200 * 1024 * 1024;

        if(options && options.MaxFileSize > 0)
            maxFileSize = options.MaxFileSize;

        let form = formidable({maxFileSize: maxFileSize});
        
        return new Promise<IRequestPart[]>((resolve, reject) => {

            form.parse(request, (err, fields, files) => {

                let result : IRequestPart[] = [];

                if (err)
                    return reject(new Exception(err.message));

                for(let c in fields)
                     result.push(
                            {
                                Name : c, 
                                Type : PartType.TEXT, 
                                Content: fields[c] ? fields[c]!.toString() : ""
                            });                     
                
                for(let c in files){

                    if((files[c] as any).filepath == undefined)
                    {
                        result.push(
                            {
                                Name : c, 
                                Type : PartType.FILE, 
                                Content: (files[c] as any)[0].filepath, 
                                Filename: (files[c] as any)[0].originalFilename,
                            });  
                    }else{
                        result.push(
                            {
                                Name : c, 
                                Type : PartType.FILE, 
                                Content: (files[c] as any).filepath, 
                                Filename: (files[c] as any).originalFilename,
                            }); 
                    }
                   
                }
                      


                return resolve(result);
            });

        });
    }

}
