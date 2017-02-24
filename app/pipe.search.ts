import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  'name': 'search'
})

export class SearchPipe implements PipeTransform {
  transform(pipeData, pipeModifier){
    console.log(pipeData);
    return pipeData.filter((eachItem) => {
      // eachItem['name'] - name of item
      // pipeModifier - value of input
      return eachItem['name'].toLowerCase().includes(pipeModifier.toLowerCase()) ||
            eachItem['reknown'].toLowerCase().includes(pipeModifier.toLowerCase());
    });
  };
}
