/* LinguaMind AI — ChatGPT-style chat with Firestore persistence */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, AlertCircle, Plus, Trash2, MessageSquare, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { sendChatMessage, aiStatus } from '../../services/aiService'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../firebase/firebaseConfig'
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore'
import GlassCard from '../../components/ui/GlassCard'

const MODES = ['Casual Chat', 'Interview Practice', 'Travel Communication', 'Classroom Discussion', 'Office Communication']
const GREETINGS = { English:"Hello! I'm your LinguaMind AI tutor.", Spanish:'¡Hola! Soy tu tutor.', French:'Bonjour!', German:'Hallo!', Hindi:'नमस्ते!', Japanese:'こんにちは！', Mandarin:'你好！', Italian:'Ciao!', Portuguese:'Olá!', Korean:'안녕하세요!', Arabic:'مرحباً!', Russian:'Привет!' }
const welcome = (l) => GREETINGS[l] ?? `Hello! I am your AI tutor for ${l}.`
const ago = (ts) => { if(!ts)return ''; const d=Date.now()-ts; if(d<60000)return 'now'; if(d<3600000)return Math.floor(d/60000)+'m'; if(d<86400000)return Math.floor(d/3600000)+'h'; return Math.floor(d/86400000)+'d' }

async function fsCreate(uid,{lang,mode,firstMessage}){
  const title=(firstMessage||'New Chat').slice(0,60)
  const ref=doc(collection(db,'users',uid,'conversations'))
  await setDoc(ref,{title,lang,mode,lastMessage:title,messageCount:0,ts:Date.now(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()})
  console.log('[Chat] Conversation created:',ref.id)
  return ref.id
}
async function fsSave(uid,convId,role,content){
  const ref=doc(collection(db,'users',uid,'conversations',convId,'messages'))
  await setDoc(ref,{role,content,ts:Date.now(),createdAt:serverTimestamp()})
  await setDoc(doc(db,'users',uid,'conversations',convId),{updatedAt:serverTimestamp(),messageCount:increment(1),ts:Date.now(),...(role==='user'&&{lastMessage:content.slice(0,80)})},{merge:true})
  console.log('[Chat] Message saved:',role,ref.id)
}
async function fsLoadConvs(uid){
  const snap=await getDocs(collection(db,'users',uid,'conversations'))
  const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0))
  console.log('[Chat] Conversations loaded:',list.length)
  return list
}
async function fsLoadMsgs(uid,convId){
  const snap=await getDocs(collection(db,'users',uid,'conversations',convId,'messages'))
  const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0))
  console.log('[Chat] Messages loaded:',list.length)
  return list
}
async function fsDel(uid,convId){
  const snap=await getDocs(collection(db,'users',uid,'conversations',convId,'messages'))
  await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)))
  await deleteDoc(doc(db,'users',uid,'conversations',convId))
}

