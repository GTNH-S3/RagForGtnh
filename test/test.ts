import {extractKeywords,testModel} from '../ai/gemini';



testModel("is Gtnh hard ? can you tell about this mod pack ").then(r => console.log(r)).catch(e => console.error(e));
