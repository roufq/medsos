import {useEffect,useRef} from 'react';
import {useLocation} from 'react-router-dom';
import api from '../../api/axios';
import {usePlatform} from '../../context/PlatformContext';
export default function TrafficTracker(){const {pathname}=useLocation();const last=useRef('');const {settings}=usePlatform();useEffect(()=>{if(last.current===pathname||pathname.startsWith('/admin')||!settings?.analytics_enabled)return;last.current=pathname;api.post('/traffic',{kind:'visit',path:pathname,referrer:document.referrer}).catch(()=>{});},[pathname,settings?.analytics_enabled]);return null;}