export default function ChatbotPage(){
  const {user,userData}=useAuth()
  const lang=userData?.targetLanguage||'English'
  const [sb,setSb]=useState(true)
  const [convs,setConvs]=useState([])
  const [convLoading,setConvLoading]=useState(true)
  const [activeId,setActiveId]=useState(null)
  const [msgs,setMsgs]=useState([])
  const [msgsLoading,setMsgsLoading]=useState(false)
  const [input,setInput]=useState('')
  const [sending,setSending]=useState(false)
  const [mode,setMode]=useState('Casual Chat')
  const [dbErr,setDbErr]=useState(null)
  const isNew=useRef(true)
  const bot=useRef(null)

  useEffect(()=>{
    if(!user?.uid)return
    setConvLoading(true)
    fsLoadConvs(user.uid).then(list=>{
      setConvs(list); setConvLoading(false); setDbErr(null)
      if(list.length>0)openConv(list[0].id)
      else setMsgs([{role:'ai',content:welcome(lang)}])
    }).catch(e=>{ setDbErr(e.message); setConvLoading(false); setMsgs([{role:'ai',content:welcome(lang)}]) })
  },[user?.uid])

  useEffect(()=>{ bot.current?.scrollIntoView({behavior:'smooth'}) },[msgs])

  const openConv=useCallback(async(id)=>{
    setActiveId(id); isNew.current=false; setMsgsLoading(true); setMsgs([])
    fsLoadMsgs(user.uid,id).then(list=>{ setMsgs(list.map(m=>({role:m.role,content:m.content}))) }).catch(console.error).finally(()=>setMsgsLoading(false))
  },[user?.uid])

  const newChat=()=>{ setActiveId(null); isNew.current=true; setMsgs([{role:'ai',content:welcome(lang)}]); setInput('') }

  const delConv=async(id,e)=>{ e.stopPropagation(); await fsDel(user.uid,id).catch(()=>{}); setConvs(p=>p.filter(c=>c.id!==id)); if(activeId===id)newChat() }

  const send=async(text=input)=>{
    const t=text.trim(); if(!t||sending)return
    setInput(''); setSending(true); setMsgs(p=>[...p,{role:'user',content:t}])
    let cid=activeId
    if(isNew.current){
      try{ cid=await fsCreate(user.uid,{lang,mode,firstMessage:t}); setActiveId(cid); isNew.current=false; setConvs(p=>[{id:cid,title:t.slice(0,60),lang,lastMessage:t,ts:Date.now()},...p]) }
      catch(e){ setDbErr(e.message) }
    }
    if(cid) fsSave(user.uid,cid,'user',t).catch(e=>console.error('save user msg:',e.message))
    try{
      const reply=await sendChatMessage(msgs,t,mode,lang)
      setMsgs(p=>[...p,{role:'ai',content:reply}])
      if(cid){ fsSave(user.uid,cid,'ai',reply).catch(console.error); setConvs(p=>p.map(c=>c.id===cid?{...c,lastMessage:t.slice(0,60),ts:Date.now()}:c)) }
    }catch{ setMsgs(p=>[...p,{role:'ai',content:'Could not reach AI. Check VITE_GROQ_API_KEY.',isError:true}]) }
    finally{ setSending(false) }
  }

  const onKey=(e)=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }

  return (
    <div className="flex h-[calc(100vh-7rem)] max-w-6xl mx-auto overflow-hidden rounded-2xl" style={{border:'1px solid rgba(255,255,255,0.07)'}}>
      <AnimatePresence initial={false}>
        {sb&&(
          <motion.aside key="sb" initial={{width:0,opacity:0}} animate={{width:256,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}}
            className="flex-shrink-0 flex flex-col border-r overflow-hidden" style={{background:'#060d18',borderColor:'rgba(255,255,255,0.06)'}}>
            <div className="flex items-center gap-2 p-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <button onClick={newChat} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white"
                style={{background:'linear-gradient(135deg,rgba(0,212,255,.15),rgba(124,58,237,.15))',border:'1px solid rgba(0,212,255,.2)'}}>
                <Plus size={13}/> New Chat
              </button>
              <button onClick={()=>setSb(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{color:'rgba(255,255,255,.35)'}}><ChevronLeft size={15}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {convLoading?(<div className="flex items-center justify-center gap-2 py-8" style={{color:'rgba(255,255,255,.3)'}}><Loader size={13} className="animate-spin"/><span className="text-xs">Loading…</span></div>)
              :convs.length===0?(<p className="text-center text-xs py-8" style={{color:'rgba(255,255,255,.25)'}}>No conversations yet</p>)
              :convs.map(c=>(
                <button key={c.id} onClick={()=>openConv(c.id)} className="w-full text-left px-3 py-2.5 rounded-xl transition-all group relative"
                  style={activeId===c.id?{background:'linear-gradient(135deg,rgba(0,212,255,.12),rgba(124,58,237,.12))',border:'1px solid rgba(0,212,255,.18)'}:{border:'1px solid transparent'}}>
                  <div className="flex gap-2 items-start">
                    <MessageSquare size={12} style={{color:'rgba(255,255,255,.35)',marginTop:2}}/>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-medium truncate" style={{color:activeId===c.id?'#fff':'rgba(255,255,255,.7)'}}>{c.title||'Chat'}</p>
                      <p className="text-xs truncate mt-0.5" style={{color:'rgba(255,255,255,.35)'}}>{c.lastMessage||c.lang}</p>
                      <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,.2)'}}>{ago(c.ts)}</p>
                    </div>
                  </div>
                  <button onClick={(e)=>delConv(c.id,e)} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{background:'rgba(239,68,68,.15)',color:'#ef4444'}}><Trash2 size={10}/></button>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0" style={{borderColor:'rgba(255,255,255,.06)'}}>
          <button onClick={()=>setSb(v=>!v)} className="w-8 h-8 rounded-lg flex items-center justify-center glass-card" style={{color:'rgba(255,255,255,.5)'}}>
            {sb?<ChevronLeft size={14}/>:<ChevronRight size={14}/>}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-bold leading-none">AI Conversation Partner</h1>
            <p className="text-xs mt-0.5" style={{color:'rgba(150,150,180,.7)'}}>Practicing <span style={{color:'#00d4ff'}}>{lang}</span> · {mode}</p>
          </div>
          <button onClick={newChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-card" style={{color:'rgba(255,255,255,.7)',border:'1px solid rgba(255,255,255,.1)'}}><Plus size={12}/> New</button>
        </div>

        {dbErr&&(<div className="flex gap-2 items-start px-4 py-2 text-xs flex-shrink-0" style={{background:'rgba(239,68,68,.1)',borderBottom:'1px solid rgba(239,68,68,.25)',color:'#f87171'}}>
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5"/>
          <div><strong>Firestore blocked.</strong> Go to Firebase Console → Firestore → Rules → paste firestore.rules → Publish.<br/><span style={{opacity:.6}}>{dbErr}</span></div>
        </div>)}

        {!aiStatus.hasKey&&(<div className="flex gap-2 items-start px-4 py-2 text-xs flex-shrink-0" style={{background:'rgba(239,68,68,.08)',borderBottom:'1px solid rgba(239,68,68,.2)',color:'#f87171'}}>
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5"/><span>Groq API key missing — free key at console.groq.com</span>
        </div>)}

        <div className="flex gap-1.5 flex-wrap px-4 py-2 flex-shrink-0 border-b" style={{borderColor:'rgba(255,255,255,.05)'}}>
          {MODES.map(m=>(<button key={m} onClick={()=>setMode(m)} className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={m===mode?{background:'linear-gradient(135deg,#00d4ff,#7c3aed)',color:'#fff'}:{background:'rgba(255,255,255,.05)',color:'rgba(180,180,210,.8)',border:'1px solid rgba(255,255,255,.08)'}}>{m}</button>))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {msgsLoading?(<div className="flex items-center justify-center h-full gap-2" style={{color:'rgba(255,255,255,.3)'}}><Loader size={16} className="animate-spin"/><span className="text-sm">Loading…</span></div>):(
            <AnimatePresence initial={false}>
              {msgs.map((m,i)=>(
                <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:0.18}}
                  className={`flex gap-3 ${m.role==='user'?'justify-end':'justify-start'}`}>
                  {m.role==='ai'&&(<div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                    style={{background:m.isError?'rgba(239,68,68,.3)':'linear-gradient(135deg,#00d4ff,#7c3aed)'}}>
                    {m.isError?<AlertCircle size={12} className="text-red-400"/>:<Brain size={12} className="text-white"/>}
                  </div>)}
                  <div className={`max-w-[76%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role==='user'?'rounded-tr-none':'glass-card rounded-tl-none'} ${m.isError?'text-red-400':''}`}
                    style={m.role==='user'?{background:'linear-gradient(135deg,rgba(0,212,255,.2),rgba(124,58,237,.2))',border:'1px solid rgba(0,212,255,.25)',color:'inherit'}:{color:'inherit'}}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {sending&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)'}}><Brain size={12} className="text-white"/></div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              {[0,1,2].map(i=>(<motion.div key={i} className="w-2 h-2 rounded-full" style={{background:'#00d4ff'}} animate={{y:[0,-5,0]}} transition={{duration:0.7,repeat:Infinity,delay:i*0.15}}/>))}
            </div>
          </motion.div>)}
          <div ref={bot}/>
        </div>

        <div className="px-4 pb-4 flex-shrink-0">
          <GlassCard className="p-3 flex gap-3 items-end">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
              placeholder={`Message your ${lang} tutor… (Enter to send)`} rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm py-1 max-h-28" style={{lineHeight:'1.6',color:'inherit'}}/>
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>send()} disabled={!input.trim()||sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{background:'linear-gradient(135deg,#00d4ff,#7c3aed)'}}>
              <Send size={15} className="text-white"/>
            </motion.button>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
