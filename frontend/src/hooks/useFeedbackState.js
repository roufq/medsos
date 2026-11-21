import {useCallback,useState} from 'react';
import {showFeedback} from '../utils/feedback';

export function useFeedbackState(initialState='',defaultType='error'){
 const [value,setValue]=useState(initialState);
 const setFeedback=useCallback(next=>{
  setValue(next);
  const message=typeof next==='string'?next:next?.text;
  const type=next?.type==='error'?'error':['ok','success'].includes(next?.type)?'success':defaultType;
  showFeedback(message,type);
 },[defaultType]);
 return [value,setFeedback];
}
